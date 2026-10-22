import { useEffect, useState } from 'react'
import { ArrowRight, Plane, Phone } from 'lucide-react'
import { save, useCollection, useDocument } from '../store'
import { useFundSummary } from './Fund'
import { EditTools, FormSheet, SectionTitle, dayLabel, shortMoney, useForm } from '../components/ui'

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
    <div className="grid grid-cols-4 gap-2">
      {parts.map(([v, l]) => (
        <div key={l} className="rounded-2xl bg-white/10 py-3 text-center backdrop-blur">
          <div className="text-3xl font-extrabold tabular-nums">{v}</div>
          <div className="text-[11px] text-white/70">{l}</div>
        </div>
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
      <section className="relative -mx-4 -mt-5 overflow-hidden px-4 pt-16 pb-6 sm:mx-0 sm:mt-0 sm:rounded-[32px] sm:px-6">
        <img src="/img/nhoque.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/30 to-bg" />
        <div className="relative">
          <div className="text-xs font-bold tracking-[.3em] text-brand">3 – 8 · 12 · 2026</div>
          <h1 className="mt-1 font-hand text-7xl leading-[.9] text-white drop-shadow-lg">Hà Giang</h1>
          <p className="mt-2 max-w-md text-sm text-white/85">Sài Gòn → Hà Nội → vòng loop Hà Giang: Quản Bạ, Thẩm Mã, Lũng Cú, Mã Pì Lèng, sông Nho Quế.</p>
          <div className="mt-6">
            {phase === 'before' && start && <><div className="mb-2 text-xs font-semibold text-white/75">Còn lại tới giờ cất cánh</div><Countdown target={start} now={now} /></>}
            {phase === 'during' && <div className="inline-flex rounded-2xl bg-brand px-4 py-2 font-bold text-white">Đang đi chơi 🎉</div>}
            {phase === 'after' && <div className="inline-flex rounded-2xl bg-white/15 px-4 py-2 font-bold text-white">Chuyến đi đã xong, hẹn chuyến sau!</div>}
          </div>
        </div>
      </section>

      {/* tiếp theo */}
      {up && (
        <a href="#/lich-trinh" className="group block rounded-[28px] border border-line bg-card p-5 transition hover:border-brand">
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
        <a href="#/quy" className="rounded-3xl bg-card p-4 transition hover:bg-card-2">
          <div className="text-xs text-muted">Quỹ dư</div>
          <div className="mt-1 text-xl font-extrabold">{fund ? shortMoney(fund.left) : '…'}</div>
        </a>
        <a href="#/chuan-bi" className="rounded-3xl bg-card p-4 transition hover:bg-card-2">
          <div className="text-xs text-muted">Checklist</div>
          <div className="mt-1 text-xl font-extrabold">{done}/{checklist?.length ?? '…'}</div>
        </a>
        <a href="#/lich-trinh" className="rounded-3xl bg-card p-4 transition hover:bg-card-2">
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
          <SectionTitle eyebrow="Gọi nhanh" title="Nhà xe & homestay" right={<a href="#/chuan-bi" className="text-sm font-semibold text-brand">Xem hết</a>} />
          <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4">
            {contacts.filter((c) => c.phone).map((c) => (
              <a key={c.id} href={`tel:${c.phone}`} className="flex w-52 shrink-0 items-center gap-3 rounded-3xl bg-card p-3.5 transition hover:bg-card-2">
                <span className="text-2xl">{c.icon}</span>
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{c.name}</div><div className="truncate text-xs text-muted">{c.role}</div></div>
                <Phone size={16} className="shrink-0 text-brand" />
              </a>
            ))}
          </div>
        </section>
      )}

      <FormSheet {...flightForm.props} title="Sửa chuyến bay" fields={FLIGHT_FIELDS}
        onSubmit={(v) => save('meta', 'main', { flights: flights.map((f, j) => (j === flightForm.meta.index ? v : f)) })} />
    </div>
  )
}
