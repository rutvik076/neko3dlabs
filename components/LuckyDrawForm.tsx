'use client'
import { useState } from 'react'
import { supabase, BUCKETS, uploadFile } from '@/lib/supabase'
import type { Product } from '@/lib/types'
import { generateFilePath } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Props { product: Product }

export default function LuckyDrawForm({ product }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', address: '', agree: false })
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const sb = supabase as any

  const handleField = (k: 'name' | 'phone' | 'address') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(s => ({ ...s, [k]: e.target.value }))

  async function submit() {
    setError('')
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Please fill all required fields.')
      return
    }
    if (!file) {
      setError('Please upload your subscription screenshot.')
      return
    }
    if (!form.agree) {
      setError('Please agree to the terms to continue.')
      return
    }

    setSubmitting(true)
    try {
      // ── Duplicate check: use .maybeSingle() instead of .single()
      // .single() throws an error if no row found; .maybeSingle() returns null safely
      const { data: existing, error: checkError } = await sb
        .from('participants')
        .select('id')
        .eq('product_id', product.id)
        .eq('phone', form.phone.trim())
        .maybeSingle()

      if (checkError) {
        // RLS or network error on the check — log and continue rather than block
        console.warn('Duplicate check error (non-blocking):', checkError.message)
      } else if (existing) {
        setError('This phone number has already entered this draw.')
        setSubmitting(false)
        return
      }

      // ── Upload screenshot to Supabase Storage
      const path = generateFilePath('screenshots', file.name)
      const screenshotUrl = await uploadFile(BUCKETS.SCREENSHOTS, path, file)

      // ── Insert participant row
      const { error: insertError } = await sb.from('participants').insert({
        product_id: product.id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        screenshot_url: screenshotUrl,
        agreed_to_share: form.agree,
        status: 'pending',
      })

      if (insertError) {
        // Surface the exact Supabase error message so it's easy to debug
        throw new Error(insertError.message)
      }

      setDone(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="card-tech p-8 text-center border-2 border-green-400">
        <div className="w-14 h-14 mx-auto mb-4 bg-green-50 rounded-xl border border-green-200 flex items-center justify-center text-3xl">
          ✓
        </div>
        <h3 className="font-display text-xl font-bold text-graphite-700">Entry Submitted!</h3>
        <p className="text-steel-500 mt-2 text-sm leading-relaxed">
          Your entry is pending admin approval.<br />Good luck! 🍀
        </p>
        <button
          onClick={() => router.push('/')}
          className="btn-tech btn-primary inline-flex mt-5 px-6 py-2.5 text-sm"
        >
          ← Back to Shop
        </button>
      </div>
    )
  }

  return (
    <div className="card-tech p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="accent-line" />
        <h3 className="font-display font-bold text-graphite-700">
          Enter: <span className="text-blue-600">{product.name}</span>
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-steel-500 mb-1.5 uppercase tracking-wide">
            Full Name *
          </label>
          <input
            value={form.name}
            onChange={handleField('name')}
            placeholder="Your full name"
            className="input-tech"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-steel-500 mb-1.5 uppercase tracking-wide">
            Phone Number *
          </label>
          <input
            value={form.phone}
            onChange={handleField('phone')}
            placeholder="+91 98765 43210"
            type="tel"
            className="input-tech"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-steel-500 mb-1.5 uppercase tracking-wide">
            Delivery Address *
          </label>
          <textarea
            value={form.address}
            onChange={handleField('address')}
            rows={3}
            placeholder="Your full delivery address..."
            className="input-tech resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-steel-500 mb-1.5 uppercase tracking-wide">
            Subscription Screenshot *
          </label>
          <label className="block border-2 border-dashed border-steel-200 rounded-lg p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors bg-steel-50">
            <div className="text-2xl mb-1.5">{file ? '✓' : '📸'}</div>
            <p className="text-xs text-steel-500 font-medium">
              {file ? file.name : 'Click to upload screenshot of your subscription'}
            </p>
            <p className="text-xs text-steel-400 mt-1">JPG, PNG, WebP accepted</p>
            <input
              type="file"
              accept="image/*"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        </div>

        <label className="flex items-start gap-3 cursor-pointer p-3 bg-steel-50 rounded-lg border border-steel-200 hover:border-blue-300 transition-colors">
          <input
            type="checkbox"
            checked={form.agree}
            onChange={e => setForm(s => ({ ...s, agree: e.target.checked }))}
            className="mt-0.5 accent-blue-500 w-4 h-4 flex-shrink-0"
          />
          <span className="text-xs text-steel-500 leading-relaxed">
            I agree to share the product on my social media if I win this lucky draw.
          </span>
        </label>

        {/* Error display — shown inline instead of alert() */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-500 text-sm mt-0.5 flex-shrink-0">⚠</span>
            <p className="text-red-600 text-sm leading-relaxed">{error}</p>
          </div>
        )}
      </div>

      <button
        onClick={submit}
        disabled={submitting}
        className="btn-tech btn-accent w-full mt-5 py-3.5 text-sm font-semibold disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : '🎲 Submit Entry — FREE'}
      </button>
    </div>
  )
}
