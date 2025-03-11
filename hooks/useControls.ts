// useControls.ts - Simplified for both mobile and desktop

'use client'

import { useState, useEffect } from 'react'

// Create a singleton instance of the controls state
let upState = false;
let controlsListeners: (() => void)[] = [];

// Function to notify all listeners when the state changes
function notifyListeners() {
  controlsListeners.forEach(listener => listener());
}

export default function useControls() {
  const [controls, setControls] = useState({ up: upState });
  
  // Function to handle flap
  const flap = () => {
    upState = true;
    setControls({ up: true });
    notifyListeners();
    
    // Auto-reset after a short delay (similar to a quick tap)
    setTimeout(() => {
      upState = false;
      setControls({ up: false });
      notifyListeners();
    }, 100);
  }
  
  useEffect(() => {
    // Space key control
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !upState) {
        flap();
      }
    }
    
    // Synchronize with the global state
    const syncState = () => {
      setControls({ up: upState });
    }
    
    controlsListeners.push(syncState);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      controlsListeners = controlsListeners.filter(listener => listener !== syncState);
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);
  
  return { ...controls, flap };
}