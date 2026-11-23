// Link Google Maps cho lịch trình, theo định dạng chính thức api=1:
// https://developers.google.com/maps/documentation/urls/get-started
const BASE = 'https://www.google.com/maps'
const enc = encodeURIComponent

// Vị trí 1 điểm dừng từ s.loc: toạ độ "lat,lng", link Google Maps đầy đủ, hoặc chữ để Google tự tìm.
// Link rút gọn (maps.app.goo.gl) không đọc được toạ độ nên bỏ qua: trả null.
export function locOf(s) {
  const v = (s?.loc || '').trim()
  if (!v) return null
  const coord = (a, b) => `${Number(a)},${Number(b)}`
  let m = v.match(/^(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/)
  if (m) return coord(m[1], m[2])
  if (!/^https?:\/\//i.test(v)) return v
  if ((m = v.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/))) return coord(m[1], m[2]) // trang địa điểm
  if ((m = v.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/))) return coord(m[1], m[2])
  if ((m = v.match(/[?&](?:q|query|destination)=([^&#]+)/))) return decodeURIComponent(m[1].replace(/\+/g, ' '))
  return null
}

// Kiểu đi của chặng (leg.mode): '' xe máy, 'car' ô tô / taxi, 'flight' máy bay (không chỉ đường).
// Xe máy và ô tô đều dùng travelmode=driving: chế độ two-wheeler của Google báo cung Hà Giang
// "nằm ngoài phạm vi chỉ đường cho xe hai bánh" (thử 10/2026) nên không vẽ được tuyến; QL4C đi chung đường.
export const MODES = [
  { value: '', label: '🛵 Xe máy' },
  { value: 'car', label: '🚗 Ô tô / taxi' },
  { value: 'flight', label: '✈️ Máy bay' },
]

// Mã địa điểm Google (cid) trong link Google Maps đầy đủ: ".../data=...!1s0x36cb…:0xb092111bc7ffa94c..." hoặc "?cid=…"
export function placeIdOf(v = '') {
  let m = v.match(/!1s0x[0-9a-f]+:(0x[0-9a-f]+)/i)
  if (m) return BigInt(m[1]).toString()
  m = v.match(/[?&]cid=(\d+)/)
  return m ? m[1] : ''
}

// Mở 1 điểm trên bản đồ
export const placeUrl = (loc) => `${BASE}/search/?api=1&query=${enc(loc)}`

// Nút "Bản đồ": có mã địa điểm thì mở đúng trang địa điểm (tên, ảnh, đánh giá); mở bằng toạ độ thì Google chỉ hiện dãy số.
// Link rút gọn maps.app.goo.gl không đọc được toạ độ nhưng vẫn mở thẳng được.
export function stopMapUrl(s) {
  if (s?.place) return `https://maps.google.com/?cid=${s.place}`
  const loc = locOf(s)
  if (loc) return placeUrl(loc)
  return /^https?:\/\//i.test(s?.loc || '') ? s.loc.trim() : null
}

// Khi lưu điểm dừng: dán link Google Maps đầy đủ thì tách ra toạ độ (để chỉ đường) + mã địa điểm (để mở trang địa điểm).
// Đổi sang vị trí khác mà không có mã thì bỏ mã cũ; giữ nguyên vị trí thì giữ mã.
export function withPlace({ loc = '', place = '' }, prev = {}) {
  const v = loc.trim()
  const id = placeIdOf(v)
  if (id) {
    const c = locOf({ loc: v })
    return { loc: c && /^-?\d/.test(c) ? c : v, place: id }
  }
  return { loc: v, place: v === (prev.loc || '') ? place || prev.place || '' : '' }
}

// Dẫn đường từ vị trí hiện tại tới loc (bỏ origin = vị trí của điện thoại)
export const navUrl = (loc) => `${BASE}/dir/?api=1&destination=${enc(loc)}&travelmode=driving&dir_action=navigate`

// Chỉ đường cả ngày: cắt lịch trình ở chặng máy bay, lấy đoạn đường bộ có nhiều điểm có vị trí nhất.
// Google cho tối đa 9 điểm trung gian (trình duyệt điện thoại chỉ 3), nên đoạn dài vẫn có nút "Đi tới" từng chặng.
export function dayRouteUrl(stops) {
  const segs = [[]]
  stops.forEach((s, i) => {
    segs.at(-1).push(s)
    if (s.leg?.mode === 'flight' && i < stops.length - 1) segs.push([])
  })
  let best = null
  for (const seg of segs) {
    const pts = seg.map(locOf).filter(Boolean).filter((p, i, a) => p !== a[i - 1]) // bỏ điểm trùng liền nhau (trả phòng ở chỗ vừa ngủ)
    if (pts.length >= 2 && (!best || pts.length > best.pts.length)) best = { seg, pts }
  }
  if (!best) return null
  const [origin, ...rest] = best.pts
  const destination = rest.pop()
  const waypoints = rest.slice(0, 9)
  return `${BASE}/dir/?api=1&origin=${enc(origin)}&destination=${enc(destination)}${waypoints.length ? `&waypoints=${enc(waypoints.join('|'))}` : ''}&travelmode=driving`
}
