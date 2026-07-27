'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, RefreshCw, Printer, Clock, Truck, 
  Phone, MapPin, Volume2, VolumeX, XCircle, AlertTriangle, X 
} from 'lucide-react'
import Link from 'next/link'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('All')
  const [otpInputs, setOtpInputs] = useState({})
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [toastMessage, setToastMessage] = useState('')

  // 💬 Admin Custom Cancel Modal State
  const [showAdminCancelModal, setShowAdminCancelModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel('admin_orders_page')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) => [payload.new, ...prev])
          if (soundEnabled) playOrderBell()
          showToast('🔔 Naya Order Aaya Hai!')
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [soundEnabled])

  const playOrderBell = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
      audio.play().catch(() => {})
    } catch (e) {}
  }

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setOrders(data)
    setLoading(false)
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      showToast(`Status: ${newStatus}`)
    }
  }

  // Open Admin Cancel Modal
  const openAdminCancelModal = (orderId) => {
    setSelectedOrderId(orderId)
    setCancelReason('')
    setReasonError('')
    setShowAdminCancelModal(true)
  }

  // Confirm Admin Cancel
  const confirmAdminCancelOrder = async () => {
    if (!cancelReason.trim()) {
      setReasonError('⚠️ Reason is required for cancellation!')
      return
    }

    setIsCancelling(true)
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'Cancelled',
        cancel_reason: `Admin Reason: ${cancelReason.trim()}`
      })
      .eq('id', selectedOrderId)

    if (!error) {
      setShowAdminCancelModal(false)
      showToast('🚫 Order Cancelled!')
      fetchOrders()
    } else {
      setReasonError('Error: ' + error.message)
    }
    setIsCancelling(false)
  }

  const handleVerifyOtp = async (order) => {
    const entered = otpInputs[order.id]
    if (entered === order.delivery_otp) {
      await updateOrderStatus(order.id, 'Delivered')
      showToast('✅ OTP Verified! Order Delivered.')
    } else {
      showToast('❌ Galat OTP!')
    }
  }

  const handlePrintSlip = (order) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Bag Slip - ${order.order_code}</title>
          <style>
            body { font-family: monospace; padding: 15px; width: 280px; font-size: 11px; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 5px; margin-bottom: 8px; }
            .title { font-size: 15px; font-weight: bold; }
            .section { border-bottom: 1px dashed #ccc; padding: 6px 0; }
            .bold { font-weight: bold; }
            .total { font-size: 13px; font-weight: bold; margin-top: 8px; border-top: 2px solid #000; padding-top: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">FOODIE EXPRESS</div>
            <div>Order #${order.order_code}</div>
            <div>${new Date(order.created_at).toLocaleString()}</div>
          </div>
          <div class="section">
            <div><span class="bold">Customer:</span> ${order.customer_name}</div>
            <div><span class="bold">Phone:</span> ${order.customer_phone}</div>
            <div><span class="bold">Address:</span> ${order.address}</div>
          </div>
          <div class="section">
            <div class="bold">Items:</div>
            <div>${order.items}</div>
            ${order.instructions ? `<div><span class="bold">Note:</span> ${order.instructions}</div>` : ''}
          </div>
          <div class="section">
            <div><span class="bold">Payment:</span> ${order.payment_method} (${order.payment_status})</div>
            <div class="total">TOTAL AMOUNT: ₹${order.total_amount}</div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const filteredOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter(o => o.status === filterStatus)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6 pb-12">
      <div className="max-w-6xl mx-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-xs font-bold text-red-400 flex items-center gap-1 bg-gray-900 border border-gray-800 px-3 py-2 rounded-xl">
            <ArrowLeft size={15} /> Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                soundEnabled ? 'bg-gray-800 text-green-400 border-gray-700' : 'bg-gray-800 text-gray-500 border-gray-700'
              }`}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="hidden sm:inline">{soundEnabled ? 'Sound ON' : 'Muted'}</span>
            </button>

            <button onClick={fetchOrders} className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-lg border border-gray-700 transition">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Filter Status Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {['All', 'Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterStatus === st 
                  ? 'bg-red-500 text-white shadow-md' 
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800'
              }`}
            >
              {st} ({st === 'All' ? orders.length : orders.filter(o => o.status === st).length})
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-2xl text-gray-500 text-xs">
            No orders found ({filterStatus})
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const isCancelled = order.status === 'Cancelled'

              return (
                <div 
                  key={order.id} 
                  className={`bg-gray-900 border rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md ${
                    isCancelled ? 'border-red-500/40 bg-red-950/10' :
                    order.status === 'Pending' ? 'border-amber-500/50 bg-amber-950/10' :
                    order.status === 'Preparing' ? 'border-blue-500/50 bg-blue-950/10' :
                    order.status === 'Out for Delivery' ? 'border-purple-500/50 bg-purple-950/10' :
                    'border-gray-800'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start border-b border-gray-800 pb-2 mb-2">
                      <div>
                        <span className="font-mono font-bold text-red-400 text-sm">#{order.order_code}</span>
                        <p className="text-[10px] text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        isCancelled ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        order.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        order.status === 'Preparing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        order.status === 'Out for Delivery' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="bg-gray-950/60 p-2.5 rounded-xl border border-gray-800/80 mb-3 space-y-1">
                      <p className="text-xs font-bold text-gray-200">{order.items}</p>
                      {order.instructions && (
                        <p className="text-[11px] text-amber-400 italic">⚠️ Note: {order.instructions}</p>
                      )}
                      {isCancelled && order.cancel_reason && (
                        <p className="text-[11px] text-red-400 font-bold border-t border-gray-800 pt-1 mt-1">
                          🚫 {order.cancel_reason}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-gray-300">
                      <p className="font-bold text-white">{order.customer_name}</p>
                      <p className="flex items-center gap-1 text-gray-400">
                        <Phone size={12} className="text-gray-500" />
                        <a href={`tel:${order.customer_phone}`} className="hover:underline">{order.customer_phone}</a>
                      </p>
                      <p className="flex items-start gap-1 text-gray-400 text-[11px]">
                        <MapPin size={12} className="text-gray-500 shrink-0 mt-0.5" />
                        <span>{order.address}</span>
                      </p>
                    </div>
                  </div>

                  {!isCancelled && (
                    <div className="pt-3 border-t border-gray-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">{order.payment_method} ({order.payment_status})</span>
                        <span className="text-sm font-black text-white">₹{order.total_amount}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {order.status === 'Pending' && (
                          <button onClick={() => updateOrderStatus(order.id, 'Preparing')} className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1">
                            <Clock size={14} /> Start Preparing
                          </button>
                        )}

                        {order.status === 'Preparing' && (
                          <button onClick={() => updateOrderStatus(order.id, 'Out for Delivery')} className="col-span-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1">
                            <Truck size={14} /> Send Out for Delivery
                          </button>
                        )}

                        {order.status === 'Out for Delivery' && (
                          <div className="col-span-2 space-y-1.5 bg-gray-950 p-2 rounded-xl border border-purple-500/30">
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                placeholder="OTP"
                                value={otpInputs[order.id] || ''}
                                onChange={(e) => setOtpInputs({ ...otpInputs, [order.id]: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 text-white text-xs px-2.5 py-1.5 rounded-lg outline-none"
                              />
                              <button onClick={() => handleVerifyOtp(order)} className="bg-green-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shrink-0">
                                Verify
                              </button>
                            </div>
                          </div>
                        )}

                        <button onClick={() => handlePrintSlip(order)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs py-2 rounded-xl border border-gray-700 transition flex items-center justify-center gap-1.5">
                          <Printer size={14} /> Print
                        </button>

                        <button 
                          onClick={() => openAdminCancelModal(order.id)} 
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs py-2 rounded-xl border border-red-500/30 transition flex items-center justify-center gap-1"
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* 💬 ADMIN CUSTOM CANCEL MODAL */}
      {showAdminCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 max-w-sm w-full relative shadow-2xl space-y-4 text-gray-100">
            <button
              onClick={() => setShowAdminCancelModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-red-500 font-bold text-sm border-b border-gray-800 pb-2">
              <AlertTriangle size={18} /> Cancel Order (Admin Control)
            </div>

            <p className="text-xs text-gray-300">
              Enter cancellation reason for customer notification:
            </p>

            <div>
              <input
                type="text"
                placeholder="e.g. Item Out of Stock / Unserviceable Area"
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value)
                  setReasonError('')
                }}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-red-500"
              />
              {reasonError && <p className="text-[11px] text-red-400 font-semibold mt-1">{reasonError}</p>}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowAdminCancelModal(false)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Close
              </button>
              <button
                onClick={confirmAdminCancelOrder}
                disabled={isCancelling}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md"
              >
                {isCancelling ? 'Processing...' : 'Cancel Order 🚫'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 border border-green-500 text-green-400 font-bold text-xs px-4 py-3 rounded-xl shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  )
}