'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'

const navItems = [
  { href: '/admin',              label: 'Dashboard',    icon: '▦', exact: true },
  { href: '/admin/products',     label: 'Products',     icon: '⬡' },
  { href: '/admin/participants', label: 'Participants', icon: '◎' },
  { href: '/admin/orders',       label: 'Orders',       icon: '◈' },
  { href: '/admin/winners',      label: 'Winners',      icon: '◆' },
  { href: '/admin/settings',     label: 'Settings',     icon: '⚙' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  async function logout() {
    await signOut(auth)
    window.location.reload()
  }

  const NavContent = () => (
    <div className="flex flex-col h-full bg-graphite-800">
      <div className="h-1 bg-gradient-to-r from-blue-500 via-orange-400 to-blue-500" />
      <div className="flex items-center gap-3 px-5 py-4 border-b border-graphite-600">
        <div className="w-8 h-8 rounded-lg overflow-hidden border border-graphite-500 flex-shrink-0">
          <Image src="/logo.png" alt="" width={32} height={32} className="object-cover" />
        </div>
        <div>
          <div className="font-display font-bold text-sm text-white tracking-tight">Neko3DLabs</div>
          <div className="text-xs text-graphite-300">Admin Panel</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = item.exact ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                ${isActive ? 'bg-blue-600 text-white font-semibold' : 'text-graphite-300 hover:bg-graphite-600 hover:text-white'}`}>
              <span className="text-base w-5 text-center opacity-80">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-graphite-600 space-y-0.5">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-graphite-400 hover:bg-graphite-600 hover:text-white transition-all">
          <span className="text-base w-5 text-center opacity-80">←</span>
          <span>View Site</span>
        </Link>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all">
          <span className="text-base w-5 text-center opacity-80">⊗</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 border-r border-graphite-600 z-30 shadow-xl">
        <NavContent />
      </aside>
      <button onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-graphite-700 border border-graphite-500 rounded-lg flex items-center justify-center shadow-lg text-white">
        ☰
      </button>
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 h-full shadow-2xl"><NavContent /></div>
          <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}
