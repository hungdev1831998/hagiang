import { useState } from 'react'
import { Camera, MapPinned, Plus, Pencil, Trash2 } from 'lucide-react'
import { remove, save, useCollection } from '../store'
import { AddButton, Btn, EditTools, FormSheet, Lightbox, Loading, Segmented, asset, confirmDelete, dayLabel, useEdit, useForm } from '../components/ui'

const STOP_FIELDS = [
  { key: 'title', label: 'Tên điểm dừng' },
  { key: 'time', label: 'Giờ tới', placeholder: '09:30' },
  { key: 'desc', label: 'Mô tả', type: 'textarea' },
  { key: 'items', label: 'Hoạt động', type: 'items' },
  { key: 'icon', label: 'Biểu tượng (emoji)', placeholder: '📍' },
  { key: 'img', label: 'Ảnh', type: 'image' },
  { key: 'legKm', label: 'Quãng đường tới điểm tiếp theo', placeholder: '12km' },
  { key: 'legDur', label: 'Thời gian di chuyển', placeholder: '30p' },
  { key: 'legFrom', label: 'Giờ rời điểm này', placeholder: '10:00' },
  { key: 'legTo', label: 'Giờ tới điểm tiếp theo', placeholder: '10:30' },
]
const DAY_FIELDS = [
  { key: 'title', label: 'Tên ngày', placeholder: 'Hà Giang → Đồng Văn' },
  { key: 'date', label: 'Ngày', type: 'date' },
  { key: 'weather', label: 'Thời tiết (emoji)', placeholder: '⛅' },
  { key: 'temp', label: 'Nhiệt độ', placeholder: '18°C – 9°C' },
  { key: 'figmaImg', label: 'Ảnh bản Figma', type: 'image' },
]

const todayIso = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10)

// Đoạn đường nối 2 điểm: giờ rời điểm trước → km, thời gian → giờ tới điểm sau (như nét đứt trong Figma)
function Leg({ leg }) {
  return (
    <div className="relative h-28 pl-[27px]">
      <div className="dash-v absolute top-0 bottom-0 left-[27px] w-[2px]" />
      {leg?.from && <span className="absolute top-2 right-6 text-xs font-semibold tabular-nums text-muted">rời {leg.from}</span>}
      {(leg?.km || leg?.dur) && (
        <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-xs">
          {leg.km && <span className="font-bold text-ink">{leg.km}</span>}
          {leg.dur && <span className="-rotate-2 rounded-lg bg-ink px-3 py-1 font-bold text-bg shadow">{leg.dur}</span>}
        </div>
      )}
      {leg?.to && <span className="absolute bottom-2 left-12 text-xs font-semibold tabular-nums text-muted">tới {leg.to}</span>}
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
          {s.img?.includes('/img/stops/') ? (
            // ảnh cắt từ Figma đã có sẵn khung + viền trắng + drone
            <button onClick={() => onImg(s.img)} className="h-28 w-28 shrink-0 sm:h-32 sm:w-32">
              <img src={asset(s.img)} alt={s.title} loading="lazy" className="h-full w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,.45)]" />
            </button>
          ) : s.img ? (
            <button onClick={() => onImg(s.img)} className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-[3px] border-ink/90 shadow-xl sm:h-28 sm:w-28">
              <img src={asset(s.img)} alt={s.title} loading="lazy" className="h-full w-full object-cover" />
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
    const { legKm, legDur, legFrom, legTo, ...rest } = v
    const s = { icon: '📍', desc: '', img: '', items: [], ...rest, leg: legKm || legDur || legFrom || legTo ? { km: legKm || '', dur: legDur || '', from: legFrom || '', to: legTo || '' } : null }
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

      {!day && <p className="py-16 text-center text-muted">Chưa có ngày nào. Bấm <b>Sửa</b> rồi dấu <b>+</b> để thêm.</p>}
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
              {edit && <Btn variant="danger" onClick={() => confirmDelete(`Day ${idx + 1}`, () => { remove('days', day.id); setActive(null) })}><Trash2 size={15} /></Btn>}
              {!edit && stops.length > 1 && <a href={mapUrl} target="_blank" rel="noreferrer"><Btn variant="ghost"><MapPinned size={16} /> Chỉ đường</Btn></a>}
            </div>
          </div>

          {view === 'figma' ? (
            day.figmaImg
              ? <img src={asset(day.figmaImg)} alt={`Day ${idx + 1}`} onClick={() => setImg(day.figmaImg)} className="mx-auto w-full max-w-sm cursor-zoom-in rounded-[28px]" />
              : <p className="py-10 text-center text-muted">Ngày này chưa có ảnh Figma. Bật chế độ Sửa → Sửa ngày để thêm.</p>
          ) : (
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
            <div className="mx-auto w-full max-w-xl">
              {stops.map((s, i) => (
                <div key={s.id}>
                  <StopCard s={s} onImg={setImg}
                    onEdit={() => stopForm.open({ ...s, legKm: s.leg?.km, legDur: s.leg?.dur, legFrom: s.leg?.from, legTo: s.leg?.to }, { index: i })}
                    onDelete={() => confirmDelete(`"${s.title}"`, () => setStops(stops.filter((_, j) => j !== i)))}
                    onUp={i > 0 ? () => move(i, i - 1) : null}
                    onDown={i < stops.length - 1 ? () => move(i, i + 1) : null} />
                  {i < stops.length - 1 && <Leg leg={s.leg} />}
                </div>
              ))}
              {stops.length === 0 && <p className="py-10 text-center text-muted">Chưa có điểm dừng nào.</p>}
              {edit && <div className="mt-6"><AddButton onClick={() => stopForm.open({ items: [], icon: '📍' })}>Thêm điểm dừng</AddButton></div>}
              {idx === days.length - 1 && <div className="mt-14 text-center font-hand text-5xl leading-tight text-muted/40">HAPPY<br />TRIP! :b</div>}
            </div>
            {day.figmaImg && (
              <aside className="hidden lg:block">
                <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-[28px]">
                  <img src={asset(day.figmaImg)} alt="" onClick={() => setImg(day.figmaImg)} className="w-full cursor-zoom-in" />
                </div>
              </aside>
            )}
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
