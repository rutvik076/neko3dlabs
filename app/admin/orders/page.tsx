'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'shipped' | 'completed' | 'cancelled'>('all')

  async function load() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders((data as Order[]) || [])
  }
  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: Order['status']) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('orders').update({ status }).eq('id', id)
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o))
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const pending = orders.filter(o => o.status === 'pending').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-choco-500">Orders 🛒</h1>
          {pending > 0 && <p className="text-blush-500 text-sm font-semibold mt-0.5">{pending} pending orders</p>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'shipped', 'completed', 'cancelled'] as const).map(f => (
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
                {['Product', 'Buyer Phone', 'Date', 'Status', 'Update Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-choco-400 font-semibold text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-choco-300">No orders yet.</td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} className="border-b border-cream-100 hover:bg-cream-50">
                  <td className="px-4 py-3 font-medium text-choco-500 max-w-[180px] truncate">{o.product_name}</td>
                  <td className="px-4 py-3 text-choco-400">{o.buyer_phone}</td>
                  <td className="px-4 py-3 text-choco-400 whitespace-nowrap">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold tag-${o.status}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value as Order['status'])}
                      className="bg-cream-50 border border-cream-200 rounded-xl px-3 py-1.5 text-xs text-choco-500 focus:outline-none focus:border-blush-300 cursor-pointer">
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
