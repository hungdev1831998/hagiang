import { useEffect, useState } from 'react'
import { to } from '../router'
import { ArrowRight, MessageCircle, Plane, Phone } from 'lucide-react'
import { save, useCollection, useDocument } from '../store'
import { useFundSummary } from './Fund'
import { EditTools, FormSheet, asset, SectionTitle, dayLabel, shortMoney, useForm } from '../components/ui'

const FLIGHT_FIELDS = [
  { key: 'dir', label: 'Chiều', placeholder: 'Chiều đi' }, { key: 'code', label: 'Chuyến bay', placeholder: 'VJ128' },
  { key: 'date', label: 'Ngày', type: 'date' }, { key: 'dep', label: 'Giờ cất cánh', placeholder: '17:20' }, { key: 'arr', label: 'Giờ hạ cánh', placeholder: '19:30' },
  { key: 'from', label: 'Đi từ' }, { key: 'to', label: 'Đến' }, { key: 'note', label: 'Ghi chú' },
]

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t) }, [ms])
  return now
}

const vnNow = (now) => new Date(now + 7 * 3600e3).toISOString() // giờ VN dạng ISO
const minutesOf = (t) => { const m = /(\d{1,2}):(\d{2})/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : null }

function nextUp(days, now) {
  if (!days?.length) return null
  const iso = vnNow(now), today = iso.slice(0, 10), mins = minutesOf(iso.slice(11, 16))
  const sorted = [...days].filter((d) => d.date).sort((a, b) => a.date.localeCompare(b.date))
  for (const [i, d] of sorted.entries()) {
    if (d.date < today) continue
    const stop = d.date > today ? d.stops?.[0] : d.stops?.find((s) => minutesOf(s.time) >= mins)
    if (stop) return { day: d, index: i, stop, isToday: d.date === today }
  }
  return null
}

function Countdown({ target, now }) {
  const diff = Math.max(0, new Date(target) - now)
  const parts = [[Math.floor(diff / 864e5), 'ngày'], [Math.floor(diff / 36e5) % 24, 'giờ'], [Math.floor(diff / 6e4) % 60, 'phút'], [Math.floor(diff / 1e3) % 60, 'giây']]
  return (
    <div className="rounded-3xl border border-white/15 bg-black/30 p-1.5 backdrop-blur-md">
      <div className="px-3 pt-2 text-[11px] font-semibold tracking-wider text-white/70 uppercase">Còn lại tới giờ cất cánh ✈ VJ128</div>
      <div className="grid grid-cols-4 divide-x divide-white/10">
        {parts.map(([v, l]) => (
          <div key={l} className="py-2 text-center">
            <div className="text-3xl font-extrabold text-white tabular-nums sm:text-4xl">{String(v).padStart(2, '0')}</div>
            <div className="text-[11px] text-white/60">{l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Ảnh sticker cắt từ Figma, xếp lệch và trôi nhẹ
function HeroStickers({ className = '' }) {
  const pics = [
    ['lung-cu', 'left-[2%] top-[14%] w-[38%] -rotate-[8deg]', '0s'],
    ['nho-que', 'left-[30%] top-0 z-10 w-[42%] rotate-[4deg]', '-2s'],
    ['ma-pi-leng', 'right-[2%] top-[22%] w-[36%] rotate-[9deg]', '-4s'],
    ['cho-phien', 'left-[24%] bottom-0 z-20 w-[30%] -rotate-[4deg]', '-1s'],
  ]
  return (
    <div className={`pointer-events-none relative mx-auto aspect-[4/3] w-full max-w-[17rem] sm:max-w-none ${className}`}>
      {pics.map(([k, pos, delay]) => (
        <img key={k} src={asset(`/img/stops/${k}.png`)} alt="" style={{ animationDelay: delay }}
          className={`float absolute drop-shadow-[0_16px_28px_rgba(0,0,0,.45)] ${pos}`} />
      ))}
    </div>
  )
}

export default function Home() {
  const meta = useDocument('meta', 'main')
  const days = useCollection('days')
  const checklist = useCollection('checklist')
  const contacts = useCollection('contacts')
  const fund = useFundSummary()
  const now = useNow()
  const flightForm = useForm()

  const start = meta?.startAt ? new Date(meta.startAt) : null
  const end = meta?.endAt ? new Date(meta.endAt) : null
  const phase = !start ? 'before' : now < start ? 'before' : end && now > end ? 'after' : 'during'
  const up = nextUp(days, now)
  const flights = meta?.flights || []
  const done = checklist?.filter((c) => c.done).length ?? 0

  return (
    <div className="space-y-10">
      {/* hero */}
      <section className="relative -mx-4 -mt-5 overflow-hidden sm:mx-0 sm:mt-0 sm:rounded-[36px]">
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_90%_0%,#ff9a4d_0%,#e0661f_28%,#7a2e0c_62%,#1a120e_100%)]" />
        {/* lớp núi */}
        <svg className="absolute inset-x-0 bottom-0 h-[55%] w-full" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden>
          <path d="M0 170 L110 90 L210 150 L340 60 L470 160 L600 80 L720 150 L860 50 L990 140 L1100 90 L1200 130 V300 H0Z" fill="#000" opacity=".18" />
          <path d="M0 220 L150 140 L280 200 L420 120 L560 210 L700 140 L840 215 L980 130 L1100 190 L1200 160 V300 H0Z" fill="#000" opacity=".25" />
          <path d="M0 265 L200 205 L380 255 L560 200 L760 260 L940 210 L1200 250 V300 H0Z" fill="#121212" />
          <path d="M40 285 C220 240 330 270 480 240 S760 215 880 250 S1080 270 1180 235" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2.5" strokeDasharray="2 10" strokeLinecap="round" />
        </svg>

        <div className="relative grid gap-4 px-5 pt-6 pb-8 sm:grid-cols-[1.15fr_.85fr] sm:items-center sm:gap-6 sm:px-10 sm:pt-10 sm:pb-12">
          <HeroStickers className="order-first sm:order-last" />
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold tracking-[.2em] text-white backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> 03 – 08 · 12 · 2026
            </div>
            <h1 className="mt-3 font-hand text-[5.2rem] leading-[.85] text-white drop-shadow-[0_6px_24px_rgba(0,0,0,.35)] sm:text-[7rem]">Hà Giang</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] font-semibold text-white/90">
              {['Sài Gòn', 'Hà Nội', 'Hà Giang', 'Đồng Văn', 'Mèo Vạc'].map((p, i, arr) => (
                <span key={p} className="flex items-center gap-2">
                  <span className="rounded-full bg-black/25 px-2.5 py-1 backdrop-blur">{p}</span>
                  {i < arr.length - 1 && <span className="text-white/50">{i === 0 ? '✈' : i === 1 ? '🚌' : '›'}</span>}
                </span>
              ))}
            </div>
            <div className="mt-6 max-w-md">
              {phase === 'before' && start && <Countdown target={start} now={now} />}
              {phase === 'during' && <div className="inline-flex rounded-2xl bg-white px-4 py-2 font-bold text-brand">Đang đi chơi 🎉</div>}
              {phase === 'after' && <div className="inline-flex rounded-2xl bg-white/15 px-4 py-2 font-bold text-white">Chuyến đi đã xong, hẹn chuyến sau!</div>}
            </div>
          </div>
        </div>
      </section>

      {/* tiếp theo */}
      {up && (
        <a href={to('lich-trinh')} className="group block rounded-[28px] border border-line bg-card p-5 transition hover:border-brand">
          <div className="text-[11px] font-bold uppercase tracking-[.2em] text-brand">{up.isToday ? 'Tiếp theo hôm nay' : phase === 'before' ? 'Điểm đầu tiên' : 'Tiếp theo'}</div>
          <div className="mt-3 flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-3xl">{up.stop.icon || '📍'}</div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-bold">{up.stop.title}</div>
              <div className="text-sm text-muted">Day {up.index + 1} · {dayLabel(up.day.date)} · {up.stop.time}</div>
            </div>
            <ArrowRight className="text-muted transition group-hover:translate-x-1 group-hover:text-brand" />
          </div>
        </a>
      )}

      {/* số liệu nhanh */}
      <section className="grid grid-cols-3 gap-2.5">
        <a href={to('quy')} className="rounded-3xl bg-card p-4 transition hover:bg-card-2">
          <div className="text-xs text-muted">Quỹ dư</div>
          <div className="mt-1 text-xl font-extrabold">{fund ? shortMoney(fund.left) : '…'}</div>
        </a>
        <a href={to('chuan-bi')} className="rounded-3xl bg-card p-4 transition hover:bg-card-2">
          <div className="text-xs text-muted">Checklist</div>
          <div className="mt-1 text-xl font-extrabold">{done}/{checklist?.length ?? '…'}</div>
        </a>
        <a href={to('lich-trinh')} className="rounded-3xl bg-card p-4 transition hover:bg-card-2">
          <div className="text-xs text-muted">Lịch trình</div>
          <div className="mt-1 text-xl font-extrabold">{days?.length ?? '…'} ngày</div>
        </a>
      </section>

      {/* chuyến bay */}
      <section>
        <SectionTitle eyebrow="Chuyến bay" title="VietJet khứ hồi" />
        <div className="grid gap-3 md:grid-cols-2">
          {flights.map((f, i) => (
            <div key={f.id || i} className="rounded-[28px] bg-card p-5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-muted">{f.dir} · {dayLabel(f.date)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-brand">{f.code}</span>
                  <EditTools onEdit={() => flightForm.open(f, { index: i })} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div><div className="text-3xl font-extrabold">{f.dep}</div><div className="text-xs text-muted">{f.from}</div></div>
                <div className="relative flex-1 border-t-2 border-dashed border-line"><Plane size={18} className="absolute -top-[10px] left-1/2 -translate-x-1/2 bg-card text-brand" /></div>
                <div className="text-right"><div className="text-3xl font-extrabold">{f.arr}</div><div className="text-xs text-muted">{f.to}</div></div>
              </div>
              {f.note && <div className="mt-4 border-t border-dashed border-line pt-3 text-sm text-muted">{f.note}</div>}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Mã đặt chỗ xem trong email xác nhận, không lưu trên web.</p>
      </section>

      {/* liên hệ nhanh */}
      {contacts?.length > 0 && (
        <section>
          <SectionTitle eyebrow="Gọi nhanh" title="Nhà xe & homestay" right={<a href={to('chuan-bi')} className="text-sm font-semibold text-brand">Xem hết</a>} />
          <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:px-0">
            {contacts.map((c) => {
              // có số thì gọi, chưa có số thì nhắn qua TikTok
              const href = c.phone ? `tel:${c.phone}` : c.url
              return (
                <a key={c.id} href={href} target={c.phone ? undefined : '_blank'} rel="noreferrer"
                  className="flex w-64 shrink-0 items-center gap-3 rounded-3xl bg-card p-3.5 transition hover:bg-card-2 lg:w-auto">
                  <span className="text-2xl">{c.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{c.name}</div>
                    <div className="truncate text-xs text-muted">{c.phone ? c.phone.replace(/(\d{4})(\d{3})(\d+)/, '$1.$2.$3') : 'Nhắn qua TikTok'}</div>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                    {c.phone ? <Phone size={16} /> : <MessageCircle size={16} />}
                  </span>
                </a>
              )
            })}
          </div>
        </section>
      )}

      <FormSheet {...flightForm.props} title="Sửa chuyến bay" fields={FLIGHT_FIELDS}
        onSubmit={(v) => save('meta', 'main', { flights: flights.map((f, j) => (j === flightForm.meta.index ? v : f)) })} />
    </div>
  )
}
