'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Trash2, CheckSquare, Square, Upload, Utensils } from 'lucide-react'
import Link from 'next/link'

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([])
  const [selectedDishes, setSelectedDishes] = useState([])

  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState('Rolls')
  const [price, setPrice] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('menu')
      .select('*')
      .order('id', { ascending: false })

    if (!error && data) setMenuItems(data)
  }

  const handleAddMenuItem = async (e) => {
    e.preventDefault()
    if (!itemName || !price) {
      showToast('⚠️ Dish Name aur Price zaroori hain!')
      return
    }

    setUploading(true)
    let imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(fileName, imageFile)

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('menu-images')
          .getPublicUrl(fileName)

        if (publicUrlData) imageUrl = publicUrlData.publicUrl
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
      showToast('✅ New Dish Add Ho Gayi!')
      setItemName('')
      setPrice('')
      setImageFile(null)
      fetchMenu()
    } else {
      showToast('Error: ' + error.message)
    }
    setUploading(false)
  }

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
      showToast(status ? '✅ Items In-Stock Marked!' : '❌ Items Out-of-Stock Marked!')
    }
  }

  const toggleAvailability = async (id, currentStatus) => {
    const { error } = await supabase
      .from('menu')
      .update({ is_available: !currentStatus })
      .eq('id', id)

    if (!error) {
      fetchMenu()
      showToast(!currentStatus ? 'In-Stock Marked!' : 'Out-of-Stock Marked!')
    }
  }

  const handleDeleteItem = async (id) => {
    if (confirm('Kya aap is dish ko menu se hatana chahte hain?')) {
      const { error } = await supabase.from('menu').delete().eq('id', id)
      if (!error) {
        fetchMenu()
        showToast('Dish Delete Ho Gayi!')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6 pb-12">
      <div className="max-w-6xl mx-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-xs font-bold text-red-400 flex items-center gap-1 bg-gray-900 border border-gray-800 px-3 py-2 rounded-xl">
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <Utensils size={18} className="text-red-500" /> Menu Manager
          </h1>
        </div>

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
                    className="text-[11px] text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-red-500/20 file:text-red-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition shadow-md mt-2"
              >
                {uploading ? 'Uploading...' : 'Add To Menu 🚀'}
              </button>
            </form>
          </div>

          {/* Menu Items List */}
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
      </div>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 border border-green-500 text-green-400 font-bold text-xs px-4 py-3 rounded-xl shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  )
}