import { useState, useEffect } from 'react'

export const useFadeIn = (delay = 0) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return isVisible
}

export const useSlideIn = (direction = 'up', delay = 0) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return 'translateY(20px)'
        case 'down':
          return 'translateY(-20px)'
        case 'left':
          return 'translateX(20px)'
        case 'right':
          return 'translateX(-20px)'
        default:
          return 'translateY(20px)'
      }
    }
    return 'translateY(0) translateX(0)'
  }

  return {
    isVisible,
    transform: getTransform(),
    opacity: isVisible ? 1 : 0
  }
}

export const useBounce = (delay = 0) => {
  const [isBouncing, setIsBouncing] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBouncing(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return isBouncing
}
