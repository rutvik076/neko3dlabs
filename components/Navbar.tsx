'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: '🛍️ Shop' },
  { href: '/lucky', label: '🎁 Lucky Draw' },
  { href: '/winners', label: '🏆 Winners' },
]

export default function Navbar() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null

  return (
    <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-cream-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-full overflow-hidden sticker-border">
            <Image src="/logo.png" alt="Neko3DLabs" width={36} height={36} className="object-cover w-full h-full" />
          </div>
          <span className="font-display font-bold text-lg text-choco-500 hidden sm:block">
            Neko<span className="text-blush-500">3D</span>Labs
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`btn-kawaii px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all rounded-full
                ${pathname === l.href
                  ? 'bg-blush-100 text-blush-500 font-semibold'
                  : 'text-choco-400 hover:text-choco-500 hover:bg-cream-200'}`}>
              {l.label}
            </Link>
          ))}
          <Link href="/admin"
            className="ml-1 btn-kawaii px-3 py-2 text-xs text-choco-300 hover:text-blush-500 hover:bg-blush-50 rounded-full">
            ⚙
          </Link>
        </nav>
      </div>
    </header>
  )
}
