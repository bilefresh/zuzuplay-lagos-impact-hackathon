'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sky } from '@react-three/drei';
import { GameProvider } from './GameContext';
import { Scene } from './Scene';
import { GameUI } from './GameUI';

interface StellaGardenGameProps {
  lessonId?: number | string;
  subjectId?: string;
  lessonName?: string;
  onGameComplete?: () => void;
}

const StellaGardenGame: React.FC<StellaGardenGameProps> = ({
  lessonId,
  subjectId,
  lessonName,
  onGameComplete
}) => {
  return (
    <GameProvider>
      <div className="relative w-full h-full bg-slate-900 overflow-hidden">
        {/* 3D Scene Layer */}
        <div className="absolute inset-0 z-0">
          <Canvas
            shadows
            camera={{ position: [0, 5, 10], fov: 50 }}
            dpr={[1, 2]} // Optimize for different screens
          >
            <Suspense fallback={null}>
              <color attach="background" args={['#1a0b2e']} />
              
              {/* Environment */}
              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
              <Sky sunPosition={[100, 10, 100]} turbidity={0.1} rayleigh={0.1} inclination={0.6} distance={1000} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} castShadow />
              
              {/* Game Content */}
              <Scene />
              
              {/* Controls */}
              <OrbitControls 
                maxPolarAngle={Math.PI / 2 - 0.1} 
                minDistance={5}
                maxDistance={20}
                enablePan={false}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* UI Layer */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <GameUI />
          
          {/* Back/Exit Button (if onGameComplete provided) */}
          {onGameComplete && (
            <div className="absolute top-4 right-4 pointer-events-auto">
               <button 
                 onClick={onGameComplete}
                 className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full shadow-lg"
               >
                 Exit Garden
               </button>
            </div>
          )}
        </div>
      </div>
    </GameProvider>
  );
};

export default StellaGardenGame;
