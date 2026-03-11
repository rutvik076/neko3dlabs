'use client'
import { useEffect, useState } from 'react'
import { supabase, BUCKETS, uploadFile } from '@/lib/supabase'
import type { Product } from '@/lib/types'
import { formatPrice, generateFilePath } from '@/lib/utils'
import Image from 'next/image'

const EMPTY: Partial<Product> = {
  name: '', description: '', price: 0, type: 'SELL', stock: 'in',
  images: [], video_url: '', lucky_draw_end: '', max_participants: 0, is_featured: false,
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Partial<Product>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  async function load() {
    const { data } = await sb.from('products').select('*').order('created_at', { ascending: false })
    setProducts((data as Product[]) || [])
  }
  useEffect(() => { load() }, [])

  function openAdd() { setForm(EMPTY); setModal(true) }
  function openEdit(p: Product) { setForm({ ...p }); setModal(true) }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of files) {
        const path = generateFilePath('products', file.name)
        const url = await uploadFile(BUCKETS.PRODUCT_IMAGES, path, file)
        urls.push(url)
      }
      setForm(f => ({ ...f, images: [...(f.images || []), ...urls] }))
    } catch {
      alert('Image upload failed. Check your Supabase storage bucket "product-images" is public.')
    } finally {
      setUploading(false)
    }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = generateFilePath('videos', file.name)
      const url = await uploadFile(BUCKETS.PRODUCT_VIDEOS, path, file)
      setForm(f => ({ ...f, video_url: url }))
    } catch {
      alert('Video upload failed. Check your Supabase storage bucket "product-videos" is public.')
    } finally {
      setUploading(false)
    }
  }

  function removeImage(idx: number) {
    setForm(f => ({ ...f, images: (f.images || []).filter((_, i) => i !== idx) }))
  }

  async function save() {
    if (!form.name?.trim()) { alert('Product name required'); return }
    setSaving(true)
    const payload = {
      name: form.name!.trim(),
      description: form.description || '',
      price: form.type === 'LUCKY_DRAW' ? 0 : Number(form.price) || 0,
      type: form.type!,
      stock: form.stock!,
      images: form.images || [],
      video_url: form.video_url || null,
      lucky_draw_end: form.lucky_draw_end || null,
      max_participants: Number(form.max_participants) || 0,
      is_featured: form.is_featured || false,
    }
    if (form.id) {
      await sb.from('products').update(payload).eq('id', form.id)
    } else {
      await sb.from('products').insert(payload)
    }
    setSaving(false)
    setModal(false)
    load()
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    setDeleting(id)
    await sb.from('products').delete().eq('id', id)
    setDeleting(null)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-choco-500">Products 📦</h1>
        <button onClick={openAdd} className="btn-kawaii px-5 py-2.5 bg-blush-500 text-white text-sm shadow-md hover:bg-blush-400">
          + Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 border-b border-cream-200">
              <tr>
                {['Product', 'Type', 'Price', 'Stock', 'Featured', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-choco-400 font-semibold text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-choco-300">No products yet. Add one!</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0">
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                      </div>
                      <span className="font-medium text-choco-500 max-w-[180px] truncate">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${p.type === 'LUCKY_DRAW' ? 'tag-lucky' : 'tag-sell'}`}>{p.type}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-choco-400">{p.type === 'LUCKY_DRAW' ? 'FREE' : formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${p.stock === 'in' ? 'tag-approved' : 'tag-rejected'}`}>
                      {p.stock === 'in' ? 'In Stock' : 'Out'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{p.is_featured ? '⭐' : '–'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="btn-kawaii px-3 py-1.5 text-xs bg-cream-100 text-choco-500 border border-cream-200 hover:bg-cream-200">Edit</button>
                      <button onClick={() => deleteProduct(p.id)} disabled={deleting === p.id} className="btn-kawaii px-3 py-1.5 text-xs bg-red-50 text-red-500 border border-red-200 hover:bg-red-100">
                        {deleting === p.id ? '...' : 'Del'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg my-6 shadow-2xl">
            <h2 className="font-display text-xl font-bold text-choco-500 mb-5">{form.id ? 'Edit Product' : 'Add Product'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-choco-400 mb-1.5">Product Name *</label>
                <input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-choco-400 mb-1.5">Description</label>
                <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-choco-400 mb-1.5">Type *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Product['type'] }))}
                    className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300">
                    <option value="SELL">SELL</option>
                    <option value="LUCKY_DRAW">LUCKY DRAW (Free)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-choco-400 mb-1.5">Stock</label>
                  <select value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value as Product['stock'] }))}
                    className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300">
                    <option value="in">In Stock</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>
              </div>
              {form.type === 'SELL' && (
                <div>
                  <label className="block text-xs font-semibold text-choco-400 mb-1.5">Price (RM)</label>
                  <input type="number" min="0" step="0.01" value={form.price || 0}
                    onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                    className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300" />
                </div>
              )}
              {form.type === 'LUCKY_DRAW' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-choco-400 mb-1.5">Draw End Date</label>
                    <input type="date" value={form.lucky_draw_end || ''}
                      onChange={e => setForm(f => ({ ...f, lucky_draw_end: e.target.value }))}
                      className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-choco-400 mb-1.5">Max Participants</label>
                    <input type="number" min="0" value={form.max_participants || 0}
                      onChange={e => setForm(f => ({ ...f, max_participants: parseInt(e.target.value) }))}
                      className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-choco-400 mb-1.5">Product Images</label>
                <label className="block border-2 border-dashed border-cream-300 rounded-xl p-4 text-center cursor-pointer hover:border-blush-300 transition-colors bg-cream-50">
                  <div className="text-2xl mb-1">🖼️</div>
                  <p className="text-xs text-choco-300">{uploading ? 'Uploading...' : 'Click to upload images (JPG, PNG, WebP)'}</p>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} className="hidden" />
                </label>
                {(form.images || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(form.images || []).map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-cream-200 group">
                        <Image src={img} alt="" fill className="object-cover" />
                        <button onClick={() => removeImage(i)}
                          className="absolute inset-0 bg-black/50 text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-choco-400 mb-1.5">Product Video</label>
                <div className="space-y-2">
                  <label className="block border-2 border-dashed border-cream-300 rounded-xl p-4 text-center cursor-pointer hover:border-blush-300 transition-colors bg-cream-50">
                    <div className="text-2xl mb-1">🎬</div>
                    <p className="text-xs text-choco-300">{uploading ? 'Uploading...' : 'Upload video file (MP4, WebM)'}</p>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploading} className="hidden" />
                  </label>
                  <input
                    value={form.video_url && !form.video_url.includes('supabase') ? form.video_url : ''}
                    onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                    placeholder="OR paste YouTube URL: https://youtube.com/watch?v=..."
                    className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-2.5 text-sm text-choco-500 focus:outline-none focus:border-blush-300"
                  />
                  {form.video_url && (
                    <p className="text-xs text-sage-400 truncate">✅ {form.video_url.split('/').pop()}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" checked={form.is_featured || false}
                  onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                  className="accent-blush-400 w-4 h-4" />
                <label htmlFor="featured" className="text-sm text-choco-400 cursor-pointer">⭐ Mark as Featured</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} disabled={saving || uploading}
                className="btn-kawaii flex-1 py-3 bg-blush-500 text-white font-semibold text-sm hover:bg-blush-400 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Product'}
              </button>
              <button onClick={() => setModal(false)} className="btn-kawaii px-6 py-3 bg-cream-100 text-choco-500 border border-cream-200 text-sm hover:bg-cream-200">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
