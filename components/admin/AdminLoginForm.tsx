'use client'
import { useState } from 'react'
import Image from 'next/image'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

export default function AdminLoginForm() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function login() {
    if (!email || !password) { setError('Please enter email and password.'); return }
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login failed'
      setError(msg.includes('invalid-credential') || msg.includes('wrong-password')
        ? 'Invalid email or password.'
        : msg)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-graphite-800 grid-bg flex items-center justify-center p-4">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-orange-400 to-blue-500" />
      <div className="bg-white rounded-xl border border-steel-200 p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-steel-200 mx-auto mb-4">
            <Image src="/logo.png" alt="Neko3DLabs" width={56} height={56} className="object-cover" />
          </div>
          <h1 className="font-display text-xl font-bold text-graphite-700">Admin Login</h1>
          <p className="text-xs text-steel-400 mt-1">Neko3DLabs Dashboard</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-steel-500 mb-1.5 uppercase tracking-wide">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@neko3dlabs.com" onKeyDown={e => e.key === 'Enter' && login()}
              className="input-tech" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-steel-500 mb-1.5 uppercase tracking-wide">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && login()}
              className="input-tech" />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 flex items-start gap-2">
              <span className="text-red-500 text-xs mt-0.5">⚠</span>
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}
          <button onClick={login} disabled={loading}
            className="btn-tech btn-primary w-full py-3 text-sm font-semibold disabled:opacity-60">
            {loading ? 'Authenticating...' : '→ Sign In'}
          </button>
        </div>
        <p className="text-xs text-steel-400 text-center mt-5">
          Create your admin account in Firebase Console → Authentication.
        </p>
      </div>
    </div>
  )
}
