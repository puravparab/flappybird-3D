'use client'

import { useEffect, useState } from 'react'
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
  const [showAboutModal, setShowAboutModal] = useState(false)
  
  // Handle keyboard controls for ui interactions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (gameState === 'start') onStart()
        if (gameState === 'gameOver') onRestart()
      }
      if (e.code === 'Escape' && showAboutModal) {
        setShowAboutModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, onStart, onRestart, showAboutModal])

  // sharing to Twitter
  const shareToTwitter = () => {
    const isHighScore = score === highScore && score > 0;
    const shareText = isHighScore 
      ? `I just set a new high score of ${score} in Flappy Bird 3D! Can you beat it? #FlappyBird3D #NewHighScore`
      : `I just scored ${score} in Flappy Bird 3D! #FlappyBird3D`;
    
    const url = window.location.href;
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterIntentUrl, '_blank', 'width=550,height=420');
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-4 right-4 z-10">
        <button
          className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-full shadow-lg pointer-events-auto cursor-pointer transition-all"
          onClick={() => setShowAboutModal(true)}
          aria-label="About"
        >
          About
        </button>
      </div>
      
      {/* About Modal */}
      {showAboutModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-auto z-20">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">About Flappy Bird 3D</h2>
            </div>
            
            <div className="prose text-gray-600">
              <p>Flappy Bird 3D is an experiment in creating a 3D browser game using purely AI tools in the least amount of time possible. This project was built in only 5 hours!</p>
              
              <h3 className="text-lg font-bold mt-4 text-gray-gray-800">Credits:</h3>
              <ul className="list-disc pl-5">
                <li>
                  Built with <a href="https://threejs.org/" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Three.js</a>
                </li>
                <li>
                  Flappy Bird model from <a href="https://sketchfab.com/3d-models/flappy-bird-3d-vertex-colors-3f2bc66f220c46c3bfdb00e912ae245e" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Sketchfab</a>
                </li>
              </ul>
            </div>
            
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowAboutModal(false)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-md shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Score display during gameplay */}
      {gameState === 'playing' && (
        <>
          {/* Additonal screen for tap functionality */}
          <div 
            className="absolute inset-0 pointer-events-auto z-0"
            onClick={flap}
            aria-label="Tap to flap"
          />
          
          {/* Main centered score */}
          <div className="absolute top-4 left-0 right-0 text-center z-10">
            <h2 className="text-4xl font-bold text-white drop-shadow-lg">
              {score}
            </h2>
          </div>
          
          {/* Title and high score in the corner */}
          <div className="absolute top-4 left-4 text-left z-10">
            <h3 className="text-xl md:text-4xl font-bold text-white drop-shadow-lg">Flappy Bird 3D</h3>
            <p className="text-sm text-white drop-shadow-lg">High Score: {highScore}</p>
          </div>
          
          {/* Flap button for both mobile and desktop - using onClick */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
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
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full shadow-lg pointer-events-auto cursor-pointer mb-4"
            onClick={onStart}
          >
            Start Game
          </button>
          <p className="mt-2 text-white">Press Space to Flap</p>
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
              Play Again
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