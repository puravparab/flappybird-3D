// pipes.tsx - Modified to make pipes fade only after bird completely passes them

'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { BIRD_RADIUS } from './bird' // Import bird radius

type PipeProps = {
  gameState: 'start' | 'playing' | 'gameOver'
  onScore: () => void
  onCollision: () => void
}

// Structure to represent a single pipe pair
type PipePair = {
  id: number
  zPosition: number
  gapY: number
  passed: boolean
  removed: boolean
}

export default function Pipes({ gameState, onScore, onCollision }: PipeProps) {
  const pipesRef = useRef<THREE.Group>(null)
  const [pipeList, setPipeList] = useState<PipePair[]>([])
  const lastPipeId = useRef(0)
  
  const PIPE_SPACING = 18
  const PIPE_WIDTH = 2 // Keep collision width the same
  const PIPE_GAP_SIZE = 4
  const PIPE_COUNT = 10
  const PIPE_THRESHOLD = 5 // Generate more pipes when we have 5 or fewer
  const PIPE_RADIUS = 1.5 // Reduced from 2 to 1.5 to make pipes smaller
  const PIPE_HEIGHT = 30
  const COLLISION_THRESHOLD = 0.8
  const MIN_BOTTOM_PIPE_HEIGHT = 2 // Minimum height for bottom pipe from ground
  
  // Pipe fade constants
  const PIPE_PASS_THRESHOLD = 0 // Distance at which a pipe is considered "passed"
  const FADE_START_DISTANCE = PIPE_PASS_THRESHOLD // Start fading
  const FADE_END_DISTANCE = FADE_START_DISTANCE + 3 // Fade completely
  
  // Generate initial pipes when game starts or on the start screen
  useEffect(() => {
    if (gameState === 'playing' || gameState === 'start') {
      const initialPipes: PipePair[] = []
      
      for (let i = 0; i < PIPE_COUNT; i++) {
        initialPipes.push({
          id: lastPipeId.current++,
          zPosition: -PIPE_SPACING * i - 20, // Start pipes ahead of bird
          gapY: getRandomGapPosition(),
          passed: false,
          removed: false
        })
      }
      
      setPipeList(initialPipes)
    }
  }, [gameState])
  
  // Generate a random Y position for the gap that ensures a minimum bottom pipe height
  const getRandomGapPosition = () => {
    // The minimum gap Y to ensure bottom pipe has minimum height
    // MIN_HEIGHT (ground) + MIN_BOTTOM_PIPE_HEIGHT + PIPE_GAP_SIZE/2
    const minGapY = -4 + MIN_BOTTOM_PIPE_HEIGHT + PIPE_GAP_SIZE/2
    // Random position between minGapY and 9
    return Math.random() * (9 - minGapY) + minGapY
  }
  
  // Add new pipes as bird progresses
  const addNewPipes = (pipeCount: number) => {
    const currentLastPipe = pipeList.length > 0 
      ? pipeList.reduce((last, pipe) => pipe.zPosition < last.zPosition ? pipe : last, pipeList[0])
      : { zPosition: 0 };

    const newPipes: PipePair[] = []
    
    for (let i = 0; i < pipeCount; i++) {
      newPipes.push({
        id: lastPipeId.current++,
        zPosition: currentLastPipe.zPosition - PIPE_SPACING * (i + 1),
        gapY: getRandomGapPosition(),
        passed: false,
        removed: false
      })
    }
    
    setPipeList(prevPipes => [...prevPipes, ...newPipes])
  }
  
  // Create pipe geometries
  const topPipeGeometry = useMemo(() => 
    new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, PIPE_HEIGHT, 16), [])
  
  const bottomPipeGeometry = useMemo(() => 
    new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, PIPE_HEIGHT, 16), [])
  
  // Calculate opacity based on distance behind bird
  const calculateOpacity = (relativePipeZ: number) => {
    // If pipe is not far enough behind bird to start fading, keep fully opaque
    if (relativePipeZ < FADE_START_DISTANCE) return 1
    
    // If pipe is beyond fade end distance, make fully transparent
    if (relativePipeZ >= FADE_END_DISTANCE) return 0
    
    // Calculate fade percentage (linear interpolation)
    return 1 - (relativePipeZ - FADE_START_DISTANCE) / (FADE_END_DISTANCE - FADE_START_DISTANCE)
  }
  
  useFrame((state) => {
    if (!pipesRef.current || (gameState !== 'playing' && gameState !== 'start')) return
    
    // Find the bird object
    const bird = state.scene.getObjectByName('bird')
    if (!bird) return
    
    // Get the bird's actual forward position from its userData
    const birdForwardPosition = bird.userData.forwardPosition || 0
    
    // Bird's visual position is at center (z=0), but its forward progress is tracked in userData
    const birdPosition = {
      x: 0,
      y: bird.position.y,
      z: -birdForwardPosition // Negative because we're moving in negative Z
    }
    
    // Check if we need to generate more pipes (only during playing state)
    if (gameState === 'playing') {
      const remainingVisiblePipes = pipeList.filter(pipe => !pipe.removed).length
      if (remainingVisiblePipes <= PIPE_THRESHOLD) {
        addNewPipes(PIPE_COUNT - PIPE_THRESHOLD) // Generate 5 more pipes when we have 5 left
      }
    }
    
    // Process each pipe
    setPipeList(prevPipes => {
      return prevPipes.map(pipe => {
        // Skip already removed pipes
        if (pipe.removed) return pipe
        
        // Calculate pipe position relative to bird's actual forward position
        const relativePipeZ = pipe.zPosition - birdPosition.z
        
        // Position each pipe visually based on bird's forward position
        if (pipesRef.current) {
          const pipeGroup = pipesRef.current.children.find(
            child => child.userData.pipeId === pipe.id
          ) as THREE.Group;
          
          if (pipeGroup) {
            pipeGroup.position.z = relativePipeZ
            
            // Calculate pipe opacity - only fade for pipes behind the bird
            const opacity = relativePipeZ > 0 ? calculateOpacity(relativePipeZ) : 1
            
            // Update opacity on all pipe meshes
            pipeGroup.children.forEach(child => {
              if (child instanceof THREE.Mesh && child.material) {
                // Need to make material transparent to enable opacity
                if (Array.isArray(child.material)) {
                  child.material.forEach(mat => {
                    mat.transparent = true;
                    mat.opacity = opacity;
                  });
                } else {
                  child.material.transparent = true;
                  child.material.opacity = opacity;
                }
                
                // Bottom pipe (index 1) should cast shadows
                if (child === pipeGroup.children[1]) {
                  child.castShadow = opacity > 0.2; // Only cast shadows if somewhat visible
                }
                child.receiveShadow = opacity > 0.2;
              }
            });
          }
        }
        
        // Check for collisions - only during gameplay, not on start screen
        if (gameState === 'playing' && Math.abs(relativePipeZ) < PIPE_WIDTH * COLLISION_THRESHOLD) {
          // Check if bird is within the pipe gap, considering bird radius
          const topGapEdge = pipe.gapY + PIPE_GAP_SIZE/2;
          const bottomGapEdge = pipe.gapY - PIPE_GAP_SIZE/2;
          
          // Bird is in gap if its top is below top edge and its bottom is above bottom edge
          const isInGap = (birdPosition.y + BIRD_RADIUS < topGapEdge) && 
                         (birdPosition.y - BIRD_RADIUS > bottomGapEdge);
          
          // If not in gap and within collision range
          if (!isInGap && Math.abs(relativePipeZ) < PIPE_WIDTH * COLLISION_THRESHOLD) {
            onCollision() // Trigger game over
          }
        }
        
        // Mark pipe as passed and trigger score when bird passes it
        if (gameState === 'playing' && !pipe.passed && relativePipeZ > PIPE_PASS_THRESHOLD) {
          onScore() // Increase score
          return { ...pipe, passed: true } // Mark as passed but keep it visible for fade effect
        }
        
        // Remove pipe when it's completely faded out
        if (relativePipeZ >= FADE_END_DISTANCE) {
          return { ...pipe, removed: true }
        }
        
        return pipe
      }).filter(pipe => !pipe.removed) // Remove pipes marked for removal
    })
  })
  
  return (
    <group ref={pipesRef}>
      {(gameState === 'playing' || gameState === 'start') && pipeList.map(pipe => (
        <group 
          key={pipe.id} 
          position={[0, 0, pipe.zPosition]}
          userData={{ pipeId: pipe.id }}
        >
          {/* Top pipe - only receives shadows */}
          <mesh 
            position={[0, pipe.gapY + PIPE_GAP_SIZE/2 + PIPE_HEIGHT/2, 0]} 
            geometry={topPipeGeometry}
            receiveShadow
          >
            <meshStandardMaterial color="#16c931" transparent={true} opacity={1} />
          </mesh>
          
          {/* Bottom pipe - casts and receives shadows */}
          <mesh 
            position={[0, pipe.gapY - PIPE_GAP_SIZE/2 - PIPE_HEIGHT/2, 0]} 
            geometry={bottomPipeGeometry}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#16c931" transparent={true} opacity={1} />
          </mesh>
        </group>
      ))}
    </group>
  )
}