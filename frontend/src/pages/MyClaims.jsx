import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyClaims, cancelClaim } from '../api/claims'
import { useNotifications } from '../context/NotificationContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ChatWindow from '../components/chat/ChatWindow'
import { XCircle, Star, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'

const statusBadge = { pending: 'badge-yellow', confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' }

export default function MyClaims() {
  const { addToast } = useNotifications()
  const qc = useQueryClient()
  const [activeChat, setActiveChat] = useState(null)

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['myClaims'],
    queryFn: () => getMyClaims().then(r => r.data),
    refetchInterval: 30_000,
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelClaim(id, {}),
    onSuccess: () => { addToast('Claim cancelled', 'success'); qc.invalidateQueries(['myClaims']) },
    onError: (e) => addToast(e.response?.data?.detail || 'Failed to cancel', 'error'),
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Claims</h1>
        <p className="text-gray-400 text-sm mt-1">Track your food claim history</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : claims.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🍽️</div>
          <p className="text-gray-400">No claims yet. Browse nearby food to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((c) => (
            <div key={c.id} className="card flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={statusBadge[c.status] || 'badge-gray'}>{c.status}</span>
                  <span className="text-xs text-gray-500">Claimed {format(new Date(c.claimed_at), 'PP p')}</span>
                </div>
                <p className="text-xs text-gray-500 font-mono">Listing: {c.listing_id}</p>
                {c.completed_at && (
                  <p className="text-xs text-brand-400 mt-1">✅ Completed {format(new Date(c.completed_at), 'PP')}</p>
                )}
                {c.feedback_rating && (
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < c.feedback_rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                    ))}
                    {c.feedback_text && <span className="text-xs text-gray-400 ml-1">"{c.feedback_text}"</span>}
                  </div>
                )}
                {c.cancel_reason && (
                  <p className="text-xs text-gray-500 mt-1">Reason: {c.cancel_reason}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {['pending', 'confirmed'].includes(c.status) && (
                  <>
                    <button onClick={() => setActiveChat(c.id)}
                      className="btn-secondary py-1 px-2 text-xs flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" /> Chat
                    </button>
                    <button onClick={() => cancelMutation.mutate(c.id)}
                      className="flex items-center justify-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors mt-1">
                      <XCircle className="w-4 h-4" /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activeChat && <ChatWindow claimId={activeChat} onClose={() => setActiveChat(null)} />}
    </div>
  )
}
