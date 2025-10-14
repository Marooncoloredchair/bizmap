import React, { Suspense, lazy } from 'react'

// Lazy load the map component
const MapComponent = lazy(() => import('./MapComponent'))

const LazyMap = (props) => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    }>
      <MapComponent {...props} />
    </Suspense>
  )
}

export default LazyMap
