import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './GameContext';

export const Character: React.FC = () => {
  const ref = useRef<THREE.Group>(null);
  const visualRef = useRef<THREE.Group>(null);
  const { state }: any = useGameStore();
  
  useFrame((ctx) => {
    if (ref.current && state.characterPosition) {
      // Smoothly move to target position
      const targetPos = new THREE.Vector3(...state.characterPosition);
      ref.current.position.lerp(targetPos, 0.1);

      // Align character to stand on sphere surface (Up vector aligns with Position normal)
      const up = new THREE.Vector3(0, 1, 0);
      const normal = ref.current.position.clone().normalize();
      const targetQuat = new THREE.Quaternion().setFromUnitVectors(up, normal);
      ref.current.quaternion.slerp(targetQuat, 0.1);
    }

    if (visualRef.current) {
      // Idle animation: gentle floating/bobbing in local space
      visualRef.current.position.y = Math.sin(ctx.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group ref={ref} position={[0, 4.5, 0]}>
      <group ref={visualRef}>
        {/* Body */}
        <mesh position={[0, 0.5, 0]}>
          <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
          <meshStandardMaterial color="#60A5FA" />
        </mesh>
        
        {/* Helmet/Head */}
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color="white" transparent opacity={0.4} roughness={0.2} metalness={1} />
        </mesh>
        
        {/* Head inside */}
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#FDBA74" />
        </mesh>
        
        {/* Jetpack */}
        <mesh position={[0, 0.6, -0.25]}>
          <boxGeometry args={[0.4, 0.5, 0.2]} />
          <meshStandardMaterial color="#9CA3AF" />
        </mesh>

        {/* Shadow blob */}
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <circleGeometry args={[0.4, 32]} />
          <meshBasicMaterial color="black" transparent opacity={0.2} />
        </mesh>
      </group>
    </group>
  );
};
