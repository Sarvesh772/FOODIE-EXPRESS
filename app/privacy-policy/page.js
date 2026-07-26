'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, FileText, RefreshCw, ArrowLeft, AlertTriangle, Mail, ShoppingBag } from 'lucide-react'

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState('privacy')

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border shadow-sm p-6 md:p-8">
        
        {/* Top Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <Link href="/" className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:underline">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="text-lg font-black text-gray-900 tracking-wide">
            FOODIE<span className="text-red-500">EXPRESS</span> Legal
          </h1>
        </div>

        {/* Policy Tabs */}
        <div className="flex gap-2 border-b pb-3 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'privacy' ? 'bg-red-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ShieldCheck size={14} /> Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'terms' ? 'bg-red-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileText size={14} /> Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'refund' ? 'bg-red-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <RefreshCw size={14} /> Cancellation & Refund
          </button>
        </div>

        {/* Tab Content */}
        <div className="text-xs text-gray-600 space-y-4 leading-relaxed">
          
          {/* 🔒 PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-gray-900 border-l-2 border-red-500 pl-2">Privacy Policy</h2>
              <p>Foodie Express aapki personal information ki privacy ko respect karta hai. Ye policy batati hai ki hum aapka data kaise collect aur protect rakhte hain.</p>
              
              <h3 className="font-bold text-gray-800 pt-1">1. Information We Collect:</h3>
              <p>Jab aap order place karte hain, hum aapka Name, Phone Number, Delivery Address, aur Pincode collect karte hain taaki aapka order sahi jagah deliver ho sake.</p>

              <h3 className="font-bold text-gray-800 pt-1">2. Payment Security:</h3>
              <p>Aapke online payment details (UPI/Card) 100% secure encrypted payment gateway dwara process hote hain. Foodie Express aapke bank details store nahi karta.</p>

              <h3 className="font-bold text-gray-800 pt-1">3. Data Usage & Confidentiality:</h3>
              <p>Aapka data sirf order pickup, OTP verification, aur delivery status updates ke liye use kiya jata hai.</p>
            </div>
          )}

          {/* 📄 TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-gray-900 border-l-2 border-red-500 pl-2">Terms of Service</h2>
              <p>Foodie Express platform use karne ke liye neeche diye gaye terms & conditions lagu hote hain:</p>

              {/* 🛍️ Business Model & Aggregator Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 space-y-1 my-2">
                <p className="font-bold flex items-center gap-1.5 text-amber-800">
                  <ShoppingBag size={15} /> 1. Business Model & Service Nature:
                </p>
                <p className="text-[11px] leading-relaxed">
                  <strong>Foodie Express ek Hyperlocal Delivery Platform hai.</strong> Hum khana swayam nahi banate hain, balki aapke dwara chune gaye local market/outlets se fresh food buy karke fast doorstep delivery service provide karte hain. Hum sirf delivery charge va convenience fee charge karte hain. Food taste, recipe va preparation ki direct responsibility respective vendor/outlet ki hoti hai.
                </p>
              </div>

              <h3 className="font-bold text-gray-800 pt-1">2. Delivery Radius & Operating Hours:</h3>
              <p>Hum abhi 5km delivery radius ke andar deliver karte hain. Service timing daily 09:30 AM se 09:30 PM tak rehti hai.</p>

              <h3 className="font-bold text-gray-800 pt-1">3. OTP Verification & Identity:</h3>
              <p>Delivery agent ko aane par customer ko order verification OTP batana compulsory hai.</p>

              {/* ⚠️ Strict COD Fraud Clause */}
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-900 space-y-1 mt-3">
                <p className="font-bold flex items-center gap-1.5 text-red-600">
                  <AlertTriangle size={15} /> 4. COD Fraud & Non-Payment Policy:
                </p>
                <p className="text-[11px] leading-relaxed">
                  Cash on Delivery (COD) order accept hone par agar koi customer delivery partner ko payment dene se mana karta hai ya fake order daalta hai, toh us mobile number ko <strong>permanently block</strong> kar diya jayega aur delivery expense recover karne ke liye legal/fraud action liya ja sakta hai.
                </p>
              </div>
            </div>
          )}

          {/* 🔄 CANCELLATION & REFUND */}
          {activeTab === 'refund' && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-gray-900 border-l-2 border-red-500 pl-2">Cancellation & Refund Policy</h2>
              
              <h3 className="font-bold text-gray-800 pt-1">1. Order Cancellation:</h3>
              <p>Market vendor dwara order purchase/prepare hone ke baad cancellation allow nahi hota, kyunki food items non-returnable hote hain.</p>

              <h3 className="font-bold text-gray-800 pt-1">2. Refund Eligibility:</h3>
              <p>Agar aapne online UPI pay kiya hai aur order vendor/kitchen side se cancel hota hai, toh 100% refund 3-5 working days ke andar aapke original payment method me credit ho jayega.</p>

              <h3 className="font-bold text-gray-800 pt-1">3. Missing Item or Support:</h3>
              <p>Kisi bhi item missing ya delivery issue ke liye customer immediate support desk se contact kar sakta hai.</p>
            </div>
          )}

          {/* 📩 Support & Grievance Section */}
          <div className="bg-gray-100 p-3.5 rounded-xl border text-[11px] text-gray-700 mt-6 flex items-center gap-3">
            <Mail size={20} className="text-red-500 shrink-0" />
            <div>
              <p className="font-bold text-gray-900">Support Queries & Orders Help</p>
              <p>Kisi bhi order assistance ke liye email karein: <strong className="text-red-600">support@foodieexpress.com</strong></p>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}