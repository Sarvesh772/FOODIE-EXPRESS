'use client'

import Link from 'next/link'
import { ShoppingBag, Utensils, Users, ArrowRight } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-white">
            FOODIE<span className="text-red-500">EXPRESS ADMIN</span> 🛠️
          </h1>
          <p className="text-xs text-gray-400 mt-1">Kitchen & Management Control Panel</p>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Orders */}
          <Link 
            href="/admin/orders" 
            className="bg-gray-900 border border-gray-800 hover:border-red-500/50 p-5 rounded-2xl transition flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-center justify-between">
              <div className="bg-red-500/10 p-3 rounded-xl text-red-500">
                <ShoppingBag size={24} />
              </div>
              <ArrowRight size={18} className="text-gray-600 group-hover:text-red-500 transition" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Live Orders</h3>
              <p className="text-xs text-gray-400 mt-0.5">Order status, OTP & receipts</p>
            </div>
          </Link>

          {/* Card 2: Menu Manager */}
          <Link 
            href="/admin/menu" 
            className="bg-gray-900 border border-gray-800 hover:border-red-500/50 p-5 rounded-2xl transition flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-center justify-between">
              <div className="bg-red-500/10 p-3 rounded-xl text-red-500">
                <Utensils size={24} />
              </div>
              <ArrowRight size={18} className="text-gray-600 group-hover:text-red-500 transition" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Menu Manager</h3>
              <p className="text-xs text-gray-400 mt-0.5">Add dishes & stock management</p>
            </div>
          </Link>

          {/* Card 3: Profiles & Ban System */}
          <Link 
            href="/admin/profiles" 
            className="bg-gray-900 border border-gray-800 hover:border-red-500/50 p-5 rounded-2xl transition flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-center justify-between">
              <div className="bg-red-500/10 p-3 rounded-xl text-red-500">
                <Users size={24} />
              </div>
              <ArrowRight size={18} className="text-gray-600 group-hover:text-red-500 transition" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Profiles & Ban</h3>
              <p className="text-xs text-gray-400 mt-0.5">Customer history & suspend user</p>
            </div>
          </Link>

        </div>

      </div>
    </div>
  )
}