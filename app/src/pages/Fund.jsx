import { useState } from 'react'
import { to } from '../router'
import { CheckCircle2, Plus } from 'lucide-react'
import { remove, save, swapOrder, useCollection } from '../store'
import { CATS } from '../seed'
import { AddButton, Btn, EditTools, FormSheet, Loading, SectionTitle, Segmented, confirmDelete, money, shortMoney, useForm } from '../components/ui'

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
  { key: 'payer', label: 'Ai trả', type: 'select', options: [{ value: '', label: 'Quỹ chung' }, ...members.map((m) => ({ value: m.name, label: m.name }))] },
  { key: 'note', label: 'Ghi chú' },
]

export function useFundSummary() {
  const members = useCollection('members')
  const expenses = useCollection('expenses')
  if (!members || !expenses) return null
  const fund = members.reduce((a, m) => a + (Number(m.contributed) || 0), 0)
  const amt = (e) => Number(e.amount) || 0
  const paid = expenses.filter((e) => e.status === 'paid').reduce((a, e) => a + amt(e), 0)
  // Khoản ghi trong Sổ chi trừ dần vào khoản dự kiến cùng loại (cafe tính vào ăn uống), để không tính trùng
  const logged = {}
  expenses.filter((e) => e.kind === 'log').forEach((e) => { const k = catOf(e.cat).budget || e.cat; logged[k] = (logged[k] || 0) + amt(e) })
  const plannedByCat = {}
  expenses.filter((e) => e.status !== 'paid').forEach((e) => { plannedByCat[e.cat] = (plannedByCat[e.cat] || 0) + amt(e) })
  const planned = Object.entries(plannedByCat).reduce((a, [k, v]) => a + Math.max(0, v - (logged[k] || 0)), 0)
  return { members, expenses, fund, paid, planned, left: fund - paid - planned, cash: fund - paid }
}

export default function Fund() {
  const sum = useFundSummary()
  const [filter, setFilter] = useState('all')
  const memberForm = useForm()
  const expForm = useForm()
  if (!sum) return <Loading />
  const { members, expenses, fund, paid, planned, left, cash } = sum
  const logs = expenses.filter((e) => e.kind === 'log')
  const shown = expenses.filter((e) => e.kind !== 'log' && (filter === 'all' || (filter === 'paid' ? e.status === 'paid' : e.status !== 'paid')))
  const pct = (x) => `${fund ? Math.min(100, (x / fund) * 100) : 0}%`

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
          right={<Btn onClick={() => expForm.open({ cat: 'food', status: 'paid', payer: '', amount: 0 })}><Plus size={16} /> Thêm</Btn>} />
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
              <div className="shrink-0 font-bold">{shortMoney(logs.reduce((a, e) => a + (Number(e.amount) || 0), 0))}</div>
            </a>
          )}
          {shown.map((e) => {
            const c = catOf(e.cat), done = e.status === 'paid'
            return (
              <div key={e.id} onClick={() => expForm.open(e)} className="flex cursor-pointer items-center gap-3 rounded-3xl bg-card p-3.5 pr-4 transition hover:bg-card-2">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-card-2 text-2xl">{c.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-[15px] leading-snug font-semibold">{e.title}</div>
                  <div className="truncate text-xs text-muted">{[e.payer || 'Quỹ chung', e.note].filter(Boolean).join(' · ')}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-bold">{shortMoney(e.amount)}</div>
                  {done
                    ? <div className="text-[11px] font-semibold text-ok">Đã chi</div>
                    : <button onClick={(ev) => { ev.stopPropagation(); save('expenses', e.id, { status: 'paid' }) }} className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand"><CheckCircle2 size={12} /> Đã chi?</button>}
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
          {members.map((m, i) => (
            <div key={m.id} className="flex items-center gap-3 rounded-3xl bg-card p-3.5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand/20 font-bold text-brand">{(m.name || '?').trim().split(' ').pop()[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-muted">{m.note}</div>
              </div>
              <div className="text-right font-bold">{shortMoney(m.contributed)}</div>
              <EditTools onEdit={() => memberForm.open(m)} onDelete={() => confirmDelete(`thành viên ${m.name}`, () => remove('members', m.id))}
                onUp={i > 0 ? () => swapOrder('members', members, i, i - 1) : null} />
            </div>
          ))}
        </div>
        <div className="mt-3"><AddButton onClick={() => memberForm.open({ contributed: 10000000 })}>Thêm thành viên</AddButton></div>
      </section>

      <FormSheet {...expForm.props} title={expForm.props.initial?.id ? 'Sửa khoản chi' : 'Thêm khoản chi'} fields={expenseFields(members)}
        onSubmit={({ id, ...v }) => save('expenses', id, v)}
        onDelete={expForm.props.initial?.id ? () => confirmDelete('khoản chi này', () => remove('expenses', expForm.props.initial.id)) : null} />
      <FormSheet {...memberForm.props} title={memberForm.props.initial?.id ? 'Sửa thành viên' : 'Thêm thành viên'} fields={MEMBER_FIELDS}
        onSubmit={({ id, ...v }) => save('members', id, v)} />
    </div>
  )
}
