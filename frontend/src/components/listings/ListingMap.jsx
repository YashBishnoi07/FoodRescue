import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function MapBounds({ listings, location }) {
  const map = useMap()
  
  useEffect(() => {
    if (listings.length > 0) {
      const bounds = L.latLngBounds(listings.map(l => [l.latitude, l.longitude]))
      if (location) bounds.extend([location.lat, location.lng])
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (location) {
      map.setView([location.lat, location.lng], 13)
    }
  }, [listings, location, map])
  
  return null
}

export default function ListingMap({ listings, location, onClaim, onView }) {
  const defaultCenter = location ? [location.lat, location.lng] : [20.5937, 78.9629] // Default to India if no location

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-800 relative z-0">
      <MapContainer center={defaultCenter} zoom={13} className="h-full w-full bg-gray-900">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {location && (
          <Marker position={[location.lat, location.lng]} icon={L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background-color: #3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white;'></div>",
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          })}>
            <Popup className="bg-gray-900 border border-gray-800">
              <div className="text-gray-200 font-semibold">You are here</div>
            </Popup>
          </Marker>
        )}

        {listings.map(l => (
          <Marker key={l.id} position={[l.latitude, l.longitude]}>
            <Popup className="bg-gray-900 text-white rounded-lg p-0 border-0 custom-popup">
              <div className="p-3 bg-gray-900 rounded-lg min-w-[200px] border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-base">{l.food_type}</h3>
                  <span className="badge-green text-[10px]">{l.category}</span>
                </div>
                <p className="text-sm text-gray-300 mb-1">{l.quantity} {l.quantity_unit}</p>
                <p className="text-xs text-gray-500 mb-3">Exp: {new Date(l.expiry_time).toLocaleTimeString()}</p>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); onView(l) }} className="btn-secondary py-1 px-2 text-xs flex-1">View</button>
                  <button onClick={(e) => { e.stopPropagation(); onClaim(l) }} className="btn-primary py-1 px-2 text-xs flex-1">Claim</button>
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
