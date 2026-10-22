// Plugin Vite: cắt ảnh từng điểm dừng từ bản export Figma (public/img/figma/new/Day N.png)
// lúc dev và lúc build, không lưu file trung gian. Ảnh ra ở /img/stops/<tên>.png,
// nền xám của card được xoá, giữ nguyên khung, viền trắng và icon drone như Figma.
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'

// [ngày, x, y, rộng, cao] trên ảnh Figma export 2x
export const STOP_BOXES = {
  'tan-son-nhat': [1, 496, 740, 300, 300], 'noi-bai': [1, 72, 1608, 300, 300], 'xe-giuong-nam': [1, 496, 2496, 300, 300],
  'doc-bac-sum': [2, 76, 1624, 368, 304], 'quan-ba': [2, 476, 2508, 324, 308], 'pho-trang-kim': [2, 76, 3392, 336, 324],
  'tham-ma': [2, 480, 4292, 320, 320], 'nha-pao': [2, 476, 5200, 324, 328], 'cici-2': [2, 244, 6080, 204, 360],
  'cho-phien': [3, 476, 752, 324, 332], 'dinh-vua-meo': [3, 72, 1624, 344, 352], 'lung-cu': [3, 472, 2508, 328, 316], 'cici': [3, 72, 3392, 352, 332],
  'tra-phong': [4, 500, 752, 300, 300], 'cafe-a-pao': [4, 72, 1624, 352, 320], 'mom-da-tu-than': [4, 444, 2508, 356, 340],
  'ma-pi-leng': [4, 72, 3392, 316, 352], 'nho-que': [4, 496, 4308, 304, 360], 'ochau': [4, 72, 5192, 344, 348],
  'an-sang-homestay': [5, 468, 752, 332, 328], 'cua-chu-m': [5, 72, 1628, 300, 300], 'mau-due': [5, 500, 2508, 300, 300],
  'huu-vinh': [5, 72, 3392, 300, 300], 'giang-son': [5, 500, 4308, 300, 300],
  'cafe-sang': [6, 500, 752, 300, 300], 'may-bay-noi-bai': [6, 500, 1652, 300, 300], 'sai-gon': [6, 72, 2532, 300, 300],
}
const MAX = 400 // ảnh gốc trong Figma 2x chỉ ~300px, giữ nguyên độ phân giải

function cutOut(src, [, bx, by, bw, bh]) {
  const W = bw, H = bh, D = Buffer.alloc(W * H * 4)
  for (let y = 0; y < H; y++) src.data.copy(D, y * W * 4, ((by + y) * src.width + bx) * 4, ((by + y) * src.width + bx + W) * 4)
  // xoá nền tối nối với mép ảnh
  const isBg = (p) => { const i = p * 4, mx = Math.max(D[i], D[i + 1], D[i + 2]), mn = Math.min(D[i], D[i + 1], D[i + 2]); return mx < 72 && mx - mn < 20 }
  const clear = new Uint8Array(W * H), st = []
  for (let x = 0; x < W; x++) st.push(x, (H - 1) * W + x)
  for (let y = 0; y < H; y++) st.push(y * W, y * W + W - 1)
  while (st.length) {
    const p = st.pop(); if (clear[p] || !isBg(p)) continue; clear[p] = 1
    const x = p % W, y = (p / W) | 0
    if (x > 0) st.push(p - 1); if (x < W - 1) st.push(p + 1); if (y > 0) st.push(p - W); if (y < H - 1) st.push(p + W)
  }
  // giữ khối lớn nhất (bỏ chữ lẻ dính ở mép)
  const lab = new Int32Array(W * H).fill(-1); let best = -1, bestN = 0, id = 0
  for (let s = 0; s < W * H; s++) {
    if (clear[s] || lab[s] >= 0) continue
    let n = 0; const q = [s]; lab[s] = id
    while (q.length) {
      const p = q.pop(); n++; const x = p % W, y = (p / W) | 0
      for (const k of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) if (k >= 0 && !clear[k] && lab[k] < 0) { lab[k] = id; q.push(k) }
    }
    if (n > bestN) { bestN = n; best = id } id++
  }
  let x0 = W, y0 = H, x1 = 0, y1 = 0
  const keep = new Uint8Array(W * H)
  for (let p = 0; p < W * H; p++) {
    if (lab[p] === best) { keep[p] = 1; const x = p % W, y = (p / W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) }
  }
  // khử răng cưa: alpha = tỉ lệ điểm được giữ trong ô 3×3 quanh mỗi điểm ở mép
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let k = 0, n = 0
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy
      if (xx >= 0 && yy >= 0 && xx < W && yy < H) { k += keep[yy * W + xx]; n++ }
    }
    D[(y * W + x) * 4 + 3] = keep[y * W + x] ? Math.round((255 * (k + 1)) / (n + 1)) : Math.round((255 * k) / (n * 2.2))
  }
  x0 = Math.max(0, x0 - 1); y0 = Math.max(0, y0 - 1); x1 = Math.min(W - 1, x1 + 1); y1 = Math.min(H - 1, y1 + 1)
  // thu nhỏ (trung bình vùng, có tính alpha)
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1, s = Math.max(1, Math.max(cw, ch) / MAX)
  const ow = Math.round(cw / s), oh = Math.round(ch / s), out = new PNG({ width: ow, height: oh })
  for (let oy = 0; oy < oh; oy++) for (let ox = 0; ox < ow; ox++) {
    let r = 0, g = 0, b = 0, a = 0, n = 0
    for (let y = Math.floor(oy * s); y < Math.min(ch, Math.ceil((oy + 1) * s)); y++) for (let x = Math.floor(ox * s); x < Math.min(cw, Math.ceil((ox + 1) * s)); x++) {
      const i = ((y0 + y) * W + x0 + x) * 4, al = D[i + 3]
      r += D[i] * al; g += D[i + 1] * al; b += D[i + 2] * al; a += al; n++
    }
    const o = (oy * ow + ox) * 4
    out.data[o] = a ? r / a : 0; out.data[o + 1] = a ? g / a : 0; out.data[o + 2] = a ? b / a : 0; out.data[o + 3] = a / n
  }
  return PNG.sync.write(out)
}

export function buildStops(figmaDir) {
  const days = {}, out = new Map()
  for (const [name, box] of Object.entries(STOP_BOXES)) {
    days[box[0]] ??= PNG.sync.read(fs.readFileSync(path.join(figmaDir, `Day ${box[0]}.png`)))
    out.set(name, cutOut(days[box[0]], box))
  }
  return out
}

export default function figmaStops(figmaDir) {
  let cache
  const get = () => (cache ??= buildStops(figmaDir))
  return {
    name: 'figma-stops',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = /\/img\/stops\/([\w-]+)\.png$/.exec(req.url.split('?')[0])
        const buf = m && get().get(m[1])
        if (!buf) return next()
        res.setHeader('Content-Type', 'image/png')
        res.end(buf)
      })
    },
    generateBundle() {
      for (const [name, source] of get()) this.emitFile({ type: 'asset', fileName: `img/stops/${name}.png`, source })
    },
  }
}
