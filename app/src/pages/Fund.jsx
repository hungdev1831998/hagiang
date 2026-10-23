import { useState } from 'react'
import { to } from '../router'
import { Check, CheckCircle2, Copy, Plus, Receipt, Trash2 } from 'lucide-react'
import { remove, removePhotoFile, save, swapOrder, useCollection, withReceipt } from '../store'
import { CATS } from '../seed'
import { AddButton, Btn, EditTools, FormSheet, Loading, SectionTitle, Segmented, Sheet, confirmDelete, money, shortMoney, useEdit, useForm } from '../components/ui'

export const catOf = (k) => CATS.find((c) => c.key === k) || CATS.at(-1)
const MEMBER_FIELDS = [
  { key: 'name', label: 'Tên' },
  { key: 'contributed', label: 'Đã góp quỹ', type: 'money' },
  { key: 'note', label: 'Ghi chú', placeholder: 'Đã có vé' },
]
const expenseFields = (members) => [
  { key: 'title', label: 'Khoản chi', placeholder: 'Ăn tối phố cổ' },
  { key: 'amount', label: 'Số tiền', type: 'money' },
  { key: 'cat', label: 'Loại', type: 'select', options: CATS.map((c) => ({ value: c.key, label: `${c.icon} ${c.label}` })) },
  { key: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'paid', label: '✅ Đã chi' }, { value: 'planned', label: '🕒 Dự kiến' }] },
  { key: 'payer', label: 'Ai trả', type: 'select', options: [{ value: '', label: 'Quỹ chung' }, ...members.map((m) => ({ value: m.name, label: `${m.name} ứng` }))] },
  { key: 'split', label: 'Chia cho', type: 'people', options: members.map((m) => m.name) },
  { key: 'receipt', label: 'Hoá đơn', type: 'receipt' },
  { key: 'note', label: 'Ghi chú' },
]
const today = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10)

// Các lần góp quỹ của 1 người; dữ liệu cũ chỉ có contributed thì coi là 1 lần "Góp ban đầu"
export const contribsOf = (m) => m.contribs || (Number(m.contributed) ? [{ amount: Number(m.contributed), date: '', note: 'Góp ban đầu' }] : [])

// "Ai trả" = '' là tiền quỹ chung; tên một người = người đó ứng tiền túi, quỹ hoàn lại khi quyết toán.
// "Chia cho" = [] là cả nhóm. Số dư mỗi người = đã góp + đã ứng − phần phải chịu; tổng số dư = tiền mặt quỹ.
export function useFundSummary() {
  const members = useCollection('members')
  const expenses = useCollection('expenses')
  if (!members || !expenses) return null
  const names = members.map((m) => m.name)
  const amt = (e) => Number(e.amount) || 0
  const fund = members.reduce((a, m) => a + (Number(m.contributed) || 0), 0)
  const paidList = expenses.filter((e) => e.status === 'paid')
  const paid = paidList.reduce((a, e) => a + amt(e), 0)
  const byMember = (e) => names.includes(e.payer)
  const advanced = paidList.filter(byMember).reduce((a, e) => a + amt(e), 0)
  const splitOf = (e) => { const s = (e.split || []).filter((n) => names.includes(n)); return s.length ? s : names }
  // Khoản ghi trong Sổ chi trừ dần vào khoản dự kiến cùng loại (cafe tính vào ăn uống), để không tính trùng
  const logged = {}
  expenses.filter((e) => e.kind === 'log').forEach((e) => { const k = catOf(e.cat).budget || e.cat; logged[k] = (logged[k] || 0) + amt(e) })
  const plannedByCat = {}
  expenses.filter((e) => e.status !== 'paid').forEach((e) => { plannedByCat[e.cat] = (plannedByCat[e.cat] || 0) + amt(e) })
  const planned = Object.entries(plannedByCat).reduce((a, [k, v]) => a + Math.max(0, v - (logged[k] || 0)), 0)
  const people = members.map((m) => {
    const contributed = Number(m.contributed) || 0
    const adv = paidList.filter((e) => e.payer === m.name).reduce((a, e) => a + amt(e), 0)
    const share = paidList.reduce((a, e) => { const s = splitOf(e); return s.includes(m.name) ? a + amt(e) / s.length : a }, 0)
    return { id: m.id, name: m.name, contributed, advanced: adv, share, balance: contributed + adv - share }
  })
  return { members, expenses, fund, paid, planned, advanced, people, splitOf, left: fund - paid - planned, cash: fund - (paid - advanced) }
}

export default function Fund() {
  const sum = useFundSummary()
  const [filter, setFilter] = useState('all')
  const [contribOf, setContribOf] = useState(null)
  const memberForm = useForm()
  const expForm = useForm()
  if (!sum) return <Loading />
  const { members, expenses, fund, paid, planned, advanced, left, cash, splitOf } = sum
  const logs = expenses.filter((e) => e.kind === 'log')
  const shown = expenses.filter((e) => e.kind !== 'log' && (filter === 'all' || (filter === 'paid' ? e.status === 'paid' : e.status !== 'paid')))
  const pct = (x) => `${fund ? Math.min(100, (x / fund) * 100) : 0}%`
  const confirming = expForm.meta?.confirm
  const delExpense = (e) => confirmDelete('khoản chi này', () => { remove('expenses', e.id); if (e.receipt?.file) removePhotoFile(e.receipt.file) })

  return (
    <div className="space-y-10">
      {/* tổng quan */}
      <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-brand via-brand-2 to-[#7a3410] p-6 text-white">
        <div className="text-sm font-semibold text-white/80">Quỹ chung · {members.length} người</div>
        <div className="mt-1 text-4xl font-extrabold tracking-tight">{money(fund)}</div>
        <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-black/25">
          <div className="bg-white" style={{ width: pct(paid) }} />
          <div className="bg-white/45" style={{ width: pct(planned) }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/85">
          <span>⬤ Đã chi {shortMoney(paid)}</span><span className="opacity-80">⬤ Dự kiến còn lại {shortMoney(planned)}</span>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-black/20 p-4">
            <div className="text-xs text-white/75">Tiền mặt trong quỹ</div>
            <div className="mt-1 text-xl font-bold">{money(cash)}</div>
            {advanced > 0 && <div className="text-xs text-white/75">Còn nợ người ứng {shortMoney(advanced)}</div>}
          </div>
          <div className="rounded-2xl bg-black/20 p-4">
            <div className="text-xs text-white/75">{left >= 0 ? 'Dư sau dự kiến' : 'Thiếu so với dự kiến'}</div>
            <div className={`mt-1 text-xl font-bold ${left < 0 ? 'text-red-200' : ''}`}>{money(Math.abs(left))}</div>
            <div className="text-xs text-white/75">≈ {shortMoney(Math.abs(left) / (members.length || 1))}/người</div>
          </div>
        </div>
      </section>

      {/* chi tiêu */}
      <section>
        <SectionTitle eyebrow="Chi tiêu" title="Các khoản chi"
          right={<Btn onClick={() => expForm.open({ cat: 'food', status: 'paid', payer: '', amount: 0, split: [] })}><Plus size={16} /> Thêm</Btn>} />
        <div className="mb-4">
          <Segmented value={filter} onChange={setFilter} options={[{ value: 'all', label: 'Tất cả' }, { value: 'paid', label: 'Đã chi' }, { value: 'planned', label: 'Dự kiến' }]} />
        </div>
        <div className="space-y-2">
          {filter !== 'planned' && (
            <a href={to('so-chi')} className="flex items-center gap-3 rounded-3xl border border-brand/40 bg-brand/10 p-3.5 pr-4 transition hover:bg-brand/15">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/20 text-2xl">📒</div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold">Sổ chi hằng ngày</div>
                <div className="text-xs text-muted">{logs.length} khoản cafe, ăn uống… thủ quỹ ghi</div>
              </div>
              <div className="shrink-0 font-bold">{money(logs.reduce((a, e) => a + (Number(e.amount) || 0), 0))}</div>
            </a>
          )}
          {shown.map((e) => {
            const c = catOf(e.cat), done = e.status === 'paid', split = splitOf(e)
            return (
              <div key={e.id} onClick={() => expForm.open(e)} className="flex cursor-pointer items-center gap-3 rounded-3xl bg-card p-3.5 pr-4 transition hover:bg-card-2">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-card-2 text-2xl">{c.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-[15px] leading-snug font-semibold">{e.title}</div>
                  <div className="text-xs text-muted">
                    {[e.payer ? `${e.payer} ứng` : 'Quỹ chung', split.length < members.length && `chia ${split.join(', ')}`, e.note].filter(Boolean).join(' · ')}
                    {e.receipt && <Receipt size={12} className="ml-1 inline align-[-1px]" />}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-bold tabular-nums">{money(e.amount)}</div>
                  {done
                    ? <div className="text-[11px] font-semibold text-ok">Đã chi</div>
                    : <button onClick={(ev) => { ev.stopPropagation(); expForm.open({ ...e, status: 'paid' }, { confirm: true }) }} className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand"><CheckCircle2 size={12} /> Đã chi?</button>}
                </div>
              </div>
            )
          })}
          {shown.length === 0 && <p className="py-8 text-center text-muted">Chưa có khoản nào.</p>}
        </div>
      </section>

      {/* thành viên */}
      <section>
        <SectionTitle eyebrow="Thành viên" title="Ai góp bao nhiêu" />
        <div className="grid gap-2 sm:grid-cols-2">
          {members.map((m, i) => {
            const n = contribsOf(m).length
            return (
              <div key={m.id} onClick={() => setContribOf(m.id)} className="flex cursor-pointer items-center gap-3 rounded-3xl bg-card p-3.5 transition hover:bg-card-2">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand/20 font-bold text-brand">{(m.name || '?').trim().split(' ').pop()[0]}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs text-muted">{[m.note, n > 1 && `${n} lần góp`].filter(Boolean).join(' · ')}</div>
                </div>
                <div className="text-right font-bold tabular-nums">{money(m.contributed)}</div>
                <EditTools onEdit={() => memberForm.open(m)} onDelete={() => confirmDelete(`thành viên ${m.name}`, () => remove('members', m.id))}
                  onUp={i > 0 ? () => swapOrder('members', members, i, i - 1) : null} />
              </div>
            )
          })}
        </div>
        <p className="mt-2 px-1 text-xs text-muted">Bấm vào một người để xem các lần góp hoặc ghi góp thêm.</p>
        <div className="mt-3"><AddButton onClick={() => memberForm.open({ contributed: 10000000 })}>Thêm thành viên</AddButton></div>
      </section>

      <Settlement sum={sum} />

      <FormSheet {...expForm.props} title={confirming ? 'Xác nhận đã chi' : expForm.props.initial?.id ? 'Sửa khoản chi' : 'Thêm khoản chi'}
        fields={confirming ? expenseFields(members).filter((f) => f.key !== 'status') : expenseFields(members)}
        onSubmit={({ id, ...v }) => save('expenses', id, withReceipt(v, expForm.props.initial))}
        onDelete={expForm.props.initial?.id && !confirming ? () => delExpense(expForm.props.initial) : null} />
      <FormSheet {...memberForm.props} title={memberForm.props.initial?.id ? 'Sửa thành viên' : 'Thêm thành viên'}
        fields={memberForm.props.initial?.contribs ? MEMBER_FIELDS.filter((f) => f.key !== 'contributed') : MEMBER_FIELDS}
        onSubmit={({ id, ...v }) => save('members', id, v)} />
      {contribOf && members.some((m) => m.id === contribOf) && <Contributions m={members.find((m) => m.id === contribOf)} onClose={() => setContribOf(null)} />}
    </div>
  )
}

// Các lần góp quỹ của 1 người + ghi góp thêm. contributed luôn = tổng contribs.
function Contributions({ m, onClose }) {
  const edit = useEdit()
  const [amount, setAmount] = useState(0)
  const [note, setNote] = useState('')
  const [date, setDate] = useState(today())
  const list = contribsOf(m)
  const write = (next) => save('members', m.id, { contribs: next, contributed: next.reduce((a, c) => a + (Number(c.amount) || 0), 0) })
  const add = (e) => {
    e.preventDefault()
    if (!amount) return
    write([...list, { amount, date, note: note.trim() }])
    setAmount(0); setNote('')
  }
  const cls = 'w-full rounded-2xl border border-line bg-card px-4 py-3 text-base outline-none focus:border-brand sm:text-[15px]'
  return (
    <Sheet open onClose={onClose} title={`${m.name} góp quỹ`}>
      <div className="mb-4 flex items-baseline justify-between rounded-2xl bg-card p-4">
        <span className="text-sm text-muted">Tổng đã góp</span>
        <span className="text-2xl font-extrabold">{money(m.contributed)}</span>
      </div>
      <div className="space-y-1.5">
        {list.map((c, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{money(c.amount)}</div>
              <div className="text-xs text-muted">{[c.date && c.date.split('-').reverse().join('/'), c.note].filter(Boolean).join(' · ') || 'Không ghi ngày'}</div>
            </div>
            {edit && list.length > 1 && (
              <button onClick={() => confirmDelete(`lần góp ${money(c.amount)}`, () => write(list.filter((_, j) => j !== i)))} aria-label="Xoá lần góp" className="text-red-300"><Trash2 size={16} /></button>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={add} className="mt-5 space-y-2.5 rounded-2xl border border-line p-4">
        <div className="text-xs font-semibold tracking-wider text-muted uppercase">Ghi góp thêm</div>
        <div className="relative">
          <input inputMode="numeric" value={amount ? amount.toLocaleString('vi-VN') : ''} placeholder="0" onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, '')) || 0)} className={`${cls} pr-10 text-right text-xl font-bold`} />
          <span className="absolute top-1/2 right-4 -translate-y-1/2 text-muted">đ</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={cls} />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú" className={cls} />
        </div>
        <Btn type="submit" disabled={!amount} className="w-full"><Plus size={16} /> Góp thêm {amount ? money(amount) : ''}</Btn>
      </form>
    </Sheet>
  )
}

// Quyết toán: chỉ tính khoản Đã chi. Ai số dư dương thì quỹ trả lại, âm thì đóng thêm vào quỹ.
// Hiện đủ đến từng đồng (chỉ làm tròn phần lẻ khi chia không hết) để đối chiếu được với tiền mặt quỹ.
function Settlement({ sum }) {
  const [copied, setCopied] = useState(false)
  const { people, cash } = sum
  const lines = people.map((p) => ({ ...p, b: Math.round(p.balance), share: Math.round(p.share) }))
  const copy = async () => {
    const text = [
      `💰 Quyết toán Hà Giang · quỹ còn ${money(cash)}`,
      ...lines.map((p) => `• ${p.name}: ${p.b > 0 ? `nhận lại ${money(p.b)}` : p.b < 0 ? `đóng thêm ${money(-p.b)}` : 'xong'} (góp ${money(p.contributed)}${p.advanced ? `, ứng ${money(p.advanced)}` : ''}, chịu ${money(p.share)})`),
    ].join('\n')
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* ignore */ }
  }
  return (
    <section>
      <SectionTitle eyebrow="Cuối chuyến" title="Quyết toán"
        right={<Btn variant="ghost" onClick={copy}>{copied ? <><Check size={15} /> Đã copy</> : <><Copy size={15} /> Copy</>}</Btn>} />
      <p className="-mt-1 mb-3 text-sm text-muted">Tính trên các khoản <b className="text-ink">Đã chi</b>. Ai ứng tiền túi thì được trừ vào phần của mình; khoản "Chia cho" vài người thì chỉ những người đó chịu.</p>
      <div className="space-y-1.5">
        {lines.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-card p-3.5">
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{p.name}</div>
              <div className="text-xs text-muted">Góp {money(p.contributed)}{p.advanced ? ` · ứng ${money(p.advanced)}` : ''} · chịu {money(p.share)}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className={`font-bold tabular-nums ${p.b > 0 ? 'text-ok' : p.b < 0 ? 'text-red-300' : ''}`}>{p.b === 0 ? 'Xong' : money(Math.abs(p.b))}</div>
              <div className="text-[11px] text-muted">{p.b > 0 ? 'quỹ trả lại' : p.b < 0 ? 'đóng thêm' : ''}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 px-1 text-xs text-muted">Tiền mặt quỹ còn {money(cash)} = tổng trả lại − tổng đóng thêm{people.length > 0 && Math.abs(lines.reduce((a, p) => a + p.b, 0) - cash) > 0 ? ' (lệch vài đồng do chia lẻ)' : ''}.</p>
    </section>
  )
}
