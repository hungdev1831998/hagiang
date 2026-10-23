import { useRef, useState } from 'react'
import { ChevronRight, Download, Pencil, Plus, RotateCcw, Trash2, Undo2, Upload } from 'lucide-react'
import { downloadJson, exportData, getMyName, importData, removeHistory, undo, useHistory } from '../store'
import { Btn, Loading, SectionTitle, Sheet, askConfirm, money, useEdit } from '../components/ui'

const COL_LABEL = {
  days: 'Lịch trình', members: 'Thành viên', expenses: 'Quỹ / Sổ chi', checklist: 'Checklist',
  contacts: 'Liên hệ', notes: 'Lưu ý', photos: 'Ảnh', suggestions: 'Đề xuất', meta: 'Chuyến bay', '*': 'Toàn bộ dữ liệu',
}
const ACTION = {
  create: { label: 'Thêm', icon: Plus, cls: 'bg-ok/15 text-ok' },
  update: { label: 'Sửa', icon: Pencil, cls: 'bg-brand/15 text-brand' },
  delete: { label: 'Xoá', icon: Trash2, cls: 'bg-red-500/15 text-red-300' },
  undo: { label: 'Hoàn tác', icon: Undo2, cls: 'bg-sky-500/15 text-sky-300' },
  restore: { label: 'Nạp backup', icon: RotateCcw, cls: 'bg-sky-500/15 text-sky-300' },
}
const FIELD_LABEL = {
  amount: 'số tiền', title: 'tên', text: 'nội dung', name: 'tên', done: 'trạng thái', status: 'trạng thái', time: 'giờ', date: 'ngày', note: 'ghi chú',
  contributed: 'đã góp', phone: 'SĐT', order: 'thứ tự', payer: 'người trả', cat: 'loại', stops: 'điểm dừng', temp: 'nhiệt độ',
  desc: 'mô tả', items: 'hoạt động', leg: 'đường đi', icon: 'icon', weather: 'thời tiết', caption: 'chú thích', credit: 'nguồn',
  kind: 'loại', area: 'khu vực', link: 'link', chosen: 'chốt', by: 'người đề xuất', flights: 'chuyến bay',
  km: 'quãng đường', dur: 'thời gian', from: 'giờ đi', to: 'giờ tới', label: 'tên', code: 'mã',
  split: 'chia cho', contribs: 'các lần góp', receipt: 'hoá đơn',
}
// Trường kỹ thuật không hiện; trường ảnh chỉ báo "đổi ảnh" (có thể là dataURL rất dài)
const HIDDEN = new Set(['id', 'order', 'votes', 'thumb', 'file'])
const IMAGE_KEYS = new Set(['img', 'src', 'figmaImg', 'receipt'])

// So sánh không phụ thuộc thứ tự trường: Firestore trả map với thứ tự key không cố định
const stable = (v) => JSON.stringify(v, (_, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, x[k]])) : x))
const same = (x, y) => stable(x) === stable(y)

const nameOf = (d) => d && (d.title || d.text || d.name || d.caption || (d.flights ? 'Chuyến bay' : ''))
const fmtVal = (k, v) => (k === 'amount' || k === 'contributed' ? money(v) : k === 'done' ? (v ? 'xong' : 'chưa xong') : k === 'status' ? (v === 'paid' ? 'đã chi' : 'dự kiến') : String(v ?? '–'))

// Mô tả ngắn thay đổi: "số tiền 50.000đ → 80.000đ"
function describe(e) {
  if (e.action === 'undo' && !e.after) return 'gỡ mục vừa thêm'
  if (e.action === 'undo' && !e.before) return 'khôi phục mục đã xoá'
  if (e.action !== 'update' && e.action !== 'undo') return ''
  const a = e.before || {}, b = e.after || {}
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => !same(a[k], b[k]))
  if (keys.includes('stops')) {
    const sc = stopChanges(a.stops || [], b.stops || [])
    if (sc.length === 1 && sc[0].label === 'thứ tự điểm dừng') return 'đổi thứ tự điểm dừng'
    const n0 = a.stops?.length ?? 0, n1 = b.stops?.length ?? 0
    return n0 === n1 ? 'sửa điểm dừng' : n1 > n0 ? 'thêm điểm dừng' : 'xoá điểm dừng'
  }
  return keys.slice(0, 2).map((k) => (typeof (a[k] ?? b[k]) === 'object' ? FIELD_LABEL[k] || k : `${FIELD_LABEL[k] || k}: ${fmtVal(k, a[k])} → ${fmtVal(k, b[k])}`)).join(' · ')
}

// Chi tiết từng trường đổi giữa 2 bản:
// { label, from, to } giá trị đơn · { label, minus, plus } danh sách (hoạt động…) · { label, text } còn lại
const shown = (k, v) => (v == null || v === '' ? '–' : fmtVal(k, v))
const itemText = (it) => (it && typeof it === 'object'
  ? it.amount != null ? [money(it.amount), it.date && it.date.split('-').reverse().join('/'), it.note].filter(Boolean).join(' · ') // lần góp quỹ
  : [it.label || it.name || it.title || it.code, it.time].filter(Boolean).join(' · ') || stable(it)
  : String(it))
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)
function changes(a, b) {
  a = a || {}; b = b || {}
  const out = []
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (HIDDEN.has(k) || same(a[k], b[k])) continue
    const label = FIELD_LABEL[k] || k
    if (k === 'stops') out.push(...stopChanges(a.stops || [], b.stops || []))
    else if (IMAGE_KEYS.has(k)) out.push({ label: 'ảnh', text: !a[k] ? 'thêm ảnh' : !b[k] ? 'bỏ ảnh' : 'đổi ảnh' })
    else if (Array.isArray(a[k] ?? b[k])) {
      const t0 = (a[k] || []).map(itemText), t1 = (b[k] || []).map(itemText)
      const minus = t0.filter((t) => !t1.includes(t)), plus = t1.filter((t) => !t0.includes(t))
      out.push(minus.length || plus.length ? { label, minus, plus } : { label, text: 'đổi thứ tự' })
    } else if (isObj(a[k]) || isObj(b[k])) changes(a[k], b[k]).forEach((c) => out.push({ ...c, label: `${label} · ${c.label}` }))
    else out.push({ label, from: shown(k, a[k]), to: shown(k, b[k]) })
  }
  return out
}
// Điểm dừng so theo id: thêm / xoá / sửa trường nào
function stopChanges(s0, s1) {
  const key = (s) => s.id || s.title
  const m0 = new Map(s0.map((s) => [key(s), s])), m1 = new Map(s1.map((s) => [key(s), s]))
  const out = []
  for (const s of s1) if (!m0.has(key(s))) out.push({ label: 'thêm điểm dừng', text: s.title })
  for (const s of s0) if (!m1.has(key(s))) out.push({ label: 'xoá điểm dừng', text: s.title })
  for (const s of s1) {
    const o = m0.get(key(s))
    if (o) changes(o, s).forEach((c) => out.push({ ...c, label: `${s.title} · ${c.label}` }))
  }
  // chỉ so thứ tự của các điểm có ở cả 2 bản
  const o0 = s0.filter((s) => m1.has(key(s))).map((s) => s.title), o1 = s1.filter((s) => m0.has(key(s))).map((s) => s.title)
  if (!same(o0, o1)) out.push({ label: 'thứ tự điểm dừng', from: o0.join(' › '), to: o1.join(' › ') })
  return out
}

const fullTime = (t) => new Date(t).toLocaleString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

const timeAgo = (t) => {
  const m = Math.round((Date.now() - t) / 6e4)
  if (m < 1) return 'vừa xong'
  if (m < 60) return `${m} phút trước`
  if (m < 24 * 60) return `${Math.round(m / 60)} giờ trước`
  return new Date(t).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}
// Gộp các lần sửa liên tiếp của cùng người trên cùng mục (cách nhau ≤ 10 phút) thành 1 dòng.
// items xếp mới → cũ; dòng gộp lấy after của lần mới nhất, before của lần cũ nhất (base) để hoàn tác.
const MERGE_GAP = 10 * 6e4
function mergeRuns(items) {
  const runs = []
  for (const e of items) {
    const run = runs.at(-1), prev = run?.at(-1)
    const same = prev && e.action === 'update' && prev.action === 'update' && !e.undone && !prev.undone
      && e.col === prev.col && e.docId === prev.docId && e.by === prev.by && prev.at - e.at <= MERGE_GAP
    if (same) run.push(e)
    else runs.push([e])
  }
  return runs.map((run) => {
    const base = run.at(-1)
    return { ...run[0], before: base.before, base, entries: run, ids: run.map((x) => x.id), count: run.length }
  })
}

const dayKey = (t) => new Date(t).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })
const stamp = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 16).replace(/[-:T]/g, '')

function Backup() {
  const file = useRef(null)
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')

  const doExport = async () => {
    setBusy('export'); setMsg('')
    try { downloadJson(await exportData(), `hagiang-backup-${stamp()}.json`); setMsg('Đã tải file backup về máy.') }
    catch { setMsg('Không tải được, kiểm tra mạng rồi thử lại.') }
    setBusy('')
  }

  const onFile = async (e) => {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    let backup
    try { backup = JSON.parse(await f.text()) } catch { setMsg('File không đọc được.'); return }
    if (backup?.app !== 'hagiang-2026') { setMsg('File này không phải backup của app.'); return }
    const when = new Date(backup.exportedAt).toLocaleString('vi-VN')
    askConfirm({
      title: 'Nạp lại backup?',
      message: `Toàn bộ dữ liệu sẽ trở về bản lúc ${when}. App tự tải bản hiện tại về máy trước để phòng hờ.`,
      confirmLabel: 'Nạp lại', icon: <Upload size={24} />,
      onYes: async () => {
        setBusy('import'); setMsg('')
        try {
          downloadJson(await exportData(), `hagiang-truoc-khi-nap-${stamp()}.json`)
          await importData(backup)
          setMsg(`Đã nạp lại dữ liệu lúc ${when}.`)
        } catch (err) { setMsg(err.message || 'Nạp không thành công.') }
        setBusy('')
      },
    })
  }

  return (
    <section className="rounded-[28px] border border-line bg-panel p-5">
      <div className="text-[11px] font-bold uppercase tracking-[.2em] text-brand">Backup</div>
      <h3 className="mt-1 text-lg font-bold">Lưu toàn bộ dữ liệu ra file</h3>
      <p className="mt-1 text-sm text-muted">Lịch trình, quỹ, sổ chi, checklist, liên hệ, ảnh. Nên tải mỗi tối trong chuyến đi.</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Btn onClick={doExport} disabled={!!busy}><Download size={16} /> {busy === 'export' ? 'Đang tải…' : 'Tải backup'}</Btn>
        <Btn variant="ghost" onClick={() => file.current?.click()} disabled={!!busy}><Upload size={16} /> {busy === 'import' ? 'Đang nạp…' : 'Nạp từ file'}</Btn>
      </div>
      <input ref={file} type="file" accept="application/json,.json" hidden onChange={onFile} />
      {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
    </section>
  )
}

export default function History() {
  const items = useHistory()
  const edit = useEdit()
  const [openId, setOpenId] = useState(null)
  if (!items) return <Loading />

  const doUndo = (e) => {
    // có thay đổi mới hơn trên cùng mục thì cảnh báo sẽ ghi đè
    const newer = items.some((x) => x.docId === e.docId && x.col === e.col && x.at > e.at && !e.ids.includes(x.id))
    const what = nameOf(e.before) || nameOf(e.after) || COL_LABEL[e.col]
    askConfirm({
      title: `Hoàn tác "${what}"?`,
      message: newer
        ? 'Mục này đã được sửa thêm sau đó. Hoàn tác sẽ trả về bản trước lần thay đổi này, ghi đè cả các lần sửa sau.'
        : e.action === 'create' ? 'Mục vừa thêm sẽ bị gỡ đi.' : 'Mục này sẽ trở lại như trước khi thay đổi.',
      confirmLabel: 'Hoàn tác', icon: <Undo2 size={24} />,
      onYes: () => { setOpenId(null); undo(e.base, e.ids.filter((id) => id !== e.base.id)) },
    })
  }

  const doDelete = (e) => askConfirm({
    title: e.count > 1 ? `Xoá ${e.count} dòng lịch sử?` : 'Xoá dòng lịch sử này?',
    message: 'Chỉ xoá dòng ghi chép, dữ liệu vẫn giữ nguyên. Xoá rồi thì không hoàn tác thay đổi này được nữa.',
    confirmLabel: 'Xoá', danger: true, icon: <Trash2 size={24} />,
    onYes: () => { setOpenId(null); removeHistory(e.ids) },
  })

  const rows = mergeRuns(items)
  const opened = rows.find((r) => r.id === openId)
  const groups = []
  for (const e of rows) {
    const k = dayKey(e.at)
    if (groups.at(-1)?.k !== k) groups.push({ k, rows: [] })
    groups.at(-1).rows.push(e)
  }

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle eyebrow="Lịch sử" title="Ai vừa đổi gì" />
        <p className="-mt-1 text-sm text-muted">Bạn đang là <b className="text-ink">{getMyName() || 'chưa đặt tên'}</b>. Bấm vào một dòng để xem chi tiết; sửa hoặc xoá nhầm thì bấm <b className="text-ink">Hoàn tác</b> trong đó.</p>
      </div>

      <Backup />

      {items.length === 0 && <p className="rounded-3xl bg-card py-10 text-center text-sm text-muted">Chưa có thay đổi nào.</p>}
      {groups.map((g) => (
        <section key={g.k}>
          <h4 className="mb-2 px-1 text-xs font-bold uppercase tracking-[.15em] text-muted first-letter:uppercase">{g.k}</h4>
          <div className="space-y-1.5">
            {g.rows.map((e) => {
              const A = ACTION[e.action] || ACTION.update
              return (
                <button key={e.id} onClick={() => setOpenId(e.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left transition hover:bg-card-2 ${e.undone ? 'opacity-50' : ''}`}>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${A.cls}`}><A.icon size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-sm wrap-break-word"><b>{A.label}</b> {titleOf(e)}{e.count > 1 && <span className="text-muted"> · {e.count} lần</span>}</div>
                    <div className="mt-0.5 text-xs wrap-break-word text-muted">
                      {[COL_LABEL[e.col], describe(e), e.by || 'ai đó', timeAgo(e.at), e.undone && 'đã hoàn tác'].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-muted" />
                </button>
              )
            })}
          </div>
        </section>
      ))}

      {opened && <Detail e={opened} edit={edit} onClose={() => setOpenId(null)} onUndo={() => doUndo(opened)} onDelete={() => doDelete(opened)} />}
    </div>
  )
}

const titleOf = (e) => e.note || nameOf(e.action === 'delete' ? e.before : e.after) || nameOf(e.before) || COL_LABEL[e.col]

// Bảng chi tiết khi bấm 1 dòng: từng trường trước → sau, dòng gộp thì liệt kê từng lần (cũ → mới)
function Detail({ e, edit, onClose, onUndo, onDelete }) {
  const A = ACTION[e.action] || ACTION.update
  const canUndo = !e.undone && ['create', 'update', 'delete'].includes(e.action)
  const footer = (canUndo || edit) && <>
    {edit && <Btn variant="danger" onClick={onDelete}><Trash2 size={16} /> Xoá dòng</Btn>}
    {canUndo && <Btn className="flex-1" onClick={onUndo}><Undo2 size={16} /> Hoàn tác</Btn>}
  </>
  return (
    <Sheet open onClose={onClose} title={`${A.label} ${titleOf(e)}`} footer={footer}>
      <p className="mb-4 text-sm text-muted">
        {[COL_LABEL[e.col], e.by || 'ai đó', e.count > 1 ? `${e.count} lần sửa` : fullTime(e.at)].filter(Boolean).join(' · ')}
        {e.undone && <span className="ml-2 rounded-lg bg-card-2 px-2 py-0.5 text-xs font-semibold">Đã hoàn tác</span>}
      </p>
      <div className="space-y-3 pb-2">
        {[...e.entries].reverse().map((x) => (
          <div key={x.id} className="rounded-2xl bg-card p-3.5">
            {e.count > 1 && <div className="mb-2 text-xs font-semibold text-muted">{fullTime(x.at)}</div>}
            <ChangeList x={x} />
          </div>
        ))}
      </div>
    </Sheet>
  )
}

function ChangeList({ x }) {
  if (x.action === 'restore') return <p className="text-sm">{x.note || 'Nạp lại toàn bộ dữ liệu từ file backup'}</p>
  if (x.action === 'undo' && !x.after) return <p className="text-sm">Gỡ mục vừa thêm</p>
  const list = x.action === 'create' ? changes(null, x.after) : x.action === 'delete' ? changes(x.before, null) : changes(x.before, x.after)
  if (!list.length) return <p className="text-sm text-muted">Không có thay đổi nào hiển thị được.</p>
  return (
    <ul className="space-y-2">
      {list.map((c, i) => (
        <li key={i} className="text-sm wrap-break-word">
          <span className="text-xs font-semibold tracking-wide text-muted uppercase">{c.label}</span>
          <div className="mt-0.5">
            {c.text != null ? c.text
              : c.minus ? <>
                {c.minus.map((t, j) => <div key={`m${j}`} className="text-red-300 line-through">− {t}</div>)}
                {c.plus.map((t, j) => <div key={`p${j}`} className="text-ok">+ {t}</div>)}
              </>
              : x.action === 'create' ? c.to
              : x.action === 'delete' ? <span className="text-red-300 line-through">{c.from}</span>
              : <><span className="text-muted line-through">{c.from}</span> <span className="text-muted">→</span> <span className="font-semibold">{c.to}</span></>}
          </div>
        </li>
      ))}
    </ul>
  )
}
