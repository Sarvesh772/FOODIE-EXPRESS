'use client'

import Link from 'next/link'
import { ShoppingBag, User } from 'lucide-react'

export default function Navbar({ user, onOpenAuth }) {
  return (
    <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* 🍔 Logo & Brand Name (Forced Single Line on Mobile) */}
        <Link href="/" className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-base sm:text-lg font-black tracking-wide text-red-500 uppercase">
            FOODIE EXPRESS
          </span>
        </Link>

        {/* 📱 Right Side Actions (Icon-Only on Mobile, Text on Desktop) */}
        <div className="flex items-center gap-2">
          
          {/* My Orders Button */}
          <Link
            href="/orders"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs p-2 sm:px-3.5 sm:py-2 rounded-xl transition flex items-center gap-1.5"
            title="My Orders"
          >
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">My Orders</span>
          </Link>

          {/* User Account / Login Button */}
          <button
            onClick={onOpenAuth}
            className="bg-red-50 hover:bg-red-100 text-red-500 font-bold text-xs p-2 sm:px-3.5 sm:py-2 rounded-xl transition flex items-center gap-1.5 border border-red-200"
            title={user ? (user.user_metadata?.display_name || user.email) : "Login / Register"}
          >
            <User size={16} />
            <span className="hidden sm:inline max-w-[100px] truncate">
              {user ? (user.user_metadata?.display_name || user.email.split('@')[0]) : 'Login'}
            </span>
          </button>

        </div>

      </div>
    </header>
  )
}