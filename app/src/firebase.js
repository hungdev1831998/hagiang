import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const app = initializeApp({
  apiKey: 'AIzaSyAMBhmYDhdsH0hac_PTTb1blmnuJ5Fxjig',
  authDomain: 'hagiang-loop-2026.firebaseapp.com',
  projectId: 'hagiang-loop-2026',
  storageBucket: 'hagiang-loop-2026.firebasestorage.app',
  messagingSenderId: '905409511691',
  appId: '1:905409511691:web:3d02f1b0545d4bca8de20e',
})

// Cache offline: lên núi mất sóng vẫn xem được, có sóng lại tự đồng bộ
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})
