import { createContext, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from 'lucide-react'
import { IMAGE_LIBRARY } from '../seed'

export const EditContext = createContext({ edit: false })

// Đường dẫn ảnh lưu dạng "/img/..."; thêm base để chạy được cả Firebase lẫn GitHub Pages (/<repo>/)
export const asset = (p) => (p && p.startsWith('/') ? encodeURI(import.meta.env.BASE_URL + p.slice(1)) : p)

// Cụm ảnh cắt từ Figma xếp chồng, dùng cho trang chủ và màn đăng nhập
export function FigmaCollage({ className = '' }) {
  const pics = [['lung-cu', '-rotate-6 left-0 top-6'], ['nho-que', 'rotate-3 left-[30%] top-0 z-10'], ['ma-pi-leng', 'rotate-6 right-0 top-10']]
  return (
    <div className={`pointer-events-none relative h-40 w-72 ${className}`}>
      {pics.map(([k, pos]) => <img key={k} src={asset(`/img/stops/${k}.png`)} alt="" className={`absolute h-32 w-32 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,.5)] ${pos}`} />)}
    </div>
  )
}
export const useEdit = () => useContext(EditContext).edit

export const money = (n) => `${Math.round(Number(n) || 0).toLocaleString('vi-VN')}đ`
export const shortMoney = (n) => {
  const v = Number(n) || 0
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr`
  if (Math.abs(v) >= 1e3) return `${Math.round(v / 1e3)}k`
  return `${v}`
}
const WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
export const dayLabel = (iso) => {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00+07:00`)
  return `${WD[d.getDay()]} · ${d.getDate()}/${d.getMonth() + 1}`
}
// Popup xác nhận dùng chung (thay window.confirm). ConfirmHost gắn 1 lần ở App.
let showConfirm = null
export const askConfirm = (opts) => (showConfirm ? showConfirm(opts) : window.confirm(opts.title) && opts.onYes())
export const confirmDelete = (what, onYes) => askConfirm({ title: `Xoá ${what}?`, message: 'Cả nhóm sẽ không thấy mục này nữa. Không hoàn tác được.', confirmLabel: 'Xoá', danger: true, onYes })

export function Btn({ variant = 'primary', className = '', ...p }) {
  const v = {
    primary: 'bg-brand text-white hover:bg-brand-2 shadow-[0_8px_24px_-10px_rgba(242,107,29,.8)]',
    ghost: 'bg-card-2 text-ink hover:bg-line',
    subtle: 'bg-transparent text-muted hover:text-ink hover:bg-card',
    danger: 'bg-red-500/15 text-red-300 hover:bg-red-500/25',
  }[variant]
  return <button className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition active:scale-[.97] disabled:opacity-50 ${v} ${className}`} {...p} />
}

export function IconBtn({ className = '', ...p }) {
  return <button className={`grid h-9 w-9 place-items-center rounded-full bg-card-2 text-muted transition hover:bg-line hover:text-ink active:scale-95 ${className}`} {...p} />
}

export function AddButton({ children, ...p }) {
  return (
    <button className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-line py-4 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand" {...p}>
      <Plus size={18} /> {children}
    </button>
  )
}

// Cụm nút sửa/xoá/lên/xuống, chỉ hiện khi đang ở chế độ sửa
export function EditTools({ onEdit, onDelete, onUp, onDown, className = '' }) {
  const edit = useEdit()
  if (!edit) return null
  return (
    <div className={`flex items-center gap-1.5 ${className}`} onClick={(e) => e.stopPropagation()}>
      {onUp && <IconBtn onClick={onUp} aria-label="Lên"><ChevronUp size={16} /></IconBtn>}
      {onDown && <IconBtn onClick={onDown} aria-label="Xuống"><ChevronDown size={16} /></IconBtn>}
      {onEdit && <IconBtn onClick={onEdit} aria-label="Sửa" className="!text-brand"><Pencil size={15} /></IconBtn>}
      {onDelete && <IconBtn onClick={onDelete} aria-label="Xoá" className="!text-red-300"><Trash2 size={15} /></IconBtn>}
    </div>
  )
}

export function SectionTitle({ eyebrow, title, right }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        {eyebrow && <div className="text-[11px] font-bold uppercase tracking-[.2em] text-brand">{eyebrow}</div>}
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{title}</h2>
      </div>
      {right}
    </div>
  )
}

export function Segmented({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-2xl bg-card p-1">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`rounded-xl px-3.5 py-1.5 text-sm font-semibold transition ${value === o.value ? 'bg-ink text-bg' : 'text-muted hover:text-ink'}`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Loading() {
  return <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-3xl bg-card" />)}</div>
}

export function Sheet({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose()
    addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div className="sheet-in flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-[28px] border border-line bg-panel sm:rounded-[28px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-lg font-bold">{title}</h3>
          <IconBtn onClick={onClose} aria-label="Đóng"><X size={18} /></IconBtn>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="safe-b flex gap-2 border-t border-line px-5 pt-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

const inputCls = 'w-full rounded-2xl border border-line bg-card px-4 py-3 text-base text-ink placeholder:text-muted/60 sm:text-[15px] outline-none transition focus:border-brand'

function Field({ f, value, set }) {
  const label = <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">{f.label}</span>
  if (f.type === 'textarea') return <label className="block">{label}<textarea rows={3} className={inputCls} value={value ?? ''} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} /></label>
  if (f.type === 'select') return (
    <div>{label}
      <div className="flex flex-wrap gap-2">
        {f.options.map((o) => (
          <button type="button" key={o.value} onClick={() => set(o.value)}
            className={`rounded-xl border px-3 py-2 text-sm transition ${value === o.value ? 'border-brand bg-brand/15 text-ink' : 'border-line bg-card text-muted'}`}>{o.label}</button>
        ))}
      </div>
    </div>
  )
  if (f.type === 'money') return (
    <label className="block">{label}
      <div className="relative">
        <input inputMode="numeric" className={`${inputCls} pr-10`} value={value ? Number(value).toLocaleString('vi-VN') : ''} placeholder="0"
          onChange={(e) => set(Number(e.target.value.replace(/\D/g, '')) || 0)} />
        <span className="absolute top-1/2 right-4 -translate-y-1/2 text-muted">đ</span>
      </div>
    </label>
  )
  if (f.type === 'toggle') return (
    <label className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
      <span className="text-sm">{f.label}</span>
      <input type="checkbox" className="h-5 w-5 accent-[#f26b1d]" checked={!!value} onChange={(e) => set(e.target.checked)} />
    </label>
  )
  if (f.type === 'image') return (
    <div>{label}
      <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
        <button type="button" onClick={() => set('')} className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl border text-xs ${!value ? 'border-brand text-ink' : 'border-line text-muted'}`}>Không</button>
        {IMAGE_LIBRARY.map((src) => (
          <button type="button" key={src} onClick={() => set(src)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 ${value === src ? 'border-brand' : 'border-transparent'}`}>
            <img src={asset(src)} alt="" className="h-full w-full object-contain" />
          </button>
        ))}
      </div>
      <input className={inputCls} value={value ?? ''} placeholder="Hoặc dán link ảnh https://..." onChange={(e) => set(e.target.value)} />
    </div>
  )
  if (f.type === 'items') {
    const list = value || []
    const upd = (i, k, v) => set(list.map((it, j) => (j === i ? { ...it, [k]: v } : it)))
    return (
      <div>{label}
        <div className="space-y-2">
          {list.map((it, i) => (
            <div key={it.id || i} className="flex gap-2">
              <input className={`${inputCls} flex-[3]`} value={it.label} placeholder="Hoạt động" onChange={(e) => upd(i, 'label', e.target.value)} />
              <input className={`${inputCls} flex-[2]`} value={it.time} placeholder="Giờ / ghi chú" onChange={(e) => upd(i, 'time', e.target.value)} />
              <IconBtn type="button" className="mt-1.5 shrink-0" onClick={() => set(list.filter((_, j) => j !== i))}><X size={16} /></IconBtn>
            </div>
          ))}
          <Btn type="button" variant="ghost" className="w-full" onClick={() => set([...list, { id: `i${Date.now()}`, label: '', time: '' }])}><Plus size={16} /> Thêm hoạt động</Btn>
        </div>
      </div>
    )
  }
  return <label className="block">{label}<input type={f.type || 'text'} className={inputCls} value={value ?? ''} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} /></label>
}

// Form chung cho mọi loại dữ liệu: truyền danh sách field, nhận object khi lưu
export function FormSheet(props) {
  // Chỉ mount form khi mở, để mỗi lần mở lấy lại dữ liệu ban đầu
  return props.open ? <FormBody {...props} /> : null
}

function FormBody({ open, onClose, title, fields, initial, onSubmit, onDelete }) {
  const [v, setV] = useState(initial || {})
  const submit = (e) => { e?.preventDefault(); onSubmit(v); onClose() }
  return (
    <Sheet open={open} onClose={onClose} title={title}
      footer={<>
        {onDelete && <Btn variant="danger" onClick={() => { onDelete(); onClose() }}><Trash2 size={16} /></Btn>}
        <Btn variant="ghost" className="flex-1" onClick={onClose}>Huỷ</Btn>
        <Btn className="flex-[2]" onClick={submit}>Lưu</Btn>
      </>}>
      <form onSubmit={submit} className="space-y-4">
        {fields.map((f) => (
          <div key={f.key} className={f.half ? 'inline-block w-[calc(50%-.5rem)] align-top odd:mr-4' : ''}>
            <Field f={f} value={v[f.key]} set={(val) => setV((s) => ({ ...s, [f.key]: val }))} />
          </div>
        ))}
        <button type="submit" hidden />
      </form>
    </Sheet>
  )
}

// Hook tiện: quản lý trạng thái mở form + dữ liệu đang sửa
export function useForm() {
  const [state, setState] = useState(null)
  return {
    open: (initial = {}, meta = {}) => setState({ initial, meta }),
    close: () => setState(null),
    props: { open: !!state, onClose: () => setState(null), initial: state?.initial },
    meta: state?.meta,
  }
}

export function ConfirmHost() {
  const [opts, setOpts] = useState(null)
  useEffect(() => { showConfirm = setOpts; return () => { showConfirm = null } }, [])
  useEffect(() => {
    if (!opts) return
    const h = (e) => { if (e.key === 'Escape') setOpts(null); if (e.key === 'Enter') { opts.onYes(); setOpts(null) } }
    addEventListener('keydown', h)
    return () => removeEventListener('keydown', h)
  }, [opts])
  if (!opts) return null
  const close = () => setOpts(null)
  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-6 backdrop-blur-sm" onClick={close}>
      <div className="sheet-in w-full max-w-xs rounded-[28px] border border-line bg-panel p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${opts.danger ? 'bg-red-500/15 text-red-300' : 'bg-brand/15 text-brand'}`}>
          {opts.danger ? <Trash2 size={24} /> : opts.icon || <X size={24} />}
        </div>
        <h3 className="mt-4 text-lg font-bold">{opts.title}</h3>
        {opts.message && <p className="mt-1.5 text-sm text-muted">{opts.message}</p>}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Btn variant="ghost" onClick={close}>Huỷ</Btn>
          <Btn className={opts.danger ? '!bg-red-500 !shadow-none hover:!bg-red-600' : ''} onClick={() => { opts.onYes(); close() }}>{opts.confirmLabel || 'Đồng ý'}</Btn>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function Lightbox({ src, onClose }) {
  if (!src) return null
  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-4" onClick={onClose}>
      {/* ảnh cắt từ Figma nhỏ: hiện đúng kích thước gốc ×1.3 cho nét; ảnh khác thì vừa màn hình */}
      <img src={asset(src)} alt="" className={`mx-auto my-auto rounded-2xl ${src.includes('/img/stops/') ? 'mt-[20vh] w-[min(90vw,380px)]' : 'max-w-full sm:max-w-lg'}`} />
      <button className="fixed top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white" onClick={onClose}><X /></button>
    </div>,
    document.body,
  )
}
