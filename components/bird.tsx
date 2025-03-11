'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
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
  const [isFlapping, setIsFlapping] = useState(false)
  const prevUpState = useRef(false)
  
  // Import bird model from Sketchfab
  const { scene, animations } = useGLTF('assets/models/flappybird.glb')
  const { actions } = useAnimations(animations, birdRef)
  
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
  
  // Load animations
  useEffect(() => {
    if (actions?.flap) {
      // Prepare the flap animation but don't play it yet
      actions.flap.clampWhenFinished = true
      actions.flap.setLoop(THREE.LoopOnce, 1)
    }
  }, [actions])
  
  useFrame((state, delta) => {
    if (!birdRef.current || gameState !== 'playing') return
    
    // Apply gravity
    velocity.current.y -= 9.8 * delta * 0.5
    
    // Detect when flap is activated (trigger on press, not hold)
    if (controls.up && !prevUpState.current) {
      velocity.current.y = 5 // Flap upward
      
      // Play flap animation
      if (actions?.flap && !isFlapping) {
        setIsFlapping(true)
        actions.flap.reset().play()
        
        // Reset flapping state when animation completes
        setTimeout(() => {
          setIsFlapping(false)
        }, actions.flap.getClip().duration * 1000)
      }
    }
    prevUpState.current = controls.up
    
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
    
    // Make bird tilt based on velocity
    if (birdRef.current.children[0]) {
      const targetRotation = velocity.current.y * 0.05
      const currentRotation = birdRef.current.children[0].rotation.x
      birdRef.current.children[0].rotation.x = THREE.MathUtils.lerp(
        currentRotation, 
        targetRotation, 
        0.1
      )
    }
    
    // Update camera position to follow bird's height
    state.camera.position.set(0, birdRef.current.position.y + 3, 10)
    state.camera.lookAt(0, birdRef.current.position.y, -10)
    
    // Store the forward position directly in birdRef for other components to access
    if (birdRef.current) {
      birdRef.current.userData.forwardPosition = forwardPosition.current
    }
  })
  
  useEffect(() => {
    if (birdRef.current && scene) {
      // Clear previous children first
      while (birdRef.current.children.length) {
        birdRef.current.remove(birdRef.current.children[0])
      }
      
      const birdModel = scene.clone()
      birdModel.scale.set(BIRD_RADIUS, BIRD_RADIUS/2, BIRD_RADIUS/2) // Scale and position the model
      birdModel.rotation.set(0, Math.PI * 0.5, 0) // face away from the player

      // Ensure materials are properly set but PRESERVE original textures
      birdModel.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true
          object.receiveShadow = true
          if (object.material && Array.isArray(object.material)) {
            // Handle multi-material objects
            object.material.forEach(mat => {
              mat.needsUpdate = true
              mat.metalness = 0.3
              mat.roughness = 0.7
            });
          } else if (object.material) {
            // Handle single material objects
            object.material.needsUpdate = true
            object.material.metalness = 0.3
            object.material.roughness = 0.7
          }
        }
      })
      // Add to the group
      birdRef.current.add(birdModel)
    }
  }, [scene])

  return (
    <group ref={birdRef} name="bird">
      {/* The 3D model will be added to this group via useEffect */}
      
      {/* Multiple lights from different angles for better coverage */}
      <pointLight
        position={[-1, 1, 0]} // Light in front of the bird
        intensity={5}
        color="#ffffff"
        distance={2}
      />
    </group>
  )
}

// Add this at the end of the file to preload the model
useGLTF.preload('/assets/models/flappybird.glb')