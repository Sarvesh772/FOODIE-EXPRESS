'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, KeyRound, CheckCircle2, Clock, ChefHat, Bike } from 'lucide-react'
import Link from 'next/link'

export default function CustomerOrders() {
  const [user, setUser] = useState(null) // 👈 User State Declared
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserOrders()

    // Real-time listener for order status change
    const subscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
        getUserOrders()
      })
      .subscribe()

    return () => { supabase.removeChannel(subscription) }
  }, [])

  const getUserOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user) // 👈 User Set Properly
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setOrders(data)
    }
    setLoading(false)
  }

  // Helper for Stepper status step index
  const getStepIndex = (status) => {
    if (status === 'Pending') return 1
    if (status === 'Preparing') return 2
    if (status === 'Out for Delivery') return 3
    if (status === 'Delivered') return 4
    return 1
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-xs font-bold text-gray-500">Loading orders...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center space-y-3">
        <div className="text-4xl">🔐</div>
        <h3 className="font-bold text-lg text-gray-800">Order History Dekhne Ke Liye Login Karein</h3>
        <p className="text-xs text-gray-500">Aapne abhi tak login nahi kiya hai.</p>
        <Link href="/" className="bg-red-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-red-600 transition">
          Go to Home & Login 🚀
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 text-gray-800 pb-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-1 text-xs font-bold text-red-500 bg-white px-3 py-2 rounded-lg border shadow-sm">
            <ArrowLeft size={16} /> Back to Menu
          </Link>
          <h1 className="text-xl font-black text-gray-900">My Orders 📦</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border text-center my-4 space-y-2 shadow-sm">
            <div className="text-3xl">📦</div>
            <h4 className="font-bold text-sm text-gray-800">Aapne abhi tak koi order nahi kiya hai!</h4>
            <Link href="/" className="inline-block mt-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-lg transition">
              Explore Menu & Order Now 🍔
            </Link>
          </div>
        ) : (
          orders.map((o) => {
            const currentStep = getStepIndex(o.status)

            return (
              <div key={o.id} className="bg-white p-4.5 rounded-2xl border shadow-sm mb-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-sm font-bold text-red-500 font-mono">
                      Order {o.order_code || `#${o.id.slice(0, 8)}`}
                    </span>
                    <p className="text-[10px] text-gray-400">{new Date(o.created_at).toLocaleString('hi-IN')}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    o.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {o.status}
                  </span>
                </div>

                {/* 🛵 VISUAL ORDER STEPPER TRACKER */}
                <div className="my-5 bg-gray-50 p-3 rounded-xl border">
                  <p className="text-[11px] font-bold text-gray-600 mb-3 text-center">Live Order Status Tracking</p>
                  <div className="flex items-center justify-between relative px-2">
                    
                    {/* Progress Line */}
                    <div className="absolute top-4 left-6 right-6 h-1 bg-gray-200 -z-0">
                      <div 
                        className="h-full bg-red-500 transition-all duration-500" 
                        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                      ></div>
                    </div>

                    {/* Step 1: Placed */}
                    <div className="flex flex-col items-center z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${currentStep >= 1 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <Clock size={15} />
                      </div>
                      <span className="text-[10px] font-bold mt-1 text-gray-700">Placed</span>
                    </div>

                    {/* Step 2: Preparing */}
                    <div className="flex flex-col items-center z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${currentStep >= 2 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <ChefHat size={15} />
                      </div>
                      <span className="text-[10px] font-bold mt-1 text-gray-700">Preparing</span>
                    </div>

                    {/* Step 3: Out for Delivery */}
                    <div className="flex flex-col items-center z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${currentStep >= 3 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <Bike size={15} />
                      </div>
                      <span className="text-[10px] font-bold mt-1 text-gray-700">On Way</span>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="flex flex-col items-center z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${currentStep >= 4 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <CheckCircle2 size={15} />
                      </div>
                      <span className="text-[10px] font-bold mt-1 text-gray-700">Delivered</span>
                    </div>

                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="bg-gray-50 p-3 rounded-lg text-xs font-semibold my-2 space-y-1">
                  <p className="text-gray-800">📦 {o.items}</p>
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200 mt-2">
                    <span className="text-gray-900 font-bold">Total: ₹{o.total_amount} ({o.payment_method})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      o.payment_status?.includes('Paid') ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {o.payment_status || 'Unpaid'}
                    </span>
                  </div>
                </div>

                {/* OTP Box */}
                {o.status !== 'Delivered' && o.delivery_otp && (
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex justify-between items-center my-2">
                    <div className="flex items-center gap-1.5 text-amber-800">
                      <KeyRound size={15} />
                      <span className="text-xs font-bold">Share OTP with Delivery Agent:</span>
                    </div>
                    <span className="bg-amber-500 text-white font-mono font-black text-sm px-3 py-1 rounded-md tracking-widest shadow-sm">
                      {o.delivery_otp}
                    </span>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">📍 <strong>Address:</strong> {o.address}</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}