'use client'
import { useState, useEffect } from 'react'
import { getFirebaseAuth } from '@/lib/firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminLoginForm from '@/components/admin/AdminLoginForm'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), u => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-steel-50">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <AdminLoginForm />

  return (
    <div className="flex min-h-screen bg-steel-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6 md:ml-64">{children}</main>
    </div>
  )
}
