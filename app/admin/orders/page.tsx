'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore'
import type { Order } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<'all'|'pending'|'shipped'|'completed'|'cancelled'>('all')

  async function load() {
    const q    = query(collection(db, 'orders'), orderBy('created_at', 'desc'))
    const snap = await getDocs(q)
    setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)))
  }
  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: Order['status']) {
    await updateDoc(doc(db, 'orders', id), { status, updated_at: new Date().toISOString() })
    setOrders(os => os.map(o => o.id===id ? { ...o, status } : o))
  }

  const filtered = filter==='all' ? orders : orders.filter(o => o.status===filter)
  const pending  = orders.filter(o => o.status==='pending').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-graphite-700 tracking-tight">Orders</h1>
          {pending > 0 && <p className="text-orange-500 text-sm font-semibold mt-0.5">{pending} pending orders</p>}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all','pending','shipped','completed','cancelled'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`btn-tech px-4 py-2 text-xs font-semibold capitalize ${filter===f ? 'btn-primary' : 'btn-ghost'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="card-tech overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-steel-50 border-b border-steel-200">
              <tr>
                {['Product','Buyer Phone','Date','Status','Update Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-steel-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={5} className="text-center py-12 text-steel-400">No orders found.</td></tr>
                : filtered.map(o => (
                  <tr key={o.id} className="border-b border-steel-100 hover:bg-steel-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-graphite-700 max-w-[180px] truncate">{o.product_name}</td>
                    <td className="px-4 py-3 text-steel-500 font-mono text-xs">{o.buyer_phone}</td>
                    <td className="px-4 py-3 text-steel-400 whitespace-nowrap text-xs">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded font-semibold tag-${o.status}`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={o.status} onChange={e => updateStatus(o.id, e.target.value as Order['status'])}
                        className="bg-white border border-steel-200 rounded-lg px-3 py-1.5 text-xs text-graphite-600 focus:outline-none focus:border-blue-400 cursor-pointer">
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
