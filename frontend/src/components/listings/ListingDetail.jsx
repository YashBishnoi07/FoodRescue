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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-textPrimary/40 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up !bg-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-brand-textPrimary">{listing.food_type}</h2>
            <p className="text-sm text-brand-textSecondary font-medium mt-1">{listing.food_category} · {listing.quantity} {listing.quantity_unit}</p>
          </div>
          <button onClick={onClose} className="p-2 text-brand-textSecondary hover:bg-[#F5F0E8] hover:text-brand-textPrimary rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        {listing.description && (
          <p className="text-brand-textPrimary text-sm mb-6 leading-relaxed bg-[#FDFBF7] p-4 rounded-xl border border-[#F0EBE1]">{listing.description}</p>
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
          className="inline-flex items-center gap-2 text-sm text-brand-olive font-bold hover:text-[#2E5034] hover:underline transition-all mb-4">
          <ExternalLink className="w-4 h-4" /> View on Google Maps
        </a>

        {/* Claims for Donor */}
        {user?.role === 'donor' && claims.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-brand-textPrimary uppercase tracking-wider text-[11px] mb-3 border-t border-[#F0EBE1] pt-5">Claims on this listing</h3>
            <div className="space-y-3">
              {claims.map(claim => (
                <div key={claim.id} className="bg-[#F5F0E8] border border-[#E8DFD0] p-3.5 rounded-xl flex items-center justify-between text-sm hover:shadow-sm transition-shadow">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-brand-textPrimary font-bold text-sm">Receiver: {claim.receiver_id.substring(0, 8)}</p>
                      <UserReputationBadge userId={claim.receiver_id} />
                    </div>
                    <p className="text-brand-textSecondary text-xs font-medium uppercase tracking-widest">Status: <span className="text-brand-textPrimary font-bold">{claim.status}</span></p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => setActiveChat(claim.id)} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 shadow-sm bg-white border-[#E8DFD0]">
                      <MessageCircle className="w-3.5 h-3.5" /> Chat
                    </button>
                    {['pending', 'confirmed'].includes(claim.status) && (
                      <button onClick={() => setRatingClaim(claim)} className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 shadow-sm">
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
        <div className="flex gap-4 pt-4 border-t border-[#F0EBE1]">
          <button onClick={onClose} className="btn-secondary flex-1 py-3 text-base">Close</button>
          {user?.role !== 'donor' && listing.status === 'available' && (
            <button
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
              className="btn-primary flex-1 py-3 text-base shadow-lg"
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
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[#F5F0E8] flex items-center justify-center text-brand-olive shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider font-bold text-brand-textSecondary">{label}</p>
        <p className="text-sm font-medium text-brand-textPrimary mt-0.5">{value}</p>
      </div>
    </div>
  )
}
