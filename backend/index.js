const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const aiService = require('./services/aiService');
const placesService = require('./services/placesService');
const censusService = require('./services/censusService');

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://bizmap.vercel.app', 'https://bizmap.netlify.app'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 4000;

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

function computeOpportunity({
	competitor_count,
	population,
	median_income,
	foot_traffic_index,
	vacancy_index,
	nearest_competitor_miles = 2.5,
	category_fit = 0.7,
	price_tier = 'mid',
	c_scale = 5,
	footTrafficIsDefault = true,
}) {
	const priceTierFactorMap = { budget: 0.9, mid: 1.0, premium: 1.1 };
	const T = priceTierFactorMap[price_tier] ?? 1.0;

	// Step 1: normalize sub-scores (0..1) - Enhanced with 7 factors
	const demand_score = clamp(Math.log10((population ?? 0) + 1) / 5, 0, 1);
	const income_score = clamp(((median_income ?? 0) - 25000) / 100000, 0, 1);
	const traffic_score = clamp((foot_traffic_index ?? 50) / 100, 0, 1);
	const vacancy_score = clamp((vacancy_index ?? 50) / 100, 0, 1);
	const competitor_penalty = clamp(1 - Math.tanh((competitor_count ?? 0) / (c_scale || 5)), 0, 1);
	const nearest_distance_score = clamp((nearest_competitor_miles ?? 2.5) / 5, 0, 1);
	const category_fit_score = clamp(category_fit ?? 0.7, 0, 1);

	// Step 2: weighted combination (enhanced weights)
	let w_demand = 0.20;
	let w_income = 0.15;
	let w_traffic = 0.15;
	let w_vacancy = 0.05;
	let w_competitor = 0.20;
	let w_distance = 0.10;
	let w_category = 0.15;

	// Edge adjustment: If F is unknown (default used), reduce traffic weight by half
	// and redistribute the removed half equally to demand and competitor
	if (footTrafficIsDefault) {
		const removed = w_traffic * 0.5;
		w_traffic -= removed;
		w_demand += removed / 2;
		w_competitor += removed / 2;
	}

	let raw_score =
		T * (
			w_demand * demand_score +
			w_income * income_score +
			w_traffic * traffic_score +
			w_vacancy * vacancy_score +
			w_competitor * competitor_penalty +
			w_distance * nearest_distance_score +
			w_category * category_fit_score
		);

	let opportunity_pct = Math.round(100 * clamp(raw_score, 0, 1));

	// Edge adjustment: If competitor_count == 0 and P < 500: subtract 15 points (validate demand)
	if ((competitor_count ?? 0) === 0 && (population ?? 0) < 500) {
		opportunity_pct = Math.max(0, opportunity_pct - 15);
	}

	// Return enhanced result with sub-scores for UI
	return {
		opportunity_pct,
		subscores: {
			competitor_penalty: Math.round(competitor_penalty * 100) / 100,
			nearest_distance_score: Math.round(nearest_distance_score * 100) / 100,
			demand_score: Math.round(demand_score * 100) / 100,
			income_score: Math.round(income_score * 100) / 100,
			traffic_score: Math.round(traffic_score * 100) / 100,
			vacancy_score: Math.round(vacancy_score * 100) / 100,
			category_fit: Math.round(category_fit_score * 100) / 100
		},
		raw_score: Math.round(raw_score * 100) / 100
	};
}

function simulateMetrics() {
	return {
		population: Math.floor(5000 + Math.random() * 20000),
		competitors: Math.floor(Math.random() * 10),
		median_income: 40000 + Math.floor(Math.random() * 30000),
		foot_traffic_index: 40 + Math.floor(Math.random() * 30),
		vacancy_index: 30 + Math.floor(Math.random() * 40),
	};
}

function generateMultipleLocations(locationText, centerLat, centerLon, placesData = null, demographicsData = null) {
	// Use real data if available, otherwise use mock data
	const basePopulation = demographicsData?.population || 15000;
	const baseIncome = demographicsData?.median_income || 55000;
	const competitorCount = placesData?.total || 3;

	// Generate 4 locations with diverse characteristics for demonstration
	const locationData = [
		{ 
			name: 'Federal Hill', 
			offsetLat: 0.01, 
			offsetLon: -0.01, 
			// High opportunity location
			metrics: {
				population: Math.round(basePopulation * 0.8),
				competitors: Math.max(1, Math.floor(competitorCount * 0.4)),
				median_income: Math.round(baseIncome * 1.0),
				foot_traffic_index: 75 + Math.floor(Math.random() * 20),
				vacancy_index: 45 + Math.floor(Math.random() * 15),
				nearest_competitor_miles: 2.5 + Math.random() * 2,
				category_fit: 0.7 + Math.random() * 0.2
			}
		},
		{ 
			name: 'Downtown', 
			offsetLat: -0.005, 
			offsetLon: 0.005, 
			// Medium-high opportunity
			metrics: {
				population: Math.round(basePopulation * 1.2),
				competitors: Math.max(2, Math.floor(competitorCount * 0.8)),
				median_income: Math.round(baseIncome * 1.2),
				foot_traffic_index: 65 + Math.floor(Math.random() * 15),
				vacancy_index: 35 + Math.floor(Math.random() * 20),
				nearest_competitor_miles: 1.5 + Math.random() * 1.5,
				category_fit: 0.5 + Math.random() * 0.3
			}
		},
		{ 
			name: 'East Side', 
			offsetLat: 0.008, 
			offsetLon: 0.012, 
			// Medium opportunity
			metrics: {
				population: Math.round(basePopulation * 1.0),
				competitors: Math.max(1, Math.floor(competitorCount * 0.6)),
				median_income: Math.round(baseIncome * 1.3),
				foot_traffic_index: 50 + Math.floor(Math.random() * 15),
				vacancy_index: 50 + Math.floor(Math.random() * 20),
				nearest_competitor_miles: 1 + Math.random() * 1.5,
				category_fit: 0.4 + Math.random() * 0.3
			}
		},
		{ 
			name: 'West End', 
			offsetLat: -0.012, 
			offsetLon: -0.008, 
			// Lower opportunity for contrast
			metrics: {
				population: Math.round(basePopulation * 0.6),
				competitors: Math.max(0, Math.floor(competitorCount * 0.2)),
				median_income: Math.round(baseIncome * 0.8),
				foot_traffic_index: 30 + Math.floor(Math.random() * 15),
				vacancy_index: 70 + Math.floor(Math.random() * 20),
				nearest_competitor_miles: 0.5 + Math.random() * 1,
				category_fit: 0.2 + Math.random() * 0.3
			}
		}
	];
	
	return locationData.map((loc, index) => ({
		name: loc.name,
		lat: centerLat + loc.offsetLat,
		lon: centerLon + loc.offsetLon,
		rank: index + 1, // Will be reassigned after sorting
		metrics: loc.metrics
	}));
}

function geocodeStub(locationText) {
	// Better coordinate generation for demonstration
	if (typeof locationText === 'string' && /providence/i.test(locationText)) {
		return { lat: 41.8240, lon: -71.4187 };
	}
	if (typeof locationText === 'string' && /new york/i.test(locationText)) {
		return { lat: 40.7128, lon: -74.0060 };
	}
	if (typeof locationText === 'string' && /chicago/i.test(locationText)) {
		return { lat: 41.8781, lon: -87.6298 };
	}
	if (typeof locationText === 'string' && /los angeles/i.test(locationText)) {
		return { lat: 34.0522, lon: -118.2437 };
	}
	// Default to Providence for demo purposes
	return { lat: 41.8240, lon: -71.4187 };
}

app.post('/analyze', async (req, res) => {
	try {
		const { business, location, radius, priceTier, daypart } = req.body || {};

		// Defaults per spec
		const price_tier = (priceTier || 'mid').toLowerCase();
		const radiusText = radius || '1 mile';
		const daypartValue = (daypart || 'both').toLowerCase();

		// Get real data from APIs with fallback to mock data
		const [placesData, demographicsData] = await Promise.all([
			placesService.searchNearbyPlaces(location, business, radiusText === '1 mile' ? 1609 : radiusText === '3 miles' ? 4828 : 804),
			censusService.getDemographics(location)
		]);

		// Simulate data (later replace with Places + Census)
		const metrics = simulateMetrics();

		// Use stub geocode and generate multiple locations
		const center = geocodeStub(location || '');
		const locations = generateMultipleLocations(location || '', center.lat, center.lon, placesData, demographicsData);

		// Calculate scores for each location using their specific metrics
		const scoredLocations = locations.map(loc => {
			const scoreResult = computeOpportunity({
				competitor_count: loc.metrics.competitors,
				population: loc.metrics.population,
				median_income: loc.metrics.median_income,
				foot_traffic_index: loc.metrics.foot_traffic_index,
				vacancy_index: loc.metrics.vacancy_index,
				nearest_competitor_miles: loc.metrics.nearest_competitor_miles,
				category_fit: loc.metrics.category_fit,
				price_tier,
				c_scale: 5,
				footTrafficIsDefault: true,
			});
			
			return {
				...loc,
				score: scoreResult.opportunity_pct,
				scoreLabel: scoreResult.opportunity_pct >= 70 ? 'Very Promising' : scoreResult.opportunity_pct >= 50 ? 'Moderate' : 'Needs Validation',
				subscores: scoreResult.subscores,
				raw_score: scoreResult.raw_score
			};
		}).sort((a, b) => b.score - a.score); // Sort by score descending

		// Reassign ranks based on sorted order
		const rankedLocations = scoredLocations.map((loc, index) => ({
			...loc,
			rank: index + 1
		}));

		const confidence = 'Medium'; // Foot traffic is simulated; mark Medium

		const response = {
			business: business || '',
			location: location || '',
			radius: radiusText,
			locations: rankedLocations,
			best_location: rankedLocations[0], // Top ranked location
			metrics: {
				population: metrics.population,
				competitors: metrics.competitors,
				median_income: metrics.median_income,
				foot_traffic_index: metrics.foot_traffic_index,
				vacancy_index: metrics.vacancy_index,
			},
			confidence,
		};

		// Add caution if needed
		if (metrics.competitors === 0 && metrics.population < 500) {
			response.caution = 'Low population — validate demand.';
		}

		return res.json(response);
	} catch (err) {
		console.error('Error in /analyze:', err);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.get('/', (_req, res) => {
	res.send('BizMap backend is running. POST /analyze to analyze a location.');
});

// AI Analysis endpoint
app.post('/api/ai-analyze', async (req, res) => {
  try {
    const { userInput, context, currentStep } = req.body;
    
    if (!userInput) {
      return res.status(400).json({ error: 'User input is required' });
    }

    // If user explicitly confirmed analysis with context, generate locations immediately
    console.log('AI Analyze - currentStep:', currentStep, 'userInput:', userInput);
    const hasProceedSignal = (currentStep === 'analysis') || (typeof userInput === 'string' && userInput.toLowerCase().includes('proceed'));
    const ctx = context && (context.analysis || context);
    const hasContext = !!(ctx && (ctx.business_type || ctx.businessCategory || ctx.business));

    if (hasProceedSignal && hasContext) {
      const analysis = ctx;
      const center = geocodeStub(analysis.location_preference || analysis.location || 'Providence, RI');
      const locations = generateMultipleLocations(analysis.location_preference || analysis.location || 'Providence, RI', center.lat, center.lon);
      const locationsWithScores = locations.map(location => {
        const result = computeOpportunity({
          competitor_count: location.metrics.competitors,
          population: location.metrics.population,
          median_income: location.metrics.median_income,
          foot_traffic_index: location.metrics.foot_traffic_index,
          vacancy_index: location.metrics.vacancy_index,
          nearest_competitor_miles: location.metrics.nearest_competitor_miles,
          category_fit: location.metrics.category_fit,
          price_tier: analysis.budget_tier || analysis.priceTier || 'mid',
          c_scale: 5,
          footTrafficIsDefault: true,
        });
        return {
          ...location,
          score: Math.round(result.opportunity_pct),
          scoreLabel: result.opportunity_pct >= 70 ? 'Very Promising' : result.opportunity_pct >= 50 ? 'Moderate' : 'Needs Validation',
          subscores: result.subscores
        };
      }).sort((a, b) => b.score - a.score);
      locationsWithScores.forEach((l, i) => l.rank = i + 1);
      const bestLocation = locationsWithScores[0];
      const insights = await aiService.generateLocationInsights(
        analysis.business_type || analysis.business || 'Business',
        analysis.location_preference || analysis.location || 'Providence, RI',
        bestLocation.metrics
      );
      return res.json({
        analysis,
        business: analysis.business_type || analysis.business || 'Business',
        businessCategory: analysis.business_category || analysis.businessCategory || 'other',
        location: analysis.location_preference || analysis.location || 'Providence, RI',
        radius: '1 mile',
        priceTier: analysis.budget_tier || analysis.priceTier || 'mid',
        daypart: analysis.operating_hours || analysis.daypart || 'both',
        score: bestLocation.score,
        scoreLabel: bestLocation.scoreLabel,
        recommended_area: bestLocation.name,
        locations: locationsWithScores,
        best_location: bestLocation,
        metrics: bestLocation.metrics,
        confidence: analysis.confidence_score || 80,
        ai_insights: insights
      });
    }

    // Default path: analyze intent first
    const analysis = await aiService.analyzeBusinessIntent(userInput, context);
    
    // If we have enough information, generate location analysis
    if (analysis.confidence_score >= 80) {
      // Use the existing analysis logic but with AI-extracted data
      const mockData = simulateMetrics();
      const center = geocodeStub(analysis.location_preference);
      const locations = generateMultipleLocations(analysis.location_preference, center.lat, center.lon);
      
      // Calculate scores for each location
      const locationsWithScores = locations.map(location => {
        const result = computeOpportunity({
          competitor_count: location.metrics.competitors,
          population: location.metrics.population,
          median_income: location.metrics.median_income,
          foot_traffic_index: location.metrics.foot_traffic_index,
          vacancy_index: location.metrics.vacancy_index,
          nearest_competitor_miles: location.metrics.nearest_competitor_miles,
          category_fit: location.metrics.category_fit,
          price_tier: analysis.budget_tier,
          c_scale: 5,
          footTrafficIsDefault: true,
        });

        return {
          ...location,
          score: Math.round(result.opportunity_pct),
          scoreLabel: result.opportunity_pct >= 70 ? 'Very Promising' : 
                     result.opportunity_pct >= 50 ? 'Moderate' : 'Needs Validation',
          subscores: result.subscores
        };
      });

      // Sort by score
      locationsWithScores.sort((a, b) => b.score - a.score);
      locationsWithScores.forEach((location, index) => {
        location.rank = index + 1;
      });

      const bestLocation = locationsWithScores[0];

      // Generate AI insights
      const insights = await aiService.generateLocationInsights(
        analysis.business_type, 
        analysis.location_preference, 
        bestLocation.metrics
      );

      res.json({
        analysis,
        business: analysis.business_type,
        businessCategory: analysis.business_category,
        location: analysis.location_preference,
        radius: '1 mile',
        priceTier: analysis.budget_tier,
        daypart: analysis.operating_hours,
        score: bestLocation.score,
        scoreLabel: bestLocation.scoreLabel,
        recommended_area: bestLocation.name,
        locations: locationsWithScores,
        best_location: bestLocation,
        metrics: bestLocation.metrics,
        confidence: analysis.confidence_score,
        ai_insights: insights,
        caution: analysis.confidence_score < 70 ? 'AI confidence is moderate. Consider providing more details for better analysis.' : null
      });
    } else {
      // Return analysis for clarification
      res.json({
        analysis,
        needsClarification: true
      });
    }
    
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze business intent' });
  }
});

app.listen(PORT, () => {
  console.log(`BizMap backend listening on port ${PORT}`);
});
