import React from 'react'

const LoadingSpinner = ({ message = 'Analyzing location...', size = 'large' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div className="w-full h-full border-4 border-red-200 border-t-red-500 rounded-full"></div>
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-gray-900">{message}</p>
        <p className="text-sm text-gray-600 mt-1">This may take a few moments...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
