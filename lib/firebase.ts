// ─────────────────────────────────────────────
// lib/firebase.ts  —  Firestore + Auth only
// Storage is handled by Cloudinary (see lib/cloudinary.ts)
// ─────────────────────────────────────────────
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  getFirestore,
  collection, doc,
  getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit,
  serverTimestamp, Timestamp,
  type QueryConstraint,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)

export {
  collection, doc,
  getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit,
  serverTimestamp, Timestamp,
  type QueryConstraint,
}

// ── Typed helpers ────────────────────────────

function docToObj<T>(snap: { id: string; data: () => Record<string, unknown> }): T {
  const data = snap.data()
  const out: Record<string, unknown> = { id: snap.id }
  for (const [k, v] of Object.entries(data)) {
    out[k] = v instanceof Timestamp ? v.toDate().toISOString() : v
  }
  return out as T
}

export async function getAll<T>(col: string, constraints: QueryConstraint[] = []): Promise<T[]> {
  const q    = constraints.length ? query(collection(db, col), ...constraints) : query(collection(db, col))
  const snap = await getDocs(q)
  return snap.docs.map(d => docToObj<T>(d))
}

export async function getOne<T>(col: string, id: string): Promise<T | null> {
  const snap = await getDoc(doc(db, col, id))
  return snap.exists() ? docToObj<T>(snap) : null
}

export async function addOne(col: string, data: Record<string, unknown>): Promise<string> {
  const r = await addDoc(collection(db, col), { ...data, created_at: serverTimestamp(), updated_at: serverTimestamp() })
  return r.id
}

export async function updateOne(col: string, id: string, data: Record<string, unknown>): Promise<void> {
  await updateDoc(doc(db, col, id), { ...data, updated_at: serverTimestamp() })
}

export async function deleteOne(col: string, id: string): Promise<void> {
  await deleteDoc(doc(db, col, id))
}

export async function countDocs(col: string, constraints: QueryConstraint[] = []): Promise<number> {
  const q    = constraints.length ? query(collection(db, col), ...constraints) : query(collection(db, col))
  const snap = await getDocs(q)
  return snap.size
}
