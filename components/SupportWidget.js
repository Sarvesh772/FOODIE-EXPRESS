'use client'

import { useState } from 'react'
import { MessageCircle, HelpCircle, X, Clock, MapPin } from 'lucide-react'

export default function SupportWidget({ supportPhone = "918957903863" }) {
  const [isOpen, setIsOpen] = useState(false)

  const whatsappMessage = encodeURIComponent("Hello Foodie Express! Mujhe mere order ke baare me help chahiye.")

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Support Popover Card */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 mb-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex justify-between items-center border-b pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
              <h4 className="font-bold text-xs text-gray-900">Foodie Express Help</h4>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
              <X size={14} />
            </button>
          </div>

          <p className="text-[11px] text-gray-500 mb-3">
            Order tracking ya kisi bhi jankari ke liye WhatsApp par message karein:
          </p>

          <div className="text-xs font-semibold">
            {/* WhatsApp Only Chat Button */}
            <a
              href={`https://wa.me/${supportPhone}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 px-3 rounded-xl transition shadow-md w-full"
            >
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </div>

          <div className="mt-3 pt-2.5 border-t text-[10px] text-gray-400 space-y-1">
            <p className="flex items-center gap-1"><Clock size={11} /> Service Time: 09:00 AM - 09:00 PM</p>
            <p className="flex items-center gap-1"><MapPin size={11} /> Fast Local Delivery </p>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-500 hover:bg-red-600 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition transform hover:scale-105"
        title="Help & Support"
      >
        {isOpen ? <X size={20} /> : <HelpCircle size={20} />}
      </button>
    </div>
  )
}