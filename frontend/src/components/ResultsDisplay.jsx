import React, { useState, useEffect } from 'react'
import LazyMap from './LazyMap'
import InteractiveFilters from './InteractiveFilters'
import { exportToPDF, exportMapToPDF } from '../utils/pdfExport'


const ResultsDisplay = ({ data, onNewSearch, isLoading, setIsLoading }) => {
  // Add safety checks for data structure
  const safeData = data || {}
  const locations = safeData.locations || []
  const bestLocation = safeData.best_location || locations[0]
  
  const [selectedLocation, setSelectedLocation] = useState(bestLocation)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({})
  
  // Update selected location when data changes
  useEffect(() => {
    if (bestLocation) {
      setSelectedLocation(bestLocation)
    }
  }, [bestLocation])

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    // Here you would typically re-run the analysis with new filters
    // For now, we'll just update the state
  }
  
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-100'
    if (score >= 50) return 'text-yellow-600 bg-yellow-100'
    return 'text-blue-600 bg-blue-100'
  }

  const getScoreLabel = (score) => {
    if (score >= 70) return 'Very Promising'
    if (score >= 50) return 'Moderate'
    return 'Needs Validation'
  }

  const getMetricColor = (value, metricType) => {
    switch (metricType) {
      case 'population':
        if (value >= 15000) return 'text-green-600'
        if (value >= 10000) return 'text-yellow-600'
        return 'text-blue-600'
      
      case 'competitors':
        if (value <= 2) return 'text-green-600'  // Fewer competitors = better
        if (value <= 5) return 'text-yellow-600'
        return 'text-blue-600'
      
      case 'income':
        if (value >= 60000) return 'text-green-600'
        if (value >= 45000) return 'text-yellow-600'
        return 'text-blue-600'
      
      case 'traffic':
        if (value >= 70) return 'text-green-600'
        if (value >= 50) return 'text-yellow-600'
        return 'text-blue-600'
      
      case 'vacancy':
        if (value >= 60) return 'text-green-600'  // Higher vacancy = more available space
        if (value >= 40) return 'text-yellow-600'
        return 'text-blue-600'
      
      default:
        return 'text-gray-900'
    }
  }

  const exportToCSV = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Business', safeData.business || 'Unknown'],
      ['Location', safeData.location || 'Unknown'],
      ['Radius', safeData.radius || '1 mile'],
      ['Score', selectedLocation?.score || bestLocation?.score || 0],
      ['Recommended Area', selectedLocation?.name || bestLocation?.name || ''],
      ['Population', selectedLocation?.metrics?.population || 0],
      ['Competitors', selectedLocation?.metrics?.competitors || 0],
      ['Median Income', selectedLocation?.metrics?.median_income || 0],
      ['Foot Traffic Index', selectedLocation?.metrics?.foot_traffic_index || 0],
      ['Vacancy Index', selectedLocation?.metrics?.vacancy_index || 0],
      ['Nearest Competitor Miles', selectedLocation?.metrics?.nearest_competitor_miles?.toFixed(1) || 0],
      ['Category Fit', selectedLocation?.metrics?.category_fit || 0],
      ['Confidence', safeData.confidence || 85]
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bizmap-analysis-${data.business}-${data.location.replace(/\s+/g, '-')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = async () => {
    try {
      await exportToPDF(data, selectedLocation)
    } catch (error) {
      alert('Error generating PDF: ' + error.message)
    }
  }

  const handleExportMapPDF = async () => {
    try {
      await exportMapToPDF('map-container')
    } catch (error) {
      alert('Error exporting map: ' + error.message)
    }
  }

  const nextSteps = [
    'Run a 2-week customer willingness-to-pay survey in the neighborhood',
    'Pull a 30-day foot traffic report (Placer.ai / SafeGraph)',
    'Contact local commercial realtor for vacant storefronts'
  ]

  return (
    <div className="h-[85vh] flex flex-col lg:flex-row relative rounded-2xl overflow-hidden" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 0, 0, 0.1)'}}>
      {/* Left Side Panel - Score and Statistics */}
      <div className="w-full lg:w-48 bg-white dark:bg-gray-800 border-r-2 border-gray-800 dark:border-gray-600 overflow-y-auto rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none" style={{boxShadow: '10px 0 25px rgba(0, 0, 0, 0.3)'}}>
        <div className="p-3 space-y-3">
          {/* Selected Location Score */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-xl font-bold ${getScoreColor(selectedLocation?.score || data.best_location?.score || 0)}`}>
              {selectedLocation?.score || data.best_location?.score || 0}%
            </div>
            <h3 className="mt-2 text-base font-bold text-gray-900">
              {selectedLocation?.scoreLabel || getScoreLabel(selectedLocation?.score || data.best_location?.score || 0)}
            </h3>
            <p className="mt-1 text-xs text-gray-600">
              <span className="font-bold">{selectedLocation?.name || data.best_location?.name || 'Location'}</span>
            </p>
            {data.caution && (
              <div className="mt-1 p-1 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p className="text-yellow-800">{data.caution}</p>
              </div>
            )}
          </div>

          {/* Locations List */}
          <div>
            <h3 className="text-sm font-bold mb-2 text-gray-900">All Locations</h3>
            <div className="space-y-1">
              {locations.length > 0 ? (
                locations.sort((a, b) => (a.rank || 0) - (b.rank || 0)).map((location, index) => (
                  <div 
                    key={index}
                    onClick={() => setSelectedLocation(location)}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedLocation?.name === location.name 
                        ? 'bg-blue-100 border-2 border-blue-500' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-xs">{location.name || 'Unknown Location'}</div>
                        <div className="text-xs text-gray-600">Rank #{location.rank || index + 1}</div>
                      </div>
                      <div className={`px-1 py-1 rounded text-xs font-bold ${getScoreColor(location.score || 0)}`}>
                        {location.score || 0}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-gray-500 text-xs">
                  No locations found. Please try a different search.
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Statistics with Progress Bars */}
          <div>
            <h3 className="text-sm font-bold mb-2 text-gray-900">
              Opportunity Analysis
            </h3>
            <div className="space-y-2">
              {/* Competition Analysis */}
              <div className="p-2 bg-gray-50 rounded">
                <div className="mb-1">
                  <div className="text-xs font-medium text-gray-700 mb-1">Low Competition</div>
                  <div className="text-xs font-bold text-gray-900">
                    {selectedLocation?.metrics?.competitors || 0} competitor{(selectedLocation?.metrics?.competitors || 0) !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max((selectedLocation?.subscores?.competitor_penalty || 0) * 100, 5)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedLocation?.metrics?.nearest_competitor_miles?.toFixed(1) || 0} miles to nearest
                </div>
              </div>

              {/* Demand Analysis */}
              <div className="p-2 bg-gray-50 rounded">
                <div className="mb-1">
                  <div className="text-xs font-medium text-gray-700 mb-1">Population Demand</div>
                  <div className="text-xs font-bold text-gray-900">
                    {(selectedLocation?.metrics?.population || 0).toLocaleString()}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max((selectedLocation?.subscores?.demand_score || 0) * 100, 5)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  High density area
                </div>
              </div>

              {/* Income Analysis */}
              <div className="p-2 bg-gray-50 rounded">
                <div className="mb-1">
                  <div className="text-xs font-medium text-gray-700 mb-1">Spending Power</div>
                  <div className="text-xs font-bold text-gray-900">
                    ${(selectedLocation?.metrics?.median_income || 0).toLocaleString()}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max((selectedLocation?.subscores?.income_score || 0) * 100, 5)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Median household income
                </div>
              </div>

              {/* Foot Traffic Analysis */}
              <div className="p-2 bg-gray-50 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700 flex-shrink-0">Foot Traffic</span>
                  <span className="text-xs font-bold text-gray-900 flex-shrink-0 ml-2">
                    {selectedLocation?.metrics?.foot_traffic_index || 0}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max((selectedLocation?.subscores?.traffic_score || 0) * 100, 5)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Daily visibility score
                </div>
              </div>

              {/* Market Fit Analysis */}
              <div className="p-2 bg-gray-50 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700 flex-shrink-0">Market Fit</span>
                  <span className="text-xs font-bold text-gray-900 flex-shrink-0 ml-2">
                    {Math.round((selectedLocation?.subscores?.category_fit || 0) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max((selectedLocation?.subscores?.category_fit || 0) * 100, 5)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Complementary business mix
                </div>
              </div>

              {/* Vacancy Analysis */}
              <div className="p-2 bg-gray-50 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700 flex-shrink-0">Space Availability</span>
                  <span className="text-xs font-bold text-gray-900 flex-shrink-0 ml-2">
                    {selectedLocation?.metrics?.vacancy_index || 0}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max((selectedLocation?.subscores?.vacancy_score || 0) * 100, 5)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Available storefronts
                </div>
              </div>

              {/* Distance Analysis */}
              <div className="p-2 bg-gray-50 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700 flex-shrink-0">Exclusivity</span>
                  <span className="text-xs font-bold text-gray-900 flex-shrink-0 ml-2">
                    {selectedLocation?.metrics?.nearest_competitor_miles?.toFixed(1) || 0} miles
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max((selectedLocation?.subscores?.nearest_distance_score || 0) * 100, 5)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Distance to nearest competitor
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

              {/* Center Map */}
              <div className="flex-1 relative h-64 lg:h-auto">
                <LazyMap 
                  data={data}
                  selectedLocation={selectedLocation}
                  onLocationSelect={setSelectedLocation}
                />
        
        {/* Map Overlay with BizMap title and controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-[1000]">
          <h1 className="text-4xl font-bold text-white" style={{textShadow: '0 0 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.6), 0 0 30px rgba(0,0,0,0.4)'}}>BizMap</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-white text-blue-500 rounded-lg font-semibold hover:bg-gray-100 shadow-lg"
            >
              {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
            <button
              onClick={onNewSearch}
              className="px-6 py-3 bg-white text-blue-500 rounded-lg font-semibold hover:bg-gray-100 shadow-lg"
            >
              New Search
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="absolute top-20 right-4 z-[1000] w-80">
            <InteractiveFilters 
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
            />
          </div>
        )}
      </div>

              {/* Right Side Panel - Next Steps and Actions */}
              <div className="w-full lg:w-48 bg-white dark:bg-gray-800 border-l-2 border-gray-800 dark:border-gray-600 overflow-y-auto rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none" style={{boxShadow: '-10px 0 25px rgba(0, 0, 0, 0.3)'}}>
        <div className="p-3 space-y-3">
          {/* Opportunity Highlights */}
          <div>
            <h3 className="text-sm font-bold mb-2 text-gray-900 dark:text-white">Why {selectedLocation?.name || 'This Location'}?</h3>
            <div className="space-y-2">
              {selectedLocation?.metrics?.competitors <= 2 && (
                <div className="flex items-start space-x-2">
                  <span className="text-green-500 text-sm">✅</span>
                  <span className="text-xs text-gray-700">
                    Only {selectedLocation?.metrics?.competitors} competitors within 1 mile (low competition)
                  </span>
                </div>
              )}
              {selectedLocation?.metrics?.median_income >= 60000 && (
                <div className="flex items-start space-x-2">
                  <span className="text-green-500 text-sm">✅</span>
                  <span className="text-xs text-gray-700">
                    High median income ${selectedLocation?.metrics?.median_income?.toLocaleString()} (premium pricing potential)
                  </span>
                </div>
              )}
              {selectedLocation?.metrics?.population >= 15000 && (
                <div className="flex items-start space-x-2">
                  <span className="text-green-500 text-sm">✅</span>
                  <span className="text-xs text-gray-700">
                    Strong population base of {selectedLocation?.metrics?.population?.toLocaleString()} people
                  </span>
                </div>
              )}
              {selectedLocation?.subscores?.category_fit >= 0.7 && (
                <div className="flex items-start space-x-2">
                  <span className="text-green-500 text-sm">✅</span>
                  <span className="text-xs text-gray-700">
                    High market fit ({Math.round((selectedLocation?.subscores?.category_fit || 0) * 100)}%) - complementary businesses nearby
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div>
            <h3 className="text-sm font-bold mb-2 text-gray-900">Next Steps</h3>
            <ol className="space-y-2">
              {nextSteps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
                    {index + 1}
                  </span>
                  <span className="text-xs text-gray-700 leading-relaxed font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </div>

                  {/* Actions */}
                  <div className="space-y-1">
                    <button
                      onClick={handleExportPDF}
                      className="w-full px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 font-bold text-xs"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={handleExportMapPDF}
                      className="w-full px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 font-bold text-xs"
                    >
                      Export Map
                    </button>
                    <button
                      onClick={exportToCSV}
                      className="w-full px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 font-bold text-xs"
                    >
                      Download CSV
                    </button>
                    <button
                      onClick={onNewSearch}
                      className="w-full px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 font-bold text-xs"
                    >
                      Re-run Search
                    </button>
                  </div>

                  {/* QR Code for Feedback */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-2 font-medium">Help us improve!</p>
                      <div className="bg-white rounded-lg shadow-md p-2 border-2 border-blue-200 inline-block">
                        <img 
                          src="/QR.jpg" 
                          alt="QR Code for Feedback" 
                          className="w-20 h-20 rounded"
                          title="Scan to provide feedback"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Scan for feedback</p>
                    </div>
                  </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsDisplay
