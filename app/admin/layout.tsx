'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminLoginForm from '@/components/admin/AdminLoginForm'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: sessionData }) => {
      setUser(sessionData.session?.user ?? null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-4xl float">🐱</div>
      </div>
    )
  }

  if (!user) return <AdminLoginForm />

  return (
    <div className="flex min-h-screen bg-cream-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6 md:ml-64">{children}</main>
    </div>
  )
}
