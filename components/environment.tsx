'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Plane } from '@react-three/drei'

type EnvironmentProps = {
  gameState: 'start' | 'playing' | 'gameOver'
}

// Helper function to create a natural mountain silhouette
const createMountainShape = (width: number, height: number, segments: number) => {
  const shape = new THREE.Shape();
  shape.moveTo(-width/2, -5); // Start at the left edge, AT ground level (-5)
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

const Cloud = ({ 
  position, 
  scale 
}: { 
  position: [number, number, number], 
  scale: [number, number, number] 
}) => {
  const cloudRef = useRef<THREE.Group>(null)
  return (
    <group ref={cloudRef} position={position} scale={scale}>
      {/* Main cloud body - larger central mass */}
      <mesh>
        <sphereGeometry args={[1.2, 20, 20]} />
        <meshStandardMaterial color="white" roughness={1} />
      </mesh>
      
      {/* Additional puffs with wider spread and more variation */}
      <mesh position={[1.5, 0.3, 0]}>
        <sphereGeometry args={[1.0, 16, 16]} />
        <meshStandardMaterial color="white" roughness={1} />
      </mesh>
      <mesh position={[-1.3, 0.2, 0.3]}>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshStandardMaterial color="white" roughness={1} />
      </mesh>
      <mesh position={[0.7, 0.5, 1.0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="white" roughness={1} />
      </mesh>
      <mesh position={[-0.5, -0.2, -1.2]}>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial color="white" roughness={1} />
      </mesh>
      
      {/* Add more puffs for complexity */}
      <mesh position={[2.0, -0.1, 0.5]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="white" roughness={1} />
      </mesh>
      <mesh position={[-2.1, 0.1, -0.3]}>
        <sphereGeometry args={[0.75, 16, 16]} />
        <meshStandardMaterial color="white" roughness={1} />
      </mesh>
      <mesh position={[0.2, 0.7, 1.5]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="white" roughness={1} />
      </mesh>
      <mesh position={[1.2, -0.3, -1.0]}>
        <sphereGeometry args={[0.65, 16, 16]} />
        <meshStandardMaterial color="white" roughness={1} />
      </mesh>
    </group>
  )
}


const Clouds = () => {
  const cloudsRef = useRef<THREE.Group>(null)
  
  // Generate improved cloud positions with better distribution and variety
  const cloudPositions = useMemo(() => {
    // Create more interesting cloud layers at different heights
    return Array.from({ length: 15 }, (_, i) => {
      // Determine if this is a high cloud, mid cloud or low cloud
      const heightCategory = i % 3; // 0: low, 1: mid, 2: high
      
      let baseHeight, heightVariation;
      if (heightCategory === 0) {
        baseHeight = 8; // Low clouds
        heightVariation = 12;
      } else if (heightCategory === 1) {
        baseHeight = 25; // Mid clouds
        heightVariation = 15;
      } else {
        baseHeight = 45; // High clouds
        heightVariation = 20;
      }
      
      // Scale clouds differently based on height (higher clouds are wider/thinner)
      let scaleX, scaleY, scaleZ;
      if (heightCategory === 0) {
        // Low clouds - more puffy and substantial
        scaleX = 3 + Math.random() * 4;
        scaleY = 2 + Math.random() * 2;
        scaleZ = 3 + Math.random() * 3;
      } else if (heightCategory === 1) {
        // Mid clouds - medium sized
        scaleX = 4 + Math.random() * 5;
        scaleY = 1.5 + Math.random() * 1.5;
        scaleZ = 2.5 + Math.random() * 2.5;
      } else {
        // High clouds - wide and thin
        scaleX = 5 + Math.random() * 7;
        scaleY = 1 + Math.random() * 1;
        scaleZ = 3 + Math.random() * 2;
      }
      
      return {
        position: [
          (Math.random() - 0.5) * 350,  // wider x spread
          baseHeight + Math.random() * heightVariation, // height based on category
          -70 - Math.random() * 150  // varied depth
        ] as [number, number, number],
        scale: [
          scaleX,
          scaleY,
          scaleZ
        ] as [number, number, number]
      }
    })
  }, [])
  
  // Add subtle cloud movement
  useFrame(({ camera, clock }) => {
    if (!cloudsRef.current) return
    
    // Follow camera on X-axis
    cloudsRef.current.position.x = camera.position.x
    
    // Add subtle drift to individual clouds
    cloudsRef.current.children.forEach((cloud, index) => {
      // Different speeds for different clouds
      const speed = 0.05 + (index % 5) * 0.01;
      const amplitude = 0.2 + (index % 3) * 0.1;
      
      // Gentle horizontal sway
      cloud.position.x += Math.sin(clock.elapsedTime * speed) * amplitude * 0.01;
      
      // Very subtle vertical drift
      cloud.position.y += Math.sin(clock.elapsedTime * speed * 0.5) * amplitude * 0.005;
    });
  })
  
  return (
    <group ref={cloudsRef}>
      {cloudPositions.map((cloud, index) => (
        <Cloud key={index} position={cloud.position} scale={cloud.scale} />
      ))}
    </group>
  )
}


export default function Environment({ gameState }: EnvironmentProps) {
  const groundRef = useRef<THREE.Group>(null)
  const mountainsRef = useRef<THREE.Group>(null)
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
            opacity={0.5}
            roughness={1}
          />
        </mesh>
      </group>
      
      {/* Wide 2D mountain range in background */}
      <group ref={mountainsRef}>
        <MountainRange />
      </group>

      <Clouds />
    </>
  )
}