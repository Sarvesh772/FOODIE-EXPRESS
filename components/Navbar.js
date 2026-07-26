'use client'

import { ShoppingBag, User } from 'lucide-react'
import Link from 'next/link'

export default function Navbar({ user, onOpenAuth }) {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <div>
          <Link href="/">
            <h1 className="text-xl sm:text-2xl font-black text-red-500 tracking-wide">FOODIE EXPRESS</h1>
          </Link>
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium"></p>
        </div>
        <div>
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/orders" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1 transition">
                <ShoppingBag size={14} /> My Orders
              </Link>
              <Link href="/profile" className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-full font-semibold text-xs hover:bg-red-100 transition">
                <User size={14} /> {user.email.split('@')[0]}
              </Link>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-lg transition">
              <User size={14} /> Login / Register
            </button>
          )}
        </div>
      </div>
    </header>
  )
}