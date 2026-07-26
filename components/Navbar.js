'use client'

import { ShoppingBag, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Navbar({ user, onOpenAuth }) {

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center gap-2">
        
        {/* 🍔 Brand Logo & Title */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-red-500 tracking-wide whitespace-nowrap">
              FOODIE EXPRESS
            </h1>
          </Link>
        </div>

        {/* 📱 Mobile Optimized Buttons */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link 
                href="/orders" 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 sm:px-3 sm:py-1.5 rounded-full font-bold text-xs flex items-center gap-1 transition"
                title="My Orders"
              >
                <ShoppingBag size={16} />
                <span className="hidden sm:inline">My Orders</span>
              </Link>
              
              <Link 
                href="/profile" 
                className="flex items-center gap-1 bg-red-50 text-red-600 p-2 sm:px-3 sm:py-1.5 rounded-full font-semibold text-xs hover:bg-red-100 transition max-w-[120px] truncate"
                title={user.email}
              >
                <User size={16} />
                <span className="hidden sm:inline truncate">
                  {user.user_metadata?.display_name || user.email.split('@')[0]}
                </span>
              </Link>

              {/* 🚪 Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-600 p-2 sm:px-2.5 sm:py-1.5 rounded-full transition"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth} 
              className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs p-2 sm:px-4 sm:py-2 rounded-xl transition"
              title="Login / Register"
            >
              <User size={16} />
              <span className="hidden sm:inline">Login / Register</span>
            </button>
          )}
        </div>

      </div>
    </header>
  )
}