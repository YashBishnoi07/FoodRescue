import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNearbyListings, getAllListings } from '../api/listings'
import { claimListing } from '../api/claims'
import { useNotifications } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import ListingGrid from '../components/listings/ListingGrid'
import ListingMap from '../components/listings/ListingMap'
import ListingDetail from '../components/listings/ListingDetail'
import AnimatedSection from '../components/common/AnimatedSection'
import { MapPin, SlidersHorizontal, RefreshCw, Map as MapIcon, Grid } from 'lucide-react'

export default function BrowseFood() {
  const [location, setLocation] = useState(null)
  const [locError, setLocError] = useState('')
  const [radius, setRadius] = useState(5)
  const [category, setCategory] = useState('')
  const [selected, setSelected] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const { addToast } = useNotifications()
  const { user } = useAuth()
  const qc = useQueryClient()
  const isDonor = user?.role === 'donor'

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
    <div className="max-w-7xl mx-auto px-4 py-28 min-h-screen">
      {/* Header */}
      <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-5">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-textPrimary mb-2">Find Food</h1>
          <div className="flex items-center gap-2 mt-1">
            {location
              ? <span className="text-sm font-bold uppercase tracking-wider text-brand-olive flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Using your location</span>
              : <span className="text-sm font-bold uppercase tracking-wider text-brand-textSecondary">{locError || 'Detecting location...'}</span>
            }
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-[#F0EBE1] shadow-sm">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg flex items-center gap-2 transition-colors ${viewMode === 'grid' ? 'bg-[#F5F0E8] text-brand-olive font-bold' : 'text-brand-textSecondary hover:text-brand-textPrimary'}`}>
              <Grid className="w-4 h-4" /> <span className="hidden sm:inline text-sm pr-1">Grid</span>
            </button>
            <button onClick={() => setViewMode('map')} className={`p-2 rounded-lg flex items-center gap-2 transition-colors ${viewMode === 'map' ? 'bg-[#F5F0E8] text-brand-olive font-bold' : 'text-brand-textSecondary hover:text-brand-textPrimary'}`}>
              <MapIcon className="w-4 h-4" /> <span className="hidden sm:inline text-sm pr-1">Map</span>
            </button>
          </div>
          <button onClick={() => refetch()} disabled={isFetching}
            className="btn-secondary py-2 px-4 shadow-sm border-[#F0EBE1]">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-brand-olive' : ''}`} />
          </button>
        </div>
      </AnimatedSection>

      {/* Filters */}
      <AnimatedSection delay={100} className="card mb-8 !bg-white">
        <div className="flex items-center gap-2 mb-5 text-sm text-brand-textPrimary font-bold uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-brand-olive" /> Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {location && (
            <div>
              <label className="label">Radius: <span className="text-brand-olive">{radius} km</span></label>
              <input type="range" min={1} max={20} value={radius} onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-brand-olive h-2 bg-[#F0EBE1] rounded-lg appearance-none cursor-pointer" />
            </div>
          )}
          <div>
            <label className="label">Dietary Category</label>
            <select className="input !py-2.5" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>
          </div>
        </div>
      </AnimatedSection>

      {/* Results count */}
      {!isLoading && (
        <AnimatedSection delay={200}>
          <p className="text-sm text-brand-textSecondary font-medium mb-6">
            Showing <span className="text-brand-textPrimary font-bold">{listings.length}</span> available listings
            {location && ` within ${radius} km`}
          </p>
        </AnimatedSection>
      )}

      {/* Listings */}
      <AnimatedSection delay={300}>
        {viewMode === 'map' ? (
          <div className="rounded-2xl overflow-hidden border border-[#F0EBE1] shadow-soft h-[600px] bg-white">
            <ListingMap 
              listings={listings} 
              location={location} 
              onView={setSelected}
              onClaim={(l) => claimMutation.mutate(l.id)}
              showActions={!isDonor}
            />
          </div>
        ) : (
          <ListingGrid
            listings={listings}
            loading={isLoading}
            onView={setSelected}
            onClaim={(l) => claimMutation.mutate(l.id)}
            showActions={!isDonor}
            emptyMessage={location ? `No food available within ${radius} km. Try increasing the radius.` : 'No listings available.'}
          />
        )}
      </AnimatedSection>

      {/* Detail Modal */}
      {selected && <ListingDetail listing={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
