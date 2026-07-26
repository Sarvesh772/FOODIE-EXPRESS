'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function CheckoutModal({ isOpen, onClose, totalPrice, onConfirmOrder }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [pincode, setPincode] = useState('')
  const [instructions, setInstructions] = useState('')
  const [payMethod, setPayMethod] = useState('UPI')
  const [loadingProfile, setLoadingProfile] = useState(false)

  // 🔄 Auto-fetch user saved profile details when Checkout Modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUserProfile()
    }
  }, [isOpen])

  const fetchUserProfile = async () => {
    setLoadingProfile(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        if (data.full_name) setName(data.full_name)
        if (data.phone) setPhone(data.phone)
        if (data.address) setAddress(data.address)
        if (data.pincode) setPincode(data.pincode)
      }
    }
    setLoadingProfile(false)
  }

  if (!isOpen) return null

  // 🚚 Delivery Fee Calculation: ₹199 ke niche ₹20, usse upar FREE!
  const deliveryFee = totalPrice >= 199 ? 0 : 20
  const finalPayableAmount = totalPrice + deliveryFee

  const handleRazorpayPayment = (orderDetails) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourKey',
      amount: finalPayableAmount * 100, // Amount in paise
      currency: 'INR',
      name: 'Foodie Express',
      description: 'Order Payment',
      handler: function (response) {
        onConfirmOrder({ ...orderDetails, razorpay_id: response.razorpay_payment_id, finalAmount: finalPayableAmount })
      },
      prefill: { name, contact: phone },
      theme: { color: '#ef4444' },
    }

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options)
      rzp.open()
    } else {
      alert('Razorpay load ho raha hai, please 2 seconds ruko.')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (pincode.trim() !== '231302' && pincode.trim() !== '231001') {
      alert('⚠️ Hum abhi sirf 5km radius (Pincode: 231302 / 231001) me deliver karte hain.')
      return
    }

    const orderDetails = { 
      name, 
      phone, 
      address, 
      pincode, 
      instructions, 
      payMethod, 
      finalAmount: finalPayableAmount 
    }

    if (payMethod === 'UPI') {
      handleRazorpayPayment(orderDetails)
    } else {
      onConfirmOrder(orderDetails)
    }
  }

  return (

    
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-red-500">Delivery & Payment Details</h3>
          {loadingProfile && <span className="text-[10px] text-gray-400 animate-pulse font-medium">Fetching saved details...</span>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-gray-600 block mb-1">Full Name</label>
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="w-full border p-2.5 rounded-lg outline-none focus:border-red-500 bg-gray-50/50" 
            />
          </div>

          <div>
            <label className="font-semibold text-gray-600 block mb-1">Mobile Number</label>
            <input 
              type="tel" 
              placeholder="Mobile Number" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required 
              className="w-full border p-2.5 rounded-lg outline-none focus:border-red-500 bg-gray-50/50" 
            />
          </div>

          <div>
            <label className="font-semibold text-gray-600 block mb-1">Address / Landmark (Under 5km)</label>
            <textarea 
              placeholder="Address / Landmark (Under 5km)" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              required 
              rows={2} 
              className="w-full border p-2.5 rounded-lg outline-none focus:border-red-500 bg-gray-50/50" 
            />
          </div>

          <div>
            <label className="font-semibold text-gray-600 block mb-1">Delivery Pincode</label>
            <input 
              type="text" 
              placeholder="Delivery Pincode (e.g. 231302)" 
              value={pincode} 
              onChange={(e) => setPincode(e.target.value)} 
              required 
              className="w-full border p-2.5 rounded-lg outline-none focus:border-red-500 bg-gray-50/50" 
            />
          </div>

          

          {/* Special Instructions Note */}
          <div>
            <label className="font-bold text-gray-700 block mb-1">Special Instructions (Optional):</label>
            <input
              type="text"
              placeholder="e.g. Extra Chutney, Spicy Rakhna"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full border p-2.5 rounded-lg outline-none focus:border-red-500 bg-gray-50 text-gray-800"
            />
          </div>
          {/* 🚨 Delivery Policy & Trust Badge */}
<div className="bg-red-50 p-2.5 rounded-lg border border-red-200 text-[11px] text-red-800 space-y-1">
  <p className="font-bold flex items-center gap-1">
    🚨 Fast Delivery Rules:
  </p>
  <ul className="list-disc list-inside space-y-0.5 text-[10px] text-red-700 font-medium">
    <li>Hum abhi sirf <strong>5km radius</strong> me deliver karte hain.</li>
    <li>Delivery boy ko aane par order verification OTP zaroor batayein.</li>
  </ul>
</div>

          {/* Payment Method Selector */}
          <div className="pt-2">
            <p className="text-xs font-bold text-gray-700 mb-1">Select Payment Method:</p>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer border p-2.5 rounded-lg mb-1.5">
              <input type="radio" name="pay" value="UPI" checked={payMethod === 'UPI'} onChange={() => setPayMethod('UPI')} />
              💳 Razorpay (UPI / PhonePe / GPay)
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer border p-2.5 rounded-lg">
              <input type="radio" name="pay" value="COD" checked={payMethod === 'COD'} onChange={() => setPayMethod('COD')} />
              💵 Cash on Delivery (COD)
            </label>
          </div>

          {/* Bill Breakup Card */}
          <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1 my-2 border">
            <div className="flex justify-between text-gray-600">
              <span>Item Total:</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee:</span>
              <span>{deliveryFee === 0 ? <strong className="text-green-600 font-bold">FREE 🎉</strong> : `₹${deliveryFee}`}</span>
            </div>
            {totalPrice < 199 && (
              <p className="text-[10px] text-amber-600 font-semibold pt-0.5">
                💡 Add ₹{199 - totalPrice} more for FREE Delivery!
              </p>
            )}
            <div className="flex justify-between font-bold text-gray-900 border-t pt-1.5 mt-1">
              <span>Total Payable Amount:</span>
              <span className="text-red-500 text-sm">₹{finalPayableAmount}</span>
            </div>
          </div>

          <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-lg text-xs transition">
            {payMethod === 'UPI' ? 'Pay Online via Razorpay 💳' : 'Confirm Order 🚀'}
          </button>
        </form>
        <button onClick={onClose} className="w-full text-xs text-gray-400 mt-3">Cancel</button>
      </div>
    </div>
  )
}