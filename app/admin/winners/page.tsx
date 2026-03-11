'use client'
import { useEffect, useState } from 'react'
import { supabase, BUCKETS, uploadFile } from '@/lib/supabase'
import type { Winner, Product, Participant } from '@/lib/types'
import { generateFilePath, formatDate } from '@/lib/utils'

export default function AdminWinners() {
  const [products, setProducts] = useState<Product[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [picking, setPicking] = useState<string | null>(null)
  const [uploadingProof, setUploadingProof] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  async function load() {
    const [{ data: prods }, { data: parts }, { data: wins }] = await Promise.all([
      sb.from('products').select('*').eq('type', 'LUCKY_DRAW'),
      sb.from('participants').select('*').eq('status', 'approved'),
      sb.from('winners').select('*').order('created_at', { ascending: false }),
    ])
    setProducts((prods as Product[]) || [])
    setParticipants((parts as Participant[]) || [])
    setWinners((wins as Winner[]) || [])
  }

  useEffect(() => { load() }, [])

  async function pickWinner(productId: string) {
    const eligible = participants.filter(p => p.product_id === productId)
    const alreadyWon = winners.some(w => w.product_id === productId)
    if (alreadyWon) { alert('A winner has already been picked for this product.'); return }
    if (eligible.length === 0) { alert('No approved participants for this product.'); return }
    if (!confirm(`Pick a random winner from ${eligible.length} participants?`)) return

    setPicking(productId)
    const arr = new Uint32Array(1)
    window.crypto.getRandomValues(arr)
    const winner = eligible[arr[0] % eligible.length]

    await sb.from('winners').insert({
      product_id: productId,
      participant_id: winner.id,
      winner_name: winner.name,
      winner_phone: winner.phone,
      announce_date: new Date().toISOString().split('T')[0],
      is_published: true,
    })
    setPicking(null)
    load()
    alert(`🎉 Winner: ${winner.name} (${winner.phone})`)
  }

  async function uploadShippingProof(winnerId: string, file: File) {
    setUploadingProof(winnerId)
    try {
      const path = generateFilePath('shipping', file.name)
      const url = await uploadFile(BUCKETS.SHIPPING_PROOFS, path, file)
      await sb.from('winners').update({ shipping_proof_url: url }).eq('id', winnerId)
      load()
    } catch {
      alert('Upload failed')
    } finally {
      setUploadingProof(null)
    }
  }

  async function togglePublish(id: string, current: boolean) {
    await sb.from('winners').update({ is_published: !current }).eq('id', id)
    setWinners(ws => ws.map(w => w.id === id ? { ...w, is_published: !current } : w))
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-choco-500 mb-6">Winners 🏆</h1>

      <div className="space-y-4 mb-10">
        <h2 className="font-semibold text-choco-400 text-sm uppercase tracking-wide">Pick Winners</h2>
        {products.length === 0 && <p className="text-choco-300 text-sm">No lucky draw products.</p>}
        {products.map(p => {
          const approved = participants.filter(pt => pt.product_id === p.id)
          const winner = winners.find(w => w.product_id === p.id)
          return (
            <div key={p.id} className="bg-white border border-cream-200 rounded-2xl p-4 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-choco-500">{p.name}</h3>
                <p className="text-sm text-choco-300 mt-0.5">{approved.length} approved entries</p>
              </div>
              {winner ? (
                <span className="tag-approved text-xs px-2 py-1 rounded-full font-semibold">Winner: {winner.winner_name}</span>
              ) : (
                <button
                  onClick={() => pickWinner(p.id)}
                  disabled={picking === p.id || approved.length === 0}
                  className="btn-kawaii px-5 py-2.5 bg-gradient-to-r from-blush-400 to-blush-500 text-white text-sm shadow-md disabled:opacity-50 hover:shadow-lg"
                >
                  {picking === p.id ? '🎲 Picking...' : '🎲 Pick Random Winner'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div>
        <h2 className="font-semibold text-choco-400 text-sm uppercase tracking-wide mb-3">All Winners</h2>
        <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  {['Winner', 'Phone', 'Product', 'Date', 'Published', 'Shipping', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-choco-400 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {winners.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-choco-300">No winners yet.</td></tr>
                ) : winners.map(w => {
                  const prod = products.find(p => p.id === w.product_id)
                  return (
                    <tr key={w.id} className="border-b border-cream-100 hover:bg-cream-50">
                      <td className="px-4 py-3 font-medium text-choco-500">{w.winner_name}</td>
                      <td className="px-4 py-3 text-choco-400">{w.winner_phone}</td>
                      <td className="px-4 py-3 text-choco-400">{prod?.name || '–'}</td>
                      <td className="px-4 py-3 text-choco-400 whitespace-nowrap">{formatDate(w.announce_date)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => togglePublish(w.id, w.is_published)}
                          className={`btn-kawaii px-3 py-1 text-xs ${w.is_published ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-cream-100 text-choco-400 border border-cream-200'}`}>
                          {w.is_published ? '✅ Public' : '🔒 Hidden'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {w.shipping_proof_url ? (
                          <a href={w.shipping_proof_url} target="_blank" rel="noreferrer" className="text-sage-400 text-xs font-semibold hover:underline">View Proof</a>
                        ) : (
                          <label className="btn-kawaii px-3 py-1.5 text-xs bg-cream-100 text-choco-500 border border-cream-200 hover:bg-cream-200 cursor-pointer">
                            {uploadingProof === w.id ? 'Uploading...' : '📦 Upload Proof'}
                            <input type="file" accept="image/*,video/*" className="hidden"
                              onChange={e => e.target.files?.[0] && uploadShippingProof(w.id, e.target.files[0])} />
                          </label>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <a href={`https://wa.me/${w.winner_phone}`} target="_blank" rel="noreferrer"
                          className="btn-kawaii px-3 py-1.5 text-xs bg-[#25d366]/10 text-[#128c7e] border border-[#25d366]/30 hover:bg-[#25d366]/20">
                          💬 WA
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
