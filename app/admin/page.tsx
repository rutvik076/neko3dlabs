'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Stats {
  products: number; entries: number; winners: number; orders: number
  pendingEntries: number; pendingOrders: number
}
interface PopularItem { name: string; type: string; count: number }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ products: 0, entries: 0, winners: 0, orders: 0, pendingEntries: 0, pendingOrders: 0 })
  const [popular, setPopular] = useState<PopularItem[]>([])
  const sb = supabase as any

  useEffect(() => {
    async function load() {
      const [p, e, w, o, pe, po] = await Promise.all([
        sb.from('products').select('*', { count: 'exact', head: true }),
        sb.from('participants').select('*', { count: 'exact', head: true }),
        sb.from('winners').select('*', { count: 'exact', head: true }),
        sb.from('orders').select('*', { count: 'exact', head: true }),
        sb.from('participants').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        sb.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ])
      setStats({ products: p.count||0, entries: e.count||0, winners: w.count||0, orders: o.count||0, pendingEntries: pe.count||0, pendingOrders: po.count||0 })

      const { data: prods } = await sb.from('products').select('id, name, type')
      const { data: parts } = await sb.from('participants').select('product_id')
      const { data: ords } = await sb.from('orders').select('product_id')

      const counts: Record<string, number> = {}
      parts?.forEach((r: any) => { counts[r.product_id] = (counts[r.product_id] || 0) + 1 })
      ords?.forEach((r: any) => { if (r.product_id) counts[r.product_id] = (counts[r.product_id] || 0) + 1 })

      const ranked: PopularItem[] = (prods || []).map((prod: any) => ({
        name: prod.name as string, type: prod.type as string, count: counts[prod.id] || 0,
      })).sort((a: any, b: any) => b.count - a.count).slice(0, 5)
      setPopular(ranked)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Products', value: stats.products, icon: '⬡', accent: 'border-t-blue-500', iconBg: 'bg-blue-50 text-blue-600' },
    { label: 'Draw Entries', value: stats.entries, icon: '◎', sub: stats.pendingEntries > 0 ? `${stats.pendingEntries} pending` : '', accent: 'border-t-orange-400', iconBg: 'bg-orange-50 text-orange-500' },
    { label: 'Winners', value: stats.winners, icon: '◆', accent: 'border-t-yellow-500', iconBg: 'bg-yellow-50 text-yellow-600' },
    { label: 'Orders', value: stats.orders, icon: '◈', sub: stats.pendingOrders > 0 ? `${stats.pendingOrders} pending` : '', accent: 'border-t-green-500', iconBg: 'bg-green-50 text-green-600' },
  ]

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-2xl font-bold text-graphite-700 tracking-tight">Dashboard</h1>
        <p className="text-steel-500 text-sm mt-1">Overview of your store activity.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className={`stat-card p-5 border-t-2 ${s.accent}`}>
            <div className={`w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center text-base mb-3`}>{s.icon}</div>
            <div className="font-display text-3xl font-bold text-graphite-700">{s.value}</div>
            <div className="text-sm text-steel-500 mt-0.5">{s.label}</div>
            {s.sub && <div className="text-xs text-orange-500 font-semibold mt-1">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="card-tech p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="accent-line" />
          <h2 className="font-display font-bold text-graphite-700">Popular Products</h2>
        </div>
        {popular.length === 0 ? (
          <p className="text-steel-400 text-sm text-center py-6">No data yet</p>
        ) : (
          <div className="space-y-3">
            {popular.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-steel-400 w-4 font-mono">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-medium text-graphite-700 truncate">{p.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${p.type === 'LUCKY_DRAW' ? 'tag-lucky' : 'tag-sell'}`}>{p.type}</span>
                  </div>
                  <div className="h-1.5 bg-steel-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-orange-400 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (p.count / Math.max(1, popular[0].count)) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-steel-500 font-mono">{p.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
