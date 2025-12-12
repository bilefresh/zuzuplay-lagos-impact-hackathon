import React, { useState } from 'react';
import { useGameStore, FlowerType, Flower } from './GameContext';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface GardenPlotProps {
  id: string;
  position: [number, number, number];
}

const FlowerModel: React.FC<{ type: FlowerType; stage: string }> = ({ type, stage }) => {
  // Simple visual representation of flowers
  const colors: Record<FlowerType, string> = {
    math: '#3B82F6', // blue
    science: '#10B981', // green
    language: '#EC4899', // pink
    logic: '#8B5CF6', // purple
  };
  
  const scale = stage === 'seed' ? 0.2 : stage === 'sprout' ? 0.5 : 1;
  
  return (
    <group scale={[scale, scale, scale]}>
      {/* Stem */}
      {stage !== 'seed' && (
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
          <meshStandardMaterial color="#059669" />
        </mesh>
      )}
      
      {/* Flower/Head */}
      <mesh position={[0, stage === 'seed' ? 0.1 : 1, 0]}>
        {stage === 'seed' ? (
          <sphereGeometry args={[0.2, 16, 16]} />
        ) : stage === 'sprout' ? (
          <sphereGeometry args={[0.3, 16, 16]} />
        ) : (
          <dodecahedronGeometry args={[0.4]} />
        )}
        <meshStandardMaterial color={colors[type]} emissive={colors[type]} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

export const GardenPlot: React.FC<GardenPlotProps> = ({ id, position }) => {
  const { state, plantSeed, waterFlower } = useGameStore();
  const [hovered, setHover] = useState(false);
  
  const flower = state.flowers.find(f => f.plotId === id);
  
  const groupRef = React.useRef<THREE.Group>(null);
  
  React.useLayoutEffect(() => {
    if (groupRef.current) {
      // Align +Y to position vector (normal)
      const up = new THREE.Vector3(0, 1, 0);
      const normal = new THREE.Vector3(...position).normalize();
      groupRef.current.quaternion.setFromUnitVectors(up, normal);
    }
  }, [position]);

  const handleClick = (e: any) => {
    // e.stopPropagation();
    
    if (!flower) {
      // Plant a random seed for now, or open a menu. 
      // For simplicity in this phase: cycle through types or pick first available.
      // Let's pick 'math' if available.
      const availableType = (Object.keys(state.inventory.seeds) as FlowerType[]).find(t => state.inventory.seeds[t] > 0);
      if (availableType) {
        plantSeed(id, availableType, position);
      }
    } else {
      // Water the flower
      if (flower.stage !== 'bloom') {
        waterFlower(flower.id);
      }
    }
  };

  return (
    <group ref={groupRef} position={position}>
      {/* Plot Base */}
      <mesh 
        onClick={handleClick} 
        onPointerOver={() => setHover(true)} 
        onPointerOut={() => setHover(false)}
      >
        <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
        <meshStandardMaterial 
          color={hovered ? "#D1D5DB" : "#9CA3AF"} 
          colorWrite={true}
        />
      </mesh>
      
      {/* Hover Indicator / Tooltip */}
      {hovered && (
        <Html position={[0, 1, 0]} center distanceFactor={10}>
          <div className="bg-white/90 px-2 py-1 rounded-full text-xs font-bold shadow-lg text-slate-800 pointer-events-none whitespace-nowrap">
            {!flower ? "Click to Plant" : flower.stage === 'bloom' ? "Fully Grown!" : "Click to Water"}
          </div>
        </Html>
      )}

      {/* Flower */}
      {flower && <FlowerModel type={flower.type} stage={flower.stage} />}
    </group>
  );
};

