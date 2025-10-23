const AIService = require('./aiService');
const PlacesService = require('./placesService');
const CensusService = require('./censusService');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const data = JSON.parse(event.body);
    const { business, location, radius, priceTier, daypart } = data;

    // Generate mock data (since we don't have real API keys)
    const mockLocations = generateMockLocations(business, location, radius, priceTier, daypart);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockLocations)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

function generateMockLocations(business, location, radius, priceTier, daypart) {
  const locations = [
    {
      name: "Downtown Core",
      address: "123 Main St, " + location,
      score: 85,
      scoreLabel: "Very Promising",
      subscores: {
        foot_traffic: 0.8,
        competition: 0.7,
        demographics: 0.9,
        category_fit: 0.8
      },
      metrics: {
        population: 25000,
        competitors: 3,
        avg_income: 65000,
        foot_traffic: 85,
        vacancy_rate: 15
      },
      coordinates: [41.8236, -71.4222],
      lat: 41.8236,
      lon: -71.4222
    },
    {
      name: "University District",
      address: "456 College Ave, " + location,
      score: 78,
      scoreLabel: "Very Promising", 
      subscores: {
        foot_traffic: 0.9,
        competition: 0.6,
        demographics: 0.8,
        category_fit: 0.7
      },
      metrics: {
        population: 18000,
        competitors: 2,
        avg_income: 45000,
        foot_traffic: 92,
        vacancy_rate: 8
      },
      coordinates: [41.8267, -71.4156],
      lat: 41.8267,
      lon: -71.4156
    },
    {
      name: "Waterfront Area",
      address: "789 Harbor Blvd, " + location,
      score: 72,
      scoreLabel: "Very Promising",
      subscores: {
        foot_traffic: 0.7,
        competition: 0.8,
        demographics: 0.7,
        category_fit: 0.8
      },
      metrics: {
        population: 12000,
        competitors: 1,
        avg_income: 75000,
        foot_traffic: 78,
        vacancy_rate: 12
      },
      coordinates: [41.8200, -71.4300],
      lat: 41.8200,
      lon: -71.4300
    }
  ];

  const bestLocation = locations[0];
  
  return {
    locations,
    best_location: bestLocation,
    summary: {
      total_locations: locations.length,
      avg_score: Math.round(locations.reduce((sum, loc) => sum + loc.score, 0) / locations.length),
      recommendation: `Based on your ${business} in ${location}, we found ${locations.length} promising locations with an average score of ${Math.round(locations.reduce((sum, loc) => sum + loc.score, 0) / locations.length)}%.`
    }
  };
}
