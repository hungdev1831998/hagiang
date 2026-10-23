import { useRef, useState } from 'react'
import { Download, Pencil, Plus, RotateCcw, Trash2, Undo2, Upload } from 'lucide-react'
import { downloadJson, exportData, getMyName, importData, removeHistory, undo, useHistory } from '../store'
import { Btn, IconBtn, Loading, SectionTitle, askConfirm, money, useEdit } from '../components/ui'

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
const FIELD_LABEL = { amount: 'số tiền', title: 'tên', text: 'nội dung', name: 'tên', done: 'trạng thái', status: 'trạng thái', time: 'giờ', date: 'ngày', note: 'ghi chú', contributed: 'đã góp', phone: 'SĐT', order: 'thứ tự', payer: 'người trả', cat: 'loại', stops: 'điểm dừng', temp: 'nhiệt độ' }

const nameOf = (d) => d && (d.title || d.text || d.name || d.caption || (d.flights ? 'Chuyến bay' : ''))
const fmtVal = (k, v) => (k === 'amount' || k === 'contributed' ? money(v) : k === 'done' ? (v ? 'xong' : 'chưa xong') : k === 'status' ? (v === 'paid' ? 'đã chi' : 'dự kiến') : String(v ?? '–'))

// Mô tả ngắn thay đổi: "số tiền 50.000đ → 80.000đ"
function describe(e) {
  if (e.action === 'undo' && !e.after) return 'gỡ mục vừa thêm'
  if (e.action === 'undo' && !e.before) return 'khôi phục mục đã xoá'
  if (e.action !== 'update' && e.action !== 'undo') return ''
  const a = e.before || {}, b = e.after || {}
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]))
  if (keys.includes('stops')) {
    const n0 = a.stops?.length ?? 0, n1 = b.stops?.length ?? 0
    return n0 === n1 ? 'sửa điểm dừng' : n1 > n0 ? 'thêm điểm dừng' : 'xoá điểm dừng'
  }
  return keys.slice(0, 2).map((k) => (typeof (a[k] ?? b[k]) === 'object' ? FIELD_LABEL[k] || k : `${FIELD_LABEL[k] || k}: ${fmtVal(k, a[k])} → ${fmtVal(k, b[k])}`)).join(' · ')
}

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
    return { ...run[0], before: base.before, base, ids: run.map((x) => x.id), count: run.length }
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
      onYes: () => undo(e.base, e.ids.filter((id) => id !== e.base.id)),
    })
  }

  const doDelete = (e) => askConfirm({
    title: e.count > 1 ? `Xoá ${e.count} dòng lịch sử?` : 'Xoá dòng lịch sử này?',
    message: 'Chỉ xoá dòng ghi chép, dữ liệu vẫn giữ nguyên. Xoá rồi thì không hoàn tác thay đổi này được nữa.',
    confirmLabel: 'Xoá', danger: true, icon: <Trash2 size={24} />,
    onYes: () => removeHistory(e.ids),
  })

  const groups = []
  for (const e of mergeRuns(items)) {
    const k = dayKey(e.at)
    if (groups.at(-1)?.k !== k) groups.push({ k, rows: [] })
    groups.at(-1).rows.push(e)
  }

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle eyebrow="Lịch sử" title="Ai vừa đổi gì" />
        <p className="-mt-1 text-sm text-muted">Bạn đang là <b className="text-ink">{getMyName() || 'chưa đặt tên'}</b>. Sửa hoặc xoá nhầm thì bấm <b className="text-ink">Hoàn tác</b>.</p>
      </div>

      <Backup />

      {items.length === 0 && <p className="rounded-3xl bg-card py-10 text-center text-sm text-muted">Chưa có thay đổi nào.</p>}
      {groups.map((g) => (
        <section key={g.k}>
          <h4 className="mb-2 px-1 text-xs font-bold uppercase tracking-[.15em] text-muted first-letter:uppercase">{g.k}</h4>
          <div className="space-y-1.5">
            {g.rows.map((e) => {
              const A = ACTION[e.action] || ACTION.update
              const what = e.note || nameOf(e.action === 'delete' ? e.before : e.after) || nameOf(e.before) || COL_LABEL[e.col]
              const canUndo = !e.undone && ['create', 'update', 'delete'].includes(e.action)
              return (
                <div key={e.id} className={`flex items-center gap-3 rounded-2xl bg-card p-3 ${e.undone ? 'opacity-50' : ''}`}>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${A.cls}`}><A.icon size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm"><b>{A.label}</b> {what}{e.count > 1 && <span className="text-muted"> · {e.count} lần</span>}</div>
                    <div className="truncate text-xs text-muted">
                      {[COL_LABEL[e.col], describe(e), e.by || 'ai đó', timeAgo(e.at)].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  {canUndo && <Btn variant="ghost" className="!px-3 !py-2 text-xs" onClick={() => doUndo(e)}><Undo2 size={14} /> Hoàn tác</Btn>}
                  {e.undone && <span className="shrink-0 text-xs text-muted">Đã hoàn tác</span>}
                  {edit && <IconBtn onClick={() => doDelete(e)} aria-label="Xoá dòng" className="shrink-0 !text-red-300"><Trash2 size={15} /></IconBtn>}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
