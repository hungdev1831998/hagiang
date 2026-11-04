import { Link2 } from 'lucide-react'

// Nhận ra mạng xã hội từ link liên hệ để hiện đúng logo / chữ (trước đây luôn hiện TikTok)
const svg = (d) => function Icon(p) {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" {...p}><path d={d} /></svg>
}
const TikTok = svg('M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.77.12V9.77a5.68 5.68 0 0 0-.77-.05A5.68 5.68 0 1 0 15.54 15.4V9.01a7.33 7.33 0 0 0 4.29 1.38V7.3a4.28 4.28 0 0 1-3.23-1.48z')
const Facebook = svg('M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.79 8.43-4.94 8.43-9.94z')
const Zalo = svg('M12 2C6.48 2 2 6.04 2 11.02c0 2.86 1.48 5.4 3.79 7.05L5 22l4.03-2.06c.94.25 1.93.38 2.97.38 5.52 0 10-4.04 10-9.02S17.52 2 12 2zm-3.6 11.8H5.9v-.75l1.8-2.53H5.95v-.92H8.4v.74l-1.79 2.54H8.4v.92zm3.94 0h-.86l-.07-.36a1.2 1.2 0 0 1-.86.42c-.73 0-1.25-.6-1.25-1.38s.52-1.37 1.25-1.37c.33 0 .63.14.86.4v-.34h.93v2.63zm1.6 0h-.95v-3.84h.95v3.84zm2.4.06c-.83 0-1.43-.6-1.43-1.38s.6-1.38 1.43-1.38 1.43.6 1.43 1.38-.6 1.38-1.43 1.38z')

export function socialOf(url = '') {
  const u = url.toLowerCase()
  if (u.includes('tiktok.com')) return { name: 'TikTok', Icon: TikTok }
  if (/facebook\.com|fb\.com|fb\.me|m\.me|messenger\.com/.test(u)) return { name: 'Facebook', Icon: Facebook }
  if (u.includes('zalo.me')) return { name: 'Zalo', Icon: Zalo }
  return { name: 'link', Icon: Link2 }
}
