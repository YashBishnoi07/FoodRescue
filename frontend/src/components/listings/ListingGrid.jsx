import LoadingSpinner from '../common/LoadingSpinner'
import ListingCard from './ListingCard'

export default function ListingGrid({ listings, loading, onClaim, onView, emptyMessage = 'No listings found.' }) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" text="Loading listings..." />
      </div>
    )
  }

  if (!listings?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🍽️</div>
        <p className="text-gray-400 text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing, idx) => (
        <div key={listing.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s`, opacity: 0 }}>
          <ListingCard
            listing={listing}
            onClaim={onClaim}
            onView={onView}
          />
        </div>
      ))}
    </div>
  )
}
