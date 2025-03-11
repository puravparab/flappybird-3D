'use client'

import { useState, useEffect } from 'react'

export default function useControls() {
  const [controls, setControls] = useState({
    up: false
  })
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setControls(prev => ({ ...prev, up: true }))
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setControls(prev => ({ ...prev, up: false }))
      }
    }
    
    // Handle touch controls for mobile
    const handleTouchStart = () => {
      setControls(prev => ({ ...prev, up: true }))
    }
    
    const handleTouchEnd = () => {
      setControls(prev => ({ ...prev, up: false }))
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])
  
  return controls
}