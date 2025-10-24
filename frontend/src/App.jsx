import React, { useState } from 'react'
import SearchFlow from './components/SearchFlow'
import AISearchInterface from './components/AISearchInterface'
import ResultsDisplay from './components/ResultsDisplay'
import ErrorBoundary from './components/ErrorBoundary'
import { DarkModeProvider, useDarkMode } from './contexts/DarkModeContext'
import './App.css'

function AppContent() {
  const [searchData, setSearchData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchMode, setSearchMode] = useState('ai') // 'ai' or 'traditional'
  const [isInConversation, setIsInConversation] = useState(false)
  const [showConversationInterface, setShowConversationInterface] = useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const handleSearchComplete = (data) => {
    setSearchData(data)
  }

  const handleNewSearch = () => {
    setSearchData(null)
    setIsLoading(false)
    setIsInConversation(false)
    setShowConversationInterface(false)
  }

  const handleConversationStart = () => {
    setShowConversationInterface(true)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Header with Mode Toggle */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSearchMode('ai')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              searchMode === 'ai'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            AI Search
          </button>
          <button
            onClick={() => setSearchMode('traditional')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              searchMode === 'traditional'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Traditional Search
          </button>
        </div>
        
        <button
          onClick={toggleDarkMode}
          className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isDarkMode ? (
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* BizMap Title */}
      {searchMode === 'ai' ? (
        <div className={`absolute top-48 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-500 ease-out ${
          searchData || showConversationInterface ? 'opacity-0 -translate-y-full scale-75' : 'opacity-100 translate-y-0 scale-100'
        }`}>
          <h1 className={`text-6xl font-bold transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-blue-600'
          }`}>BizMap</h1>
        </div>
      ) : (
        <div className="fixed top-4 left-4 z-20">
          <h1 className={`text-2xl font-extrabold ${isDarkMode ? 'text-white' : 'text-blue-600'}`}>BizMap</h1>
        </div>
      )}

      <main className="h-screen flex items-center justify-center px-4 relative pt-4 pb-4 overflow-hidden">

        {/* Search Interface - slides up and out */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out z-10 ${
          searchData ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}>
          <div className="text-center w-full max-w-6xl px-4">
            {searchMode === 'ai' ? (
              <AISearchInterface
                onSearchComplete={handleSearchComplete}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setIsInConversation={setIsInConversation}
                onConversationStart={handleConversationStart}
              />
            ) : (
              <SearchFlow
                onSearchComplete={handleSearchComplete}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
          </div>
        </div>
        {/* Results Display - slides up from bottom */}
        {searchData && (
          <div className={`w-full h-[85vh] transition-all duration-1000 ease-in-out z-0 ${
            searchData ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}>
            <ResultsDisplay
              data={searchData}
              onNewSearch={handleNewSearch}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <AppContent />
      </DarkModeProvider>
    </ErrorBoundary>
  )
}

export default App