'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Star, Send, ShieldCheck, CheckCircle2, Lock } from 'lucide-react'

export default function WebsiteReviews() {
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchReviews()
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUser(user)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('website_reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setReviews(data)
    if (error) console.error('Error fetching reviews:', error.message)
  }

  // Real Dynamic Average Calculation
  const totalReviews = reviews.length
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : 0

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    // User ka naam metadata ya email se nikal rahe hain
    const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name || user.email.split('@')[0]

    const { error } = await supabase.from('website_reviews').insert([
      {
        user_id: user.id,
        user_name: displayName,
        rating: rating,
        feedback: feedback.trim() || null,
      },
    ])

    if (error) {
      console.error('Error inserting review:', error.message)
      alert('Review save karne me error aayi: ' + error.message)
    } else {
      setFeedback('')
      fetchReviews()
      setSuccessMsg(true)
      setTimeout(() => setSuccessMsg(false), 3000)
    }
    setLoading(false)
  }

  return (
    <section className="bg-white rounded-xl border p-4 shadow-sm my-4 max-w-4xl mx-auto">
      {/* Compact Header */}
      <div className="flex justify-between items-center pb-2.5 mb-3 border-b">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold text-gray-900">Ratings & Reviews</h3>
          <ShieldCheck className="text-green-500" size={16} />
        </div>

        {/* Rating Badge */}
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
          <Star className="text-amber-500 fill-amber-500" size={14} />
          <span className="font-bold text-xs text-amber-900">
            {totalReviews > 0 ? `${avgRating} / 5.0 (${totalReviews})` : 'No ratings yet'}
          </span>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="bg-green-50 text-green-700 border border-green-200 text-xs font-bold p-2 rounded-lg mb-3 flex items-center gap-1.5 animate-in fade-in">
          <CheckCircle2 size={15} /> Thank you for your rating! ⭐
        </div>
      )}

      {/* Conditional Form: Login Hai toh Form dikhega, Nahi toh Login Prompt */}
      {user ? (
        <form onSubmit={handleSubmitReview} className="bg-gray-50 p-3 rounded-lg border mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-600">Rate Us ({user.user_metadata?.display_name || user.email}):</span>
            
            {/* Star Selection */}
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-0.5"
                >
                  <Star
                    size={18}
                    className={star <= rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="Write your feedback here (Optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border p-2 rounded-md bg-white text-xs outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-md transition flex items-center gap-1 shadow-sm"
          >
            <Send size={12} /> {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-lg mb-3 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-1 text-amber-800 font-bold text-xs">
            <Lock size={14} /> Rating dene ke liye Login karna zaroori hai!
          </div>
          <p className="text-[11px] text-amber-700">
            Kripya upar header me diye gaye Login button se pehle login karein.
          </p>
        </div>
      )}

      {/* Compact Review Cards Grid */}
      {reviews.length === 0 ? (
        <p className="text-center text-[11px] text-gray-400 py-1 italic">
          Be the first customer to give a rating! 🌟
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {reviews.map((r) => (
            <div key={r.id} className="bg-gray-50 p-2.5 rounded-lg border text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800 text-[11px]">{r.user_name}</span>
                <div className="flex text-amber-500">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} size={10} className="fill-amber-500" />
                  ))}
                </div>
              </div>
              {r.feedback ? (
                <p className="text-gray-600 text-[10px] mt-1 italic">"{r.feedback}"</p>
              ) : (
                <p className="text-gray-400 text-[9px] mt-0.5">Rated {r.rating} Stars</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}