import { useState } from 'react'
import { Check, ChevronDown, Phone } from 'lucide-react'
import { remove, save, swapOrder, useCollection } from '../store'
import { AddButton, Btn, EditTools, FormSheet, Loading, SectionTitle, Segmented, confirmDelete, useForm } from '../components/ui'

const TikTok = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...p}><path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.77.12V9.77a5.68 5.68 0 0 0-.77-.05A5.68 5.68 0 1 0 15.54 15.4V9.01a7.33 7.33 0 0 0 4.29 1.38V7.3a4.28 4.28 0 0 1-3.23-1.48z" /></svg>
)
const fmtPhone = (p) => (p || '').replace(/(\d{4})(\d{3})(\d+)/, '$1.$2.$3')

function Checklist() {
  const items = useCollection('checklist')
  const form = useForm()
  if (!items) return <Loading />
  const groups = [...new Set(items.map((i) => i.group || 'Khác'))]
  const done = items.filter((i) => i.done).length
  return (
    <div>
      <div className="mb-6 rounded-3xl bg-card p-5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted">Đã xong</span>
          <span className="text-2xl font-extrabold">{done}<span className="text-base text-muted">/{items.length}</span></span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-card-2">
          <div className="h-full rounded-full bg-ok transition-all" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">Danh sách chung: ai tích thì cả nhóm đều thấy.</p>
      </div>
      <div className="space-y-6">
        {groups.map((g) => {
          const rows = items.filter((i) => (i.group || 'Khác') === g)
          return (
            <div key={g}>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-muted">{g}</h4>
              <div className="space-y-1.5">
                {rows.map((it, i) => (
                  <div key={it.id} className="flex items-center gap-2 rounded-2xl bg-card pr-2">
                    <button onClick={() => save('checklist', it.id, { done: !it.done })} className="flex min-w-0 flex-1 items-center gap-3 p-3.5 text-left">
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition ${it.done ? 'border-ok bg-ok text-bg' : 'border-line'}`}>
                        {it.done && <Check size={15} strokeWidth={3} />}
                      </span>
                      <span className={`text-[15px] ${it.done ? 'text-muted line-through' : ''}`}>{it.text}</span>
                    </button>
                    <EditTools onEdit={() => form.open(it)} onDelete={() => confirmDelete(`"${it.text}"`) && remove('checklist', it.id)}
                      onUp={i > 0 ? () => swapOrder('checklist', rows, i, i - 1) : null} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-6"><AddButton onClick={() => form.open({ group: groups[0] || 'Việc cần làm', done: false })}>Thêm việc / món đồ</AddButton></div>
      <FormSheet {...form.props} title={form.props.initial?.id ? 'Sửa' : 'Thêm vào checklist'}
        fields={[{ key: 'text', label: 'Nội dung' }, { key: 'group', label: 'Nhóm', type: 'select', options: groups.map((g) => ({ value: g, label: g })) }, { key: 'groupNew', label: 'Hoặc tạo nhóm mới', placeholder: 'Ví dụ: Đồ ăn vặt' }]}
        onSubmit={({ id, groupNew, ...v }) => save('checklist', id, { ...v, group: groupNew?.trim() || v.group })} />
    </div>
  )
}

const CONTACT_FIELDS = [
  { key: 'name', label: 'Tên' }, { key: 'role', label: 'Vai trò / ghi chú' }, { key: 'phone', label: 'Số điện thoại', type: 'tel' },
  { key: 'url', label: 'Link TikTok / Facebook' }, { key: 'icon', label: 'Biểu tượng (emoji)', placeholder: '🏡' },
]

function Contacts() {
  const items = useCollection('contacts')
  const form = useForm()
  if (!items) return <Loading />
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((c, i) => (
          <div key={c.id} className="rounded-3xl bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-card-2 text-2xl">{c.icon || '📞'}</div>
              <div className="min-w-0 flex-1">
                <div className="font-bold">{c.name}</div>
                <div className="text-sm text-muted">{c.role}</div>
              </div>
              <EditTools onEdit={() => form.open(c)} onDelete={() => confirmDelete(c.name) && remove('contacts', c.id)}
                onUp={i > 0 ? () => swapOrder('contacts', items, i, i - 1) : null} />
            </div>
            <div className="mt-4 flex gap-2">
              {c.phone && <a href={`tel:${c.phone}`} className="flex-1"><Btn className="w-full"><Phone size={15} /> {fmtPhone(c.phone)}</Btn></a>}
              {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="flex-1"><Btn variant="ghost" className="w-full"><TikTok /> Nhắn tin</Btn></a>}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4"><AddButton onClick={() => form.open({ icon: '📞' })}>Thêm liên hệ</AddButton></div>
      <FormSheet {...form.props} title={form.props.initial?.id ? 'Sửa liên hệ' : 'Thêm liên hệ'} fields={CONTACT_FIELDS}
        onSubmit={({ id, ...v }) => save('contacts', id, { ...v, phone: (v.phone || '').replace(/\D/g, '') })} />
    </div>
  )
}

function Notes() {
  const items = useCollection('notes')
  const form = useForm()
  const [open, setOpen] = useState(null)
  if (!items) return <Loading />
  return (
    <div>
      <div className="space-y-2">
        {items.map((n, i) => (
          <div key={n.id} className="rounded-3xl bg-card">
            <div className="flex items-center gap-2 pr-3">
              <button onClick={() => setOpen(open === n.id ? null : n.id)} className="flex flex-1 items-center justify-between gap-3 p-4 text-left font-semibold">
                {n.title}
                <ChevronDown size={18} className={`shrink-0 text-brand transition ${open === n.id ? 'rotate-180' : ''}`} />
              </button>
              <EditTools onEdit={() => form.open(n)} onDelete={() => confirmDelete(`"${n.title}"`) && remove('notes', n.id)}
                onUp={i > 0 ? () => swapOrder('notes', items, i, i - 1) : null} />
            </div>
            {open === n.id && <p className="px-4 pb-4 text-sm leading-relaxed whitespace-pre-line text-muted">{n.body}</p>}
          </div>
        ))}
      </div>
      <div className="mt-4"><AddButton onClick={() => form.open({})}>Thêm lưu ý</AddButton></div>
      <FormSheet {...form.props} title={form.props.initial?.id ? 'Sửa lưu ý' : 'Thêm lưu ý'}
        fields={[{ key: 'title', label: 'Tiêu đề' }, { key: 'body', label: 'Nội dung', type: 'textarea' }]}
        onSubmit={({ id, ...v }) => save('notes', id, v)} />
    </div>
  )
}

export default function Prepare() {
  const [tab, setTab] = useState('check')
  return (
    <div>
      <SectionTitle eyebrow="Chuẩn bị" title={{ check: 'Checklist của nhóm', contact: 'Đặt xe & phòng', note: 'Lưu ý khi đi' }[tab]} />
      <div className="mb-5">
        <Segmented value={tab} onChange={setTab} options={[{ value: 'check', label: 'Checklist' }, { value: 'contact', label: 'Liên hệ' }, { value: 'note', label: 'Lưu ý' }]} />
      </div>
      {tab === 'check' && <Checklist />}
      {tab === 'contact' && <Contacts />}
      {tab === 'note' && <Notes />}
    </div>
  )
}

