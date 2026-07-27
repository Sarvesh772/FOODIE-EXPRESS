'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Users, Ban, CheckCircle, Search } from 'lucide-react'
import Link from 'next/link'

export default function AdminProfiles() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    setLoading(true)

    // 1. Fetch Orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('user_id, customer_name, customer_phone, total_amount, created_at')
      .order('created_at', { ascending: false })

    // 2. Fetch Banned Users
    const { data: bannedData } = await supabase.from('banned_users').select('*')
    const bannedSet = new Set(bannedData?.map((b) => b.user_id_or_phone) || [])

    const userMap = {}
    ordersData?.forEach((ord) => {
      const key = ord.customer_phone || ord.user_id || ord.customer_name
      if (!userMap[key]) {
        userMap[key] = {
          key: key,
          userId: ord.user_id,
          name: ord.customer_name || 'Guest User',
          phone: ord.customer_phone || 'N/A',
          totalOrders: 0,
          totalSpent: 0,
          lastOrdered: ord.created_at,
          isBanned: bannedSet.has(key) || bannedSet.has(ord.user_id) || bannedSet.has(ord.customer_phone),
        }
      }
      userMap[key].totalOrders += 1
      userMap[key].totalSpent += Number(ord.total_amount || 0)
    })

    setProfiles(Object.values(userMap))
    setLoading(false)
  }

  // 🚫 Toggle Ban / Unban
  const toggleBanUser = async (user) => {
    const targetKey = user.userId || user.phone || user.key

    if (user.isBanned) {
      await supabase.from('banned_users').delete().eq('user_id_or_phone', targetKey)
    } else {
      await supabase.from('banned_users').insert([{ user_id_or_phone: targetKey, name: user.name }])
    }
    fetchProfiles()
  }

  const filtered = profiles.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.phone.includes(search)
  )

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6 pb-12">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-xs font-bold text-red-400 flex items-center gap-1 bg-gray-900 border border-gray-800 px-3 py-2 rounded-xl">
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <Users size={18} className="text-red-500" /> User Profiles & Ban
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white outline-none focus:border-red-500"
          />
        </div>

        {/* User Cards */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-xs text-gray-500 text-center py-8">Loading profiles...</p>
          ) : filtered.map((p, idx) => (
            <div 
              key={idx} 
              className={`bg-gray-900 border p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition ${
                p.isBanned ? 'border-red-500/50 bg-red-950/10' : 'border-gray-800'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{p.name}</span>
                  <span className="bg-red-500/20 text-red-400 font-bold text-[10px] px-2 py-0.5 rounded-md border border-red-500/30">
                    {p.totalOrders} Orders
                  </span>
                  {p.isBanned && (
                    <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Ban size={10} /> SUSPENDED
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  📞 {p.phone} • Spent: <strong className="text-emerald-400">₹{p.totalSpent}</strong>
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => toggleBanUser(p)}
                className={`font-bold text-xs px-3.5 py-2 rounded-xl border transition flex items-center gap-1.5 ${
                  p.isBanned
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                }`}
              >
                {p.isBanned ? <CheckCircle size={14} /> : <Ban size={14} />}
                {p.isBanned ? 'Unban User' : 'Ban / Suspend'}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}