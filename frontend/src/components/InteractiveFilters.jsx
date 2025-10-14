import React, { useState } from 'react'
import { useDarkMode } from '../contexts/DarkModeContext'

const InteractiveFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    radius: initialFilters.radius || 1,
    priceRange: initialFilters.priceRange || [30000, 80000],
    footTraffic: initialFilters.footTraffic || 50,
    vacancyRate: initialFilters.vacancyRate || 50,
    competitionLevel: initialFilters.competitionLevel || 3,
    ...initialFilters
  })

  const { isDarkMode } = useDarkMode()

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handlePriceRangeChange = (index, value) => {
    const newPriceRange = [...filters.priceRange]
    newPriceRange[index] = parseInt(value)
    handleFilterChange('priceRange', newPriceRange)
  }

  const resetFilters = () => {
    const defaultFilters = {
      radius: 1,
      priceRange: [30000, 80000],
      footTraffic: 50,
      vacancyRate: 50,
      competitionLevel: 3
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  return (
    <div className={`p-4 rounded-lg border-2 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-600' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Advanced Filters
        </h3>
        <button
          onClick={resetFilters}
          className="text-sm text-red-500 hover:text-red-600 font-medium"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-6">
        {/* Radius Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Search Radius: {filters.radius} mile{filters.radius !== 1 ? 's' : ''}
          </label>
          <input
            type="range"
            min="0.25"
            max="5"
            step="0.25"
            value={filters.radius}
            onChange={(e) => handleFilterChange('radius', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.25 mi</span>
            <span>5 mi</span>
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Income Range: ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
          </label>
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="range"
                min="20000"
                max="150000"
                step="5000"
                value={filters.priceRange[0]}
                onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-500 mt-1">Min: $20k</div>
            </div>
            <div className="flex-1">
              <input
                type="range"
                min="20000"
                max="150000"
                step="5000"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-500 mt-1">Max: $150k</div>
            </div>
          </div>
        </div>

        {/* Foot Traffic Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Foot Traffic: {filters.footTraffic}/100
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters.footTraffic}
            onChange={(e) => handleFilterChange('footTraffic', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Vacancy Rate Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Vacancy Rate: {filters.vacancyRate}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters.vacancyRate}
            onChange={(e) => handleFilterChange('vacancyRate', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low Availability</span>
            <span>High Availability</span>
          </div>
        </div>

        {/* Competition Level Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Competition Level: {filters.competitionLevel} competitors
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={filters.competitionLevel}
            onChange={(e) => handleFilterChange('competitionLevel', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>No Competition</span>
            <span>High Competition</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveFilters
