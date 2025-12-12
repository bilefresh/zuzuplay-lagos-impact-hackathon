"use client";

import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Text, 
  Float, 
  Sparkles, 
  Stars, 
  Trail, 
  useTexture, 
  PerspectiveCamera,
  Environment as DreiEnvironment,
  MeshDistortMaterial,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, Zap, Play, RotateCcw, Check, X } from 'lucide-react';

// --- Types ---
type GameState = 'start' | 'playing' | 'paused' | 'question' | 'gameover' | 'victory';

type Question = {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
};

// --- Data ---
const QUESTIONS: Question[] = [
  { id: 1, text: "Which color is mixed from Red and Blue?", options: ["Green", "Purple", "Orange"], correctIndex: 1 },
  { id: 2, text: "What shape is the moon usually drawn as?", options: ["Square", "Crescent", "Triangle"], correctIndex: 1 },
  { id: 3, text: "5 + 5 = ?", options: ["10", "15", "20"], correctIndex: 0 },
  { id: 4, text: "Which is a domestic animal?", options: ["Lion", "Cat", "Tiger"], correctIndex: 1 },
  { id: 5, text: "What do bees make?", options: ["Milk", "Honey", "Jam"], correctIndex: 1 },
  { id: 6, text: "Which season is cold?", options: ["Summer", "Winter", "Spring"], correctIndex: 1 },
];

// --- Assets & Utils ---
const MovingBackground = () => {
  // Simulating a parallax background with moving layers
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        // Move clouds/stars left
        child.position.x -= delta * (2 + i); 
        if (child.position.x < -20) {
          child.position.x = 20;
          child.position.y = (Math.random() - 0.5) * 10;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={i} position={[Math.random() * 40 - 20, (Math.random() - 0.5) * 10, -5 - Math.random() * 10]}>
          <sphereGeometry args={[0.5 + Math.random(), 16, 16]} />
          <meshBasicMaterial color={Math.random() > 0.5 ? "#E0F2FE" : "#FCE7F3"} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
};

// --- Player Character ---
const MagicalGirl = ({ position, isMoving }: { position: [number, number, number], isMoving: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock, mouse }) => {
    if (groupRef.current) {
        // Smoothly follow mouse Y position
        // Map mouse Y (-1 to 1) to world Y (-4 to 4)
        const targetY = mouse.y * 4; 
        groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.1;
        
        // Tilt based on movement
        groupRef.current.rotation.z = (targetY - groupRef.current.position.y) * -0.5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Trail width={1} length={8} color="#F472B6" attenuation={(t) => t * t}>
        <Float speed={5} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef} rotation={[0, Math.PI / 2, 0]}>
                <coneGeometry args={[0.4, 1.2, 32]} />
                <MeshDistortMaterial 
                    color="#F472B6" 
                    emissive="#BE185D"
                    distort={0.3} 
                    speed={3} 
                    roughness={0.2}
                />
            </mesh>
            {/* Wings */}
            <group position={[0, 0.2, 0]}>
                 <mesh position={[0, 0, 0.4]} rotation={[0.5, 0, 0]}>
                    <planeGeometry args={[1, 1.5]} />
                    <meshStandardMaterial color="#A5F3FC" transparent opacity={0.6} side={THREE.DoubleSide} />
                 </mesh>
                 <mesh position={[0, 0, -0.4]} rotation={[-0.5, 0, 0]}>
                    <planeGeometry args={[1, 1.5]} />
                    <meshStandardMaterial color="#A5F3FC" transparent opacity={0.6} side={THREE.DoubleSide} />
                 </mesh>
            </group>
            <Sparkles count={15} scale={1.5} size={4} speed={0.4} opacity={0.8} color="#FFF" />
            <pointLight intensity={1} color="#F472B6" distance={5} />
        </Float>
      </Trail>
    </group>
  );
};

// --- Collectibles & Obstacles ---
const Item = ({ 
    position, 
    type, 
    onCollect 
}: { 
    position: [number, number, number], 
    type: 'star' | 'gate', 
    onCollect: () => void 
}) => {
    const ref = useRef<THREE.Group>(null);
    const [collected, setCollected] = useState(false);

    useFrame((state, delta) => {
        if (ref.current) {
            // Move item left
            ref.current.position.x -= delta * 5; // Speed

            // Rotation
            ref.current.rotation.y += delta * 2;
            
            // Simple collision check with player (assumed at x=-4)
            // Player Y is dynamic, we need to track it, but for simplicity in this demo:
            // We'll just check X crossing for gates, and distance for stars if we had player ref.
            // For this prototype, we'll rely on the player guiding into it visually, 
            // but realistically we need a global state for player position or a collision manager.
            
            // SIMULATION: If it passes x=-4 and hasn't been collected, trigger 'collect' if close in Y
            // Since we don't have player Y here easily without context/store, 
            // let's assume player catches it if it's on screen for now or check mouse.
            
            const playerY = state.pointer.y * 4; // Approximation of player logic
            const distY = Math.abs(ref.current.position.y - playerY);
            
            if (!collected && ref.current.position.x < -3.5 && ref.current.position.x > -4.5) {
                if (type === 'gate' || distY < 1.5) {
                    setCollected(true);
                    onCollect();
                }
            }

            // Reset if off screen
            if (ref.current.position.x < -10) {
                ref.current.position.x = 20 + Math.random() * 10;
                ref.current.position.y = (Math.random() - 0.5) * 6;
                setCollected(false);
            }
        }
    });

    return (
        <group ref={ref} position={position} visible={!collected}>
            {type === 'star' ? (
                <mesh>
                    <icosahedronGeometry args={[0.4, 0]} />
                    <meshStandardMaterial color="#FCD34D" emissive="#F59E0B" emissiveIntensity={0.5} />
                </mesh>
            ) : (
                <group>
                    <mesh>
                        <torusGeometry args={[1.5, 0.2, 16, 100]} />
                        <meshStandardMaterial color="#C084FC" emissive="#9333EA" emissiveIntensity={1} />
                    </mesh>
                    <Sparkles count={20} scale={2} color="#A855F7" />
                </group>
            )}
        </group>
    );
};

// --- Game Scene ---
const GameScene = ({ gameState, onGateEnter, onStarCollect }: { gameState: GameState, onGateEnter: () => void, onStarCollect: () => void }) => {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            {/* Background Elements */}
            <MovingBackground />

            {/* Player */}
            <MagicalGirl position={[-4, 0, 0]} isMoving={gameState === 'playing'} />

            {/* Spawner - Simplified for demo */}
            {gameState === 'playing' && (
                <>
                    {/* Stars */}
                    <Item position={[10, 2, 0]} type="star" onCollect={onStarCollect} />
                    <Item position={[15, -2, 0]} type="star" onCollect={onStarCollect} />
                    <Item position={[20, 0, 0]} type="star" onCollect={onStarCollect} />
                    
                    {/* Question Gate - appears occasionally */}
                    <Item position={[30, 0, 0]} type="gate" onCollect={onGateEnter} />
                </>
            )}
        </>
    );
};

// --- Main Component ---
const MagicalGardenGame = ({ onExit }: { onExit?: () => void }) => {
    const [gameState, setGameState] = useState<GameState>('start');
    const [score, setScore] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [lives, setLives] = useState(3);

    // Game Control Handlers
    const startGame = () => setGameState('playing');
    
    const handleGateEnter = () => {
        if (gameState === 'playing') {
            setGameState('question');
        }
    };

    const handleStarCollect = () => {
        setScore(s => s + 10);
    };

    const handleAnswer = (index: number) => {
        const currentQ = QUESTIONS[questionIndex];
        if (index === currentQ.correctIndex) {
            // Correct
            setScore(s => s + 50);
            if (questionIndex + 1 < QUESTIONS.length) {
                setQuestionIndex(i => i + 1);
                setGameState('playing');
            } else {
                setGameState('victory');
            }
        } else {
            // Wrong
            setLives(l => l - 1);
            if (lives <= 1) {
                setGameState('gameover');
            } else {
                 // Shake effect or feedback could go here
                 // For now just continue but maybe push back a bit
                 alert("Oops! Try again next time!");
                 setGameState('playing');
            }
        }
    };

    return (
        <div className="relative w-full h-screen bg-slate-900 overflow-hidden font-sans select-none">
            {/* 3D Layer */}
            <div className="absolute inset-0">
                <Canvas>
                    <Suspense fallback={null}>
                        <GameScene 
                            gameState={gameState} 
                            onGateEnter={handleGateEnter} 
                            onStarCollect={handleStarCollect}
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                {/* HUD */}
                <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-auto">
                     <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full flex items-center gap-2 px-4 text-white">
                            <Heart className="fill-pink-500 text-pink-500" size={20} />
                            <span className="font-bold text-xl">{lives}</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full flex items-center gap-2 px-4 text-white">
                            <Star className="fill-yellow-400 text-yellow-400" size={20} />
                            <span className="font-bold text-xl">{score}</span>
                        </div>
                     </div>
                     <button 
                        onClick={onExit}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-2 rounded-full text-white transition"
                    >
                        <X size={24} />
                     </button>
                </div>

                {/* Start Screen */}
                <AnimatePresence>
                    {gameState === 'start' && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
                        >
                            <div className="text-center">
                                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-4 drop-shadow-lg">
                                    Starlight Dash
                                </h1>
                                <p className="text-blue-200 text-xl mb-8 max-w-md mx-auto">
                                    Move your mouse up and down to fly! Collect stars and pass through Magic Gates to answer questions.
                                </p>
                                <button 
                                    onClick={startGame}
                                    className="group relative bg-gradient-to-r from-pink-500 to-violet-600 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:scale-105 transition-all"
                                >
                                    <span className="flex items-center gap-3">
                                        Let{"'"}s Fly! <Play className="fill-current" />
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Question Modal */}
                <AnimatePresence>
                    {gameState === 'question' && (
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-auto p-4 bg-black/40"
                        >
                            <div className="bg-slate-900/90 border-2 border-pink-500/50 p-8 rounded-3xl max-w-2xl w-full shadow-2xl backdrop-blur-xl">
                                <div className="flex justify-center mb-6">
                                    <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.6)]">
                                        <Zap className="text-white w-8 h-8" />
                                    </div>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-8">
                                    {QUESTIONS[questionIndex].text}
                                </h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {QUESTIONS[questionIndex].options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(idx)}
                                            className="bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/50 text-white text-xl font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-between group"
                                        >
                                            <span>{opt}</span>
                                            <span className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:border-pink-400 group-hover:bg-pink-500 text-transparent group-hover:text-white transition-all">
                                                <Check size={16} />
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Victory/Game Over */}
                <AnimatePresence>
                    {(gameState === 'victory' || gameState === 'gameover') && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto"
                        >
                            <div className="text-center bg-white/10 p-12 rounded-3xl border border-white/10 backdrop-blur-xl">
                                {gameState === 'victory' ? (
                                    <>
                                        <div className="text-8xl mb-4">👑</div>
                                        <h2 className="text-5xl font-bold text-yellow-400 mb-4">Magical!</h2>
                                        <p className="text-white text-xl mb-8">You are a true star superstar!</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-8xl mb-4">💔</div>
                                        <h2 className="text-5xl font-bold text-pink-500 mb-4">Game Over</h2>
                                        <p className="text-white text-xl mb-8">Don{"'"}t give up, try again!</p>
                                    </>
                                )}
                                
                                <div className="text-3xl font-mono text-blue-300 mb-8">
                                    Final Score: {score}
                                </div>

                                <div className="flex gap-4 justify-center">
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-colors"
                                    >
                                        <RotateCcw size={20} /> Play Again
                                    </button>
                                    {onExit && (
                                        <button 
                                            onClick={onExit}
                                            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
                                        >
                                            Exit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MagicalGardenGame;
