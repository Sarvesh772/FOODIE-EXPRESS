'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  ShieldCheck, Lock, RefreshCw, Printer, Clock, Truck, 
  AlertTriangle, Phone, MapPin, Volume2, VolumeX, LogOut, 
  ShoppingBag, Utensils, Plus, Trash2, CheckSquare, Square, Upload 
} from 'lucide-react'

export default function AdminDashboard() {
  // 🔐 Security State
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // 🔔 Toast Notification State
  const [toastMessage, setToastMessage] = useState('')

  // 🧭 Navigation Tab State ('orders' or 'menu')
  const [activeTab, setActiveTab] = useState('orders')

  // 📦 Orders State
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('All')
  const [otpInputs, setOtpInputs] = useState({})
  const [soundEnabled, setSoundEnabled] = useState(true)

  // 🍔 Menu Manager State
  const [menuItems, setMenuItems] = useState([])
  const [selectedDishes, setSelectedDishes] = useState([])
  
  // Add Dish Form State
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState('Rolls')
  const [price, setPrice] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Trigger Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  useEffect(() => {
    const savedSession = localStorage.getItem('fe_admin_login')
    if (savedSession === 'true') {
      setIsAuthenticated(true)
      fetchOrders()
      fetchMenu()
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    // Realtime Supabase Subscription for New Orders
    const channel = supabase
      .channel('admin_orders')
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
  }, [isAuthenticated, soundEnabled])

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

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('menu')
      .select('*')
      .order('id', { ascending: false })

    if (!error && data) setMenuItems(data)
  }

  // Admin Login Handler
  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    const { data, error } = await supabase
      .from('admin')
      .select('*')
      .eq('username', username.trim())
      .eq('password', password.trim())
      .single()

    if (error || !data) {
      setAuthError('❌ Galat Username ya Password!')
      setAuthLoading(false)
      return
    }

    setIsAuthenticated(true)
    localStorage.setItem('fe_admin_login', 'true')
    fetchOrders()
    fetchMenu()
    setAuthLoading(false)
    showToast('🔑 Welcome Back Admin!')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('fe_admin_login')
  }

  // 📦 Order Status Updates
  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      showToast(`Status updated to: ${newStatus}`)
    }
  }

  const handleVerifyOtp = async (order) => {
    const entered = otpInputs[order.id]
    if (entered === order.delivery_otp) {
      await updateOrderStatus(order.id, 'Delivered')
      showToast('✅ OTP Verified! Order Delivered mark ho gaya.')
    } else {
      showToast('❌ Galat OTP! Punah prayas karein.')
    }
  }

  // 📸 Image Upload & Add Menu Item
  const handleAddMenuItem = async (e) => {
    e.preventDefault()
    if (!itemName || !price) {
      showToast('⚠️ Dish Name aur Price enter karein!')
      return
    }

    setUploading(true)
    let imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, imageFile)

      if (uploadError) {
        showToast('Image upload failed: ' + uploadError.message)
        setUploading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath)

      if (publicUrlData) {
        imageUrl = publicUrlData.publicUrl
      }
    }

    const { error } = await supabase.from('menu').insert([
      {
        name: itemName,
        price: parseFloat(price),
        category: category,
        image: imageUrl,
        is_available: true,
      },
    ])

    if (!error) {
      showToast('✅ New Dish Menu me add ho gayi!')
      setItemName('')
      setPrice('')
      setImageFile(null)
      fetchMenu()
    } else {
      showToast('Error: ' + error.message)
    }
    setUploading(false)
  }

  // Selection Logic
  const toggleSelectDish = (id) => {
    if (selectedDishes.includes(id)) {
      setSelectedDishes(selectedDishes.filter((dishId) => dishId !== id))
    } else {
      setSelectedDishes([...selectedDishes, id])
    }
  }

  const handleSelectAll = () => {
    if (selectedDishes.length === menuItems.length) {
      setSelectedDishes([])
    } else {
      setSelectedDishes(menuItems.map((item) => item.id))
    }
  }

  const handleBulkStockUpdate = async (status) => {
    if (selectedDishes.length === 0) return

    const { error } = await supabase
      .from('menu')
      .update({ is_available: status })
      .in('id', selectedDishes)

    if (!error) {
      fetchMenu()
      setSelectedDishes([])
      showToast(status ? '✅ Selected items In-Stock marked!' : '❌ Selected items Out-of-Stock marked!')
    } else {
      showToast('Bulk update error: ' + error.message)
    }
  }

  const toggleAvailability = async (id, currentStatus) => {
    const { error } = await supabase
      .from('menu')
      .update({ is_available: !currentStatus })
      .eq('id', id)

    if (!error) {
      fetchMenu()
      showToast(!currentStatus ? 'Item In-Stock marked!' : 'Item Out-of-Stock marked!')
    }
  }

  const handleDeleteItem = async (id) => {
    if (confirm('Kya aap is dish ko menu se hatana chahte hain?')) {
      const { error } = await supabase.from('menu').delete().eq('id', id)
      if (!error) {
        fetchMenu()
        showToast('Dish menu se delete ho gayi!')
      }
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

  // 🔒 LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
          <div className="bg-red-500/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-red-500 border border-red-500/20">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide">FOODIE<span className="text-red-500">ADMIN</span></h2>
            <p className="text-xs text-gray-400 mt-1">Kitchen & Menu Management Panel</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-3 pt-2 text-left">
            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">Username:</label>
              <input
                type="text"
                required
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">Password:</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-red-500 transition"
              />
            </div>

            {authError && (
              <p className="text-red-400 text-xs font-semibold pt-1 flex items-center gap-1">
                <AlertTriangle size={12} /> {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-red-500/20 mt-2"
            >
              {authLoading ? 'Verifying...' : 'Login to Dashboard 🔐'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const filteredOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter(o => o.status === filterStatus)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col relative">
      {/* Top Admin Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-red-500 text-white font-black p-1.5 rounded-lg text-xs">FE</div>
            <h1 className="text-base font-black text-white tracking-wide">
              FOODIE<span className="text-red-500">KITCHEN ADMIN</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                soundEnabled ? 'bg-gray-800 text-green-400 border-gray-700' : 'bg-gray-800 text-gray-500 border-gray-700'
              }`}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="hidden sm:inline">{soundEnabled ? 'Sound ON' : 'Muted'}</span>
            </button>

            <button onClick={() => { fetchOrders(); fetchMenu(); }} className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-lg border border-gray-700 transition">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition">
              <LogOut size={14} /> Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <div className="bg-gray-900 border-b border-gray-800 py-2.5">
        <div className="max-w-6xl mx-auto px-4 flex gap-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'orders' ? 'bg-red-500 text-white shadow-sm' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <ShoppingBag size={15} /> Live Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'menu' ? 'bg-red-500 text-white shadow-sm' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Utensils size={15} /> Menu Manager ({menuItems.length})
          </button>
        </div>
      </div>

      {/* 📦 TAB 1: LIVE ORDERS VIEW */}
      {activeTab === 'orders' && (
        <>
          <div className="bg-gray-900/50 border-b border-gray-800 py-2.5">
            <div className="max-w-6xl mx-auto px-4 flex gap-2 overflow-x-auto no-scrollbar">
              {['All', 'Pending', 'Preparing', 'Out for Delivery', 'Delivered'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    filterStatus === st 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  {st} ({st === 'All' ? orders.length : orders.filter(o => o.status === st).length})
                </button>
              ))}
            </div>
          </div>

          <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-2xl text-gray-500 text-xs space-y-2">
                <div className="text-2xl">📦</div>
                <p className="font-bold">No orders found ({filterStatus})</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className={`bg-gray-900 border rounded-2xl p-4 flex flex-col justify-between space-y-3 transition shadow-md ${
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

                        <button onClick={() => handlePrintSlip(order)} className="col-span-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs py-2 rounded-xl border border-gray-700 transition flex items-center justify-center gap-1.5">
                          <Printer size={14} /> Print Bag Slip
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* 🍔 TAB 2: MANAGE MENU WITH BULK ACTIONS & FILE UPLOAD */}
      {activeTab === 'menu' && (
        <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Add Food Form */}
            <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 h-fit space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-1.5 text-red-500">
                <Plus size={16} /> Add New Food Dish
              </h3>
              <form onSubmit={handleAddMenuItem} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Dish Name:</label>
                  <input
                    type="text"
                    placeholder="e.g. Paneer Roll"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                  >
                    <option value="Rolls">Rolls</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Momos">Momos</option>
                    <option value="Chowmein">Chowmein</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Fast Food">Fast Food</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Price (₹):</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 p-2.5 rounded-xl text-white outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Upload Food Image:</label>
                  <div className="bg-gray-950 border border-gray-800 p-2.5 rounded-xl flex items-center gap-2 cursor-pointer">
                    <Upload size={14} className="text-red-500 shrink-0" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="text-[11px] text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-red-500/20 file:text-red-400 hover:file:bg-red-500/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition shadow-md mt-2"
                >
                  {uploading ? 'Uploading & Adding...' : 'Add To Menu 🚀'}
                </button>
              </form>
            </div>

            {/* Menu Items List & Bulk Actions */}
            <div className="md:col-span-2 space-y-3">
              <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 flex flex-wrap justify-between items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white"
                >
                  {selectedDishes.length === menuItems.length && menuItems.length > 0 ? (
                    <CheckSquare size={16} className="text-red-500" />
                  ) : (
                    <Square size={16} className="text-gray-500" />
                  )}
                  Select All ({selectedDishes.length}/{menuItems.length})
                </button>

                {selectedDishes.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkStockUpdate(false)}
                      className="bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      Out of Stock ❌
                    </button>
                    <button
                      onClick={() => handleBulkStockUpdate(true)}
                      className="bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      In Stock ✅
                    </button>
                  </div>
                )}
              </div>

              {menuItems.map((item) => {
                const isSelected = selectedDishes.includes(item.id)
                return (
                  <div
                    key={item.id}
                    className={`bg-gray-900 p-3 rounded-xl border flex items-center justify-between transition ${
                      isSelected ? 'border-red-500 bg-red-950/20' : 'border-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectDish(item.id)}
                        className="w-4 h-4 accent-red-500 cursor-pointer"
                      />

                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-gray-800" />
                      <div>
                        <h4 className="font-bold text-xs text-white">{item.name}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">{item.category} • ₹{item.price}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAvailability(item.id, item.is_available ?? true)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition ${
                          item.is_available !== false
                            ? 'bg-green-500/10 text-green-400 border-green-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        {item.is_available !== false ? 'In Stock ✅' : 'Out of Stock ❌'}
                      </button>

                      <button onClick={() => handleDeleteItem(item.id)} className="text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </main>
      )}

      {/* 🚀 Floating Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 border border-green-500 text-green-400 font-bold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          {toastMessage}
        </div>
      )}

    </div>
  )
}