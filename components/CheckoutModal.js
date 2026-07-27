'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function CheckoutModal({ isOpen, onClose, totalPrice, onConfirmOrder, user }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [pincode, setPincode] = useState('')
  const [instructions, setInstructions] = useState('')
  const [payMethod, setPayMethod] = useState('Razorpay')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setErrorMsg('')
    fetchUserProfileFromDb()
  }, [isOpen])

  const fetchUserProfileFromDb = async () => {
    if (user?.user_metadata) {
      const meta = user.user_metadata
      if (meta.display_name || meta.full_name) setName(meta.display_name || meta.full_name)
      if (meta.phone || meta.mobile || user.phone) setPhone(meta.phone || meta.mobile || user.phone)
      if (meta.address) setAddress(meta.address)
      if (meta.pincode) setPincode(meta.pincode)
    }

    const currentUser = user || (await supabase.auth.getUser())?.data?.user
    if (currentUser) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (profileData) {
        if (profileData.full_name) setName(profileData.full_name)
        if (profileData.phone) setPhone(profileData.phone)
        if (profileData.address) setAddress(profileData.address)
        if (profileData.pincode) setPincode(profileData.pincode)
      }
    }
  }

  if (!isOpen) return null

  const deliveryFee = totalPrice >= 200 || totalPrice === 0 ? 0 : 20
  const finalPayableAmount = totalPrice + deliveryFee

  // 📝 SUBMIT HANDLER WITH PRE-PAYMENT BAN CHECK
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    // 🚫 1. Check if User / Phone is BANNED BEFORE ANYTHING
    const customerKey = phone.trim() || (user ? user.id : '')
    const { data: isBanned } = await supabase
      .from('banned_users')
      .select('*')
      .or(`user_id_or_phone.eq.${customerKey},user_id_or_phone.eq.${user?.id}`)
      .single()

    if (isBanned) {
      setErrorMsg('🚫 Aapka account suspend/banned hai! Online / COD payment nahi ho sakta.')
      setLoading(false)
      return // 👈 Yahan se hi rok diya, Razorpay Gateway nahi khulega!
    }

    // 💳 2. Online Payment via Razorpay
    if (payMethod === 'Razorpay') {
      const res = await loadRazorpayScript()
      if (!res) {
        setErrorMsg('Razorpay SDK load nahi ho paya. Connection check karein!')
        setLoading(false)
        return
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: finalPayableAmount * 100,
        currency: 'INR',
        name: 'Foodie Express',
        description: 'Food Order Payment',
        handler: function (response) {
          onConfirmOrder(
            {
              name,
              phone,
              address,
              pincode,
              instructions,
              payMethod: 'UPI',
              razorpay_id: response.razorpay_payment_id,
            },
            setErrorMsg
          )
          setLoading(false)
        },
        prefill: {
          name: name,
          contact: phone,
        },
        theme: {
          color: '#ef4444',
        },
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
      paymentObject.on('payment.failed', function () {
        setErrorMsg('Payment Failed! Kripya punah prayas karein.')
        setLoading(false)
      })
    } else {
      // 💵 3. Cash On Delivery
      onConfirmOrder(
        {
          name,
          phone,
          address,
          pincode,
          instructions,
          payMethod: 'COD',
        },
        setErrorMsg
      )
      setLoading(false)
    }
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 max-w-md w-full relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold p-1 rounded-full transition"
        >
          <X size={18} />
        </button>

        <h3 className="text-base font-black text-gray-900 mb-3 border-b pb-2">
          Delivery Details 🚚
        </h3>

        {/* 🔴 IN-CARD BAN ERROR BANNER */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl mb-3 font-bold flex items-center gap-2 animate-shake">
            <AlertTriangle size={16} className="shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Your Name:</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-red-500 text-gray-900"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Phone Number:</label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-red-500 text-gray-900"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Address / Landmark (Under 5km):</label>
            <input
              type="text"
              required
              placeholder="House No, Colony / Landmark"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-red-500 text-gray-900"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Delivery Pincode:</label>
            <input
              type="text"
              required
              placeholder="e.g. 231302"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-red-500 text-gray-900"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Special Instructions (Optional):</label>
            <input
              type="text"
              placeholder="e.g. Extra Chutney, Spicy Rakhna"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-red-500 text-gray-900"
            />
          </div>

          <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-[11px] space-y-1">
            <p className="font-bold flex items-center gap-1">🚨 Fast Delivery Rules:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Hum abhi sirf 5km radius me deliver karte hain.</li>
              <li>Delivery boy ko aane par order verification OTP zaroor batayein.</li>
            </ul>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="font-bold text-gray-800 block">Select Payment Method:</label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 border p-2.5 rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payMethod"
                  value="Razorpay"
                  checked={payMethod === 'Razorpay'}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="accent-red-500"
                />
                <span className="font-bold text-gray-800">💳 Razorpay (UPI / PhonePe / GPay)</span>
              </label>

              <label className="flex items-center gap-2 border p-2.5 rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payMethod"
                  value="COD"
                  checked={payMethod === 'COD'}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="accent-red-500"
                />
                <span className="font-bold text-gray-800">💵 Cash on Delivery (COD)</span>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 border rounded-xl p-3 space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span>Item Total:</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t pt-1.5 mt-1">
              <span>Total Payable Amount:</span>
              <span className="text-red-500 text-sm">₹{finalPayableAmount}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-md mt-2 text-xs"
          >
            {loading ? 'Verifying Account...' : payMethod === 'Razorpay' ? `Pay Online via Razorpay (₹${finalPayableAmount}) 💳` : `Confirm COD Order (₹${finalPayableAmount}) 💵`}
          </button>
        </form>
      </div>
    </div>
  )
}