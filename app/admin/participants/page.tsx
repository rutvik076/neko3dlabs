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
  const [imgError, setImgError] = useState(false)
  const sb = supabase as any

  async function load() {
    const [{ data: parts }, { data: prods }] = await Promise.all([
      sb.from('participants').select('*').order('created_at', { ascending: false }),
      sb.from('products').select('*'),
    ])
    setParticipants((parts as Participant[]) || [])
    const map: Record<string, Product> = {}
    ;((prods as Product[]) || []).forEach((p: Product) => { map[p.id] = p })
    setProducts(map)
  }
  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    await sb.from('participants').update({ status }).eq('id', id)
    setParticipants(ps => ps.map(p => p.id === id ? { ...p, status } : p))
  }

  function openModal(url: string) {
    setImgError(false)
    setScreenshotModal(url)
  }

  const filtered = filter === 'all' ? participants : participants.filter(p => p.status === filter)
  const pendingCount = participants.filter(p => p.status === 'pending').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-graphite-700 tracking-tight">Participants</h1>
          {pendingCount > 0 && (
            <p className="text-orange-500 text-sm font-semibold mt-0.5">{pendingCount} pending review</p>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`btn-tech px-4 py-2 text-xs font-semibold capitalize ${filter === f ? 'btn-primary' : 'btn-ghost'}`}>
              {f}
              {f !== 'all' && (
                <span className="ml-1 opacity-60">
                  ({participants.filter(p => p.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="card-tech overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-steel-50 border-b border-steel-200">
              <tr>
                {['Name', 'Product', 'Phone', 'Date', 'Status', 'Proof', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-steel-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-steel-400">
                    <div className="text-3xl mb-2">📋</div>
                    No participants found.
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-steel-100 hover:bg-steel-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-graphite-700">{p.name}</td>
                  <td className="px-4 py-3 text-steel-500 max-w-[140px] truncate text-xs">
                    {products[p.product_id]?.name || '–'}
                  </td>
                  <td className="px-4 py-3 text-steel-500 font-mono text-xs">{p.phone}</td>
                  <td className="px-4 py-3 text-steel-400 whitespace-nowrap text-xs">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded font-semibold tag-${p.status}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.screenshot_url ? (
                      <button
                        onClick={() => openModal(p.screenshot_url!)}
                        className="btn-tech btn-ghost px-3 py-1.5 text-xs font-semibold"
                      >
                        📸 View
                      </button>
                    ) : (
                      <span className="text-steel-300 text-xs">No file</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => updateStatus(p.id, 'approved')}
                          title="Approve"
                          className="btn-tech px-3 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 font-bold"
                        >✓</button>
                        <button
                          onClick={() => updateStatus(p.id, 'rejected')}
                          title="Reject"
                          className="btn-tech px-3 py-1.5 text-xs bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-bold"
                        >✗</button>
                      </div>
                    )}
                    {p.status !== 'pending' && (
                      <button
                        onClick={() => updateStatus(p.id, p.status === 'approved' ? 'rejected' : 'approved')}
                        className="btn-tech btn-ghost px-3 py-1.5 text-xs"
                      >Undo</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screenshot Modal */}
      {screenshotModal && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setScreenshotModal(null)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setScreenshotModal(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-medium flex items-center gap-1.5"
            >
              ✕ Close
            </button>

            {imgError ? (
              /* Error state — show URL so admin can open manually */
              <div className="bg-graphite-700 border border-graphite-500 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🖼️</div>
                <p className="text-white font-semibold mb-2">Image could not be displayed</p>
                <p className="text-graphite-300 text-sm mb-4">
                  The screenshot storage bucket may still be set to private in Supabase.<br/>
                  Run the updated <code className="bg-graphite-600 px-1.5 py-0.5 rounded text-xs">schema.sql</code> to fix this.
                </p>
                <a
                  href={screenshotModal}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-tech btn-primary inline-flex px-5 py-2.5 text-sm"
                >
                  Open URL directly →
                </a>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={screenshotModal}
                alt="Subscription screenshot proof"
                className="w-full rounded-xl shadow-2xl border border-graphite-500 max-h-[80vh] object-contain bg-graphite-800"
                onError={() => setImgError(true)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
