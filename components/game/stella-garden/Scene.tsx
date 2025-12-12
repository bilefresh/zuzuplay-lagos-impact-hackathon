import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Character } from './Character';
import { GardenPlot } from './GardenPlot';
import { useGameStore } from './GameContext';
import * as THREE from 'three';

export const Scene: React.FC = () => {
  const { state } = useGameStore();
  const planetRef = useRef<THREE.Mesh>(null);

  // Define plot positions on the sphere (Radius 4)
  // We add slightly more than 4 to be on surface
  const R = 4.05;
  const plotPositions: [number, number, number][] = [
    [0, R, 0],           // Top
    [0, -R, 0],          // Bottom
    [R, 0, 0],           // Front
    [-R, 0, 0],          // Back
    [0, 0, R],           // Right
    [0, 0, -R],          // Left
    [R * 0.7, R * 0.7, 0], // Diagonals
    [-R * 0.7, R * 0.7, 0]
  ];

  useFrame((state) => {
      // Rotate planet slowly for ambience
      if (planetRef.current) {
          planetRef.current.rotation.y += 0.0005;
      }
  });

  return (
    <group>
      {/* Main Planet */}
      <mesh ref={planetRef} receiveShadow castShadow>
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial color="#8B5CF6" roughness={0.8} />
      </mesh>

      {/* Decor: Rings or Atmosphere */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[6, 0.2, 16, 100]} />
        <meshStandardMaterial color="#F472B6" emissive="#F472B6" emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>

      {/* Character - rendered independently to move freely */}
      <Character />

      {/* Garden Plots - Rendered as children of scene, but they need to stick to planet? 
          If planet rotates, they should rotate with it?
          If so, they should be inside the planetRef mesh or a group that rotates.
          
          However, if planet rotates, Character standing on it needs to rotate too OR we just rotate the visual planet and keep logic static?
          Usually easier to rotate the world and keep character at top (Runner style) OR rotate character around world (Mario Galaxy style).
          
          Given OrbitControls, let's keep the Planet static (except slow ambient rotation maybe?) and move Character around it.
          So plots are static in world space.
      */}
      {plotPositions.map((pos, index) => (
        <GardenPlot 
          key={`plot-${index}`} 
          id={`plot-${index}`} 
          position={pos} 
        />
      ))}
    </group>
  );
};
