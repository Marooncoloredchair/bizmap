const axios = require('axios')

class CensusService {
  constructor() {
    this.baseUrl = 'https://api.census.gov/data'
    this.apiKey = process.env.CENSUS_API_KEY
  }

  async getDemographics(location) {
    try {
      if (!this.apiKey) {
        console.log('Census API key not found, using mock data')
        return this.getMockDemographics(location)
      }

      // For now, we'll use mock data as the Census API requires specific geographic identifiers
      // In production, you would need to:
      // 1. Geocode the location to get coordinates
      // 2. Use the coordinates to find the Census tract/block group
      // 3. Query the Census API for demographic data
      
      return this.getMockDemographics(location)
    } catch (error) {
      console.error('Census Service Error:', error)
      return this.getMockDemographics(location)
    }
  }

  getMockDemographics(location) {
    // Generate realistic mock data based on location
    const locationData = {
      'providence': {
        population: 179335,
        median_income: 45000,
        median_age: 32.5,
        education_level: 'some_college',
        employment_rate: 0.85
      },
      'boston': {
        population: 692600,
        median_income: 75000,
        median_age: 34.2,
        education_level: 'bachelors',
        employment_rate: 0.88
      },
      'new york': {
        population: 8336817,
        median_income: 65000,
        median_age: 36.8,
        education_level: 'bachelors',
        employment_rate: 0.87
      },
      'chicago': {
        population: 2693976,
        median_income: 58000,
        median_age: 35.1,
        education_level: 'some_college',
        employment_rate: 0.86
      },
      'los angeles': {
        population: 3971883,
        median_income: 62000,
        median_age: 36.0,
        education_level: 'some_college',
        employment_rate: 0.84
      }
    }

    const lowerLocation = location.toLowerCase()
    for (const [key, value] of Object.entries(locationData)) {
      if (lowerLocation.includes(key)) {
        return value
      }
    }

    // Default demographics
    return {
      population: 50000,
      median_income: 55000,
      median_age: 35.0,
      education_level: 'some_college',
      employment_rate: 0.85
    }
  }

  async getEconomicData(location) {
    try {
      // Mock economic data
      return {
        unemployment_rate: 4.2,
        gdp_growth: 2.8,
        business_growth_rate: 3.5,
        retail_sales_growth: 4.1,
        housing_affordability: 0.65
      }
    } catch (error) {
      console.error('Economic Data Error:', error)
      return {
        unemployment_rate: 4.5,
        gdp_growth: 2.5,
        business_growth_rate: 3.0,
        retail_sales_growth: 3.8,
        housing_affordability: 0.60
      }
    }
  }

  async getPopulationDensity(location) {
    try {
      // Mock population density data
      const densityData = {
        'providence': 3800, // people per square mile
        'boston': 14000,
        'new york': 28000,
        'chicago': 12000,
        'los angeles': 8000
      }

      const lowerLocation = location.toLowerCase()
      for (const [key, value] of Object.entries(densityData)) {
        if (lowerLocation.includes(key)) {
          return value
        }
      }

      return 5000 // Default density
    } catch (error) {
      console.error('Population Density Error:', error)
      return 5000
    }
  }
}

module.exports = new CensusService()
