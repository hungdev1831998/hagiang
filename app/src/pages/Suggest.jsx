import { useState } from 'react'
import { Heart, MapPin, Plus, Star } from 'lucide-react'
import { getMyName, remove, save, useCollection } from '../store'
import { Btn, EditTools, FormSheet, Loading, SectionTitle, Segmented, confirmDelete, useForm } from '../components/ui'

// Đề xuất quán cafe / ăn uống: ai cũng thêm được, thả tim để bình chọn, quán nhiều tim lên đầu.
export const AREAS = ['Hà Giang', 'Quản Bạ', 'Yên Minh', 'Đồng Văn', 'Mã Pì Lèng', 'Mèo Vạc', 'Hà Nội']
const KINDS = [
  { value: 'cafe', label: '☕ Cafe' },
  { value: 'food', label: '🍜 Ăn uống' },
  { value: 'other', label: '📍 Chỗ chơi' },
]
const FIELDS = [
  { key: 'name', label: 'Tên quán', placeholder: 'Cafe A Páo' },
  { key: 'kind', label: 'Loại', type: 'select', options: KINDS },
  { key: 'area', label: 'Khu vực', type: 'select', options: AREAS.map((a) => ({ value: a, label: a })) },
  { key: 'note', label: 'Vì sao nên ghé', type: 'textarea', placeholder: 'View đèo đẹp, có sưởi, cafe trứng ngon…' },
  { key: 'link', label: 'Link Google Maps / TikTok (nếu có)', placeholder: 'https://…' },
  { key: 'img', label: 'Ảnh', type: 'image' },
]
const mapUrl = (s) => s.link || `https://www.google.com/maps/search/${encodeURIComponent(`${s.name} ${s.area || ''} Việt Nam`)}`

export default function Suggest() {
  const items = useCollection('suggestions')
  const [area, setArea] = useState('all')
  const [kind, setKind] = useState('all')
  const form = useForm()
  const me = getMyName()
  if (!items) return <Loading />

  const votes = (s) => s.votes?.length || 0
  const shown = items
    .filter((s) => (area === 'all' || s.area === area) && (kind === 'all' || s.kind === kind))
    .sort((a, b) => (b.chosen ? 1 : 0) - (a.chosen ? 1 : 0) || votes(b) - votes(a) || (b.order ?? 0) - (a.order ?? 0))
  const areasUsed = AREAS.filter((a) => items.some((s) => s.area === a))

  const toggleVote = (s) => {
    if (!me) return
    const v = s.votes || []
    save('suggestions', s.id, { votes: v.includes(me) ? v.filter((x) => x !== me) : [...v, me] }, { log: false })
  }

  return (
    <div>
      <SectionTitle eyebrow="Đề xuất" title="Quán nào nên ghé?"
        right={<Btn onClick={() => form.open({ kind: 'cafe', area: 'Đồng Văn', by: me })}><Plus size={16} /> Đề xuất</Btn>} />
      <p className="-mt-1 mb-5 text-sm text-muted">Ai biết quán ngon, view đẹp thì thêm vào. Thả ❤️ để bình chọn, quán nhiều tim lên đầu.</p>

      <div className="mb-3"><Segmented value={kind} onChange={setKind} options={[{ value: 'all', label: 'Tất cả' }, ...KINDS]} /></div>
      {areasUsed.length > 1 && (
        <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
          {['all', ...areasUsed].map((a) => (
            <button key={a} onClick={() => setArea(a)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${area === a ? 'border-brand bg-brand/15 text-ink' : 'border-line text-muted hover:text-ink'}`}>
              {a === 'all' ? 'Mọi nơi' : a}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((s) => {
          const mine = me && s.votes?.includes(me)
          return (
            <div key={s.id} className={`relative rounded-[28px] bg-card p-4 ${s.chosen ? 'ring-2 ring-brand' : ''}`}>
              <div className="flex gap-3.5">
                {s.img
                  ? <img src={s.img} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                  : <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-card-2 text-4xl">{KINDS.find((k) => k.value === s.kind)?.label.split(' ')[0] || '☕'}</div>}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <h3 className="min-w-0 flex-1 text-[17px] leading-snug font-bold">{s.name}</h3>
                    <EditTools onEdit={() => form.open(s)} onDelete={() => confirmDelete(`"${s.name}"`, () => remove('suggestions', s.id))} />
                  </div>
                  <div className="mt-0.5 text-xs text-muted">{[s.area, s.by && `${s.by} đề xuất`].filter(Boolean).join(' · ')}</div>
                  {s.chosen && <div className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-brand px-2 py-0.5 text-[11px] font-bold text-white"><Star size={11} fill="currentColor" /> Đã chốt</div>}
                </div>
              </div>
              {s.note && <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted">{s.note}</p>}
              <div className="mt-4 flex items-center gap-2">
                <button onClick={() => toggleVote(s)} disabled={!me} title={me ? '' : 'Đặt tên ở trang Lịch sử để bình chọn'}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition active:scale-95 ${mine ? 'bg-red-500/20 text-red-300' : 'bg-card-2 text-muted hover:text-ink'}`}>
                  <Heart size={16} fill={mine ? 'currentColor' : 'none'} /> {votes(s)}
                </button>
                {votes(s) > 0 && <span className="min-w-0 flex-1 truncate text-xs text-muted">{s.votes.join(', ')}</span>}
                <div className="ml-auto flex shrink-0 gap-2">
                  <button onClick={() => save('suggestions', s.id, { chosen: !s.chosen })}
                    className={`rounded-full px-3 py-2 text-xs font-semibold transition ${s.chosen ? 'bg-brand/15 text-brand' : 'bg-card-2 text-muted hover:text-ink'}`}>
                    {s.chosen ? 'Bỏ chốt' : 'Chốt'}
                  </button>
                  <a href={mapUrl(s)} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-card-2 text-muted transition hover:text-brand" aria-label="Bản đồ"><MapPin size={16} /></a>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {shown.length === 0 && (
        <div className="rounded-[28px] border-2 border-dashed border-line py-12 text-center">
          <div className="text-4xl">☕</div>
          <p className="mt-2 text-sm text-muted">Chưa có đề xuất nào{area !== 'all' ? ` ở ${area}` : ''}.</p>
          <Btn className="mt-4" onClick={() => form.open({ kind: 'cafe', area: area === 'all' ? 'Đồng Văn' : area, by: me })}><Plus size={16} /> Đề xuất quán đầu tiên</Btn>
        </div>
      )}

      <FormSheet {...form.props} title={form.props.initial?.id ? 'Sửa đề xuất' : 'Đề xuất quán'} fields={FIELDS}
        onSubmit={({ id, ...v }) => v.name?.trim() && save('suggestions', id, { votes: [], ...v, name: v.name.trim() })} />
    </div>
  )
}
