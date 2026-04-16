// ─────────────────────────────────────────────
// lib/firebase.ts  —  Firestore + Auth (client-side only)
// Lazy-initialised so Next.js static generation never touches Firebase SDK.
// ─────────────────────────────────────────────
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth,      type Auth }      from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import {
  collection, doc,
  getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit,
  serverTimestamp, Timestamp,
  type QueryConstraint,
} from 'firebase/firestore'

// Re-export Firestore helpers — pages import these directly
export {
  collection, doc,
  getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit,
  serverTimestamp, Timestamp,
  type QueryConstraint,
}

// ── Lazy singletons ──────────────────────────
// These are NEVER called at module load time.
// They are called only inside useEffect / event handlers (browser only).

let _app:  FirebaseApp | undefined
let _auth: Auth       | undefined
let _db:   Firestore  | undefined

function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length
      ? getApp()
      : initializeApp({
          apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
          authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
          projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
          storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
          appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
        })
  }
  return _app
}

// Call these inside useEffect / event handlers — never at module top level
export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getFirebaseApp())
  return _auth
}

export function getFirebaseDb(): Firestore {
  if (!_db) _db = getFirestore(getFirebaseApp())
  return _db
}

// Convenience aliases used by pages that already import { auth, db }
// These are getters — evaluated lazily, not at import time.
export const getDb   = getFirebaseDb
export const getAuth_ = getFirebaseAuth

// ── Typed document helper ────────────────────

function docToObj<T>(snap: { id: string; data: () => Record<string, unknown> }): T {
  const data = snap.data()
  const out: Record<string, unknown> = { id: snap.id }
  for (const [k, v] of Object.entries(data)) {
    out[k] = v instanceof Timestamp ? v.toDate().toISOString() : v
  }
  return out as T
}

// ── Helper functions (all lazy — use getFirebaseDb() internally) ──

export async function getAll<T>(col: string, constraints: QueryConstraint[] = []): Promise<T[]> {
  const db   = getFirebaseDb()
  const q    = constraints.length ? query(collection(db, col), ...constraints) : query(collection(db, col))
  const snap = await getDocs(q)
  return snap.docs.map(d => docToObj<T>(d))
}

export async function getOne<T>(col: string, id: string): Promise<T | null> {
  const db   = getFirebaseDb()
  const snap = await getDoc(doc(db, col, id))
  return snap.exists() ? docToObj<T>(snap) : null
}

export async function addOne(col: string, data: Record<string, unknown>): Promise<string> {
  const db = getFirebaseDb()
  const r  = await addDoc(collection(db, col), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
  return r.id
}

export async function updateOne(col: string, id: string, data: Record<string, unknown>): Promise<void> {
  const db = getFirebaseDb()
  await updateDoc(doc(db, col, id), { ...data, updated_at: serverTimestamp() })
}

export async function deleteOne(col: string, id: string): Promise<void> {
  const db = getFirebaseDb()
  await deleteDoc(doc(db, col, id))
}

export async function countDocs(col: string, constraints: QueryConstraint[] = []): Promise<number> {
  const db   = getFirebaseDb()
  const q    = constraints.length ? query(collection(db, col), ...constraints) : query(collection(db, col))
  const snap = await getDocs(q)
  return snap.size
}
