import { useState } from 'react'
import { X, MapPin, Package, User, Clock, ExternalLink, MessageCircle, CheckSquare } from 'lucide-react'
import { format } from 'date-fns'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { claimListing, getClaimsForListing } from '../../api/claims'
import { useNotifications } from '../../context/NotificationContext'
import { useAuth } from '../../context/AuthContext'
import ChatWindow from '../chat/ChatWindow'
import RatingModal from '../claims/RatingModal'
import UserReputationBadge from '../common/UserReputationBadge'

export default function ListingDetail({ listing, onClose }) {
  const { user } = useAuth()
  const { addToast } = useNotifications()
  const qc = useQueryClient()
  const [activeChat, setActiveChat] = useState(null)
  const [ratingClaim, setRatingClaim] = useState(null)

  const claimMutation = useMutation({
    mutationFn: () => claimListing({ listing_id: listing.id }),
    onSuccess: () => {
      addToast('Food claimed successfully! Coordinate with the donor for pickup.', 'success')
      qc.invalidateQueries(['listings'])
      qc.invalidateQueries(['nearby'])
      onClose()
    },
    onError: (e) => addToast(e.response?.data?.detail || 'Failed to claim', 'error'),
  })

  const { data: claims = [] } = useQuery({
    queryKey: ['claimsForListing', listing.id],
    queryFn: () => getClaimsForListing(listing.id).then(r => r.data),
    enabled: user?.role === 'donor',
  })

  const mapsUrl = `https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">{listing.food_type}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{listing.food_category} · {listing.quantity} {listing.quantity_unit}</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        {listing.description && (
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">{listing.description}</p>
        )}

        {/* Details */}
        <div className="space-y-3 mb-4">
          <DetailRow icon={<MapPin className="w-4 h-4" />} label="Pickup Address" value={listing.pickup_address} />
          <DetailRow icon={<User className="w-4 h-4" />} label="Donor" value={listing.donor_name || 'Unknown'} />
          <DetailRow icon={<Package className="w-4 h-4" />} label="Quantity" value={`${listing.quantity} ${listing.quantity_unit}`} />
          <DetailRow icon={<Clock className="w-4 h-4" />} label="Expires At" value={format(new Date(listing.expires_at), 'PPp')} />
          {listing.distance_km != null && (
            <DetailRow icon={<span className="text-xs">📍</span>} label="Distance" value={`${listing.distance_km} km away`} />
          )}
        </div>

        {/* Map link */}
        <a href={mapsUrl} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors mb-4">
          <ExternalLink className="w-4 h-4" /> View on Google Maps
        </a>

        {/* Claims for Donor */}
        {user?.role === 'donor' && claims.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold text-gray-200 text-sm mb-2 border-t border-gray-800 pt-4">Claims on this listing</h3>
            <div className="space-y-2">
              {claims.map(claim => (
                <div key={claim.id} className="bg-gray-800 p-2 rounded-lg flex items-center justify-between text-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white font-medium text-xs">Receiver: {claim.receiver_id.substring(0, 8)}...</p>
                      <UserReputationBadge userId={claim.receiver_id} />
                    </div>
                    <p className="text-gray-400 text-xs">Status: {claim.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveChat(claim.id)} className="btn-secondary py-1 px-2 text-xs flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" /> Chat
                    </button>
                    {['pending', 'confirmed'].includes(claim.status) && (
                      <button onClick={() => setRatingClaim(claim)} className="btn-primary py-1 px-2 text-xs flex items-center gap-1">
                        <CheckSquare className="w-3.5 h-3.5" /> Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-3 border-t border-gray-800">
          <button onClick={onClose} className="btn-secondary flex-1">Close</button>
          {user?.role !== 'donor' && listing.status === 'available' && (
            <button
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
              className="btn-primary flex-1"
            >
              {claimMutation.isPending ? 'Claiming...' : 'Claim This Food'}
            </button>
          )}
        </div>
      </div>
      {activeChat && <ChatWindow claimId={activeChat} onClose={() => setActiveChat(null)} />}
      {ratingClaim && <RatingModal claim={ratingClaim} onClose={() => setRatingClaim(null)} />}
    </div>
  )
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-gray-500 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-gray-500 text-xs">{label}</p>
        <p className="text-gray-200">{value}</p>
      </div>
    </div>
  )
}
