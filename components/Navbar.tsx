'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/', label: 'Shop' },
  { href: '/lucky', label: 'Lucky Draw' },
  { href: '/winners', label: 'Winners' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-steel-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-lg overflow-hidden border-2 border-steel-200 group-hover:border-blue-400 transition-colors">
            <Image src="/logo.png" alt="Neko3DLabs" width={36} height={36} className="object-cover w-full h-full" />
          </div>
          <span className="font-display font-bold text-lg text-graphite-700 hidden sm:block tracking-tight">
            Neko<span className="text-blue-500">3D</span>Labs
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`btn-tech px-4 py-2 text-sm transition-all
                ${pathname === l.href
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-steel-600 hover:text-blue-600 hover:bg-blue-50'}`}>
              {l.label}
            </Link>
          ))}
          <Link href="/admin"
            className="ml-2 btn-tech px-3 py-2 text-xs text-steel-400 hover:text-graphite-600 hover:bg-steel-100">
            ⚙
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-steel-200 text-steel-500 hover:border-steel-300 hover:bg-steel-50 transition-colors">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            {mobileOpen
              ? <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              : <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-steel-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className={`block btn-tech w-full py-2.5 text-sm text-left px-4
                ${pathname === l.href
                  ? 'bg-blue-500 text-white'
                  : 'text-steel-600 hover:bg-steel-100'}`}>
              {l.label}
            </Link>
          ))}
          <Link href="/admin" onClick={() => setMobileOpen(false)}
            className="block btn-tech w-full py-2.5 text-sm text-left px-4 text-steel-400 hover:bg-steel-100">
            ⚙ Admin
          </Link>
        </div>
      )}
    </header>
  )
}
