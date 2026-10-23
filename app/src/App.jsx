import { useRef, useState } from 'react'
import { CalendarDays, Check, Coffee, Ellipsis, History as HistoryIcon, Home as HomeIcon, Images, ListChecks, LogOut, NotebookPen, Pencil, Wallet, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { getMyName, hasKey, login, logout, setMyName, useCollection } from './store'
import { useRoute, to } from './router'
import { ConfirmHost, EditContext, FigmaCollage, Sheet, askConfirm } from './components/ui'
import Home from './pages/Home'
import Itinerary from './pages/Itinerary'
import Fund from './pages/Fund'
import Ledger from './pages/Ledger'
import Prepare from './pages/Prepare'
import Photos from './pages/Photos'
import Suggest from './pages/Suggest'
import History from './pages/History'

// main: hiện trên thanh menu dưới đáy (điện thoại); còn lại nằm trong mục "Khác"
const TABS = [
  { id: '', label: 'Trang chủ', icon: HomeIcon, el: Home, main: true },
  { id: 'lich-trinh', label: 'Lịch trình', icon: CalendarDays, el: Itinerary, main: true },
  { id: 'de-xuat', label: 'Đề xuất', icon: Coffee, el: Suggest, main: true },
  { id: 'so-chi', label: 'Sổ chi', icon: NotebookPen, el: Ledger, main: true },
  { id: 'quy', label: 'Quỹ', icon: Wallet, el: Fund, main: true },
  { id: 'chuan-bi', label: 'Chuẩn bị', icon: ListChecks, el: Prepare },
  { id: 'anh', label: 'Ảnh', icon: Images, el: Photos },
  { id: 'lich-su', label: 'Lịch sử & Backup', short: 'Lịch sử', icon: HistoryIcon, el: History },
]

// Hỏi tên 1 lần mỗi máy, để lịch sử và bình chọn biết ai làm
function WhoAmI() {
  const members = useCollection('members')
  const [name, setName] = useState(getMyName())
  if (name || !members?.length) return null
  const pick = (n) => { setMyName(n); setName(n) }
  return (
    <Sheet open title="Bạn là ai?" onClose={() => pick('Khách')}>
      <p className="mb-4 text-sm text-muted">Chọn tên để lịch sử ghi ai sửa gì, và để thả tim ở mục Đề xuất. Chỉ hỏi 1 lần trên máy này.</p>
      <div className="grid grid-cols-2 gap-2 pb-2">
        {members.map((m) => (
          <button key={m.id} onClick={() => pick(m.name)} className="flex items-center gap-3 rounded-2xl bg-card p-3.5 text-left font-semibold transition hover:bg-card-2">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand/20 text-brand">{m.name.trim().split(' ').pop()[0]}</span>{m.name}
          </button>
        ))}
      </div>
    </Sheet>
  )
}

function Login({ onDone }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [show, setShow] = useState(false)
  const input = useRef(null)
  const box = useRef(null)
  // Rung ngay trên ô hiện có (không tạo lại ô: ô mật khẩu mới sẽ bị trình duyệt tự điền mật khẩu đã lưu)
  const fail = (msg) => {
    setErr(msg)
    input.current?.focus()
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
      box.current?.animate([{ translate: '0' }, { translate: '-6px 0' }, { translate: '6px 0' }, { translate: '-6px 0' }, { translate: '6px 0' }, { translate: '0' }], { duration: 350, easing: 'ease' })
  }
  const submit = async (e) => {
    e.preventDefault()
    if (!pw.trim()) return fail('Nhập mật khẩu nhóm trước nhé')
    setBusy(true); setErr('')
    try { await login(pw); onDone() } catch (e2) { fail(e2.message) } finally { setBusy(false) }
  }
  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden px-5">
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-[26vw] leading-none font-extrabold tracking-tight whitespace-nowrap text-white/[.035] select-none">HÀ GIANG</div>
      <form onSubmit={submit} className="rise relative w-full max-w-sm">
        <FigmaCollage className="mx-auto mb-4" />
        <div className="mb-8 text-center">
          <div className="font-hand text-6xl leading-none">Hà Giang</div>
          <div className="mt-2 text-sm font-semibold tracking-[.3em] text-brand">3 – 8 · 12 · 2026</div>
        </div>
        <div className="rounded-[28px] border border-line bg-panel/90 p-6 backdrop-blur">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted"><Lock size={15} /> Mật khẩu của nhóm</label>
          <div ref={box} className="relative">
            <input ref={input} type={show ? 'text' : 'password'} inputMode="numeric" autoComplete="current-password" autoFocus value={pw} placeholder="Nhập mật khẩu"
              onChange={(e) => { setPw(e.target.value); if (err) setErr('') }}
              aria-invalid={!!err} aria-describedby={err ? 'login-err' : undefined}
              className={`w-full rounded-2xl border bg-card px-12 py-3.5 text-center text-xl tracking-[.4em] outline-none placeholder:text-base placeholder:tracking-normal placeholder:text-muted/60 ${err ? 'border-red-400 focus:border-red-400' : 'border-line focus:border-brand'}`} />
            <button type="button" onClick={() => { setShow((s) => !s); input.current?.focus() }} aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="absolute top-1/2 right-2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-muted transition hover:text-ink">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {err && <p id="login-err" role="alert" className="mt-3 text-center text-sm text-red-300">{err}</p>}
          <button disabled={busy} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 font-bold text-white transition hover:bg-brand-2 disabled:opacity-60">
            {busy ? <Loader2 size={18} className="animate-spin" /> : 'Vào xem lịch trình'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(hasKey())
  const route = useRoute()
  const [edit, setEdit] = useState(false)
  const [more, setMore] = useState(false)

  if (!authed) return <Login onDone={() => setAuthed(true)} />

  const tab = TABS.find((t) => t.id === route) || TABS[0]
  const Page = tab.el
  const extra = TABS.filter((t) => !t.main)

  return (
    <EditContext.Provider value={{ edit }}>
      <ConfirmHost />
      <WhoAmI />
      <div className="min-h-svh pb-28 md:pb-12">
        <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/85 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
            <a href={to('')} className="font-hand text-2xl leading-none">Hà Giang<span className="text-brand">.</span></a>
            <nav className="ml-4 hidden gap-0.5 md:flex">
              {TABS.map((t) => (
                <a key={t.id} href={to(t.id)} className={`rounded-xl px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap transition ${t === tab ? 'bg-card text-ink' : 'text-muted hover:text-ink'}`}>{t.short || t.label}</a>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setEdit((e) => !e)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition ${edit ? 'bg-brand text-white' : 'bg-card text-muted hover:text-ink'}`}>
                {edit ? <><Check size={15} /> Xong</> : <><Pencil size={14} /> Sửa</>}
              </button>
              <button onClick={() => askConfirm({ title: 'Đăng xuất?', message: 'Lần sau vào lại cần nhập mật khẩu nhóm.', confirmLabel: 'Đăng xuất', icon: <LogOut size={24} />, onYes: logout })} className="grid h-9 w-9 place-items-center rounded-full bg-card text-muted hover:text-ink" aria-label="Đăng xuất">
                <LogOut size={16} />
              </button>
            </div>
          </div>
          {edit && <div className="bg-brand/15 py-1.5 text-center text-xs font-semibold text-brand">Đang ở chế độ sửa · thay đổi lưu ngay cho cả nhóm</div>}
        </header>

        <main key={tab.id} className="rise mx-auto max-w-5xl px-4 pt-5">
          <Page />
        </main>

        <nav className="safe-b fixed inset-x-0 bottom-0 z-40 border-t border-line/60 bg-bg/90 pt-1.5 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-md px-1">
            {[...TABS.filter((t) => t.main), { id: '__more', label: 'Khác', icon: Ellipsis }].map((t) => {
              const Icon = t.icon, on = t === tab || (t.id === '__more' && !tab.main)
              const cls = `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[10.5px] font-semibold whitespace-nowrap transition ${on ? 'text-brand' : 'text-muted'}`
              const inner = <><Icon size={22} strokeWidth={on ? 2.4 : 1.8} />{t.label}</>
              return t.id === '__more'
                ? <button key={t.id} onClick={() => setMore(true)} className={cls}>{inner}</button>
                : <a key={t.id} href={to(t.id)} className={cls}>{inner}</a>
            })}
          </div>
        </nav>

        <Sheet open={more} onClose={() => setMore(false)} title="Khác">
          <div className="space-y-2 pb-3">
            {extra.map((t) => (
              <a key={t.id} href={to(t.id)} onClick={() => setMore(false)}
                className={`flex items-center gap-3 rounded-2xl p-4 font-semibold transition ${t === tab ? 'bg-brand/15 text-brand' : 'bg-card hover:bg-card-2'}`}>
                <t.icon size={20} /> {t.label}
              </a>
            ))}
          </div>
        </Sheet>
      </div>
    </EditContext.Provider>
  )
}
