import { useState } from 'react'
import { Camera, MapPinned, Plus, Pencil, Trash2 } from 'lucide-react'
import { remove, save, useCollection } from '../store'
import { AddButton, Btn, EditTools, FormSheet, Lightbox, Loading, Segmented, confirmDelete, dayLabel, useEdit, useForm } from '../components/ui'

const STOP_FIELDS = [
  { key: 'title', label: 'Tên điểm dừng' },
  { key: 'time', label: 'Giờ tới', placeholder: '09:30' },
  { key: 'desc', label: 'Mô tả', type: 'textarea' },
  { key: 'items', label: 'Hoạt động', type: 'items' },
  { key: 'icon', label: 'Biểu tượng (emoji)', placeholder: '📍' },
  { key: 'img', label: 'Ảnh', type: 'image' },
  { key: 'legKm', label: 'Quãng đường tới điểm tiếp theo', placeholder: '12km' },
  { key: 'legDur', label: 'Thời gian di chuyển', placeholder: '30p' },
]
const DAY_FIELDS = [
  { key: 'title', label: 'Tên ngày', placeholder: 'Hà Giang → Đồng Văn' },
  { key: 'date', label: 'Ngày', type: 'date' },
  { key: 'weather', label: 'Thời tiết (emoji)', placeholder: '⛅' },
  { key: 'temp', label: 'Nhiệt độ', placeholder: '18°C – 9°C' },
  { key: 'figmaImg', label: 'Ảnh bản Figma', type: 'image' },
]

const todayIso = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10)

function Leg({ leg }) {
  return (
    <div className="relative flex h-20 items-center pl-[27px]">
      <div className="dash-v absolute top-0 bottom-0 left-[27px] w-[2px]" />
      {leg && (leg.km || leg.dur) && (
        <div className="ml-6 flex items-center gap-2 text-xs">
          {leg.km && <span className="font-semibold text-muted">{leg.km}</span>}
          {leg.dur && <span className="rounded-lg bg-ink px-2.5 py-1 font-bold text-bg">{leg.dur}</span>}
        </div>
      )}
    </div>
  )
}

function StopCard({ s, onEdit, onDelete, onUp, onDown, onImg }) {
  return (
    <div className="relative">
      {/* lớp nền lệch phía sau giống Figma */}
      <div className="absolute inset-0 translate-x-2 translate-y-2 -rotate-1 rounded-[28px] bg-card/50" />
      <div className="relative rounded-[28px] bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 inline-flex rounded-lg bg-brand/15 px-2 py-0.5 text-xs font-bold text-brand">{s.time}</div>
            <h3 className="text-lg leading-snug font-bold">{s.title}</h3>
            {s.desc && <p className="mt-1 text-[13px] leading-relaxed text-muted">{s.desc}</p>}
          </div>
          <EditTools onEdit={onEdit} onDelete={onDelete} onUp={onUp} onDown={onDown} />
        </div>
        <div className="mt-3 flex items-end gap-3">
          <ul className="min-w-0 flex-1 space-y-2.5">
            {(s.items || []).map((it) => (
              <li key={it.id} className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-card-2 text-muted"><Camera size={15} /></span>
                <div className="min-w-0">
                  <div className="text-sm leading-tight">{it.label}</div>
                  {it.time && (/^[\d.\s]{9,}$/.test(it.time)
                    ? <a href={`tel:${it.time.replace(/\D/g, '')}`} className="text-xs text-brand underline-offset-2 hover:underline">{it.time}</a>
                    : <div className="text-xs text-muted">{it.time}</div>)}
                </div>
              </li>
            ))}
          </ul>
          {s.img ? (
            <button onClick={() => onImg(s.img)} className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-[3px] border-ink/90 shadow-xl sm:h-28 sm:w-28">
              <img src={s.img} alt={s.title} loading="lazy" className="h-full w-full object-cover" />
            </button>
          ) : (
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-4xl shadow-xl">{s.icon || '📍'}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Itinerary() {
  const days = useCollection('days')
  const edit = useEdit()
  const [active, setActive] = useState(null)
  const [view, setView] = useState('timeline')
  const [img, setImg] = useState(null)
  const stopForm = useForm()
  const dayForm = useForm()

  if (!days) return <Loading />
  const day = days.find((d) => d.id === active) || days.find((d) => d.date === todayIso()) || days[0]
  const idx = days.indexOf(day)
  const stops = day?.stops || []

  const setStops = (next) => save('days', day.id, { stops: next })
  const submitStop = (v) => {
    const { legKm, legDur, ...rest } = v
    const s = { icon: '📍', desc: '', img: '', items: [], ...rest, leg: legKm || legDur ? { km: legKm || '', dur: legDur || '' } : null }
    const i = stopForm.meta?.index
    if (i == null) setStops([...stops, { ...s, id: `s${Date.now()}` }])
    else setStops(stops.map((x, j) => (j === i ? { ...x, ...s } : x)))
  }
  const move = (i, j) => {
    if (j < 0 || j >= stops.length) return
    const next = [...stops];[next[i], next[j]] = [next[j], next[i]]
    setStops(next)
  }
  const mapUrl = `https://www.google.com/maps/dir/${stops.map((s) => encodeURIComponent(`${s.title.replace(/\(.*?\)/g, '')} Hà Giang`)).join('/')}`

  return (
    <div>
      {/* chọn ngày */}
      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
        {days.map((d, i) => (
          <button key={d.id} onClick={() => setActive(d.id)}
            className={`shrink-0 rounded-2xl px-4 py-2.5 text-left transition ${d.id === day?.id ? 'bg-brand text-white' : 'bg-card text-muted hover:text-ink'}`}>
            <div className="text-[11px] font-semibold opacity-80">{dayLabel(d.date)}</div>
            <div className="text-sm font-bold">Day {i + 1}</div>
          </button>
        ))}
        {edit && (
          <button onClick={() => dayForm.open({ date: '', title: '', weather: '⛅', temp: '' }, { isNew: true })}
            className="grid shrink-0 place-items-center rounded-2xl border-2 border-dashed border-line px-4 text-muted hover:text-brand"><Plus size={18} /></button>
        )}
      </div>

      {day && (
        <>
          {/* tiêu đề ngày kiểu Figma */}
          <div className="mb-5 flex items-end justify-between gap-4">
            <div className="flex items-end gap-3">
              <span className="text-7xl leading-[.8] font-extrabold text-muted/40">{idx + 1}</span>
              <div>
                <div className="font-hand text-4xl leading-none">Hà Giang</div>
                <div className="mt-1 font-hand text-lg text-muted">{dayLabel(day.date)} · {day.title}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl leading-none">{day.weather}</div>
              <div className="mt-1 text-sm font-semibold">{day.temp}</div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Segmented value={view} onChange={setView} options={[{ value: 'timeline', label: 'Timeline' }, { value: 'figma', label: 'Bản Figma' }]} />
            <div className="flex gap-2">
              {edit && <Btn variant="ghost" onClick={() => dayForm.open(day)}><Pencil size={15} /> Sửa ngày</Btn>}
              {edit && <Btn variant="danger" onClick={() => confirmDelete(`Day ${idx + 1}`) && (remove('days', day.id), setActive(null))}><Trash2 size={15} /></Btn>}
              {!edit && stops.length > 1 && <a href={mapUrl} target="_blank" rel="noreferrer"><Btn variant="ghost"><MapPinned size={16} /> Chỉ đường</Btn></a>}
            </div>
          </div>

          {view === 'figma' ? (
            day.figmaImg
              ? <img src={day.figmaImg} alt={`Day ${idx + 1}`} onClick={() => setImg(day.figmaImg)} className="mx-auto w-full max-w-sm cursor-zoom-in rounded-[28px]" />
              : <p className="py-10 text-center text-muted">Ngày này chưa có ảnh Figma. Bật chế độ Sửa → Sửa ngày để thêm.</p>
          ) : (
            <div className="mx-auto max-w-xl">
              {stops.map((s, i) => (
                <div key={s.id}>
                  <StopCard s={s} onImg={setImg}
                    onEdit={() => stopForm.open({ ...s, legKm: s.leg?.km, legDur: s.leg?.dur }, { index: i })}
                    onDelete={() => confirmDelete(`"${s.title}"`) && setStops(stops.filter((_, j) => j !== i))}
                    onUp={i > 0 ? () => move(i, i - 1) : null}
                    onDown={i < stops.length - 1 ? () => move(i, i + 1) : null} />
                  {i < stops.length - 1 && <Leg leg={s.leg} />}
                </div>
              ))}
              {stops.length === 0 && <p className="py-10 text-center text-muted">Chưa có điểm dừng nào.</p>}
              {edit && <div className="mt-6"><AddButton onClick={() => stopForm.open({ items: [], icon: '📍' })}>Thêm điểm dừng</AddButton></div>}
              {idx === days.length - 1 && <div className="mt-14 text-center font-hand text-5xl leading-tight text-muted/40">HAPPY<br />TRIP! :b</div>}
            </div>
          )}
        </>
      )}

      <FormSheet {...stopForm.props} title={stopForm.meta?.index == null ? 'Thêm điểm dừng' : 'Sửa điểm dừng'} fields={STOP_FIELDS} onSubmit={submitStop} />
      <FormSheet {...dayForm.props} title={dayForm.meta?.isNew ? 'Thêm ngày' : 'Sửa ngày'} fields={DAY_FIELDS}
        onSubmit={(v) => {
          if (dayForm.meta?.isNew) { const nid = `day${Date.now()}`; save('days', nid, { ...v, stops: [], order: (days.at(-1)?.order || 0) + 1 }); setActive(nid) }
          else { const { id, stops: _s, ...rest } = v; save('days', id, rest) }
        }} />
      <Lightbox src={img} onClose={() => setImg(null)} />
    </div>
  )
}
