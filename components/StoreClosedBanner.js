'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertCircle } from 'lucide-react'

export default function StoreClosedBanner() {
  const [isClosed, setIsClosed] = useState(false)

  useEffect(() => {
    checkStoreStatus()
    const interval = setInterval(checkStoreStatus, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const checkStoreStatus = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentTimeInMinutes = hours * 60 + minutes

    const openTimeInMinutes = 9 * 60 + 30  // 09:30 AM (570 mins)
    const closeTimeInMinutes = 21 * 60 + 30 // 09:30 PM (1290 mins)

    // Closed if time is before 9:30 AM or after 9:30 PM
    if (currentTimeInMinutes < openTimeInMinutes || currentTimeInMinutes >= closeTimeInMinutes) {
      setIsClosed(true)
    } else {
      setIsClosed(false)
    }
  }

  if (!isClosed) return null

  return (
    <div className="bg-amber-500 text-white text-xs font-bold px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-sm animate-in slide-in-from-top">
      <Clock size={16} className="animate-pulse shrink-0" />
      <span>
        🌙 Kitchen is currently Closed! We accept delivery orders daily from <strong>09:30 AM to 09:30 PM</strong>.
      </span>
    </div>
  )
}