import React, { useState } from 'react'
import { DarkModeProvider, useDarkMode } from './contexts/DarkModeContext'
import './App.css'

function AppContent() {
  const [searchMode, setSearchMode] = useState('ai')
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="flex justify-between items-center p-4">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-blue-600'}`}>
          BizMap Test
        </h1>
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Toggle Dark Mode
        </button>
      </div>
      
      <main className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Test Page</h2>
          <p className="text-lg">If you can see this, the basic app is working!</p>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <DarkModeProvider>
      <AppContent />
    </DarkModeProvider>
  )
}

export default App
