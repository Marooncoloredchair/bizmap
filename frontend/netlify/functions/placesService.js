const axios = require('axios')

class PlacesService {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place'
  }

  async searchNearbyPlaces(location, businessType, radius = 1609) { // radius in meters (1 mile = 1609m)
    try {
      if (!this.apiKey) {
        console.log('Google Places API key not found, using mock data')
        return this.getMockPlacesData(businessType)
      }

      // First, get coordinates for the location
      const coordinates = await this.geocodeLocation(location)
      if (!coordinates) {
        throw new Error('Could not geocode location')
      }

      // Search for nearby places
      const response = await axios.get(`${this.baseUrl}/nearbysearch/json`, {
        params: {
          location: `${coordinates.lat},${coordinates.lng}`,
          radius: radius,
          type: this.getGooglePlaceType(businessType),
          key: this.apiKey
        }
      })

      if (response.data.status !== 'OK') {
        throw new Error(`Google Places API error: ${response.data.status}`)
      }

      return {
        places: response.data.results,
        total: response.data.results.length,
        next_page_token: response.data.next_page_token
      }
    } catch (error) {
      console.error('Places Service Error:', error)
      return this.getMockPlacesData(businessType)
    }
  }

  async geocodeLocation(location) {
    try {
      if (!this.apiKey) {
        return this.getMockCoordinates(location)
      }

      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          address: location,
          key: this.apiKey
        }
      })

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0]
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formatted_address: result.formatted_address
        }
      }

      return this.getMockCoordinates(location)
    } catch (error) {
      console.error('Geocoding Error:', error)
      return this.getMockCoordinates(location)
    }
  }

  getGooglePlaceType(businessType) {
    const typeMap = {
      'restaurant': 'restaurant',
      'coffee': 'cafe',
      'retail': 'store',
      'gym': 'gym',
      'clinic': 'hospital',
      'salon': 'beauty_salon',
      'auto': 'car_repair',
      'pharmacy': 'pharmacy',
      'bank': 'bank',
      'gas': 'gas_station'
    }

    const lowerType = businessType.toLowerCase()
    for (const [key, value] of Object.entries(typeMap)) {
      if (lowerType.includes(key)) {
        return value
      }
    }

    return 'establishment' // fallback
  }

  getMockPlacesData(businessType) {
    const mockPlaces = {
      'restaurant': [
        { name: 'The Golden Spoon', rating: 4.2, user_ratings_total: 156 },
        { name: 'Bella Vista', rating: 4.5, user_ratings_total: 89 },
        { name: 'Corner Bistro', rating: 3.8, user_ratings_total: 203 }
      ],
      'coffee': [
        { name: 'Bean There Coffee', rating: 4.3, user_ratings_total: 124 },
        { name: 'Morning Brew', rating: 4.1, user_ratings_total: 67 },
        { name: 'Cafe Central', rating: 4.6, user_ratings_total: 189 }
      ],
      'retail': [
        { name: 'Fashion Forward', rating: 4.0, user_ratings_total: 45 },
        { name: 'Tech Store', rating: 3.9, user_ratings_total: 78 },
        { name: 'Home Goods', rating: 4.2, user_ratings_total: 112 }
      ],
      'gym': [
        { name: 'FitLife Gym', rating: 4.4, user_ratings_total: 234 },
        { name: 'Power Fitness', rating: 4.1, user_ratings_total: 156 },
        { name: 'Elite Training', rating: 4.7, user_ratings_total: 89 }
      ]
    }

    return {
      places: mockPlaces[businessType] || mockPlaces['restaurant'],
      total: (mockPlaces[businessType] || mockPlaces['restaurant']).length,
      next_page_token: null
    }
  }

  getMockCoordinates(location) {
    const coordinates = {
      'providence': { lat: 41.8240, lng: -71.4187 },
      'boston': { lat: 42.3601, lng: -71.0589 },
      'new york': { lat: 40.7128, lng: -74.0060 },
      'chicago': { lat: 41.8781, lng: -87.6298 },
      'los angeles': { lat: 34.0522, lng: -118.2437 },
      'near me': { lat: 41.8240, lng: -71.4187 }
    }

    const lowerLocation = location.toLowerCase()
    for (const [key, value] of Object.entries(coordinates)) {
      if (lowerLocation.includes(key)) {
        return value
      }
    }

    return { lat: 41.8240, lng: -71.4187 } // Default to Providence
  }
}

module.exports = new PlacesService()
