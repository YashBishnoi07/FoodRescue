import { useState } from 'react'
import { Star, X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { completeClaim } from '../../api/claims'
import { useNotifications } from '../../context/NotificationContext'

export default function RatingModal({ claim, onClose }) {
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [hovered, setHovered] = useState(0)
  
  const qc = useQueryClient()
  const { addToast } = useNotifications()

  const completeMutation = useMutation({
    mutationFn: () => completeClaim(claim.id, { feedback_rating: rating, feedback_text: feedback }),
    onSuccess: () => {
      addToast('Pickup marked as completed! Thank you.', 'success')
      qc.invalidateQueries(['claimsForListing', claim.listing_id])
      qc.invalidateQueries(['myStats'])
      onClose()
    },
    onError: (e) => addToast(e.response?.data?.detail || 'Failed to complete', 'error')
  })

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-sm animate-slide-up relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-xl font-bold text-white mb-2">Complete Pickup</h3>
        <p className="text-sm text-gray-400 mb-6">Rate your experience with this receiver.</p>
        
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star 
                className={`w-10 h-10 ${
                  star <= (hovered || rating) 
                    ? 'text-amber-400 fill-amber-400' 
                    : 'text-gray-600'
                }`} 
              />
            </button>
          ))}
        </div>
        
        <textarea
          className="input mb-4"
          placeholder="Optional: Write a short review..."
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        
        <button 
          onClick={() => completeMutation.mutate()} 
          disabled={completeMutation.isPending}
          className="btn-primary w-full"
        >
          {completeMutation.isPending ? 'Saving...' : 'Submit & Complete'}
        </button>
      </div>
    </div>
  )
}
