import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { addUploadedPhoto, getMyName, getPhotoFile, newId, remove, removePhotoFile, save, useCollection } from '../store'
import { compressPhoto } from '../photo'
import { AddButton, asset, EditTools, FormSheet, Lightbox, Loading, SectionTitle, confirmDelete, useForm } from '../components/ui'

const FIELDS = [
  { key: 'src', label: 'Ảnh', type: 'image' },
  { key: 'caption', label: 'Chú thích' },
  { key: 'credit', label: 'Nguồn / người chụp' },
]
// ảnh tự up thì không đổi file, chỉ sửa chữ
const UPLOAD_FIELDS = FIELDS.filter((f) => f.key !== 'src')

// Nút chụp / chọn ảnh: trên điện thoại hiện lựa chọn Chụp ảnh hoặc Thư viện, chọn được nhiều ảnh
function UploadButton() {
  const input = useRef(null)
  const [busy, setBusy] = useState(null)
  const [msg, setMsg] = useState('')
  const pick = async (e) => {
    const files = [...e.target.files]
    e.target.value = ''
    if (!files.length) return
    setMsg('')
    let ok = 0
    const errs = []
    for (const [i, f] of files.entries()) {
      setBusy(`${i + 1}/${files.length}`)
      try {
        const img = await compressPhoto(f)
        addUploadedPhoto(newId('photos'), { ...img, caption: '', credit: getMyName() })
          .catch(() => setMsg('Có ảnh chưa lưu lên được máy chủ. Kiểm tra mạng rồi thử lại.'))
        ok++
      } catch (err) { errs.push(err.message) }
    }
    setBusy(null)
    setMsg([ok && `Đã thêm ${ok} ảnh.${navigator.onLine ? '' : ' Đang mất sóng, có sóng lại sẽ tự gửi lên.'}`, ...errs].filter(Boolean).join(' '))
  }
  return (
    <div className="flex-[2]">
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={pick} />
      <button disabled={!!busy} onClick={() => input.current.click()}
        className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-transparent bg-brand py-4 text-sm font-bold text-white transition hover:bg-brand-2 disabled:opacity-70">
        {busy ? <><Loader2 size={18} className="animate-spin" /> Đang xử lý {busy}…</> : <><Camera size={18} /> Chụp / chọn ảnh</>}
      </button>
      {msg && <p className="mt-2 text-center text-xs text-muted">{msg}</p>}
    </div>
  )
}

export default function Photos() {
  const photos = useCollection('photos')
  const [img, setImg] = useState(null)
  const form = useForm()
  if (!photos) return <Loading />

  // ảnh tự up: mở ảnh nhỏ ngay, tải xong ảnh lớn thì thay vào
  const open = (p) => {
    if (!p.file) return setImg(p.src)
    setImg(p.thumb)
    getPhotoFile(p.file).then((full) => full && setImg((cur) => (cur === p.thumb ? full : cur)))
  }
  const del = (p) => confirmDelete('ảnh này', () => { remove('photos', p.id); if (p.file) removePhotoFile(p.file) })

  return (
    <div>
      <SectionTitle eyebrow="Hình ảnh" title="Những nơi tụi mình đi qua" />
      <p className="-mt-1 mb-5 text-sm text-muted">Chụp hoặc chọn ảnh trong máy để cả nhóm cùng xem. Ảnh được thu nhỏ cho nhẹ; muốn giữ ảnh gốc thì dán link Google Photos, Drive…</p>
      {/* ảnh Figma gốc chỉ ~300px nên hiển thị ô nhỏ đều nhau, không phóng to cho khỏi vỡ */}
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
        {photos.map((p) => {
          const figma = p.src?.includes('/img/stops/')
          return (
            <figure key={p.id} onClick={() => open(p)} className="group relative cursor-zoom-in">
              <div className={`grid aspect-square place-items-center overflow-hidden rounded-3xl bg-card ${figma ? 'p-2.5' : ''}`}>
                <img src={p.thumb || asset(p.src)} alt={p.caption} loading="lazy"
                  className={`max-h-full max-w-full transition duration-300 group-hover:scale-105 ${figma ? 'object-contain' : 'h-full w-full object-cover'}`} />
              </div>
              {p.caption && <figcaption className="mt-1.5 px-1 text-center text-xs leading-tight font-semibold">{p.caption}</figcaption>}
              <EditTools className="absolute top-1.5 right-1.5" onEdit={() => form.open(p)} onDelete={() => del(p)} />
            </figure>
          )
        })}
      </div>
      <div className="mt-4 flex items-start gap-2.5">
        <UploadButton />
        <div className="flex-1"><AddButton onClick={() => form.open({})}>Dán link</AddButton></div>
      </div>
      <FormSheet {...form.props} title={form.props.initial?.id ? 'Sửa ảnh' : 'Thêm ảnh'} fields={form.props.initial?.file ? UPLOAD_FIELDS : FIELDS}
        onSubmit={({ id, ...v }) => (v.src || v.file) && save('photos', id, v)} />
      <Lightbox src={img} onClose={() => setImg(null)} />
    </div>
  )
}
