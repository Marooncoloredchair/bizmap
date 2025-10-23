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

  const handleConversationStart = () => {
    console.log('Conversation started, hiding logo')
    setShowConversationInterface(true)
  }

  const handleNewSearch = () => {
    setSearchData(null)
  }

  const toggleSearchMode = () => {
    setSearchMode(prev => prev === 'ai' ? 'traditional' : 'ai')
    setSearchData(null)
  }

  return (
    <div className={`h-screen overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>

      {/* Controls */}
      <div className="fixed top-4 right-4 z-50 flex space-x-2">
        {/* Search Mode Toggle */}
        <button
          onClick={toggleSearchMode}
          className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Toggle search mode"
        >
          {searchMode === 'ai' ? (
            <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Toggle dark mode"
        >
        {isDarkMode ? (
          <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
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