import { useState } from 'react'
import { Check, Copy, Plus } from 'lucide-react'
import { remove, save, useCollection } from '../store'
import { CATS } from '../seed'
import { catOf, useFundSummary } from './Fund'
import { Btn, FormSheet, Loading, SectionTitle, confirmDelete, dayLabel, money, shortMoney, useForm } from '../components/ui'

// Sổ chi: thủ quỹ ghi nhanh từng khoản cafe, ăn uống, xăng… trong chuyến đi.
// Mỗi khoản là một expense { kind: 'log', status: 'paid', date, time }, nên Quỹ chung tự trừ theo.
const QUICK_CATS = ['food', 'cafe', 'bike', 'ticket', 'gift', 'other']
const AMOUNTS = [20000, 50000, 100000, 200000, 500000]
const vnNow = () => new Date(Date.now() + 7 * 3600e3).toISOString()

const editFields = (members) => [
  { key: 'title', label: 'Nội dung', placeholder: 'Cafe A Páo' },
  { key: 'amount', label: 'Số tiền', type: 'money' },
  { key: 'cat', label: 'Loại', type: 'select', options: CATS.map((c) => ({ value: c.key, label: `${c.icon} ${c.label}` })) },
  { key: 'date', label: 'Ngày', type: 'date' },
  { key: 'time', label: 'Giờ', type: 'time' },
  { key: 'payer', label: 'Ai trả', type: 'select', options: [{ value: '', label: 'Quỹ chung' }, ...members.map((m) => ({ value: m.name, label: m.name }))] },
]

const selectCls = 'w-full appearance-none rounded-2xl border border-line bg-card px-4 py-3 text-base text-ink outline-none focus:border-brand sm:text-sm'

export default function Ledger() {
  const sum = useFundSummary()
  const days = useCollection('days')
  const [cat, setCat] = useState('food')
  const [amount, setAmount] = useState(0)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [payer, setPayer] = useState('')
  const [copied, setCopied] = useState(false)
  const editForm = useForm()
  if (!sum || !days) return <Loading />

  const today = vnNow().slice(0, 10)
  const day = date || today
  const dayName = (iso) => {
    const i = days.findIndex((d) => d.date === iso)
    return i >= 0 ? `Day ${i + 1} · ${dayLabel(iso)}` : dayLabel(iso)
  }
  const logs = sum.expenses.filter((e) => e.kind === 'log')
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`) || (b.order ?? 0) - (a.order ?? 0))
  const total = logs.reduce((a, e) => a + (Number(e.amount) || 0), 0)
  const todayTotal = logs.filter((e) => e.date === today).reduce((a, e) => a + (Number(e.amount) || 0), 0)
  const dates = [...new Set(logs.map((e) => e.date))]
  const byCat = CATS.map((c) => ({ ...c, sum: logs.filter((e) => e.cat === c.key).reduce((a, e) => a + (Number(e.amount) || 0), 0) }))
    .filter((c) => c.sum > 0).sort((a, b) => b.sum - a.sum)
  const dateOptions = [...new Set([today, ...days.map((d) => d.date).filter(Boolean)])].sort()

  const add = (e) => {
    e.preventDefault()
    if (!amount) return
    save('expenses', null, {
      title: title.trim() || catOf(cat).label, amount, cat, status: 'paid', kind: 'log',
      date: day, time: vnNow().slice(11, 16), payer, note: '',
    })
    setAmount(0); setTitle('')
  }

  const copyReport = async () => {
    const lines = [`📒 Sổ chi Hà Giang · tổng ${money(total)}`, `💰 Quỹ còn: ${money(sum.cash)}`, '']
    for (const d of [...dates].sort()) {
      const rows = logs.filter((e) => e.date === d)
      lines.push(`${dayName(d)}: ${money(rows.reduce((a, e) => a + (Number(e.amount) || 0), 0))}`)
      rows.forEach((e) => lines.push(`  ${catOf(e.cat).icon} ${e.title} ${money(e.amount)}${e.payer ? ` (${e.payer} trả)` : ''}`))
    }
    try { await navigator.clipboard.writeText(lines.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* ignore */ }
  }

  return (
    <div className="space-y-8">
      {/* tổng quan */}
      <section className="grid grid-cols-3 gap-2.5">
        <div className="col-span-3 rounded-[28px] bg-gradient-to-br from-brand to-brand-2 p-5 text-white sm:col-span-1">
          <div className="text-xs text-white/80">Quỹ còn trong tay</div>
          <div className="mt-1 text-3xl font-extrabold tracking-tight">{money(sum.cash)}</div>
        </div>
        <div className="col-span-3 grid grid-cols-2 gap-2.5 sm:col-span-2">
          <div className="rounded-[28px] bg-card p-5">
            <div className="text-xs text-muted">Hôm nay chi</div>
            <div className="mt-1 text-2xl font-extrabold">{shortMoney(todayTotal)}</div>
          </div>
          <div className="rounded-[28px] bg-card p-5">
            <div className="text-xs text-muted">Tổng sổ chi</div>
            <div className="mt-1 text-2xl font-extrabold">{shortMoney(total)}</div>
            <div className="text-xs text-muted">{logs.length} khoản</div>
          </div>
        </div>
      </section>

      {/* ghi nhanh */}
      <form onSubmit={add} className="rounded-[28px] border border-line bg-panel p-5">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[.2em] text-brand">Ghi khoản mới</div>
        <div className="relative">
          <input inputMode="numeric" value={amount ? amount.toLocaleString('vi-VN') : ''} placeholder="0"
            onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, '')) || 0)}
            className="w-full rounded-2xl border border-line bg-card px-4 py-4 pr-12 text-right text-3xl font-extrabold tabular-nums outline-none focus:border-brand" />
          <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xl font-bold text-muted">đ</span>
        </div>
        <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto">
          {AMOUNTS.map((v) => (
            <button type="button" key={v} onClick={() => setAmount((a) => a + v)} className="shrink-0 rounded-xl bg-card-2 px-3 py-2 text-sm font-semibold text-muted transition hover:text-ink active:scale-95">+{shortMoney(v)}</button>
          ))}
          {amount > 0 && <button type="button" onClick={() => setAmount(0)} className="shrink-0 rounded-xl px-3 py-2 text-sm text-muted">Xoá</button>}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {QUICK_CATS.map((k) => {
            const c = catOf(k)
            return (
              <button type="button" key={k} onClick={() => setCat(k)}
                className={`flex flex-col items-center gap-1 rounded-2xl border py-2.5 text-xs font-semibold transition ${cat === k ? 'border-brand bg-brand/15 text-ink' : 'border-line bg-card text-muted'}`}>
                <span className="text-2xl">{c.icon}</span>{c.label}
              </button>
            )
          })}
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`Ghi chú (vd: ${cat === 'cafe' ? 'Cafe A Páo' : 'Lẩu gà đen phố cổ'})`}
          className="mt-3 w-full rounded-2xl border border-line bg-card px-4 py-3 text-base outline-none focus:border-brand sm:text-[15px]" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <select value={day} onChange={(e) => setDate(e.target.value)} className={selectCls}>
            {dateOptions.map((d) => <option key={d} value={d}>{d === today ? 'Hôm nay' : dayName(d)}</option>)}
          </select>
          <select value={payer} onChange={(e) => setPayer(e.target.value)} className={selectCls}>
            <option value="">Quỹ chung trả</option>
            {sum.members.map((m) => <option key={m.id} value={m.name}>{m.name} trả</option>)}
          </select>
        </div>
        <Btn type="submit" disabled={!amount} className="mt-4 w-full py-3.5 text-base"><Plus size={18} /> Ghi lại {amount ? money(amount) : ''}</Btn>
      </form>

      {/* theo loại */}
      {byCat.length > 0 && (
        <section>
          <SectionTitle eyebrow="Thống kê" title="Chi vào đâu nhiều nhất" />
          <div className="space-y-2.5 rounded-[28px] bg-card p-5">
            {byCat.map((c) => (
              <div key={c.key}>
                <div className="mb-1 flex justify-between text-sm"><span>{c.icon} {c.label}</span><span className="font-bold">{money(c.sum)}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-card-2"><div className="h-full rounded-full bg-brand" style={{ width: `${(c.sum / byCat[0].sum) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* lịch sử theo ngày */}
      <section>
        <SectionTitle eyebrow="Lịch sử" title="Từng khoản đã ghi"
          right={logs.length > 0 && <Btn variant="ghost" onClick={copyReport}>{copied ? <><Check size={15} /> Đã copy</> : <><Copy size={15} /> Copy báo cáo</>}</Btn>} />
        {logs.length === 0 && <p className="rounded-3xl bg-card py-10 text-center text-sm text-muted">Chưa ghi khoản nào. Nhập số tiền ở trên rồi bấm Ghi lại.</p>}
        <div className="space-y-6">
          {dates.map((d) => {
            const rows = logs.filter((e) => e.date === d)
            return (
              <div key={d}>
                <div className="mb-2 flex items-baseline justify-between px-1">
                  <h4 className="text-sm font-bold">{d === today ? 'Hôm nay' : dayName(d)}</h4>
                  <span className="text-sm font-bold text-brand">{money(rows.reduce((a, e) => a + (Number(e.amount) || 0), 0))}</span>
                </div>
                <div className="space-y-1.5">
                  {rows.map((e) => (
                    <button key={e.id} onClick={() => editForm.open(e)} className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left transition hover:bg-card-2">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-card-2 text-xl">{catOf(e.cat).icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-semibold">{e.title}</div>
                        <div className="text-xs text-muted">{e.time}{e.payer ? ` · ${e.payer} trả` : ''}</div>
                      </div>
                      <span className="shrink-0 font-bold tabular-nums">{money(e.amount)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <FormSheet {...editForm.props} title="Sửa khoản chi" fields={editFields(sum.members)}
        onSubmit={({ id, ...v }) => save('expenses', id, v)}
        onDelete={() => confirmDelete('khoản chi này', () => remove('expenses', editForm.props.initial.id))} />
    </div>
  )
}
