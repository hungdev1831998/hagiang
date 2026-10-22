import { useState } from 'react'
import { remove, save, useCollection } from '../store'
import { AddButton, asset, EditTools, FormSheet, Lightbox, Loading, SectionTitle, confirmDelete, useForm } from '../components/ui'

const FIELDS = [
  { key: 'src', label: 'Ảnh', type: 'image' },
  { key: 'caption', label: 'Chú thích' },
  { key: 'credit', label: 'Nguồn / người chụp' },
]

export default function Photos() {
  const photos = useCollection('photos')
  const [img, setImg] = useState(null)
  const form = useForm()
  if (!photos) return <Loading />
  return (
    <div>
      <SectionTitle eyebrow="Hình ảnh" title="Những nơi tụi mình đi qua" />
      <p className="-mt-1 mb-5 text-sm text-muted">Ảnh lấy từ file Figma. Đi về thì dán link ảnh của nhóm (Google Photos, Drive…) để thêm vào.</p>
      {/* ảnh Figma gốc chỉ ~300px nên hiển thị ô nhỏ đều nhau, không phóng to cho khỏi vỡ */}
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
        {photos.map((p) => {
          const figma = p.src?.includes('/img/stops/')
          return (
            <figure key={p.id} onClick={() => setImg(p.src)} className="group relative cursor-zoom-in">
              <div className={`grid aspect-square place-items-center overflow-hidden rounded-3xl bg-card ${figma ? 'p-2.5' : ''}`}>
                <img src={asset(p.src)} alt={p.caption} loading="lazy"
                  className={`max-h-full max-w-full transition duration-300 group-hover:scale-105 ${figma ? 'object-contain' : 'h-full w-full object-cover'}`} />
              </div>
              <figcaption className="mt-1.5 px-1 text-center text-xs leading-tight font-semibold">{p.caption}</figcaption>
              <EditTools className="absolute top-1.5 right-1.5" onEdit={() => form.open(p)} onDelete={() => confirmDelete('ảnh này', () => remove('photos', p.id))} />
            </figure>
          )
        })}
      </div>
      <div className="mt-4"><AddButton onClick={() => form.open({})}>Thêm ảnh</AddButton></div>
      <FormSheet {...form.props} title={form.props.initial?.id ? 'Sửa ảnh' : 'Thêm ảnh'} fields={FIELDS} onSubmit={({ id, ...v }) => v.src && save('photos', id, v)} />
      <Lightbox src={img} onClose={() => setImg(null)} />
    </div>
  )
}
