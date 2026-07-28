'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import MenuCard from '@/components/MenuCard'
import CheckoutModal from '@/components/CheckoutModal'
import WebsiteReviews from '@/components/WebsiteReviews'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ShoppingBag, Search, CheckCircle, X, Lock, Mail, User as UserIcon } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function Home() {
  const [menuList, setMenuList] = useState([])
  const [filteredMenu, setFilteredMenu] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const [cart, setCart] = useState([])
  const [user, setUser] = useState(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)

  // Auth Modal States
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authMsg, setAuthMsg] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    supabase.from('menu').select('*').then(({ data }) => {
      if (data) {
        setMenuList(data)
        setFilteredMenu(data)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let result = menuList
    if (selectedCategory !== 'All') {
      result = result.filter((i) => i.category === selectedCategory)
    }
    if (searchQuery.trim() !== '') {
      result = result.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    setFilteredMenu(result)
  }, [selectedCategory, searchQuery, menuList])

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0))
  }

  const itemTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const deliveryFee = itemTotal >= 200 || itemTotal === 0 ? 0 : 20
  const finalPayableAmount = itemTotal + deliveryFee
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthMsg('')
    setAuthLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    })

    setAuthLoading(false)

    if (error) {
      setAuthError(error.message)
    } else {
      setUser(data.user)
      setShowAuthModal(false)
      setUserEmail('')
      setUserPassword('')
    }
  }

  // Register Handler
  const handleRegister = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthMsg('')
    setAuthLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: userEmail,
      password: userPassword,
      options: {
        data: {
          display_name: userName,
        },
      },
    })

    setAuthLoading(false)

    if (error) {
      setAuthError(error.message)
    } else {
      setAuthMsg('🎉 Account Created Successfully!')
      setUser(data.user)
      setTimeout(() => {
        setShowAuthModal(false)
        setUserName('')
        setUserEmail('')
        setUserPassword('')
        setAuthMsg('')
      }, 1500)
    }
  }

  // 📝 CONFIRM ORDER WITH FINAL PAYABLE AMOUNT
  const handleConfirmOrder = async (orderDetails, setErrorMessage) => {
    // 🚫 Check if Customer is Banned
    const customerKey = orderDetails.phone || (user ? user.id : '')
    const { data: isBanned } = await supabase
      .from('banned_users')
      .select('*')
      .or(`user_id_or_phone.eq.${customerKey},user_id_or_phone.eq.${user?.id}`)
      .single()

    if (isBanned) {
      if (setErrorMessage) {
        setErrorMessage('🚫 Aapka account suspend/banned hai! Order nahi kiya ja sakta.')
      }
      return
    }

    const itemsSummary = cart.map((i) => `${i.name} x ${i.qty}`).join(', ')
    const customOrderId = `FE-${Math.floor(10000 + Math.random() * 90000)}`
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString()
    const isPaid = orderDetails.payMethod === 'UPI' ? 'Paid ✅' : 'Unpaid (COD) 💵'

    const currentDelivery = itemTotal >= 200 ? 0 : 20
    const totalToSave = itemTotal + currentDelivery

    const { data, error } = await supabase.from('orders').insert([
      {
        order_code: customOrderId,
        user_id: user ? user.id : null,
        customer_name: orderDetails.name,
        customer_phone: orderDetails.phone,
        address: `${orderDetails.address} - Pin: ${orderDetails.pincode}`,
        instructions: orderDetails.instructions || null,
        items: itemsSummary,
        total_amount: totalToSave,
        payment_method: orderDetails.payMethod,
        payment_status: isPaid,
        razorpay_payment_id: orderDetails.razorpay_id || null,
        delivery_otp: generatedOtp,
        status: 'Pending',
      },
    ]).select()

    if (!error && data) {
      setOrderSuccess(customOrderId)
      setCart([])
      setShowCheckout(false)
    }
  }

  const categories = ['All', 'Rolls', 'Pizza', 'Momos', 'Chowmein', 'Drinks']

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col justify-between relative">
      <div className="flex-1 pb-16">
        <Navbar user={user} onOpenAuth={() => {
          setAuthError('')
          setAuthMsg('')
          setShowAuthModal(true)
        }} />

        <main className="max-w-5xl mx-auto px-4 mt-6">
          <div className="bg-gradient-to-r from-red-500 to-rose-400 text-white p-5 rounded-2xl mb-6 shadow-md">
            <h2 className="text-xl font-bold mb-1">Garma-Garam Fast Food 🚀</h2>
            <p className="text-xs opacity-90">Under 30 minutes superfast local delivery!</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search Roll, Pizza, Momos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none focus:border-red-500 shadow-sm"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition ${
                    selectedCategory === cat ? 'bg-red-500 text-white shadow-sm' : 'bg-white text-gray-600 border hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <h3 className="text-base font-bold mb-3 border-l-4 border-red-500 pl-2 text-gray-900">
            Special Menu
          </h3>

          {filteredMenu.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border text-center my-4 space-y-2 shadow-sm">
              <div className="text-3xl">🔍</div>
              <h4 className="font-bold text-sm text-gray-800">
                Aapka dhundha hua item nahi mila!
              </h4>
              <p className="text-xs text-gray-500">
                Kripya spelling check karein ya dusra category select karein.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                }}
                className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-lg transition"
              >
                View Full Menu 📜
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredMenu.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  inCart={cart.find((i) => i.id === item.id)}
                  onAdd={addToCart}
                  onRemove={() => removeFromCart(item.id)}
                />
              ))}
            </div>
          )}

          <div className="mt-10">
            <WebsiteReviews />
          </div>
        </main>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t p-4 z-30 shadow-2xl">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 font-semibold">{totalItems} items in cart</p>
              <p className="text-lg font-black text-red-500">₹{finalPayableAmount}</p>
            </div>

            <button 
              onClick={() => {
                if (!user) {
                  setAuthError('Order karne ke liye pehle Login / Register karein!')
                  setShowAuthModal(true)
                } else {
                  setShowCheckout(true)
                }
              }} 
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-1.5"
            >
              <ShoppingBag size={15} /> Place Online Order
            </button>
          </div>
        </div>
      )}

      <Footer />

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        totalPrice={itemTotal}
        onConfirmOrder={handleConfirmOrder}
        user={user}
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative shadow-2xl space-y-4 border border-gray-100">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold p-1 rounded-full transition"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-gray-900">Welcome to Foodie Express 🍔</h3>
              <p className="text-xs text-gray-500">Food order karne ke liye login/register karein</p>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => {
                  setAuthTab('login')
                  setAuthError('')
                  setAuthMsg('')
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  authTab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setAuthTab('register')
                  setAuthError('')
                  setAuthMsg('')
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  authTab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Register
              </button>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-xl font-medium">
                ⚠️ {authError}
              </div>
            )}
            {authMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-2 rounded-xl font-medium">
                {authMsg}
              </div>
            )}

            {authTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Email Address:</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="example@mail.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3.5 py-2 text-xs outline-none focus:border-red-500 transition text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Password:</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3.5 py-2 text-xs outline-none focus:border-red-500 transition text-gray-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md shadow-red-500/20 mt-2 disabled:opacity-50"
                >
                  {authLoading ? 'Logging in...' : 'Login 🚀'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Full Name:</label>
                  <div className="relative">
                    <UserIcon size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Sarvesh Kumar"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3.5 py-2 text-xs outline-none focus:border-red-500 transition text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Email Address:</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="example@mail.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3.5 py-2 text-xs outline-none focus:border-red-500 transition text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Create Password:</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="•••••••• (Min 6 characters)"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3.5 py-2 text-xs outline-none focus:border-red-500 transition text-gray-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md shadow-red-500/20 mt-2 disabled:opacity-50"
                >
                  {authLoading ? 'Creating Account...' : 'Create Account 🎉'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {orderSuccess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-gray-900">Order Placed Successfully! 🎉</h3>
            <p className="text-xs text-gray-500 mt-1">Order ID: <span className="font-mono font-bold text-red-500">#{orderSuccess}</span></p>
            <Link href="/orders" className="mt-4 bg-red-500 text-white font-bold text-xs py-2.5 rounded-lg block hover:bg-red-600 transition">
              See Order Status 📦
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}