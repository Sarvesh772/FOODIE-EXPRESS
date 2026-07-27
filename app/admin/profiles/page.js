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

    // 1. Fetch Registered Users from 'profiles' table
    const { data: usersData, error: usersErr } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    // 2. Fetch Banned Users
    const { data: bannedData, error: bannedErr } = await supabase
      .from('banned_users')
      .select('*')

    if (usersErr) {
      console.error('Error fetching users:', usersErr)
    }

    const bannedSet = new Set(bannedData?.map((b) => b.user_id_or_phone) || [])

    if (usersData) {
      const formattedProfiles = usersData.map((u) => {
        const phoneKey = u.phone || u.mobile || ''
        const userIdKey = u.id || ''

        const isBanned = 
          (phoneKey && bannedSet.has(phoneKey)) || 
          (userIdKey && bannedSet.has(userIdKey))

        return {
          id: u.id,
          name: u.full_name || u.display_name || 'User',
          phone: u.phone || u.mobile || 'N/A',
          email: u.email || '',
          created_at: u.created_at,
          isBanned: isBanned,
        }
      })

      setProfiles(formattedProfiles)
    }
    setLoading(false)
  }

  // 🚫 TOGGLE BAN / UNBAN HANDLER
  const toggleBanUser = async (user) => {
    const targetKey = user.phone !== 'N/A' && user.phone ? user.phone : user.id

    if (user.isBanned) {
      // Unban User
      const { error } = await supabase
        .from('banned_users')
        .delete()
        .or(`user_id_or_phone.eq.${user.phone},user_id_or_phone.eq.${user.id}`)

      if (!error) {
        showToast(`✅ ${user.name} ko Unban kar diya gaya!`)
      } else {
        showToast(`❌ Error: ${error.message}`)
      }
    } else {
      // Ban User
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
    p.phone.includes(search) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6 pb-12">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-xs font-bold text-red-400 flex items-center gap-1 bg-gray-900 border border-gray-800 px-3 py-2 rounded-xl hover:bg-gray-800 transition">
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <Users size={18} className="text-red-500" /> User Profiles & Ban
          </h1>
        </div>

        {/* Counter Cards */}
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
            placeholder="Search by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white outline-none focus:border-red-500"
          />
        </div>

        {/* Pure Registered Users List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center text-xs text-gray-500">
              Loading users...
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center text-xs text-gray-500">
              No registered users found!
            </div>
          ) : (
            filtered.map((p) => (
              <div 
                key={p.id} 
                className={`bg-gray-900 border p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition ${
                  p.isBanned ? 'border-red-500/50 bg-red-950/20' : 'border-gray-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{p.name}</span>
                    {p.isBanned && (
                      <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Ban size={10} /> BANNED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    📞 {p.phone} {p.email ? `• ✉️ ${p.email}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {p.phone !== 'N/A' && p.phone && (
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