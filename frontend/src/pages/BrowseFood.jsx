import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNearbyListings, getAllListings } from '../api/listings'
import { claimListing } from '../api/claims'
import { useNotifications } from '../context/NotificationContext'
import ListingGrid from '../components/listings/ListingGrid'
import ListingMap from '../components/listings/ListingMap'
import ListingDetail from '../components/listings/ListingDetail'
import { MapPin, SlidersHorizontal, RefreshCw, Map as MapIcon, Grid } from 'lucide-react'

export default function BrowseFood() {
  const [location, setLocation] = useState(null)
  const [locError, setLocError] = useState('')
  const [radius, setRadius] = useState(5)
  const [category, setCategory] = useState('')
  const [selected, setSelected] = useState(null)
  const [viewMode, setViewMode] = useState('map')
  const { addToast } = useNotifications()
  const qc = useQueryClient()

  // Request geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) { setLocError('Geolocation not supported'); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocError('Location denied. Showing all listings.')
    )
  }, [])

  const params = location
    ? { lat: location.lat, lng: location.lng, radius_km: radius, ...(category ? { category } : {}) }
    : null

  const { data: listings = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['nearby', params],
    queryFn: () => (params ? getNearbyListings(params) : getAllListings()).then(r => r.data),
    refetchInterval: 30_000,
    staleTime: 20_000,
  })

  const claimMutation = useMutation({
    mutationFn: (listingId) => claimListing({ listing_id: listingId }),
    onSuccess: () => {
      addToast('Food claimed! Coordinate with the donor for pickup.', 'success')
      qc.invalidateQueries(['nearby'])
      setSelected(null)
    },
    onError: (e) => addToast(e.response?.data?.detail || 'Failed to claim', 'error'),
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Browse Nearby Food</h1>
          <div className="flex items-center gap-2 mt-1">
            {location
              ? <span className="text-xs text-brand-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> Using your location</span>
              : <span className="text-xs text-gray-400">{locError || 'Detecting location...'}</span>
            }
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
            <button onClick={() => setViewMode('map')} className={`p-1.5 rounded-md ${viewMode === 'map' ? 'bg-gray-700 text-brand-400' : 'text-gray-400 hover:text-white'}`}>
              <MapIcon className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-gray-700 text-brand-400' : 'text-gray-400 hover:text-white'}`}>
              <Grid className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => refetch()} disabled={isFetching}
            className="btn-secondary py-1.5 text-sm gap-2">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refresh' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-300 font-medium">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {location && (
            <div>
              <label className="label">Radius: {radius} km</label>
              <input type="range" min={1} max={20} value={radius} onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-brand-500" />
            </div>
          )}
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-gray-400 mb-4">
          Showing <span className="text-white font-semibold">{listings.length}</span> available listings
          {location && ` within ${radius} km`}
          {' '}· Auto-refreshes every 30s
        </p>
      )}

      {/* Listings */}
      {viewMode === 'map' ? (
        <ListingMap 
          listings={listings} 
          location={location} 
          onView={setSelected}
          onClaim={(l) => claimMutation.mutate(l.id)}
        />
      ) : (
        <ListingGrid
          listings={listings}
          loading={isLoading}
          onView={setSelected}
          onClaim={(l) => claimMutation.mutate(l.id)}
          emptyMessage={location ? `No food available within ${radius} km. Try increasing the radius.` : 'No listings available.'}
        />
      )}

      {/* Detail Modal */}
      {selected && <ListingDetail listing={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
