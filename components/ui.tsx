'use client'

import { useEffect } from 'react'
import useControls from '@/hooks/useControls'

interface UIProps {
  score: number
  highScore: number
  gameState: 'start' | 'playing' | 'gameOver'
  onStart: () => void
  onRestart: () => void
}

export default function UI({ score, highScore, gameState, onStart, onRestart }: UIProps) {
  const { flap } = useControls()
  
  // Handle keyboard controls for starting/restarting
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

  // Handle sharing to Twitter
  const shareToTwitter = () => {
    const isHighScore = score === highScore && score > 0;
    const shareText = isHighScore 
      ? `I just set a new high score of ${score} in Flappy Bird 3D! Can you beat it? #FlappyBird3D #NewHighScore`
      : `I just scored ${score} in Flappy Bird 3D! #FlappyBird3D`;
    
    const url = window.location.href;
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    
    // Open Twitter sharing in a new window
    window.open(twitterIntentUrl, '_blank', 'width=550,height=420');
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Score display during gameplay */}
      {gameState === 'playing' && (
        <>
          {/* Main centered score */}
          <div className="absolute top-4 left-0 right-0 text-center">
            <h2 className="text-4xl font-bold text-white drop-shadow-lg">
              {score}
            </h2>
          </div>
          
          {/* Title and high score in the corner */}
          <div className="absolute top-4 left-4 text-left">
            <h3 className="text-4xl font-bold text-white drop-shadow-lg">Flappy Bird 3D</h3>
            <p className="text-sm text-white drop-shadow-lg">High Score: {highScore}</p>
          </div>
          
          {/* Flap button for both mobile and desktop - using onClick */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <button 
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full shadow-lg pointer-events-auto opacity-75 active:opacity-100 active:scale-95 transition-all text-xl"
              onClick={flap}
              aria-label="Flap button"
            >
              Press space
            </button>
          </div>
        </>
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
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full shadow-lg pointer-events-auto cursor-pointer"
            onClick={onStart}
          >
            Start Game
          </button>
          <p className="mt-4 text-white">Press Space to Flap</p>
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
          
          <div className="flex space-x-4">
            <button 
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full shadow-lg pointer-events-auto cursor-pointer"
              onClick={onRestart}
            >
              Press Space
            </button>
            
            {/* Share to Twitter Button */}
            <button 
              className={`px-6 py-3 ${
                score === highScore && score > 0 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-blue-400 hover:bg-blue-500'
              } text-white font-bold rounded-full shadow-lg pointer-events-auto flex items-center cursor-pointer`}
              onClick={shareToTwitter}
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
              {score === highScore && score > 0 
                ? 'Share New Record!' 
                : 'Share Score'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}