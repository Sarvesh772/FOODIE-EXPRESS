'use client'

import Link from 'next/link'
import { Clock, ShieldCheck, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-8 pb-6 border-t border-gray-800 text-xs">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
        
        {/* Col 1: Brand Info */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
           <img 
  src="/favicon.png" 
  alt="Foodie Express Logo" 
  className="w-10 h-10 object-contain" 
/>
            <h2 className="text-lg font-black text-white tracking-wide">
              FOODIE<span className="text-red-500">EXPRESS</span>
            </h2>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            Aapke shehar ka apna fast-food destination. Garma-garam Rolls, Pizza, Momos aur Chowmein direct aapke ghar tak fast delivery ke saath!
          </p>
          <div className="flex items-center gap-1.5 text-green-400 font-bold text-[11px] pt-1">
            <ShieldCheck size={16} /> 100% Hygienic & Fresh Food
          </div>
        </div>

        {/* Col 2: Customer Quick Links */}
        <div>
          <h4 className="text-white font-bold text-sm mb-3 border-l-2 border-red-500 pl-2">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-gray-400 font-medium">
            <li>
              <Link href="/" className="hover:text-red-400 transition">
                📜 Today's Menu
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-red-400 transition">
                📦 My Orders & Live Tracking
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-red-400 transition">
                👤 My Profile & Saved Address
              </Link>
            </li>
            <li>
      <Link href="/privacy-policy" className="hover:text-red-400 transition text-gray-400">
        🛡️ Privacy & Terms Policy
      </Link>
    </li>
          </ul>
        </div>

        {/* Col 3: Outlet Timing & Delivery Note */}
        <div>
          <h4 className="text-white font-bold text-sm mb-3 border-l-2 border-red-500 pl-2">
            Opening Hours
          </h4>
          <div className="space-y-2 text-gray-400">
            <div className="flex items-center gap-2 text-gray-300">
              <Clock size={15} className="text-red-500 shrink-0" />
              <span>09:30 AM – 09:30 PM (Everyday)</span>
            </div>
            <div className="bg-gray-800 p-2.5 rounded-lg border border-gray-700 text-[11px] text-gray-300 font-medium mt-3">
              🚀 Local Delivery within <span className="text-red-400 font-bold">5km Radius</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-gray-800 pt-4 text-center text-gray-500 text-[11px] flex flex-col sm:flex-row justify-between items-center max-w-5xl mx-auto px-4 gap-2">
        <p>© {new Date().getFullYear()} Foodie Express. All Rights Reserved.</p>
        <p className="flex items-center gap-1">
          Made with <Heart size={12} className="text-red-500 fill-red-500" /> for Local Foodies
        </p>
      </div>
    </footer>
  )
}