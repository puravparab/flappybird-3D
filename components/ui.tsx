'use client'

import { useEffect } from 'react'

interface UIProps {
  score: number
  gameState: 'start' | 'playing' | 'gameOver'
  onStart: () => void
  onRestart: () => void
}

export default function UI({ score, gameState, onStart, onRestart }: UIProps) {
  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (gameState === 'start') onStart()
        if (gameState === 'gameOver') onRestart()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, onStart, onRestart])

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Score display - always visible when playing or game over */}
      {(gameState === 'playing' || gameState === 'gameOver') && (
        <div className="absolute top-4 left-0 right-0 text-center">
          <h2 className="text-4xl font-bold text-white drop-shadow-lg">
            {score}
          </h2>
        </div>
      )}
      
      {/* Start screen */}
      {gameState === 'start' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
          <h1 className="text-5xl font-bold text-white mb-8">3D Flappy Bird</h1>
          <button 
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full shadow-lg pointer-events-auto"
            onClick={onStart}
          >
            Start Game
          </button>
          <p className="mt-4 text-white">Use Space to flap</p>
        </div>
      )}
      
      {/* Game over screen */}
      {gameState === 'gameOver' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
          <h1 className="text-5xl font-bold text-white mb-4">Game Over</h1>
          <p className="text-xl text-white mb-8">Score: {score}</p>
          <button 
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full shadow-lg pointer-events-auto"
            onClick={onRestart}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}