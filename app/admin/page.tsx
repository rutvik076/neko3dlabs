'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Stats {
  products: number
  entries: number
  winners: number
  orders: number
  pendingEntries: number
  pendingOrders: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ products: 0, entries: 0, winners: 0, orders: 0, pendingEntries: 0, pendingOrders: 0 })
  const [popular, setPopular] = useState<Array<{ name: string; type: string; count: number }>>([])

  useEffect(() => {
    async function load() {
      const [p, e, w, o, pe, po] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('participants').select('*', { count: 'exact', head: true }),
        supabase.from('winners').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('participants').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ])
      setStats({ products: p.count || 0, entries: e.count || 0, winners: w.count || 0, orders: o.count || 0, pendingEntries: pe.count || 0, pendingOrders: po.count || 0 })

      // Popular products
      const { data: prods } = await supabase.from('products').select('id, name, type')
      const { data: parts } = await supabase.from('participants').select('product_id')
      const { data: ords } = await supabase.from('orders').select('product_id')
      const counts: Record<string, number> = {}
      parts?.forEach(r => { counts[r.product_id] = (counts[r.product_id] || 0) + 1 })
      ords?.forEach(r => { if (r.product_id) counts[r.product_id] = (counts[r.product_id] || 0) + 1 })
      const ranked = (prods || []).map(p => ({ name: p.name, type: p.type, count: counts[p.id] || 0 }))
        .sort((a, b) => b.count - a.count).slice(0, 5)
      setPopular(ranked)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Products', value: stats.products, icon: '📦', color: 'from-amber-100 to-orange-100', border: 'border-orange-200' },
    { label: 'Draw Entries', value: stats.entries, icon: '🎁', sub: stats.pendingEntries > 0 ? `${stats.pendingEntries} pending` : '', color: 'from-pink-100 to-rose-100', border: 'border-rose-200' },
    { label: 'Winners', value: stats.winners, icon: '🏆', color: 'from-yellow-100 to-amber-100', border: 'border-amber-200' },
    { label: 'Orders', value: stats.orders, icon: '🛒', sub: stats.pendingOrders > 0 ? `${stats.pendingOrders} pending` : '', color: 'from-green-100 to-emerald-100', border: 'border-emerald-200' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-choco-500">Dashboard 🐱</h1>
        <p className="text-choco-300 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-4`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="font-display text-3xl font-bold text-choco-500">{s.value}</div>
            <div className="text-sm text-choco-400 mt-0.5">{s.label}</div>
            {s.sub && <div className="text-xs text-blush-500 font-semibold mt-1">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-cream-200 p-5">
        <h2 className="font-display font-bold text-choco-500 mb-4">📊 Popular Products</h2>
        {popular.length === 0 ? (
          <p className="text-choco-300 text-sm text-center py-6">No data yet</p>
        ) : (
          <div className="space-y-2">
            {popular.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-choco-300 w-4">{i+1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-choco-500 truncate">{p.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.type === 'LUCKY_DRAW' ? 'tag-lucky' : 'tag-sell'}`}>{p.type}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blush-300 to-blush-500 rounded-full transition-all" style={{ width: `${Math.min(100, (p.count / Math.max(1, popular[0].count)) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-choco-400">{p.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
