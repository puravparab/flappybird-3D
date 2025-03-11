'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Plane } from '@react-three/drei'

type EnvironmentProps = {
  gameState: 'start' | 'playing' | 'gameOver'
}

// Helper function to create a natural mountain silhouette
const createMountainShape = (width: number, height: number, segments: number) => {
  const shape = new THREE.Shape();
  
  // Start at the left edge, AT ground level (-5)
  shape.moveTo(-width/2, -5);
  
  // Generate a natural mountain silhouette using sine waves with varying frequencies
  for (let i = 0; i <= segments; i++) {
    const x = -width/2 + (width * i / segments);
    
    // Create height using multiple sine waves for natural variation
    const h1 = Math.sin(i / segments * Math.PI) * height * 0.7;
    const h2 = Math.sin(i / segments * Math.PI * 3) * height * 0.2;
    const h3 = Math.sin(i / segments * Math.PI * 7) * height * 0.1;
    
    // Ensure the mountain never goes below ground level
    const y = Math.max(-5, h1 + h2 + h3);
    
    shape.lineTo(x, y);
  }
  
  // Close the shape by ending at ground level
  shape.lineTo(width/2, -5);
  
  return shape;
};

export default function Environment({ gameState }: EnvironmentProps) {
  const groundRef = useRef<THREE.Group>(null)
  const mountainsRef = useRef<THREE.Group>(null)
  
  // Much wider ground and mountains to ensure they cover the entire screen
  const GROUND_SIZE = 2000;
  
  useFrame(({ camera }) => {
    if (!groundRef.current) return
    
    // Update ground position to follow camera
    if (gameState === 'playing') {
      groundRef.current.position.z = Math.floor(camera.position.z / 20) * 20
    }
    
    // Keep mountains at a fixed position relative to camera
    if (mountainsRef.current) {
      // Mountains follow camera on X-axis for side-to-side movement
      mountainsRef.current.position.x = camera.position.x
      
      // Mountains stay at a fixed Z distance from camera
      mountainsRef.current.position.z = camera.position.z - 150
    }
  })
  
  // Natural 2D mountain silhouettes
  const MountainRange = () => {
    return (
      <group>
        {/* Create multiple layers of mountains with different depths for parallax effect */}
        {[0, 1, 2].map((layer) => {
          // Each layer has different depth, scale, and color
          const zPos = -5 - layer * 5;
          const yScale = 25 - layer * 5;
          const width = GROUND_SIZE; // Extra wide to ensure full screen coverage
          const color = layer === 0 ? "#2d3436" : layer === 1 ? "#636e72" : "#7f8c8d";
          
          return (
            <mesh key={layer} position={[0, 0, zPos]}>
              <shapeGeometry args={[createMountainShape(width, yScale, 30 + layer * 10)]} />
              <meshStandardMaterial 
                color={color}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>
    );
  };
  
  return (
    <>
      {/* Ground with improved shadow reception */}
      <group ref={groundRef}>
        <Plane 
          args={[GROUND_SIZE, GROUND_SIZE]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -5, 0]}
          receiveShadow
        >
          <meshStandardMaterial 
            color="#2e7d32" 
            roughness={0.9}
            metalness={0.1}
          />
        </Plane>
        
        {/* Grass effect - also wider */}
        <mesh position={[0, -4.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
          <meshStandardMaterial 
            color="#4caf50" 
            transparent={true}
            opacity={0.7}
            roughness={1}
          />
        </mesh>
      </group>
      
      {/* Wide 2D mountain range in background */}
      <group ref={mountainsRef}>
        <MountainRange />
      </group>
    </>
  )
}