const OpenAI = require('openai')

class AIService {
  constructor() {
    // Initialize with mock API key for development
    // In production, this would use a real API key
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'mock-key-for-development'
    })
  }

  async analyzeBusinessIntent(userInput, context = {}) {
    try {
      // For development, we'll use a mock AI response
      // In production, this would call the actual OpenAI API
      if (!process.env.OPENAI_API_KEY) {
        return this.getMockAIResponse(userInput, context)
      }

      const prompt = this.buildAnalysisPrompt(userInput, context)
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a business location analysis expert. Analyze user input to extract business type, location preferences, and requirements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })

      return this.parseAIResponse(response.choices[0].message.content)
    } catch (error) {
      console.error('AI Service Error:', error)
      return this.getMockAIResponse(userInput, context)
    }
  }

  buildAnalysisPrompt(userInput, context) {
    return `
    Analyze this business search request: "${userInput}"
    
    Context: ${JSON.stringify(context)}
    
    Extract and return a JSON object with:
    1. business_type: The specific type of business
    2. business_category: One of: restaurant, retail, service, healthcare, education, entertainment, automotive, other
    3. location_preference: The desired location (city, state, or "near me")
    4. target_demographics: Who they want to serve
    5. budget_tier: budget, mid, or premium
    6. operating_hours: day, evening, or both
    7. special_requirements: Any specific needs or constraints
    8. confidence_score: 0-100 based on how clear the request is
    9. suggested_questions: Array of follow-up questions to clarify requirements
    
    Return only valid JSON.
    `
  }

  parseAIResponse(aiResponse) {
    try {
      // Extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        // Ensure all required fields are present
        return {
          business_type: parsed.business_type || 'General Business',
          business_category: parsed.business_category || 'other',
          location_preference: parsed.location_preference || 'Any Location',
          target_demographics: parsed.target_demographics || ['general population'],
          budget_tier: parsed.budget_tier || 'mid',
          operating_hours: parsed.operating_hours || 'both',
          special_requirements: parsed.special_requirements || [],
          confidence_score: parsed.confidence_score || 50,
          suggested_questions: parsed.suggested_questions || ['What type of business are you planning?'],
          clarification_needed: parsed.clarification_needed || false,
          follow_up_question: parsed.follow_up_question || ''
        }
      }
      throw new Error('No JSON found in response')
    } catch (error) {
      console.error('Error parsing AI response:', error)
      return this.getDefaultResponse()
    }
  }

  getMockAIResponse(userInput, context) {
    // Intelligent mock responses based on keywords and conversation state
    const input = userInput.toLowerCase()
    
    // Check if this is a follow-up response (not initial business idea)
    const isFollowUp = context.business_type && context.business_type !== 'General Business'
    
    // Business type detection
    let businessType = 'General Business'
    let businessCategory = 'other'
    let confidenceScore = 70
    
    if (input.includes('coffee') || input.includes('cafe')) {
      businessType = 'Coffee Shop'
      businessCategory = 'restaurant'
      confidenceScore = 90
    } else if (input.includes('restaurant') || input.includes('food')) {
      businessType = 'Restaurant'
      businessCategory = 'restaurant'
      confidenceScore = 85
    } else if (input.includes('retail') || input.includes('store') || input.includes('shop')) {
      businessType = 'Retail Store'
      businessCategory = 'retail'
      confidenceScore = 80
    } else if (input.includes('gym') || input.includes('fitness')) {
      businessType = 'Fitness Center'
      businessCategory = 'healthcare'
      confidenceScore = 85
    } else if (input.includes('clinic') || input.includes('medical')) {
      businessType = 'Medical Practice'
      businessCategory = 'healthcare'
      confidenceScore = 90
    } else if (input.includes('salon') || input.includes('beauty')) {
      businessType = 'Beauty Salon'
      businessCategory = 'service'
      confidenceScore = 85
    } else if (input.includes('barber') || input.includes('barbershop')) {
      businessType = 'Barbershop'
      businessCategory = 'service'
      confidenceScore = 90
    } else if (input.includes('auto') || input.includes('car')) {
      businessType = 'Auto Repair'
      businessCategory = 'automotive'
      confidenceScore = 80
    }

    // Location detection
    let locationPreference = 'Any Location'
    if (input.includes('near me')) {
      locationPreference = 'near me'
    } else if (input.includes('downtown') || input.includes('city center')) {
      locationPreference = 'downtown'
    } else if (input.includes('suburb') || input.includes('residential')) {
      locationPreference = 'suburban'
    }

    // Budget detection
    let budgetTier = 'mid'
    if (input.includes('budget') || input.includes('cheap') || input.includes('affordable')) {
      budgetTier = 'budget'
    } else if (input.includes('premium') || input.includes('luxury') || input.includes('high-end')) {
      budgetTier = 'premium'
    }

    // Operating hours detection
    let operatingHours = 'both'
    if (input.includes('morning') || input.includes('day')) {
      operatingHours = 'day'
    } else if (input.includes('evening') || input.includes('night')) {
      operatingHours = 'evening'
    }

    // Create conversational response based on context
    const conversationState = this.getConversationState(context, businessType, input)
    
    return {
      business_type: businessType,
      business_category: businessCategory,
      location_preference: locationPreference,
      target_demographics: this.extractDemographics(input),
      budget_tier: budgetTier,
      operating_hours: operatingHours,
      special_requirements: this.extractRequirements(input),
      confidence_score: confidenceScore,
      suggested_questions: this.generateConversationalQuestions(context, businessType, businessCategory, confidenceScore, conversationState),
      clarification_needed: conversationState.needsMoreInfo,
      follow_up_question: this.generateFollowUpQuestion(context, businessType, conversationState),
      conversation_stage: conversationState.stage
    }
  }

  extractDemographics(input) {
    const demographics = []
    if (input.includes('family') || input.includes('kids')) demographics.push('families')
    if (input.includes('young') || input.includes('millennial')) demographics.push('young adults')
    if (input.includes('professional') || input.includes('office')) demographics.push('professionals')
    if (input.includes('senior') || input.includes('elderly')) demographics.push('seniors')
    if (input.includes('student') || input.includes('college')) demographics.push('students')
    return demographics.length > 0 ? demographics : ['general population']
  }

  extractRequirements(input) {
    const requirements = []
    if (input.includes('parking')) requirements.push('parking space')
    if (input.includes('accessibility') || input.includes('wheelchair')) requirements.push('accessibility')
    if (input.includes('outdoor') || input.includes('patio')) requirements.push('outdoor space')
    if (input.includes('delivery')) requirements.push('delivery service')
    if (input.includes('wifi') || input.includes('internet')) requirements.push('high-speed internet')
    return requirements
  }

  generateQuestions(businessType, category, confidence) {
    const questions = []
    
    if (confidence < 80) {
      questions.push(`What specific type of ${businessType.toLowerCase()} are you planning?`)
    }
    
    if (category === 'restaurant') {
      questions.push('What cuisine style are you considering?')
      questions.push('Are you planning dine-in, takeout, or delivery?')
    } else if (category === 'retail') {
      questions.push('What products will you be selling?')
      questions.push('Are you targeting online sales or in-store only?')
    } else if (category === 'service') {
      questions.push('What specific services will you offer?')
      questions.push('Do you need appointment scheduling?')
    }
    
    questions.push('What\'s your target customer demographic?')
    questions.push('Do you have any specific location requirements?')
    
    return questions.slice(0, 3) // Return top 3 questions
  }

  getConversationState(context, businessType, input) {
    // Determine conversation stage and what info we still need
    const hasBusinessType = businessType !== 'General Business'
    const hasLocation = context.location_preference && context.location_preference !== 'Any Location'
    const hasBudget = context.budget_tier && context.budget_tier !== 'mid'
    const hasHours = context.operating_hours && context.operating_hours !== 'both'
    const hasDemographics = context.target_demographics && context.target_demographics.length > 0
    
    let stage = 'initial'
    let needsMoreInfo = true
    
    if (!hasBusinessType) {
      stage = 'business_type'
    } else if (!hasLocation) {
      stage = 'location'
    } else if (!hasBudget) {
      stage = 'budget'
    } else if (!hasHours) {
      stage = 'hours'
    } else if (!hasDemographics) {
      stage = 'demographics'
    } else {
      stage = 'ready'
      needsMoreInfo = false
    }
    
    return { stage, needsMoreInfo }
  }

  generateConversationalQuestions(context, businessType, category, confidence, conversationState) {
    const questions = []
    
    switch (conversationState.stage) {
      case 'business_type':
        questions.push(`That sounds interesting! What specific type of ${businessType.toLowerCase()} are you thinking about?`)
        questions.push('Are you planning a traditional barbershop or something more modern?')
        break
        
      case 'location':
        questions.push('Great choice! Where are you thinking of opening this barbershop?')
        questions.push('Are you looking for a downtown location, or would you prefer a neighborhood spot?')
        questions.push('Do you want to be near other businesses, or in a more residential area?')
        break
        
      case 'budget':
        questions.push('What\'s your budget range for rent and setup?')
        questions.push('Are you looking for a premium location or something more affordable?')
        break
        
      case 'hours':
        questions.push('What hours are you planning to operate?')
        questions.push('Will you be open during the day, evenings, or both?')
        break
        
      case 'demographics':
        questions.push('Who\'s your target customer?')
        questions.push('Are you focusing on professionals, students, families, or a mix?')
        break
        
      case 'ready':
        questions.push('I have enough information to find you some good locations.')
        questions.push('Would you like me to analyze potential spots for your barbershop?')
        break
    }
    
    return questions.slice(0, 2) // Return max 2 questions
  }

  generateFollowUpQuestion(context, businessType, conversationState) {
    switch (conversationState.stage) {
      case 'business_type':
        return 'What specific type of barbershop are you planning?'
      case 'location':
        return 'Where are you thinking of opening this barbershop?'
      case 'budget':
        return 'What\'s your budget range for rent and setup?'
      case 'hours':
        return 'What hours are you planning to operate?'
      case 'demographics':
        return 'Who\'s your target customer?'
      case 'ready':
        return 'Would you like me to analyze potential locations for your barbershop?'
      default:
        return 'Tell me more about your business idea!'
    }
  }

  getDefaultResponse() {
    return {
      business_type: 'General Business',
      business_category: 'other',
      location_preference: 'Any Location',
      target_demographics: ['general population'],
      budget_tier: 'mid',
      operating_hours: 'both',
      special_requirements: [],
      confidence_score: 50,
      suggested_questions: [
        'What type of business are you planning?',
        'Where would you like to locate it?',
        'Who is your target customer?'
      ],
      clarification_needed: true,
      follow_up_question: 'What type of business are you planning?'
    }
  }

  async generateLocationInsights(businessType, location, metrics) {
    // Generate AI-powered insights about the location
    const insights = []
    
    if (metrics.competitors <= 2) {
      insights.push(`Low competition in this area - only ${metrics.competitors} similar businesses nearby`)
    } else if (metrics.competitors >= 8) {
      insights.push(`High competition area with ${metrics.competitors} competitors - consider differentiation strategies`)
    }
    
    if (metrics.median_income >= 60000) {
      insights.push(`High-income area ($${metrics.median_income.toLocaleString()}) - premium pricing potential`)
    } else if (metrics.median_income <= 40000) {
      insights.push(`Budget-conscious area ($${metrics.median_income.toLocaleString()}) - focus on value pricing`)
    }
    
    if (metrics.population >= 15000) {
      insights.push(`Dense population area (${metrics.population.toLocaleString()}) - strong customer base`)
    }
    
    if (metrics.foot_traffic_index >= 70) {
      insights.push(`High foot traffic area - excellent visibility for walk-in customers`)
    }
    
    if (metrics.vacancy_index >= 60) {
      insights.push(`High vacancy rate - more available spaces and potentially lower rent`)
    }
    
    return insights
  }
}

module.exports = AIService
