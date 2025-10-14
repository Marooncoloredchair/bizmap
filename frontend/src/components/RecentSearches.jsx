import React from 'react'
import { getSearchHistory, formatSearchHistoryItem } from '../utils/searchHistory'

const RecentSearches = ({ onSelectSearch, onClearHistory }) => {
  const history = getSearchHistory().map(formatSearchHistoryItem)

  if (history.length === 0) {
    return null
  }

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">Recent Searches</h3>
        <button
          onClick={onClearHistory}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Clear All
        </button>
      </div>
      
      <div className="space-y-2">
        {history.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectSearch(item)}
            className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-gray-900">{item.displayText}</div>
                <div className="text-xs text-gray-500">
                  {item.radius} • {item.priceTier} • {item.daypart}
                </div>
              </div>
              <div className="text-xs text-gray-400">{item.timeAgo}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default RecentSearches
