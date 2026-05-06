import { useState, useEffect } from 'react'
import { Clock, MapPin, Package, User, Leaf, Drumstick, ChevronRight } from 'lucide-react'
import { formatDistanceToNow, isPast } from 'date-fns'

const categoryIcon = { veg: <Leaf className="w-3 h-3" />, 'non-veg': <Drumstick className="w-3 h-3" />, vegan: <Leaf className="w-3 h-3" /> }
const categoryBadge = { veg: 'badge-green', 'non-veg': 'badge-amber', vegan: 'badge-green' }

function FreshnessBadge({ expiresAt }) {
  const diff = new Date(expiresAt) - new Date()
  const isExpiringSoon = diff > 0 && diff < 120 * 60_000 // less than 2 hours
  const isExpired = diff <= 0

  if (isExpired) return null

  return (
    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur shadow-soft px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10 border border-[#F0EBE1]">
      <div className={`w-2 h-2 rounded-full ${isExpiringSoon ? 'bg-brand-amber animate-pulse-dot' : 'bg-brand-olive'}`}></div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-textPrimary">
        {isExpiringSoon ? 'Expiring Soon' : 'Fresh'}
      </span>
    </div>
  )
}

function Countdown({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState('')
  
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const exp = new Date(expiresAt)
      const diff = exp - now
      if (diff <= 0) { setTimeLeft('Expired'); return }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      setTimeLeft(`${h > 0 ? `${h}h ` : ''}${m}m`)
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [expiresAt])

  const expired = isPast(new Date(expiresAt))
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${expired ? 'text-brand-textSecondary' : 'text-brand-textPrimary'}`}>
      <Clock className="w-3.5 h-3.5 text-brand-textSecondary" /> {timeLeft} left
    </span>
  )
}

export default function ListingCard({ listing, onClaim, onView, showActions = true }) {
  const expired = isPast(new Date(listing.expires_at)) || listing.status !== 'available'
  
  // Random warm gradient placeholder for images
  const gradients = [
    'from-[#F0EBE1] to-[#E8DFD0]',
    'from-[#FDF5E6] to-[#FBE3B8]',
    'from-[#EAF2EC] to-[#D1E0D5]'
  ]
  const gradient = gradients[listing.id.charCodeAt(0) % gradients.length]
  const emoji = listing.food_category === 'veg' ? '🥗' : listing.food_category === 'vegan' ? '🥑' : '🍗'

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group border border-[#F0EBE1] flex flex-col ${expired ? 'opacity-60 grayscale-[0.5]' : ''}`}
      onClick={() => onView?.(listing)}
    >
      {/* Image Area */}
      <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        {listing.status === 'available' && !expired && <FreshnessBadge expiresAt={listing.expires_at} />}
        <span className="text-5xl drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">{emoji}</span>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-serif text-xl font-bold text-brand-textPrimary group-hover:text-brand-olive transition-colors line-clamp-1">
              {listing.food_type}
            </h3>
            {listing.status === 'claimed' && <span className="badge-amber shrink-0 mt-1">Claimed</span>}
            {listing.status === 'expired' && <span className="badge-gray shrink-0 mt-1">Expired</span>}
          </div>
          <span className={categoryBadge[listing.food_category] || 'badge-gray'}>
            <span className="flex items-center gap-1">
              {categoryIcon[listing.food_category]} {listing.food_category}
            </span>
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-brand-textSecondary font-medium">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#D4C5A9]" />
            <span>{listing.quantity} {listing.quantity_unit}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#D4C5A9]" />
            <span className="line-clamp-1">{listing.pickup_address}</span>
          </div>
          {listing.distance_km !== undefined && listing.distance_km !== null && (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center text-[10px]">📍</span>
              <span className="font-bold text-brand-olive">{listing.distance_km} km away</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-[#F0EBE1] flex items-center justify-between">
          <Countdown expiresAt={listing.expires_at} />
          {showActions && listing.status === 'available' && !expired && (
            <button
              className="btn-primary py-1.5 px-4 text-xs"
              onClick={(e) => { e.stopPropagation(); onClaim?.(listing) }}
            >
              Claim Food
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
