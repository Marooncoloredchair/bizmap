import React, { useState, useRef, useEffect } from 'react'
import { useDarkMode } from '../contexts/DarkModeContext'
import { useFadeIn, useSlideIn } from '../hooks/useAnimation'

const AISearchInterface = ({ onSearchComplete, isLoading, setIsLoading, setIsInConversation, onConversationStart }) => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentStep, setCurrentStep] = useState('search') // 'search' or 'conversation'
  const [searchData, setSearchData] = useState({})
  const messagesEndRef = useRef(null)
  const typingIntervalRef = useRef(null)
  const aiMessageIdRef = useRef(null)
  const { isDarkMode } = useDarkMode()
  const fadeIn = useFadeIn(200)
  const slideIn = useSlideIn('up', 100)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cleanup typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }
    }
  }, [])

  const addMessage = (sender, text, options = {}) => {
    const newMessage = {
      id: Date.now(),
      sender,
      text,
      timestamp: new Date(),
      ...options
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }

  const simulateTyping = (text, callback) => {
    // Clear any existing typing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
    }
    
    setIsTyping(true)
    let index = 0
    const words = text.split(' ')
    typingIntervalRef.current = setInterval(() => {
      if (index < words.length) {
        const partialText = words.slice(0, index + 1).join(' ')
        callback(partialText)
        index++
      } else {
        clearInterval(typingIntervalRef.current)
        typingIntervalRef.current = null
        setIsTyping(false)
      }
    }, 100)
  }

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    
    // Add user message
    addMessage('user', userMessage)
    
    // Extract info from user message and update searchData
    updateSearchDataFromMessage(userMessage)
    
    // If this is the first message, transition to conversation mode
    if (currentStep === 'search') {
      setCurrentStep('conversation')
      // Immediately trigger conversation start for logo animation
      setIsInConversation(true)
      onConversationStart && onConversationStart()
    }

    setIsLoading(true)
    setIsTyping(true)

    // Decide how to route this message
    const lowerMsg = userMessage.toLowerCase()
    const isAffirmative = /\b(yes|yeah|yep|sure|ok|okay|affirmative)\b/.test(lowerMsg)
    const isExplicitAnalyze = lowerMsg.includes('analyze locations now') ||
                              lowerMsg.includes('show locations') ||
                              lowerMsg.includes('analyze locations') ||
                              lowerMsg.includes('start analysis') ||
                              lowerMsg.includes("let's analyze") ||
                              lowerMsg.includes('begin analysis')

    // Helper: ask the next follow-up question if key details are missing
    const askNextQuestionIfNeeded = () => {
      const missing = []
      if (!searchData.location_preference) missing.push('location')
      if (!searchData.budget_tier) missing.push('budget')
      if (!searchData.operating_hours) missing.push('hours')
      if (!searchData.target_demographic) missing.push('demographics')

      if (missing.length === 0) {
        return false
      }

      let q = ''
      const first = missing[0]
      if (first === 'location') {
        q = 'Great! Which area are you targeting? Downtown, neighborhood, or a specific part of the city?'
      } else if (first === 'budget') {
        q = "What's your approximate monthly budget for rent? Low, mid, or premium?"
      } else if (first === 'hours') {
        q = 'What hours will you operate? Daytime, evenings, or both?'
      } else if (first === 'demographics') {
        q = "Who's your target customer? Professionals, students, families, or a mix?"
      }
      addMessage('ai', q)
      return true
    }

    // Helper: extract info from user message and update searchData
    const updateSearchDataFromMessage = (message) => {
      const lowerMsg = message.toLowerCase()
      const updates = {}
      
      // Extract location info
      if (lowerMsg.includes('downtown') || lowerMsg.includes('city center')) {
        updates.location_preference = 'downtown'
      } else if (lowerMsg.includes('neighborhood') || lowerMsg.includes('residential')) {
        updates.location_preference = 'neighborhood'
      } else if (lowerMsg.includes('suburb')) {
        updates.location_preference = 'suburban'
      }
      
      // Extract business type
      if (lowerMsg.includes('barber') || lowerMsg.includes('barbershop')) {
        updates.business_type = 'Barbershop'
        updates.business_category = 'service'
      } else if (lowerMsg.includes('coffee') || lowerMsg.includes('cafe')) {
        updates.business_type = 'Coffee Shop'
        updates.business_category = 'restaurant'
      } else if (lowerMsg.includes('restaurant') || lowerMsg.includes('food')) {
        updates.business_type = 'Restaurant'
        updates.business_category = 'restaurant'
      }
      
      // Extract demographics
      if (lowerMsg.includes('mix') || lowerMsg.includes('everyone') || lowerMsg.includes('anyone')) {
        updates.target_demographic = 'general population'
      } else if (lowerMsg.includes('professional')) {
        updates.target_demographic = 'professionals'
      } else if (lowerMsg.includes('student')) {
        updates.target_demographic = 'students'
      } else if (lowerMsg.includes('family')) {
        updates.target_demographic = 'families'
      }
      
      // Extract budget info
      if (lowerMsg.includes('budget') || lowerMsg.includes('cheap') || lowerMsg.includes('affordable')) {
        updates.budget_tier = 'budget'
      } else if (lowerMsg.includes('premium') || lowerMsg.includes('luxury') || lowerMsg.includes('high-end')) {
        updates.budget_tier = 'premium'
      } else if (lowerMsg.includes('mid') || lowerMsg.includes('medium')) {
        updates.budget_tier = 'mid'
      }
      
      // Extract hours
      if (lowerMsg.includes('morning') || lowerMsg.includes('day')) {
        updates.operating_hours = 'day'
      } else if (lowerMsg.includes('evening') || lowerMsg.includes('night')) {
        updates.operating_hours = 'evening'
      } else if (lowerMsg.includes('both') || lowerMsg.includes('all day')) {
        updates.operating_hours = 'both'
      }
      
      // Update searchData with extracted info
      if (Object.keys(updates).length > 0) {
        setSearchData(prev => ({ ...prev, ...updates }))
        console.log('Updated searchData with:', updates)
      }
    }

    // If the user simply says yes, check if we have enough info to proceed
    if (isAffirmative && !isExplicitAnalyze) {
      // Check if we have the minimum required info
      const hasBusinessType = searchData.business_type && searchData.business_type !== 'General Business'
      const hasLocation = searchData.location_preference || userMessage.toLowerCase().includes('downtown') || userMessage.toLowerCase().includes('providence')
      
      if (hasBusinessType && hasLocation) {
        // We have enough info, proceed to analysis
        addMessage('ai', "Perfect! Let me analyze the best locations for you...")
        
        // Set location preference if not already set
        if (!searchData.location_preference) {
          if (userMessage.toLowerCase().includes('downtown')) {
            setSearchData(prev => ({ ...prev, location_preference: 'downtown' }))
          } else if (userMessage.toLowerCase().includes('providence')) {
            setSearchData(prev => ({ ...prev, location_preference: 'Providence, RI' }))
          }
        }
        
        // Proceed to analysis
        try {
          console.log('Proceeding to analysis with searchData:', searchData);
          const response = await fetch('/api/ai-analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userInput: 'proceed with analysis',
              context: searchData,
              currentStep: 'analysis'
            })
          })

          if (!response.ok) {
            throw new Error(`HTTP error during ai-analyze: ${response.status}`)
          }
          const data = await response.json()
          console.log('AI analysis response:', data)
          
          if (data.error) {
            throw new Error(data.error)
          }

          // Use the full analysis data from backend (prefer /analyze for consistent structure)
          if (data && data.locations) {
            setTimeout(() => onSearchComplete(data), 800)
            return
          }

          // Build payload for /analyze using analysis context
          const analyzePayload = {
            business: searchData.business_type || 'Restaurant',
            location: searchData.location_preference || 'Providence, RI',
            radius: '1 mile',
            priceTier: searchData.budget_tier || 'mid',
            daypart: searchData.operating_hours || 'both'
          }

          console.log('Sending analyze request with payload:', analyzePayload)

          const analyzeRes = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(analyzePayload)
          })
          
          if (!analyzeRes.ok) {
            throw new Error(`HTTP error during analyze: ${analyzeRes.status}`)
          }
          
          const analyzeData = await analyzeRes.json()
          console.log('Analyze response data:', analyzeData)
          
          // Ensure the data has the required structure for ResultsDisplay
          const transformedData = {
            business: searchData.business_type || 'Restaurant',
            location: searchData.location_preference || 'Providence, RI',
            radius: '1 mile',
            confidence: searchData.confidence_score || 85,
            ...analyzeData
          }
          
          console.log('Transformed data for ResultsDisplay:', transformedData)
          setTimeout(() => onSearchComplete(transformedData), 800)
          return
        } catch (error) {
          console.error('Error:', error)
          addMessage('ai', "I'm sorry, I encountered an error while analyzing locations. Please try again.")
          return
        }
      } else {
        // Ask for the next missing detail, if any
        const asked = askNextQuestionIfNeeded()
        if (!asked) {
          // If we already have enough info, ask for explicit confirmation
          addMessage('ai', 'Awesome. When you are ready, say "analyze locations now" and I will run the analysis.')
        }
      }
      setIsLoading(false)
      setIsTyping(false)
      return
    }

    // Check if user explicitly wants to proceed to analysis
    const proceedToAnalysis = isExplicitAnalyze

    if (proceedToAnalysis && searchData.business_type) {
      // Require minimum context before analysis
      if (!searchData.location_preference) {
        addMessage('ai', 'Before I analyze locations, which area are you most interested in? Downtown, neighborhood, or a specific district?')
        setIsLoading(false)
        setIsTyping(false)
        return
      }
      // User wants to proceed to analysis - call the backend to get full analysis
      addMessage('ai', "Perfect! Let me analyze the best locations for you...")
      
      try {
        console.log('Sending analysis request with context:', searchData);
        const response = await fetch('/api/ai-analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userInput: 'proceed with analysis',
            context: searchData,
            currentStep: 'analysis'
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error during ai-analyze: ${response.status}`)
        }
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        // Use the full analysis data from backend (prefer /analyze for consistent structure)
        if (data && data.locations) {
          setTimeout(() => onSearchComplete(data), 800)
          return
        }

        // Build payload for /analyze using analysis context
        const analyzePayload = {
          business: searchData.business_type || 'Restaurant',
          location: searchData.location_preference || 'Providence, RI',
          radius: '1 mile',
          priceTier: searchData.budget_tier || 'mid',
          daypart: searchData.operating_hours || 'both'
        }

        console.log('Sending analyze request with payload:', analyzePayload)

        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analyzePayload)
        })
        if (!analyzeRes.ok) {
          throw new Error(`HTTP error during analyze: ${analyzeRes.status}`)
        }
        const analyzeData = await analyzeRes.json()
        console.log('Analyze response data:', analyzeData)
        
        // Ensure the data has the required structure for ResultsDisplay
        const transformedData = {
          business: searchData.business_type || 'Restaurant',
          location: searchData.location_preference || 'Providence, RI',
          radius: '1 mile',
          confidence: searchData.confidence_score || 85,
          ...analyzeData
        }
        
        console.log('Transformed data for ResultsDisplay:', transformedData)
        setTimeout(() => onSearchComplete(transformedData), 800)
        return
      } catch (error) {
        console.error('Error:', error)
        addMessage('ai', "I'm sorry, I encountered an error while analyzing locations. Please try again.")
        return
      }
    }

    try {
      console.log('Sending AI request:', { userMessage, searchData, currentStep })
      
      const response = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: userMessage,
          context: searchData,
          currentStep
        })
      })

      console.log('AI response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('AI response data:', data)
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Update search data with AI analysis
      setSearchData(prev => ({ ...prev, ...data.analysis }))
      
      // Store the full context for later use
      if (data.analysis) {
        setSearchData(prev => ({ ...prev, analysis: data.analysis }))
      }

      // Generate AI response
      let aiResponse = ''
      let nextStep = currentStep

      if (data.analysis.confidence_score >= 80) {
        // High confidence - start conversation but don't go to analysis yet
        aiResponse = `Great! I understand you want to start a ${data.analysis.business_type.toLowerCase()}. I can help you find the perfect location. `
        if (data.analysis.location_preference && data.analysis.location_preference !== 'Any Location') {
          aiResponse += `I see you're interested in ${data.analysis.location_preference} areas. `
        }
        aiResponse += `Would you like me to analyze some potential locations for you?`
        nextStep = 'conversation'
      } else {
        // Low confidence - ask clarifying questions
        aiResponse = `I'd like to help you find the perfect location for your ${data.analysis.business_type.toLowerCase()}. `
        if (data.analysis.suggested_questions && data.analysis.suggested_questions.length > 0) {
          aiResponse += data.analysis.suggested_questions[0]
        } else if (data.analysis.follow_up_question) {
          aiResponse += data.analysis.follow_up_question
        } else {
          aiResponse += "Could you provide more details about your business idea?"
        }
        nextStep = 'conversation'
      }

      // Reset AI message ID for new response
      aiMessageIdRef.current = null
      
      // Simulate typing for AI response
      simulateTyping(aiResponse, (partialText) => {
        if (aiMessageIdRef.current) {
          // Update existing AI message
          setMessages(prev => {
            const newMessages = [...prev]
            const messageIndex = newMessages.findIndex(msg => msg.id === aiMessageIdRef.current)
            if (messageIndex !== -1) {
              newMessages[messageIndex] = { ...newMessages[messageIndex], text: partialText }
            }
            return newMessages
          })
        } else {
          // Create new AI message
          const newMessage = addMessage('ai', partialText)
          aiMessageIdRef.current = newMessage.id
        }
      })

      setCurrentStep(nextStep)
      
      // Set conversation state for logo fade
      if (nextStep === 'conversation') {
        setIsInConversation(true)
        console.log('Starting conversation, calling onConversationStart')
        onConversationStart && onConversationStart()
      }

    } catch (error) {
      console.error('Error:', error)
      
      // Fallback response based on user input
      let fallbackResponse = "I'd love to help you find the perfect location! "
      
      if (userMessage.toLowerCase().includes('barber') || userMessage.toLowerCase().includes('barbershop')) {
        fallbackResponse += "A barbershop is a great business idea! Where are you thinking of opening it? Are you looking for a downtown location or a neighborhood spot?"
      } else if (userMessage.toLowerCase().includes('coffee') || userMessage.toLowerCase().includes('cafe')) {
        fallbackResponse += "A coffee shop sounds wonderful! What type of atmosphere are you going for? Are you thinking downtown or a quieter area?"
      } else if (userMessage.toLowerCase().includes('restaurant') || userMessage.toLowerCase().includes('food')) {
        fallbackResponse += "A restaurant is exciting! What cuisine are you planning? And where are you thinking of opening it?"
      } else {
        fallbackResponse += "Tell me more about your business idea! What type of business are you planning and where would you like to open it?"
      }
      
      addMessage('ai', fallbackResponse)
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const resetConversation = () => {
    setMessages([])
    setSearchData({})
    setCurrentStep('search')
    setInputValue('')
    setIsInConversation(false)
    aiMessageIdRef.current = null
  }

  return (
    <div 
      className={`w-full flex items-center justify-center transition-all duration-700 ease-in-out ${
        currentStep === 'search' ? 'h-screen' : 'h-auto'
      }`}
      style={{
        opacity: fadeIn ? 1 : 0,
        transform: slideIn.transform,
        transition: 'opacity 0.7s ease-out, transform 0.7s ease-out, height 0.7s ease-in-out'
      }}
    >
      {currentStep === 'search' ? (
        // Initial Search State - Enhanced with animations and visual elements
        <div className="w-full max-w-2xl flex flex-col items-center space-y-8">
          {/* Animated Search Bar Container */}
          <div className="relative w-full max-w-lg" style={{ animation: 'fadeInUp 1.2s ease-out' }}>
            <form onSubmit={handleSendMessage} className="relative flex flex-col items-center space-y-4">
              <div className="relative w-full">
                {/* SVG Border with Tracing Animation */}
                <div className="absolute -inset-1 rounded-full pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none" style={{ pointerEvents: 'none' }}>
                    <rect
                      x="0.5"
                      y="0.5"
                      width="99"
                      height="19"
                      rx="9.5"
                      ry="9.5"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="10 90"
                      strokeDashoffset="0"
                      style={{
                        animation: 'trace-border 1.5s linear infinite'
                      }}
                    />
                  </svg>
                </div>
                
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="tell me your business ideas"
                  disabled={isLoading}
                  className={`w-full px-6 py-4 text-lg rounded-full border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300
                    bg-black/70 border-gray-400 text-white placeholder-gray-300 shadow-2xl
                  `}
                />
                {/* Search Icon */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <button
                type="submit"
                className="px-8 py-3 bg-blue-500 text-white font-bold rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                disabled={isLoading || !inputValue.trim()}
              >
                {isLoading ? 'Analyzing...' : 'Search'}
              </button>
            </form>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl" style={{ animation: 'fadeInUp 1.4s ease-out' }}>
            <div className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Smart Location Analysis</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">AI-powered insights</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Data-Driven Insights</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Real market data</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Instant Results</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Quick analysis</p>
            </div>
          </div>
        </div>
      ) : (
        // Conversation State - Full Chat Interface (With Box)
        <div 
          className={`max-w-4xl mx-auto h-[600px] flex flex-col rounded-2xl border-2 transform transition-all duration-700 ease-in-out ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-800'
          }`}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 0, 0, 0.1)',
            animation: 'slideInUp 0.7s ease-out'
          }}
        >
          {/* Header */}
          <div className={`p-4 border-b-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <div>
                  <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    AI Business Assistant
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isTyping ? 'Typing...' : 'Online'}
                  </p>
                </div>
              </div>
              <button
                onClick={resetConversation}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                New Search
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className={`text-xs mt-2 ${
                    message.sender === 'user' 
                      ? 'text-blue-100' 
                      : isDarkMode 
                      ? 'text-gray-400' 
                      : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`p-4 border-t-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Continue the conversation..."
                disabled={isLoading}
                className={`flex-1 px-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors font-medium"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AISearchInterface
