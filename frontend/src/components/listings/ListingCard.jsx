import { useState, useEffect } from 'react'
import { Clock, MapPin, Package, User, Leaf, Drumstick, ChevronRight } from 'lucide-react'
import { formatDistanceToNow, isPast } from 'date-fns'

const categoryIcon = { veg: <Leaf className="w-3 h-3" />, 'non-veg': <Drumstick className="w-3 h-3" />, vegan: <Leaf className="w-3 h-3" /> }
const categoryBadge = { veg: 'badge-green', 'non-veg': 'badge-red', vegan: 'badge-blue' }

function Countdown({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [urgency, setUrgency] = useState('green')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const exp = new Date(expiresAt)
      const diff = exp - now
      if (diff <= 0) { setTimeLeft('Expired'); setUrgency('red'); return }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1000)
      setTimeLeft(`${h > 0 ? `${h}h ` : ''}${m}m ${s}s`)
      if (diff < 30 * 60_000) setUrgency('red')
      else if (diff < 120 * 60_000) setUrgency('yellow')
      else setUrgency('green')
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const colors = { green: 'text-brand-400', yellow: 'text-amber-400', red: 'text-red-400' }
  const bg     = { green: 'bg-brand-500/10', yellow: 'bg-amber-500/10', red: 'bg-red-500/10' }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full ${colors[urgency]} ${bg[urgency]}`}>
      <Clock className="w-3 h-3" /> {timeLeft}
    </span>
  )
}

export default function ListingCard({ listing, onClaim, onView, showActions = true }) {
  const expired = isPast(new Date(listing.expires_at)) || listing.status !== 'available'

  return (
    <div
      className={`glass p-5 flex flex-col gap-3 hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 cursor-pointer group ${expired ? 'opacity-60' : ''}`}
      onClick={() => onView?.(listing)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
            {listing.food_type}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={categoryBadge[listing.food_category] || 'badge-gray'}>
              <span className="flex items-center gap-1">
                {categoryIcon[listing.food_category]} {listing.food_category}
              </span>
            </span>
            {listing.status === 'claimed' && <span className="badge-yellow">Claimed</span>}
            {listing.status === 'expired' && <span className="badge-gray">Expired</span>}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-brand-500 transition-colors shrink-0 mt-1" />
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Package className="w-3.5 h-3.5 shrink-0 text-gray-500" />
          <span>{listing.quantity} {listing.quantity_unit}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-500" />
          <span className="line-clamp-1">{listing.pickup_address}</span>
        </div>
        {listing.donor_name && (
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 shrink-0 text-gray-500" />
            <span>{listing.donor_name}</span>
          </div>
        )}
        {listing.distance_km !== undefined && listing.distance_km !== null && (
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 shrink-0 text-center text-gray-500 text-xs">📍</span>
            <span className="font-medium text-brand-400">{listing.distance_km} km away</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-800">
        <Countdown expiresAt={listing.expires_at} />
        {showActions && listing.status === 'available' && !expired && (
          <button
            className="btn-primary py-1 px-3 text-xs"
            onClick={(e) => { e.stopPropagation(); onClaim?.(listing) }}
          >
            Claim
          </button>
        )}
      </div>
    </div>
  )
}
