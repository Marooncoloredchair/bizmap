import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Component to handle map centering
function MapCenter({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, 13)
    }
  }, [center, map])
  return null
}

const MapComponent = ({ data, selectedLocation, onLocationSelect }) => {
  // Safety checks for coordinates
  const safeData = data || {}
  const locations = safeData.locations || []
  const bestLocation = safeData.best_location || locations[0]
  
  // Default coordinates for Providence, RI
  const defaultLat = 41.8240
  const defaultLon = -71.4187
  
  // Get center coordinates with fallbacks
  const centerLat = selectedLocation?.lat || bestLocation?.lat || defaultLat
  const centerLon = selectedLocation?.lon || bestLocation?.lon || defaultLon
  
  // Filter locations with valid coordinates
  const validLocations = locations.filter(loc => 
    loc.lat !== undefined && loc.lon !== undefined && 
    !isNaN(loc.lat) && !isNaN(loc.lon)
  )
  
  console.log('MapComponent data:', { data, selectedLocation, validLocations })
  
  return (
    <MapContainer
      id="map-container"
      center={[centerLat, centerLon]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapCenter center={selectedLocation && selectedLocation.lat && selectedLocation.lon ? [selectedLocation.lat, selectedLocation.lon] : null} />
      {validLocations.map((location, index) => (
        <Marker 
          key={index}
          position={[location.lat, location.lon]}
          eventHandlers={{
            click: () => onLocationSelect(location)
          }}
        >
          <Popup>
            <div>
              <h4 className="font-bold">{location.name || 'Unknown Location'}</h4>
              <p>Score: {location.score || 0}%</p>
              <p>{safeData.business || 'Business'} opportunity</p>
              <p className="text-xs text-gray-600">Rank: #{location.rank || index + 1}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default MapComponent
