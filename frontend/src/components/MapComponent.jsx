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
  return (
    <MapContainer
      id="map-container"
      center={[selectedLocation?.lat || data.best_location?.lat || 41.8240, selectedLocation?.lon || data.best_location?.lon || -71.4187]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapCenter center={selectedLocation ? [selectedLocation.lat, selectedLocation.lon] : null} />
      {data.locations?.map((location, index) => (
        <Marker 
          key={index}
          position={[location.lat, location.lon]}
          eventHandlers={{
            click: () => onLocationSelect(location)
          }}
        >
          <Popup>
            <div>
              <h4 className="font-bold">{location.name}</h4>
              <p>Score: {location.score}%</p>
              <p>{data.business} opportunity</p>
              <p className="text-xs text-gray-600">Rank: #{location.rank}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default MapComponent
