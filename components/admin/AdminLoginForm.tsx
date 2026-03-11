'use client'
import { useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function AdminLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function login() {
    if (!email || !password) { setError('Please enter email and password.'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream-50 paw-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-cream-200 p-8 w-full max-w-sm shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden sticker-border mx-auto mb-3 float">
            <Image src="/logo.png" alt="Neko3DLabs" width={64} height={64} className="object-cover" />
          </div>
          <h1 className="font-display text-xl font-bold text-choco-500">Admin Login</h1>
          <p className="text-xs text-choco-300 mt-1">Neko3DLabs Dashboard</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-choco-400 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@neko3dlabs.com" onKeyDown={e => e.key === 'Enter' && login()}
              className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-choco-400 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && login()}
              className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300" />
          </div>

          {error && <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}

          <button onClick={login} disabled={loading}
            className="btn-kawaii w-full py-3 bg-blush-500 text-white font-semibold text-sm hover:bg-blush-400 disabled:opacity-60 shadow-md">
            {loading ? '🐱 Logging in...' : '🔐 Login'}
          </button>
        </div>

        <p className="text-xs text-choco-300 text-center mt-5">
          Create your admin account in Supabase Auth dashboard.
        </p>
      </div>
    </div>
  )
}
