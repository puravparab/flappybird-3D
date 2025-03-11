'use client'

import { useEffect } from 'react'

interface UIProps {
  score: number
  highScore: number // Added high score prop
  gameState: 'start' | 'playing' | 'gameOver'
  onStart: () => void
  onRestart: () => void
}

export default function UI({ score, highScore, gameState, onStart, onRestart }: UIProps) {
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
      {/* Score display - only show current score during gameplay */}
      {gameState === 'playing' && (
        <div className="absolute top-4 left-0 right-0 text-center">
          <h2 className="text-4xl font-bold text-white drop-shadow-lg">
            {score}
          </h2>
        </div>
      )}
      
      {/* Start screen */}
      {gameState === 'start' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
          <h1 className="text-5xl font-bold text-white mb-8">Flappy Bird 3D</h1>
          {/* Display high score on start screen if it exists */}
          {highScore > 0 && (
            <p className="text-2xl text-white mb-4">High Score: {highScore}</p>
          )}
          <button 
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full shadow-lg pointer-events-auto"
            onClick={onStart}
          >
            Start Game
          </button>
          <p className="mt-4 text-white">Press Space to flap</p>
        </div>
      )}
      
      {/* Game over screen */}
      {gameState === 'gameOver' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
          <h1 className="text-5xl font-bold text-red-400 mb-4">Game Over</h1>
          <p className="text-xl text-white mb-2">Score: {score}</p>
					{score === highScore && score > 0 ?
						<p className="text-xl text-green-400 mb-8">
							New Record! 🎉
						</p> :
						<p className="text-xl text-white mb-8">
							Your High Score: {highScore}
						</p>
					}
					
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