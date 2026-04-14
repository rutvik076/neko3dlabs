'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { uploadToCloudinary, FOLDERS } from '@/lib/cloudinary'
import { collection, getDocs, addDoc, updateDoc, doc, orderBy, query, where } from 'firebase/firestore'
import type { Winner, Product, Participant } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export default function AdminWinners() {
  const [products,      setProducts]      = useState<Product[]>([])
  const [participants,  setParticipants]  = useState<Participant[]>([])
  const [winners,       setWinners]       = useState<Winner[]>([])
  const [picking,       setPicking]       = useState<string | null>(null)
  const [uploadingProof,setUploadingProof]= useState<string | null>(null)

  async function load() {
    const [prodSnap, partSnap, winSnap] = await Promise.all([
      getDocs(query(collection(db, 'products'),     where('type', '==', 'LUCKY_DRAW'))),
      getDocs(query(collection(db, 'participants'), where('status', '==', 'approved'))),
      getDocs(query(collection(db, 'winners'),      orderBy('created_at', 'desc'))),
    ])
    setProducts(    prodSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)))
    setParticipants(partSnap.docs.map(d => ({ id: d.id, ...d.data() } as Participant)))
    setWinners(     winSnap.docs.map(d => ({ id: d.id, ...d.data() } as Winner)))
  }
  useEffect(() => { load() }, [])

  async function pickWinner(productId: string) {
    const eligible   = participants.filter(p => p.product_id === productId)
    const alreadyWon = winners.some(w => w.product_id === productId)
    if (alreadyWon)           { alert('A winner has already been picked.'); return }
    if (eligible.length === 0){ alert('No approved participants for this product.'); return }
    if (!confirm(`Pick a random winner from ${eligible.length} participants?`)) return

    setPicking(productId)
    const arr    = new Uint32Array(1)
    window.crypto.getRandomValues(arr)
    const winner = eligible[arr[0] % eligible.length]
    await addDoc(collection(db, 'winners'), {
      product_id:     productId,
      participant_id: winner.id,
      winner_name:    winner.name,
      winner_phone:   winner.phone,
      announce_date:  new Date().toISOString().split('T')[0],
      is_published:   true,
      created_at:     new Date().toISOString(),
    })
    setPicking(null); load()
    alert(`🎉 Winner: ${winner.name} (${winner.phone})`)
  }

  async function uploadShippingProof(winnerId: string, file: File) {
    setUploadingProof(winnerId)
    try {
      const url = await uploadToCloudinary(file, FOLDERS.SHIPPING_PROOFS)
      await updateDoc(doc(db, 'winners', winnerId), { shipping_proof_url: url })
      load()
    } catch (err: unknown) {
      alert('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally { setUploadingProof(null) }
  }

  async function togglePublish(id: string, current: boolean) {
    await updateDoc(doc(db, 'winners', id), { is_published: !current })
    setWinners(ws => ws.map(w => w.id === id ? { ...w, is_published: !current } : w))
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-graphite-700 tracking-tight mb-6">Winners</h1>

      <div className="card-tech p-5 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="accent-line" />
          <h2 className="font-semibold text-graphite-700 text-sm uppercase tracking-wide">Pick Winners</h2>
        </div>
        {products.length === 0 && <p className="text-steel-400 text-sm">No lucky draw products.</p>}
        <div className="space-y-3">
          {products.map(p => {
            const approved = participants.filter(pt => pt.product_id === p.id)
            const winner   = winners.find(w => w.product_id === p.id)
            return (
              <div key={p.id} className="flex items-center gap-4 flex-wrap p-4 bg-steel-50 border border-steel-200 rounded-xl">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-graphite-700 text-sm">{p.name}</h3>
                  <p className="text-xs text-steel-400 mt-0.5">{approved.length} approved entries</p>
                </div>
                {winner
                  ? <span className="tag-approved text-xs px-3 py-1.5 rounded font-semibold">Winner: {winner.winner_name}</span>
                  : <button onClick={() => pickWinner(p.id)} disabled={picking === p.id || approved.length === 0}
                      className="btn-tech btn-accent px-5 py-2.5 text-sm disabled:opacity-50">
                      {picking === p.id ? 'Picking...' : '🎲 Pick Random Winner'}
                    </button>
                }
              </div>
            )
          })}
        </div>
      </div>

      <div className="card-tech overflow-hidden">
        <div className="p-5 border-b border-steel-200 flex items-center gap-3">
          <div className="accent-line" />
          <h2 className="font-semibold text-graphite-700 text-sm uppercase tracking-wide">All Winners</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-steel-50 border-b border-steel-200">
              <tr>{['Winner','Phone','Product','Date','Published','Shipping','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-steel-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {winners.length === 0
                ? <tr><td colSpan={7} className="text-center py-12 text-steel-400">No winners yet.</td></tr>
                : winners.map(w => {
                  const prod = products.find(p => p.id === w.product_id)
                  return (
                    <tr key={w.id} className="border-b border-steel-100 hover:bg-steel-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-graphite-700">{w.winner_name}</td>
                      <td className="px-4 py-3 text-steel-500 font-mono text-xs">{w.winner_phone}</td>
                      <td className="px-4 py-3 text-steel-500 text-xs">{prod?.name || '–'}</td>
                      <td className="px-4 py-3 text-steel-400 text-xs whitespace-nowrap">{formatDate(w.announce_date)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => togglePublish(w.id, w.is_published)}
                          className={`btn-tech px-3 py-1 text-xs font-semibold ${w.is_published ? 'tag-approved' : 'tag-cancelled'}`}>
                          {w.is_published ? '✓ Public' : '✗ Hidden'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {w.shipping_proof_url
                          ? <a href={w.shipping_proof_url} target="_blank" rel="noreferrer" className="text-blue-600 text-xs font-semibold hover:underline">View</a>
                          : <label className="btn-tech btn-ghost px-3 py-1.5 text-xs cursor-pointer">
                              {uploadingProof === w.id ? 'Uploading...' : 'Upload Proof'}
                              <input type="file" accept="image/*,video/*" className="hidden"
                                onChange={e => e.target.files?.[0] && uploadShippingProof(w.id, e.target.files[0])} />
                            </label>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <a href={`https://wa.me/${w.winner_phone}`} target="_blank" rel="noreferrer"
                          className="btn-tech px-3 py-1.5 text-xs bg-[#25d366]/10 text-[#128c7e] border border-[#25d366]/30 hover:bg-[#25d366]/20">WA</a>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
