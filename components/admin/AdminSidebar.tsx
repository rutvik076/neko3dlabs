'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/products', label: 'Products', icon: '📦' },
  { href: '/admin/participants', label: 'Participants', icon: '🎁' },
  { href: '/admin/orders', label: 'Orders', icon: '🛒' },
  { href: '/admin/winners', label: 'Winners', icon: '🏆' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  async function logout() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 p-5 border-b border-cream-200">
        <div className="w-8 h-8 rounded-full overflow-hidden sticker-border flex-shrink-0">
          <Image src="/logo.png" alt="" width={32} height={32} className="object-cover" />
        </div>
        <div>
          <div className="font-display font-bold text-sm text-choco-500">Neko3DLabs</div>
          <div className="text-xs text-choco-300">Admin</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href) && pathname !== '/admin'
          const isActive = item.exact ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? 'admin-nav-active' : 'text-choco-400 hover:bg-cream-100 hover:text-choco-500'}`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-cream-200 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-choco-400 hover:bg-cream-100 transition-colors">
          ← View Site
        </Link>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-50 transition-colors">
          🚪 Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-cream-200 z-30">
        <NavContent />
      </aside>

      {/* Mobile toggle */}
      <button onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-cream-200 rounded-xl flex items-center justify-center shadow-sm text-choco-500">
        ☰
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-white border-r border-cream-200 h-full shadow-2xl"><NavContent /></div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}
