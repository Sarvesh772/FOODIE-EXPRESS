'use client'

import { Plus, Minus } from 'lucide-react'

export default function MenuCard({ item, inCart, onAdd, onRemove }) {
  const isAvailable = item.is_available !== false // Default true

  return (
    <div className={`bg-white rounded-xl p-3 border shadow-sm flex flex-col justify-between transition ${!isAvailable ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'}`}>
      <div className="relative">
        <img src={item.image} alt={item.name} className="w-full h-36 object-cover rounded-lg mb-3" />
        {!isAvailable && (
          <span className="absolute top-2 left-2 bg-black/75 text-white font-bold text-[10px] px-2 py-0.5 rounded">
            SOLD OUT ❌
          </span>
        )}
      </div>

      <div>
        <h4 className="font-bold text-sm text-gray-900">{item.name}</h4>
        <p className="text-xs text-gray-500 font-medium">{item.category}</p>
        <p className="text-red-500 font-bold mt-1 text-sm">₹{item.price}</p>
      </div>

      <div className="mt-3">
        {!isAvailable ? (
          <button disabled className="w-full bg-gray-200 text-gray-500 font-bold text-xs py-1.5 rounded-lg cursor-not-allowed">
            Currently Unavailable
          </button>
        ) : inCart ? (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-1">
            <button onClick={() => onRemove(item.id)} className="p-1 text-red-600 hover:bg-red-100 rounded">
              <Minus size={14} />
            </button>
            <span className="font-bold text-xs text-red-600">{inCart.qty}</span>
            <button onClick={() => onAdd(item)} className="p-1 text-red-600 hover:bg-red-100 rounded">
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAdd(item)}
            className="w-full border-2 border-red-500 text-red-500 font-bold text-xs py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition"
          >
            + ADD
          </button>
        )}
      </div>
    </div>
  )
}