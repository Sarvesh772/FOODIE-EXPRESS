'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Users, Search, Phone, Mail, ShoppingBag, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function AdminProfiles() {
  const [profiles, setProfiles] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfiles()
  }, [])

  const fetchUserProfiles = async () => {
    setLoading(true)

    // 1. Fetch Orders to group customer data
    const { data: ordersData, error: ordersErr } = await supabase
      .from('orders')
      .select('user_id, customer_name, customer_phone, total_amount, created_at')
      .order('created_at', { ascending: false })

    if (ordersErr) {
      console.error('Error fetching orders:', ordersErr)
      setLoading(false)
      return
    }

    // 2. Aggregate metrics per customer
    const userMap = {}

    ordersData?.forEach((ord) => {
      const key = ord.customer_phone || ord.user_id || ord.customer_name

      if (!userMap[key]) {
        userMap[key] = {
          name: ord.customer_name || 'Guest User',
          phone: ord.customer_phone || 'N/A',
          totalOrders: 0,
          totalSpent: 0,
          lastOrdered: ord.created_at,
        }
      }

      userMap[key].totalOrders += 1
      userMap[key].totalSpent += Number(ord.total_amount || 0)
    })

    const userList = Object.values(userMap)
    setProfiles(userList)
    setLoading(false)
  }

  const filteredProfiles = profiles.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 pb-12">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <Link 
            href="/admin" 
            className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-white px-3.5 py-2 rounded-xl border shadow-sm hover:bg-gray-50 transition"
          >
            <ArrowLeft size={16} /> Admin Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Users className="text-red-500" size={20} />
            <h1 className="text-xl font-black text-gray-900">Registered Users 👥</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search customer by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none focus:border-red-500 shadow-sm"
          />
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border shadow-sm">
            <p className="text-[11px] font-bold text-gray-500">Total Customers</p>
            <p className="text-lg font-black text-gray-900 mt-0.5">{profiles.length}</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border shadow-sm">
            <p className="text-[11px] font-bold text-gray-500">Total Revenue</p>
            <p className="text-lg font-black text-emerald-600 mt-0.5">
              ₹{profiles.reduce((sum, p) => sum + p.totalSpent, 0)}
            </p>
          </div>
        </div>

        {/* Customer Profiles List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-xs text-gray-500 shadow-sm">
              Loading customer profiles...
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-xs text-gray-500 shadow-sm">
              No customer profiles found!
            </div>
          ) : (
            filteredProfiles.map((p, idx) => (
              <div 
                key={idx} 
                className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:border-red-200 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{p.name}</span>
                    <span className="bg-red-50 text-red-500 font-bold text-[10px] px-2 py-0.5 rounded-md">
                      {p.totalOrders} Orders
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone size={13} className="text-gray-400" /> {p.phone}
                    </span>
                    <span>•</span>
                    <span className="text-[11px] text-gray-400">
                      Last active: {new Date(p.lastOrdered).toLocaleDateString('hi-IN')}
                    </span>
                  </div>
                </div>

                {/* Right Side Actions & Total Spent */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Total Spent</p>
                    <p className="text-sm font-black text-emerald-600">₹{p.totalSpent}</p>
                  </div>

                  {p.phone !== 'N/A' && (
                    <a
                      href={`https://wa.me/91${p.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs px-3 py-2 rounded-xl border border-emerald-200 flex items-center gap-1 transition"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}