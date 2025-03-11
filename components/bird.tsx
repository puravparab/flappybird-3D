// Bird.tsx - Completely revised forward movement
'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Vector3 } from 'three'
import useControls from '@/hooks/useControls'

type BirdProps = {
  gameState: 'start' | 'playing' | 'gameOver'
  onGameOver: () => void
}

export const BIRD_RADIUS = 0.7

export default function Bird({ gameState, onGameOver }: BirdProps) {
  const birdRef = useRef<THREE.Group>(null)
  const velocity = useRef<Vector3>(new Vector3(0, 0, 0))
  const forwardPosition = useRef(0) // Track actual forward position
  const controls = useControls()
  
  // Height constraints
  const MAX_HEIGHT = 15
  const MIN_HEIGHT = -4 // Minimum height (ground collision)
  
  // Reset bird position when game restarts
  useEffect(() => {
    if (gameState === 'playing' && birdRef.current) {
      birdRef.current.position.set(0, 0, 0)
      velocity.current.set(0, 0, 0)
      forwardPosition.current = 0
    }
  }, [gameState])
  
  useFrame((state, delta) => {
    if (!birdRef.current || gameState !== 'playing') return
    
    // Apply gravity
    velocity.current.y -= 9.8 * delta * 0.5
    
    // Only up control (flap) with height limit
    if (controls.up) {
      velocity.current.y = 5 // Flap upward
    }
    
    // Calculate and track forward movement
    const forwardSpeed = 7 * delta
    forwardPosition.current += forwardSpeed // Track actual forward distance
    
    // Update vertical position with height constraints
    birdRef.current.position.y += velocity.current.y * delta
    
    // Apply height constraints - prevent going above MAX_HEIGHT
    if (birdRef.current.position.y > MAX_HEIGHT) {
      birdRef.current.position.y = MAX_HEIGHT
      velocity.current.y = 0 // Stop upward velocity
    }
    
    // Game over if bird hits the ground
    if (birdRef.current.position.y < MIN_HEIGHT) {
      onGameOver()
    }
    
    // Ensure X position stays at 0
    birdRef.current.position.x = 0
    
    // Keep visual Z position at 0 (bird stays centered in the frame)
    birdRef.current.position.z = 0
    
    // Update camera position to follow bird's height
    state.camera.position.set(0, birdRef.current.position.y + 3, 10)
    state.camera.lookAt(0, birdRef.current.position.y, -10)
    
    // Store the forward position directly in birdRef for other components to access
    if (birdRef.current) {
      birdRef.current.userData.forwardPosition = forwardPosition.current
    }
  })
  
  return (
    <group ref={birdRef} name="bird">
      {/* Bird - orange sphere with shadow */}
      <mesh castShadow>
        <sphereGeometry args={[BIRD_RADIUS, 32, 32]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </group>
  )
}