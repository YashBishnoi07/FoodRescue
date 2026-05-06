import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useState } from 'react'
import { Navigation, X } from 'lucide-react'

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom olive green marker for food listings
const foodMarkerIcon = (isActive = false) => L.divIcon({
  className: '',
  html: `
    <div style="
      background: ${isActive ? '#E8A838' : '#3D6B45'};
      width: 36px; height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 12px rgba(0,0,0,0.25);
    ">
      <div style="
        transform: rotate(45deg);
        display: flex; align-items: center; justify-content: center;
        width: 100%; height: 100%;
        font-size: 15px;
      ">🍽</div>
    </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
})

// Blue "you are here" pulsing dot
const userMarkerIcon = () => L.divIcon({
  className: '',
  html: `
    <div style="position:relative; width:20px; height:20px;">
      <div style="
        position:absolute; inset:0;
        background: #3B82F6; border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 6px rgba(59,130,246,0.25);
      "></div>
    </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

function MapBounds({ listings, location }) {
  const map = useMap()
  useEffect(() => {
    if (listings.length > 0) {
      const bounds = L.latLngBounds(listings.map(l => [l.latitude, l.longitude]))
      if (location) bounds.extend([location.lat, location.lng])
      map.fitBounds(bounds, { padding: [60, 60] })
    } else if (location) {
      map.setView([location.lat, location.lng], 14)
    }
  }, [listings, location, map])
  return null
}

// Fetch OSRM road route between two points
async function fetchRoute(from, to) {
  const url = `https://router.project-osrm.org/route/v1/foot/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
  const res = await fetch(url)
  const data = await res.json()
  if (data.routes && data.routes.length > 0) {
    // GeoJSON coords are [lng, lat], Leaflet needs [lat, lng]
    return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
  }
  return null
}

export default function ListingMap({ listings, location, onClaim, onView, showActions = true }) {
  const defaultCenter = location ? [location.lat, location.lng] : [20.5937, 78.9629]
  const [routeCoords, setRouteCoords] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [loadingRoute, setLoadingRoute] = useState(false)

  const handleShowRoute = async (listing) => {
    if (!location) return
    setLoadingRoute(true)
    setActiveId(listing.id)
    setRouteInfo(null)
    const coords = await fetchRoute(
      { lat: location.lat, lng: location.lng },
      { lat: listing.latitude, lng: listing.longitude }
    )
    if (coords) {
      setRouteCoords(coords)
      // Estimate walk time: avg walking speed ~5km/h
      const dist = listing.distance_km ?? '?'
      const mins = dist !== '?' ? Math.round((dist / 5) * 60) : null
      setRouteInfo({ dist, mins, name: listing.food_type })
    }
    setLoadingRoute(false)
  }

  const clearRoute = () => {
    setRouteCoords(null)
    setActiveId(null)
    setRouteInfo(null)
  }

  return (
    <div className="relative h-full w-full">
      {/* Route info banner */}
      {routeInfo && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-white shadow-xl rounded-2xl px-5 py-3 flex items-center gap-4 border border-[#F0EBE1] min-w-[280px]">
          <Navigation className="w-5 h-5 text-brand-olive shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-brand-textPrimary text-sm">{routeInfo.name}</p>
            <p className="text-brand-textSecondary text-xs font-medium mt-0.5">
              {routeInfo.dist} km · ~{routeInfo.mins} min walk
            </p>
          </div>
          <button onClick={clearRoute} className="p-1.5 hover:bg-[#F5F0E8] rounded-full transition-colors text-brand-textSecondary hover:text-brand-textPrimary">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loadingRoute && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-white shadow-xl rounded-2xl px-5 py-3 border border-[#F0EBE1]">
          <p className="text-sm text-brand-textSecondary font-medium flex items-center gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-brand-olive border-t-transparent rounded-full"></span>
            Finding best route…
          </p>
        </div>
      )}

      <MapContainer center={defaultCenter} zoom={13} className="h-full w-full" style={{ background: '#F5F0E8' }}>
        {/* Light warm CartoDB Positron tile */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Route polyline */}
        {routeCoords && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: '#3D6B45', weight: 5, opacity: 0.85, dashArray: '10, 6', lineCap: 'round' }}
          />
        )}

        {/* User location marker */}
        {location && (
          <Marker position={[location.lat, location.lng]} icon={userMarkerIcon()}>
            <Popup>
              <div className="text-center p-1 font-bold text-sm text-blue-700">📍 You are here</div>
            </Popup>
          </Marker>
        )}

        {/* Food listing markers */}
        {listings.map(l => (
          <Marker key={l.id} position={[l.latitude, l.longitude]} icon={foodMarkerIcon(activeId === l.id)}>
            <Popup minWidth={200}>
              <div className="p-1 min-w-[190px]">
                <h3 className="font-bold text-[#1C1C1C] text-base mb-0.5">{l.food_type}</h3>
                <p className="text-xs text-[#6B6B6B] mb-1">{l.quantity} {l.quantity_unit}</p>
                {l.distance_km != null && (
                  <p className="text-xs font-bold text-[#3D6B45] mb-2">📍 {l.distance_km} km away</p>
                )}
                <div className="flex flex-col gap-1.5 mt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onView(l) }}
                    style={{ background: '#F5F0E8', color: '#1C1C1C', border: '1px solid #D4C5A9', borderRadius: '9999px', padding: '4px 10px', fontWeight: '600', fontSize: '12px', cursor: 'pointer', width: '100%' }}
                  >
                    View Details
                  </button>
                  {location && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShowRoute(l) }}
                      style={{ background: '#3D6B45', color: 'white', border: 'none', borderRadius: '9999px', padding: '4px 10px', fontWeight: '600', fontSize: '12px', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      🗺️ Show Route
                    </button>
                  )}
                  {showActions && l.status === 'available' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onClaim(l) }}
                      style={{ background: '#E8A838', color: '#1C1C1C', border: 'none', borderRadius: '9999px', padding: '4px 10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', width: '100%' }}
                    >
                      Claim Food
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapBounds listings={listings} location={location} />
      </MapContainer>
    </div>
  )
}
