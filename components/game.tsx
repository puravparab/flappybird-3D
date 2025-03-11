// Game.tsx - Updated to add a name to the bird for reference
'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import { PCFSoftShadowMap } from 'three'
import UI from './ui'
import Bird from './bird'
import Pipes from './pipes'
import Environment from './environment'

export default function Game() {
  const [score, setScore] = useState(0)
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start')

  const startGame = () => {
    setScore(0)
    setGameState('playing')
  }
  
  const endGame = () => {
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
          {/* Add name="bird" to the Bird component for reference */}
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
        gameState={gameState} 
        onStart={startGame} 
        onRestart={restartGame} 
      />
    </>
  )
}