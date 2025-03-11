// Game.tsx - Updated to add high score tracking
'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useEffect } from 'react' // Added useEffect
import { PCFSoftShadowMap } from 'three'
import UI from './ui'
import Bird from './bird'
import Pipes from './pipes'
import Environment from './environment'

export default function Game() {
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0) // Added high score state
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start')

  // Load high score from localStorage on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('flappyBirdHighScore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore))
    }
  }, [])

  const startGame = () => {
    setScore(0)
    setGameState('playing')
  }
  
  const endGame = () => {
    // Update high score if current score is higher
    if (score > highScore) {
      setHighScore(score)
      // Save to localStorage
      localStorage.setItem('flappyBirdHighScore', score.toString())
    }
    setGameState('gameOver')
  }
  
  const restartGame = () => {
    setScore(0)
    setGameState('playing')
  }
  
  const increaseScore = () => {
    if (gameState === 'playing') {
      setScore(prev => prev + 1)
    }
  }

  return (
    <>
      <Canvas 
        className="w-full h-full" 
        camera={{ position: [0, 3, 10], fov: 75 }}
        shadows={{
          enabled: true,
          type: PCFSoftShadowMap
        }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#87CEEB']} />
        <ambientLight intensity={0.4} />
        
        {/* Sun positioned to cast realistic angled shadows */}
        <directionalLight 
          position={[-15, 20, 10]} 
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-bias={-0.0005}
        />
        
        <fog attach="fog" args={['#87CEEB', 50, 200]} />
        
        <Suspense fallback={null}>
          <Bird 
            gameState={gameState} 
            onGameOver={endGame}
          />
          
          <Pipes 
            gameState={gameState}
            onScore={increaseScore}
            onCollision={endGame}
          />
          
          <Environment gameState={gameState} />
        </Suspense>
      </Canvas>
      
      <UI 
        score={score} 
        highScore={highScore} // Pass high score to UI
        gameState={gameState} 
        onStart={startGame} 
        onRestart={restartGame} 
      />
    </>
  )
}