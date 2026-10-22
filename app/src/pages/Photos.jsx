import { useState } from 'react'
import { remove, save, useCollection } from '../store'
import { AddButton, EditTools, FormSheet, Lightbox, Loading, SectionTitle, confirmDelete, useForm } from '../components/ui'

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
      <p className="-mt-2 mb-5 text-sm text-muted">Ảnh mẫu từ Wikimedia Commons. Đi về thì dán link ảnh của nhóm (Google Photos, Drive…) để thay vào.</p>
      <div className="grid auto-rows-[150px] grid-cols-2 gap-2.5 sm:auto-rows-[200px] md:grid-cols-4">
        {photos.map((p, i) => (
          <figure key={p.id} onClick={() => setImg(p.src)}
            className={`group relative cursor-zoom-in overflow-hidden rounded-3xl bg-card ${i % 5 === 0 ? 'col-span-2 row-span-2' : ''}`}>
            <img src={p.src} alt={p.caption} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8">
              <div className="text-sm font-semibold">{p.caption}</div>
              {p.credit && <div className="text-[10px] text-white/60">{p.credit}</div>}
            </figcaption>
            <EditTools className="absolute top-2 right-2" onEdit={() => form.open(p)} onDelete={() => confirmDelete('ảnh này') && remove('photos', p.id)} />
          </figure>
        ))}
      </div>
      <div className="mt-4"><AddButton onClick={() => form.open({})}>Thêm ảnh</AddButton></div>
      <FormSheet {...form.props} title={form.props.initial?.id ? 'Sửa ảnh' : 'Thêm ảnh'} fields={FIELDS} onSubmit={({ id, ...v }) => v.src && save('photos', id, v)} />
      <Lightbox src={img} onClose={() => setImg(null)} />
    </div>
  )
}
