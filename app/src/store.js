import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDoc, getDocs, getDocFromServer, onSnapshot, setDoc, writeBatch, query, orderBy, limit } from 'firebase/firestore'
import { db } from './firebase'
import { DAYS, META, MEMBERS, EXPENSES, CHECKLIST, CONTACTS, NOTES, PHOTOS, SUGGESTIONS } from './seed'

// Mọi dữ liệu nằm dưới trips/{key}. key = sha256 của mật khẩu nhóm,
// Firestore rules chỉ cho đọc/ghi đúng key này.
const KEY_STORAGE = 'hg-key'
let KEY = null
try { KEY = localStorage.getItem(KEY_STORAGE) } catch { /* private mode */ }

export const hasKey = () => !!KEY
const path = () => `trips/${KEY}`
const colRef = (name) => collection(db, path(), name)
const docRef = (name, id) => doc(db, path(), name, id)

export async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`hagiang-2026:${pw}`))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function login(pw) {
  const key = await hashPassword(pw.trim())
  KEY = key
  // Firestore tự thử lại rất lâu khi chưa có database hoặc mất mạng, nên giới hạn 12 giây
  const timeout = new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error('timeout'), { code: 'timeout' })), 12000))
  try {
    const snap = await Promise.race([getDocFromServer(docRef('meta', 'main')), timeout])
    if (!snap.exists()) await Promise.race([seed(), timeout])
  } catch (e) {
    KEY = null
    if (e.code === 'permission-denied') throw new Error('Sai mật khẩu rồi 😅')
    if (e.code === 'timeout' && navigator.onLine) throw new Error('Máy chủ không phản hồi. Có thể database Firestore chưa được bật.')
    throw new Error('Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.')
  }
  try { localStorage.setItem(KEY_STORAGE, key) } catch { /* ignore */ }
}

export function logout() {
  try { localStorage.removeItem(KEY_STORAGE) } catch { /* ignore */ }
  KEY = null
  location.reload()
}

async function seed() {
  const b = writeBatch(db)
  DAYS.forEach(({ id, ...d }) => b.set(docRef('days', id), d))
  const add = (name, rows) => rows.forEach((r) => b.set(doc(colRef(name)), r))
  add('members', MEMBERS)
  add('expenses', EXPENSES)
  add('checklist', CHECKLIST)
  add('contacts', CONTACTS)
  add('notes', NOTES)
  add('photos', PHOTOS)
  add('suggestions', SUGGESTIONS)
  b.set(docRef('meta', 'main'), META)
  await b.commit()
}

export function useCollection(name, sortKey = 'order') {
  const [items, setItems] = useState(null)
  useEffect(() => onSnapshot(colRef(name), (s) => {
    const rows = s.docs.map((d) => ({ id: d.id, ...d.data() }))
    rows.sort((a, b) => (a[sortKey] ?? 0) - (b[sortKey] ?? 0))
    setItems(rows)
  }), [name, sortKey])
  return items
}

export function useDocument(name, id) {
  const [data, setData] = useState(null)
  useEffect(() => onSnapshot(docRef(name, id), (s) => setData(s.exists() ? { id: s.id, ...s.data() } : null)), [name, id])
  return data
}

// ---- Lịch sử thay đổi ----
// Mỗi lần lưu/xoá đều ghi bản trước (before) vào trips/{key}/history để hoàn tác được.
const NAME_STORAGE = 'hg-name'
export const getMyName = () => { try { return localStorage.getItem(NAME_STORAGE) || '' } catch { return '' } }
export const setMyName = (n) => { try { localStorage.setItem(NAME_STORAGE, n) } catch { /* ignore */ } }

const strip = ({ id: _id, ...rest }) => rest
async function readDoc(name, id) {
  try { const s = await getDoc(docRef(name, id)); return s.exists() ? s.data() : null } catch { return null }
}
function record(entry) {
  const r = doc(colRef('history'))
  // ghi nền, lỗi lịch sử không được chặn thao tác chính
  setDoc(r, { at: Date.now(), by: getMyName(), undone: false, ...entry }).catch(() => {})
}

// Ghi không cần chờ server (offline vẫn ghi, có mạng tự đồng bộ)
export async function save(name, id, data, { log = true } = {}) {
  if (!id) {
    const r = doc(colRef(name))
    const full = { order: Date.now(), ...data }
    if (log) record({ col: name, docId: r.id, action: 'create', before: null, after: full })
    return setDoc(r, full)
  }
  const before = log ? await readDoc(name, id) : null
  if (log) record({ col: name, docId: id, action: before ? 'update' : 'create', before, after: { ...(before || {}), ...strip(data) } })
  return setDoc(docRef(name, id), strip(data), { merge: true })
}
export async function remove(name, id) {
  const before = await readDoc(name, id)
  if (before) record({ col: name, docId: id, action: 'delete', before, after: null })
  return deleteDoc(docRef(name, id))
}

// Trả tài liệu về trạng thái trước thay đổi (ghi đè toàn bộ, không merge)
export async function undo(entry) {
  const { col, docId, before } = entry
  const now = await readDoc(col, docId)
  if (before) await setDoc(docRef(col, docId), before)
  else await deleteDoc(docRef(col, docId))
  record({ col, docId, action: 'undo', before: now, after: before, undoOf: entry.id })
  await setDoc(docRef('history', entry.id), { undone: true }, { merge: true })
}

export function useHistory(n = 200) {
  const [items, setItems] = useState(null)
  useEffect(() => onSnapshot(query(colRef('history'), orderBy('at', 'desc'), limit(n)),
    (s) => setItems(s.docs.map((d) => ({ id: d.id, ...d.data() })))), [n])
  return items
}

// ---- Backup ra file / nạp lại ----
export const BACKUP_COLS = ['meta', 'days', 'members', 'expenses', 'checklist', 'contacts', 'notes', 'photos', 'suggestions']

export async function exportData() {
  const data = {}
  for (const c of BACKUP_COLS) data[c] = (await getDocs(colRef(c))).docs.map((d) => ({ id: d.id, ...d.data() }))
  return { app: 'hagiang-2026', version: 1, exportedAt: new Date().toISOString(), data }
}

export function downloadJson(obj, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function importData(backup) {
  if (backup?.app !== 'hagiang-2026' || !backup.data) throw new Error('File không phải backup của app này')
  const ops = []
  for (const c of BACKUP_COLS) {
    const rows = backup.data[c] || []
    const keep = new Set(rows.map((r) => r.id))
    for (const d of (await getDocs(colRef(c))).docs) if (!keep.has(d.id)) ops.push(['del', docRef(c, d.id)])
    for (const { id, ...r } of rows) ops.push(['set', docRef(c, id), r])
  }
  // batch tối đa 500 thao tác
  for (let i = 0; i < ops.length; i += 450) {
    const b = writeBatch(db)
    ops.slice(i, i + 450).forEach(([t, ref, d]) => (t === 'del' ? b.delete(ref) : b.set(ref, d)))
    await b.commit()
  }
  record({ col: '*', docId: '', action: 'restore', before: null, after: null, note: `Nạp backup ${backup.exportedAt}` })
}

// Đổi chỗ 2 phần tử trong danh sách có field order
export function swapOrder(name, list, i, j) {
  if (j < 0 || j >= list.length) return
  const a = list[i], b = list[j]
  const oa = a.order ?? i, ob = b.order ?? j
  save(name, a.id, { order: oa === ob ? ob + 1 : ob })
  save(name, b.id, { order: oa })
}
