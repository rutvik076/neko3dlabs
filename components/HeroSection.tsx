import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative py-10 md:py-14 mb-8 overflow-hidden rounded-2xl bg-graphite-700 dot-bg">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-graphite-800/90 via-graphite-700/80 to-blue-600/20 pointer-events-none" />

      {/* Accent lines — industrial feel */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-orange-400 to-blue-500" />

      <div className="relative flex flex-col items-center text-center gap-6 px-4">
        {/* Logo */}
        <div className="relative">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-blue-400/50 shadow-blue-glow shadow-lg">
            <Image src="/logo.png" alt="Neko3DLabs" width={80} height={80} className="object-cover w-full h-full" priority />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center pulse-dot">
            <div className="w-2.5 h-2.5 bg-white rounded-full" />
          </div>
        </div>

        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
            Neko<span className="text-blue-400">3D</span>Labs
          </h1>
          <p className="text-steel-300 mt-3 max-w-lg mx-auto text-base leading-relaxed">
            Precision-crafted 3D printed products made by a maker, for makers.
            <span className="block mt-1 text-steel-400 text-sm">Buy yours or win one FREE in our lucky draws!</span>
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <div className="text-white font-bold text-lg font-display">3D Print</div>
            <div className="text-steel-400 text-xs mt-0.5">Quality</div>
          </div>
          <div className="w-px h-8 bg-steel-600" />
          <div className="text-center">
            <div className="text-white font-bold text-lg font-display">Free</div>
            <div className="text-steel-400 text-xs mt-0.5">Lucky Draws</div>
          </div>
          <div className="w-px h-8 bg-steel-600" />
          <div className="text-center">
            <div className="text-white font-bold text-lg font-display">Fast</div>
            <div className="text-steel-400 text-xs mt-0.5">Delivery</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/lucky"
            className="btn-tech btn-accent px-6 py-3 text-sm font-semibold shadow-orange-glow">
            🎲 Enter Lucky Draw
          </Link>
          <a href={process.env.NEXT_PUBLIC_YOUTUBE_URL || '#'} target="_blank" rel="noreferrer"
            className="btn-tech px-6 py-3 bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20 hover:border-white/30 backdrop-blur-sm">
            ▶ Watch on YouTube
          </a>
        </div>
      </div>
    </section>
  )
}
