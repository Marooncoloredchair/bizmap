// Search history management utilities
export const saveSearchToHistory = (searchData) => {
  try {
    const history = getSearchHistory()
    const newSearch = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...searchData
    }
    
    // Add to beginning of array and limit to 10 recent searches
    const updatedHistory = [newSearch, ...history.filter(item => 
      !(item.business === searchData.business && item.location === searchData.location)
    )].slice(0, 10)
    
    localStorage.setItem('bizmap_search_history', JSON.stringify(updatedHistory))
    return updatedHistory
  } catch (error) {
    console.error('Error saving search history:', error)
    return []
  }
}

export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem('bizmap_search_history')
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('Error loading search history:', error)
    return []
  }
}

export const clearSearchHistory = () => {
  try {
    localStorage.removeItem('bizmap_search_history')
    return []
  } catch (error) {
    console.error('Error clearing search history:', error)
    return []
  }
}

export const formatSearchHistoryItem = (item) => {
  const date = new Date(item.timestamp)
  const timeAgo = getTimeAgo(date)
  return {
    ...item,
    displayText: `${item.business} in ${item.location}`,
    timeAgo
  }
}

const getTimeAgo = (date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}
