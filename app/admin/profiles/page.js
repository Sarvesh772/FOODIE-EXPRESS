'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Users, Ban, CheckCircle, Search, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function AdminProfiles() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    setLoading(true)

    // 1. Fetch Orders
    const { data: ordersData, error: ordersErr } = await supabase
      .from('orders')
      .select('user_id, customer_name, customer_phone, total_amount, created_at')
      .order('created_at', { ascending: false })

    if (ordersErr) {
      console.error('Error fetching orders:', ordersErr)
    }

    // 2. Fetch Banned Users Table
    const { data: bannedData, error: bannedErr } = await supabase
      .from('banned_users')
      .select('*')

    if (bannedErr) {
      console.error('Error fetching banned users:', bannedErr)
    }

    const bannedSet = new Set(bannedData?.map((b) => b.user_id_or_phone) || [])

    // 3. Aggregate User Profiles
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
          isBanned: 
            bannedSet.has(key) || 
            (ord.user_id && bannedSet.has(ord.user_id)) || 
            (ord.customer_phone && bannedSet.has(ord.customer_phone)),
        }
      }
      userMap[key].totalOrders += 1
      userMap[key].totalSpent += Number(ord.total_amount || 0)
    })

    setProfiles(Object.values(userMap))
    setLoading(false)
  }

  // 🚫 TOGGLE BAN / UNBAN
  const toggleBanUser = async (user) => {
    const targetKey = user.phone !== 'N/A' ? user.phone : (user.userId || user.key)

    if (user.isBanned) {
      // Unban
      const { error } = await supabase
        .from('banned_users')
        .delete()
        .eq('user_id_or_phone', targetKey)

      if (!error) {
        showToast(`✅ ${user.name} ko Unban kar diya gaya!`)
      } else {
        showToast(`❌ Error: ${error.message}`)
      }
    } else {
      // Ban
      const { error } = await supabase
        .from('banned_users')
        .insert([{ user_id_or_phone: targetKey, name: user.name }])

      if (!error) {
        showToast(`🚫 ${user.name} ko Suspend/Ban kar diya gaya!`)
      } else {
        showToast(`❌ Error: ${error.message}`)
      }
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
          <Link href="/admin" className="text-xs font-bold text-red-400 flex items-center gap-1 bg-gray-900 border border-gray-800 px-3 py-2 rounded-xl hover:bg-gray-800 transition">
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <Users size={18} className="text-red-500" /> User Profiles & Ban
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900 border border-gray-800 p-3.5 rounded-2xl">
            <p className="text-[11px] font-bold text-gray-400">Total Registered Users</p>
            <p className="text-lg font-black text-white mt-0.5">{profiles.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-3.5 rounded-2xl">
            <p className="text-[11px] font-bold text-gray-400">Banned Users</p>
            <p className="text-lg font-black text-red-400 mt-0.5">{profiles.filter(p => p.isBanned).length}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search customer by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white outline-none focus:border-red-500"
          />
        </div>

        {/* User Profiles List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center text-xs text-gray-500">
              Loading customer profiles...
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center text-xs text-gray-500">
              No customer profiles found!
            </div>
          ) : (
            filtered.map((p, idx) => (
              <div 
                key={idx} 
                className={`bg-gray-900 border p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition ${
                  p.isBanned ? 'border-red-500/50 bg-red-950/20' : 'border-gray-800'
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
                        <Ban size={10} /> BANNED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    📞 {p.phone} • Total Spent: <strong className="text-emerald-400">₹{p.totalSpent}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {p.phone !== 'N/A' && (
                    <a
                      href={`https://wa.me/91${p.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs px-3 py-1.5 rounded-xl transition"
                    >
                      💬 WhatsApp
                    </a>
                  )}

                  {/* 🚫 BAN / UNBAN BUTTON */}
                  <button
                    onClick={() => toggleBanUser(p)}
                    className={`font-bold text-xs px-3.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
                      p.isBanned
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                    }`}
                  >
                    {p.isBanned ? (
                      <>
                        <CheckCircle size={14} /> Unban
                      </>
                    ) : (
                      <>
                        <Ban size={14} /> Ban / Suspend
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 border border-red-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl animate-bounce">
          {toastMsg}
        </div>
      )}
    </div>
  )
}