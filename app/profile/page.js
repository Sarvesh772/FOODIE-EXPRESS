'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, User, Save, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [pincode, setPincode] = useState('')
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
        setAddress(data.address || '')
        setPincode(data.pincode || '')
      }
    }
    setLoading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setMsg({ text: 'Saving details...', type: 'info' })

    const { error } = await supabase.from('profiles').upsert([
      {
        id: user.id,
        full_name: fullName,
        phone: phone,
        address: address,
        pincode: pincode,
      },
    ])

    if (error) {
      setMsg({ text: 'Error: ' + error.message, type: 'error' })
    } else {
      setMsg({ text: 'Profile saved successfully! 🎉', type: 'success' })
      setTimeout(() => setMsg({ text: '', type: '' }), 3000)
    }
  }

  if (loading) return <div className="p-8 text-center text-xs text-gray-500">Loading profile...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 text-gray-800">
      <div className="max-w-md mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-red-500 bg-white px-3 py-2 rounded-lg border shadow-sm mb-4">
          <ArrowLeft size={16} /> Back to Menu
        </Link>

        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <User className="text-red-500" size={20} /> My Profile & Address
          </h1>

          {msg.text && (
            <p className={`text-xs p-2.5 rounded-lg font-bold ${
              msg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' :
              msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-600'
            }`}>
              {msg.text}
            </p>
          )}

          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full border p-2.5 rounded-lg outline-none focus:border-red-500" />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Mobile Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full border p-2.5 rounded-lg outline-none focus:border-red-500" />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Default Address </label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={2} className="w-full border p-2.5 rounded-lg outline-none focus:border-red-500" />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Pincode</label>
              <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} required className="w-full border p-2.5 rounded-lg outline-none focus:border-red-500" />
            </div>

            <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg transition shadow-sm flex items-center justify-center gap-1.5">
              <Save size={15} /> Save Details
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}