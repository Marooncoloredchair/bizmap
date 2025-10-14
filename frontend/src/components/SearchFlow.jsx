import React, { useState } from 'react'
import axios from 'axios'
import RecentSearches from './RecentSearches'
import LoadingSpinner from './LoadingSpinner'
import { saveSearchToHistory, getSearchHistory, clearSearchHistory } from '../utils/searchHistory'
import { useDarkMode } from '../contexts/DarkModeContext'
import { useFadeIn, useSlideIn } from '../hooks/useAnimation'

const SearchFlow = ({ onSearchComplete, isLoading, setIsLoading }) => {
  const [step, setStep] = useState(1)
  const { isDarkMode } = useDarkMode()
  const fadeIn = useFadeIn(200)
  const slideIn = useSlideIn('up', 100)
  const [formData, setFormData] = useState({
    business: '',
    businessCategory: '',
    location: '',
    radius: '1 mile',
    priceTier: 'mid',
    daypart: 'both'
  })

  const businessCategories = [
    { value: 'restaurant', label: 'Restaurant & Food', subcategories: ['Fast Food', 'Fine Dining', 'Cafe', 'Food Truck', 'Bakery', 'Bar & Grill'] },
    { value: 'retail', label: 'Retail & Shopping', subcategories: ['Clothing', 'Electronics', 'Home & Garden', 'Beauty & Health', 'Books & Media', 'Sports & Outdoors'] },
    { value: 'service', label: 'Professional Services', subcategories: ['Legal', 'Accounting', 'Consulting', 'Real Estate', 'Insurance', 'Marketing'] },
    { value: 'healthcare', label: 'Healthcare & Wellness', subcategories: ['Medical Practice', 'Dental', 'Pharmacy', 'Fitness Center', 'Spa & Beauty', 'Mental Health'] },
    { value: 'education', label: 'Education & Training', subcategories: ['Tutoring', 'Language School', 'Music Lessons', 'Driving School', 'Professional Training', 'Childcare'] },
    { value: 'entertainment', label: 'Entertainment & Recreation', subcategories: ['Movie Theater', 'Arcade', 'Bowling', 'Escape Room', 'Art Gallery', 'Event Venue'] },
    { value: 'automotive', label: 'Automotive', subcategories: ['Auto Repair', 'Car Wash', 'Auto Parts', 'Gas Station', 'Car Dealership', 'Tire Shop'] },
    { value: 'other', label: 'Other', subcategories: ['Custom Business Type'] }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Save to search history
      saveSearchToHistory(formData)
      
      const response = await axios.post('/api/analyze', formData)
      onSearchComplete(response.data)
    } catch (error) {
      console.error('Error analyzing location:', error)
      
      // Better error handling with specific messages
      let errorMessage = 'Error analyzing location. Please try again.'
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again in a few moments.'
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid request. Please check your inputs and try again.'
        } else if (error.response.status === 404) {
          errorMessage = 'Service not available. Please try again later.'
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Unable to connect to the server. Please check your internet connection.'
      }
      
      // Show error in a more user-friendly way
      const errorDiv = document.createElement('div')
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm'
      errorDiv.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <span>${errorMessage}</span>
        </div>
      `
      document.body.appendChild(errorDiv)
      
      // Remove error message after 5 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv)
        }
      }, 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectRecentSearch = (searchData) => {
    setFormData(searchData)
    setStep(5) // Jump to final step since we have all data
  }

  const handleClearHistory = () => {
    clearSearchHistory()
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">What type of business are you planning?</h2>
            
            {/* Business Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">Choose a category:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {businessCategories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleInputChange('businessCategory', category.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.businessCategory === category.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    disabled={isLoading}
                    aria-pressed={formData.businessCategory === category.value}
                    aria-label={`Select ${category.label} business category`}
                  >
                    <div className="font-medium text-sm">{category.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Business Type Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Specific business type:</label>
              {formData.businessCategory && formData.businessCategory !== 'other' ? (
                <select
                  value={formData.business}
                  onChange={(e) => handleInputChange('business', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={isLoading}
                  aria-label="Select specific business type"
                >
                  <option value="">Select specific type...</option>
                  {businessCategories.find(cat => cat.value === formData.businessCategory)?.subcategories.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.business}
                  onChange={(e) => handleInputChange('business', e.target.value)}
                  placeholder="e.g., Coffee shop, Restaurant, Retail store..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                  onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                  aria-label="Enter specific business type"
                />
              )}
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Where? (city, ZIP, or "near me")</h2>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g. Providence, RI or 02903"
              className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleNext()}
            />
          </div>
        )
      
      case 3:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Trade radius?</h2>
            <div className="space-y-2">
              {['walking', '1 mile', '3 miles'].map(option => (
                <button
                  key={option}
                  onClick={() => handleInputChange('radius', option)}
                  className={`w-full max-w-md px-4 py-3 border rounded-lg text-lg ${
                    formData.radius === option 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )
      
      case 4:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Target price tier?</h2>
            <div className="space-y-2">
              {['budget', 'mid', 'premium'].map(option => (
                <button
                  key={option}
                  onClick={() => handleInputChange('priceTier', option)}
                  className={`w-full max-w-md px-4 py-3 border rounded-lg text-lg ${
                    formData.priceTier === option 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )
      
      case 5:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Preferred daypart?</h2>
            <div className="space-y-2">
              {['day', 'evening', 'both'].map(option => (
                <button
                  key={option}
                  onClick={() => handleInputChange('daypart', option)}
                  className={`w-full max-w-md px-4 py-3 border rounded-lg text-lg ${
                    formData.daypart === option 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-lg border-2 p-8 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-800'
        }`} style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 0, 0, 0.1)'}}>
          <LoadingSpinner message="Analyzing your location..." />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div 
        className={`rounded-lg border-2 p-8 transition-all duration-500 ease-out ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-800'
        }`} 
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 0, 0, 0.1)',
          opacity: fadeIn ? 1 : 0,
          transform: slideIn.transform,
          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
        }}
      >
        {renderStep()}
        
        {/* Recent Searches - only show on step 1 */}
        {step === 1 && (
          <RecentSearches 
            onSelectSearch={handleSelectRecentSearch}
            onClearHistory={handleClearHistory}
          />
        )}
        
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className={`px-6 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={isLoading || (step === 1 && (!formData.businessCategory || !formData.business.trim()))}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors duration-300"
          >
            {isLoading ? 'Analyzing...' : step === 5 ? 'Analyze Location' : 'Next'}
          </button>
        </div>
        
        <div className={`mt-4 text-center text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Step {step} of 5
        </div>
      </div>
    </div>
  )
}

export default SearchFlow
