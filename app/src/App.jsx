import { useEffect, useState } from 'react'
import { CalendarDays, Check, Home as HomeIcon, Images, ListChecks, LogOut, Pencil, Wallet, Lock, Loader2 } from 'lucide-react'
import { hasKey, login, logout } from './store'
import { EditContext } from './components/ui'
import Home from './pages/Home'
import Itinerary from './pages/Itinerary'
import Fund from './pages/Fund'
import Prepare from './pages/Prepare'
import Photos from './pages/Photos'

const TABS = [
  { id: '', label: 'Trang chủ', icon: HomeIcon, el: Home },
  { id: 'lich-trinh', label: 'Lịch trình', icon: CalendarDays, el: Itinerary },
  { id: 'quy', label: 'Quỹ', icon: Wallet, el: Fund },
  { id: 'chuan-bi', label: 'Chuẩn bị', icon: ListChecks, el: Prepare },
  { id: 'anh', label: 'Ảnh', icon: Images, el: Photos },
]

const readRoute = () => location.hash.replace(/^#\/?/, '').split('?')[0]

function Login({ onDone }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    if (!pw) return
    setBusy(true); setErr('')
    try { await login(pw); onDone() } catch (e2) { setErr(e2.message) } finally { setBusy(false) }
  }
  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden px-5">
      <img src="/img/nhoque.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/70 to-bg" />
      <form onSubmit={submit} className="rise relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-hand text-6xl leading-none">Hà Giang</div>
          <div className="mt-2 text-sm font-semibold tracking-[.3em] text-brand">3 – 8 · 12 · 2026</div>
        </div>
        <div className="rounded-[28px] border border-line bg-panel/90 p-6 backdrop-blur">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted"><Lock size={15} /> Mật khẩu của nhóm</label>
          <input type="password" inputMode="numeric" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••"
            className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-center text-xl tracking-[.4em] outline-none focus:border-brand" />
          {err && <p className="mt-3 text-center text-sm text-red-300">{err}</p>}
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
  const [route, setRoute] = useState(readRoute())
  const [edit, setEdit] = useState(false)

  useEffect(() => {
    const h = () => { setRoute(readRoute()); scrollTo({ top: 0 }) }
    addEventListener('hashchange', h)
    return () => removeEventListener('hashchange', h)
  }, [])

  if (!authed) return <Login onDone={() => setAuthed(true)} />

  const tab = TABS.find((t) => t.id === route) || TABS[0]
  const Page = tab.el

  return (
    <EditContext.Provider value={{ edit }}>
      <div className="min-h-svh pb-28 md:pb-12">
        <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/85 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
            <a href="#/" className="font-hand text-2xl leading-none">Hà Giang<span className="text-brand">.</span></a>
            <nav className="ml-6 hidden gap-1 md:flex">
              {TABS.map((t) => (
                <a key={t.id} href={`#/${t.id}`} className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition ${t === tab ? 'bg-card text-ink' : 'text-muted hover:text-ink'}`}>{t.label}</a>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setEdit((e) => !e)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition ${edit ? 'bg-brand text-white' : 'bg-card text-muted hover:text-ink'}`}>
                {edit ? <><Check size={15} /> Xong</> : <><Pencil size={14} /> Sửa</>}
              </button>
              <button onClick={() => window.confirm('Đăng xuất khỏi máy này?') && logout()} className="grid h-9 w-9 place-items-center rounded-full bg-card text-muted hover:text-ink" aria-label="Đăng xuất">
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
          <div className="mx-auto flex max-w-md justify-around">
            {TABS.map((t) => {
              const Icon = t.icon, on = t === tab
              return (
                <a key={t.id} href={`#/${t.id}`} className={`flex w-16 flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-semibold transition ${on ? 'text-brand' : 'text-muted'}`}>
                  <Icon size={22} strokeWidth={on ? 2.4 : 1.8} />
                  {t.label}
                </a>
              )
            })}
          </div>
        </nav>
      </div>
    </EditContext.Provider>
  )
}
