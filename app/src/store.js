import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDocFromServer, onSnapshot, setDoc, addDoc, writeBatch } from 'firebase/firestore'
import { db } from './firebase'
import { DAYS, META, MEMBERS, EXPENSES, CHECKLIST, CONTACTS, NOTES, PHOTOS } from './seed'

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
  try {
    const snap = await getDocFromServer(docRef('meta', 'main'))
    if (!snap.exists()) await seed()
  } catch (e) {
    KEY = null
    if (e.code === 'permission-denied') throw new Error('Sai mật khẩu rồi 😅')
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

// Ghi không cần chờ server (offline vẫn ghi, có mạng tự đồng bộ)
export const save = (name, id, data) => (id ? setDoc(docRef(name, id), data, { merge: true }) : addDoc(colRef(name), { order: Date.now(), ...data }))
export const remove = (name, id) => deleteDoc(docRef(name, id))

// Đổi chỗ 2 phần tử trong danh sách có field order
export function swapOrder(name, list, i, j) {
  if (j < 0 || j >= list.length) return
  const a = list[i], b = list[j]
  const oa = a.order ?? i, ob = b.order ?? j
  save(name, a.id, { order: oa === ob ? ob + 1 : ob })
  save(name, b.id, { order: oa })
}
