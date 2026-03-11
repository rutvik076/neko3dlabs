'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Participant, Product } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export default function AdminParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [products, setProducts] = useState<Record<string, Product>>({})
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null)

  async function load() {
    const [{ data: parts }, { data: prods }] = await Promise.all([
      supabase.from('participants').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*'),
    ])
    setParticipants((parts as Participant[]) || [])
    const map: Record<string, Product> = {}
    ;((prods as Product[]) || []).forEach(p => { map[p.id] = p })
    setProducts(map)
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    await supabase.from('participants').update({ status }).eq('id', id)
    setParticipants(ps => ps.map(p => p.id === id ? { ...p, status } : p))
  }

  const filtered = filter === 'all' ? participants : participants.filter(p => p.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-choco-500">Participants 🎁</h1>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`btn-kawaii px-4 py-2 text-xs font-semibold capitalize ${filter === f ? 'bg-blush-500 text-white' : 'bg-cream-100 text-choco-400 border border-cream-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 border-b border-cream-200">
              <tr>
                {['Name', 'Product', 'Phone', 'Date', 'Status', 'Proof', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-choco-400 font-semibold text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-choco-300">No participants yet.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-cream-100 hover:bg-cream-50">
                  <td className="px-4 py-3 font-medium text-choco-500">{p.name}</td>
                  <td className="px-4 py-3 text-choco-400 max-w-[140px] truncate">{products[p.product_id]?.name || '–'}</td>
                  <td className="px-4 py-3 text-choco-400">{p.phone}</td>
                  <td className="px-4 py-3 text-choco-400 whitespace-nowrap">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold tag-${p.status}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.screenshot_url ? (
                      <button onClick={() => setScreenshotModal(p.screenshot_url!)}
                        className="btn-kawaii px-3 py-1.5 text-xs bg-cream-100 text-choco-500 border border-cream-200 hover:bg-cream-200">📸 View</button>
                    ) : <span className="text-choco-300">–</span>}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button onClick={() => updateStatus(p.id, 'approved')}
                          className="btn-kawaii px-3 py-1.5 text-xs bg-green-50 text-green-600 border border-green-200 hover:bg-green-100">✓</button>
                        <button onClick={() => updateStatus(p.id, 'rejected')}
                          className="btn-kawaii px-3 py-1.5 text-xs bg-red-50 text-red-500 border border-red-200 hover:bg-red-100">✗</button>
                      </div>
                    )}
                    {p.status !== 'pending' && (
                      <button onClick={() => updateStatus(p.id, p.status === 'approved' ? 'rejected' : 'approved')}
                        className="btn-kawaii px-3 py-1.5 text-xs bg-cream-100 text-choco-400 border border-cream-200 hover:bg-cream-200">Undo</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {screenshotModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setScreenshotModal(null)}>
          <div className="relative max-w-lg w-full">
            <img src={screenshotModal} alt="Screenshot proof" className="w-full rounded-2xl shadow-2xl" />
            <button onClick={() => setScreenshotModal(null)} className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-choco-500 font-bold">×</button>
          </div>
        </div>
      )}
    </div>
  )
}
