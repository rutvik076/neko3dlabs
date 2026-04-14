'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { uploadToCloudinary, FOLDERS } from '@/lib/cloudinary'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

const EMPTY: Partial<Product> = {
  name: '', description: '', price: 0, type: 'SELL', stock: 'in',
  images: [], video_url: '', lucky_draw_end: '', max_participants: 0, is_featured: false,
}

export default function AdminProducts() {
  const [products,  setProducts]  = useState<Product[]>([])
  const [modal,     setModal]     = useState(false)
  const [form,      setForm]      = useState<Partial<Product>>(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting,  setDeleting]  = useState<string | null>(null)

  async function load() {
    const snap = await getDocs(query(collection(db, 'products'), orderBy('created_at', 'desc')))
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)))
  }
  useEffect(() => { load() }, [])

  function openAdd()            { setForm(EMPTY); setModal(true) }
  function openEdit(p: Product) { setForm({ ...p }); setModal(true) }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const urls = await Promise.all(files.map(f => uploadToCloudinary(f, FOLDERS.PRODUCT_IMAGES)))
      setForm(f => ({ ...f, images: [...(f.images || []), ...urls] }))
    } catch (err: unknown) {
      alert('Image upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally { setUploading(false) }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file, FOLDERS.PRODUCT_VIDEOS)
      setForm(f => ({ ...f, video_url: url }))
    } catch (err: unknown) {
      alert('Video upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally { setUploading(false) }
  }

  function removeImage(idx: number) {
    setForm(f => ({ ...f, images: (f.images || []).filter((_, i) => i !== idx) }))
  }

  async function save() {
    if (!form.name?.trim()) { alert('Product name required'); return }
    setSaving(true)
    const payload: Record<string, unknown> = {
      name:             form.name!.trim(),
      description:      form.description || '',
      price:            form.type === 'LUCKY_DRAW' ? 0 : Number(form.price) || 0,
      type:             form.type!,
      stock:            form.stock!,
      images:           form.images || [],
      video_url:        form.video_url || null,
      lucky_draw_end:   form.lucky_draw_end || null,
      max_participants: Number(form.max_participants) || 0,
      is_featured:      form.is_featured || false,
      updated_at:       serverTimestamp(),
    }
    if (form.id) {
      await updateDoc(doc(db, 'products', form.id), payload)
    } else {
      payload.created_at = serverTimestamp()
      await addDoc(collection(db, 'products'), payload)
    }
    setSaving(false); setModal(false); load()
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    setDeleting(id)
    await deleteDoc(doc(db, 'products', id))
    setDeleting(null); load()
  }

  const iCls = 'input-tech'
  const lCls = 'block text-xs font-semibold text-steel-500 mb-1.5 uppercase tracking-wide'

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-graphite-700 tracking-tight">Products</h1>
        <button onClick={openAdd} className="btn-tech btn-primary px-5 py-2.5 text-sm font-semibold">+ Add Product</button>
      </div>

      <div className="card-tech overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-steel-50 border-b border-steel-200">
              <tr>{['Product','Type','Price (₹)','Stock','Featured','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-steel-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {products.length === 0
                ? <tr><td colSpan={6} className="text-center py-12 text-steel-400">No products yet.</td></tr>
                : products.map(p => (
                  <tr key={p.id} className="border-b border-steel-100 hover:bg-steel-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-steel-100 flex-shrink-0 border border-steel-200">
                          {p.images?.[0]
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                            : <div className="w-full h-full flex items-center justify-center text-steel-300 text-xs">–</div>
                          }
                        </div>
                        <span className="font-medium text-graphite-700 max-w-[180px] truncate">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded font-semibold ${p.type==='LUCKY_DRAW'?'tag-lucky':'tag-sell'}`}>{p.type}</span></td>
                    <td className="px-4 py-3 font-mono font-medium text-graphite-600">{p.type==='LUCKY_DRAW' ? 'FREE' : formatPrice(p.price)}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded font-semibold ${p.stock==='in'?'tag-approved':'tag-rejected'}`}>{p.stock==='in'?'In Stock':'Out'}</span></td>
                    <td className="px-4 py-3 text-center">{p.is_featured ? '⭐' : '–'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(p)} className="btn-tech btn-ghost px-3 py-1.5 text-xs">Edit</button>
                        <button onClick={() => deleteProduct(p.id)} disabled={deleting===p.id}
                          className="btn-tech px-3 py-1.5 text-xs bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                          {deleting===p.id ? '...' : 'Del'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-steel-200 p-6 w-full max-w-lg my-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="accent-line" />
              <h2 className="font-display text-xl font-bold text-graphite-700">{form.id ? 'Edit Product' : 'Add Product'}</h2>
            </div>
            <div className="space-y-4">
              <div><label className={lCls}>Product Name *</label><input value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={iCls} /></div>
              <div><label className={lCls}>Description</label><textarea value={form.description||''} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} className="input-tech resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lCls}>Type *</label>
                  <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value as Product['type']}))} className={iCls}>
                    <option value="SELL">SELL</option>
                    <option value="LUCKY_DRAW">LUCKY DRAW (Free)</option>
                  </select>
                </div>
                <div>
                  <label className={lCls}>Stock</label>
                  <select value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value as Product['stock']}))} className={iCls}>
                    <option value="in">In Stock</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>
              </div>
              {form.type==='SELL' && (
                <div><label className={lCls}>Price (₹ INR)</label>
                <input type="number" min="0" step="1" value={form.price||0} onChange={e=>setForm(f=>({...f,price:parseFloat(e.target.value)}))} className={iCls} /></div>
              )}
              {form.type==='LUCKY_DRAW' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={lCls}>Draw End Date</label><input type="date" value={form.lucky_draw_end||''} onChange={e=>setForm(f=>({...f,lucky_draw_end:e.target.value}))} className={iCls} /></div>
                  <div><label className={lCls}>Max Participants</label><input type="number" min="0" value={form.max_participants||0} onChange={e=>setForm(f=>({...f,max_participants:parseInt(e.target.value)}))} className={iCls} /></div>
                </div>
              )}
              <div>
                <label className={lCls}>Product Images</label>
                <label className="block border-2 border-dashed border-steel-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors bg-steel-50">
                  <div className="text-xl mb-1">{uploading ? '⏳' : '🖼️'}</div>
                  <p className="text-xs text-steel-500 font-medium">{uploading ? 'Uploading to Cloudinary...' : 'Click to upload images (JPG, PNG, WebP)'}</p>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} className="hidden" />
                </label>
                {(form.images||[]).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(form.images||[]).map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-steel-200 group bg-steel-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(i)} className="absolute inset-0 bg-black/60 text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className={lCls}>Product Video</label>
                <div className="space-y-2">
                  <label className="block border-2 border-dashed border-steel-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors bg-steel-50">
                    <div className="text-xl mb-1">{uploading ? '⏳' : '🎬'}</div>
                    <p className="text-xs text-steel-500 font-medium">{uploading ? 'Uploading...' : 'Upload video file (MP4, WebM)'}</p>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploading} className="hidden" />
                  </label>
                  <input value={form.video_url && !form.video_url.includes('cloudinary') ? form.video_url : ''}
                    onChange={e=>setForm(f=>({...f,video_url:e.target.value}))}
                    placeholder="OR paste YouTube URL: https://youtube.com/watch?v=..." className={iCls} />
                  {form.video_url && <p className="text-xs text-green-600 font-medium truncate">✓ {form.video_url.split('/').pop()}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-steel-50 rounded-lg border border-steel-200">
                <input type="checkbox" id="featured" checked={form.is_featured||false} onChange={e=>setForm(f=>({...f,is_featured:e.target.checked}))} className="accent-blue-500 w-4 h-4" />
                <label htmlFor="featured" className="text-sm text-steel-600 cursor-pointer font-medium">⭐ Mark as Featured</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} disabled={saving||uploading} className="btn-tech btn-primary flex-1 py-3 text-sm font-semibold disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Product'}
              </button>
              <button onClick={() => setModal(false)} className="btn-tech btn-ghost px-6 py-3 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
