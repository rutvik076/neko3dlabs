import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) { return clsx(inputs) }

export function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function buildWhatsAppUrl(phone: string, productName: string) {
  const msg = encodeURIComponent(`Hello, I want to buy this product: ${productName}`)
  return `https://wa.me/${phone}?text=${msg}`
}

export function extractYouTubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}
