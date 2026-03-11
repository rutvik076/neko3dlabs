import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import FloatingButtons from '@/components/FloatingButtons'
import WinnerBanner from '@/components/WinnerBanner'
import YTPopup from '@/components/YTPopup'
import ToastProvider from '@/components/ToastProvider'

export const metadata: Metadata = {
  title: 'Neko3DLabs – Custom 3D Printed Products',
  description: 'Handcrafted 3D printed products by a YouTube creator. Buy unique prints or win them FREE in our lucky draws!',
  icons: { icon: '/logo.png', apple: '/logo.png' },
  openGraph: {
    title: 'Neko3DLabs',
    description: 'Custom 3D Printed Products — Buy or Win Free!',
    images: ['/logo.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fdf8f0',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="grain min-h-screen bg-cream-50">
        <ToastProvider>
          <WinnerBanner />
          <Navbar />
          <main className="pb-24">{children}</main>
          <FloatingButtons />
          <YTPopup />
        </ToastProvider>
      </body>
    </html>
  )
}
