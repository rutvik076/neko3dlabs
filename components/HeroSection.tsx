import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative py-10 md:py-14 mb-6 overflow-hidden">
      {/* Paw background */}
      <div className="absolute inset-0 paw-bg pointer-events-none" />

      <div className="relative flex flex-col items-center text-center gap-5">
        {/* Logo */}
        <div className="float">
          <div className="w-24 h-24 rounded-full overflow-hidden sticker-border">
            <Image src="/logo.png" alt="Neko3DLabs" width={96} height={96} className="object-cover w-full h-full" priority />
          </div>
        </div>

        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-choco-500 leading-tight">
            Neko<span className="text-blush-500">3D</span>Labs
          </h1>
          <p className="text-choco-300 mt-2 max-w-md mx-auto text-base">
            Handcrafted 3D prints made with love 🐱<br/>
            <span className="font-medium text-choco-400">Buy yours or win one FREE in our lucky draws!</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/lucky"
            className="btn-kawaii px-6 py-3 bg-gradient-to-r from-blush-400 to-blush-500 text-white text-sm shadow-lg"
            style={{ boxShadow: '0 4px 20px rgba(217,85,85,0.35)' }}>
            🎲 Enter Lucky Draw
          </Link>
          <a href={process.env.NEXT_PUBLIC_YOUTUBE_URL || '#'} target="_blank" rel="noreferrer"
            className="btn-kawaii px-6 py-3 bg-red-500 text-white text-sm shadow-md hover:bg-red-600">
            ▶ Watch on YouTube
          </a>
        </div>
      </div>
    </section>
  )
}
