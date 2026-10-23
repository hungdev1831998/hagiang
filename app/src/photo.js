// Thu nhỏ ảnh ngay trên điện thoại trước khi gửi: Firestore giới hạn 1 MB mỗi tài liệu,
// gói miễn phí 1 GB tổng, nên ảnh lớn ~1600px (~200-300 KB) và ảnh nhỏ cho lưới ~360px.
const FULL = 1600
const THUMB = 360
const MAX_CHARS = 900_000 // dataURL base64, chừa chỗ cho các field khác trong tài liệu 1 MB

async function decode(file) {
  // imageOrientation: xoay đúng chiều theo EXIF của ảnh chụp dọc
  try { return await createImageBitmap(file, { imageOrientation: 'from-image' }) } catch { /* Safari cũ: dùng <img> */ }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally { URL.revokeObjectURL(url) }
}

function render(src, max, quality) {
  const s = Math.min(1, max / Math.max(src.width, src.height))
  const c = document.createElement('canvas')
  c.width = Math.round(src.width * s)
  c.height = Math.round(src.height * s)
  const ctx = c.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', quality)
}

export async function compressPhoto(file) {
  let src
  try { src = await decode(file) } catch { throw new Error(`Không đọc được ảnh "${file.name}"`) }
  let max = FULL, q = 0.82, full
  // ảnh nhiều chi tiết vẫn quá 1 MB thì giảm chất lượng, rồi giảm kích thước
  while ((full = render(src, max, q)).length > MAX_CHARS) {
    if (q > 0.6) q -= 0.1
    else max = Math.round(max * 0.8)
  }
  const thumb = render(src, THUMB, 0.7)
  src.close?.()
  return { full, thumb }
}
