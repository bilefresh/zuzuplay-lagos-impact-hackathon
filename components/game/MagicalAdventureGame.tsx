"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGameState } from "@/hooks/useGameState";
import LivesIndicator from "./LivesIndicator";
import BoostIndicator from "./BoostIndicator";

interface MagicalAdventureGameProps {
  lessonId?: number;
  subjectId?: string;
  lessonName?: string;
  onGameComplete?: () => void;
}

const MagicalAdventureGame: React.FC<MagicalAdventureGameProps> = ({ 
  lessonId,
  subjectId,
  lessonName,
  onGameComplete 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const playerRef = useRef<THREE.Group>();
  const aiRef = useRef<THREE.Group>();
  const roadRef = useRef<THREE.Group>();
  const frameRef = useRef<number>();
  const boostParticlesRef = useRef<THREE.Points>();
  const playerSparklesRef = useRef<THREE.Points>();
  const stateRef = useRef({ playerPosition: 0, aiPosition: 0, boost: 0, speedPenaltyUntil: 0 });
  
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const {
    score,
    lives,
    playerPosition,
    aiPosition,
    currentQuestion,
    isPlaying,
    boost,
    currentDifficulty,
    questionsAnswered,
    maxQuestions,
    isLoading,
    answerQuestion,
    formattedTime,
    speedPenaltyUntil,
  } = useGameState(lessonId, subjectId);

  // Sync state for animation loop
  useEffect(() => {
    stateRef.current = {
      playerPosition,
      aiPosition,
      boost,
      speedPenaltyUntil: speedPenaltyUntil || 0,
    };
  }, [playerPosition, aiPosition, boost, speedPenaltyUntil]);

  const [roadOffset, setRoadOffset] = useState(0);
  const roadOffsetRef = useRef(0);
  const [answerFeedback, setAnswerFeedback] = useState<{show: boolean; isCorrect: boolean; selectedAnswer: string; correctAnswer: string} | null>(null);
  const [characterStaggering, setCharacterStaggering] = useState(false);
  const [failedQuestions, setFailedQuestions] = useState<any[]>([]);
  const [showSaveMe, setShowSaveMe] = useState(false);
  const [obstacles, setObstacles] = useState<any[]>([]);
  const [itemsPassed, setItemsPassed] = useState(0);
  const [showQuestionPrompt, setShowQuestionPrompt] = useState(false);
  const [collisionDetected, setCollisionDetected] = useState(false);
  const obstaclesRef = useRef<THREE.Group[]>([]);

  // Initialize Three.js scene
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Pink/Purple Fog
    scene.fog = new THREE.Fog(0xffc0cb, 20, 150); // Pink mist

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 6, 12);
    camera.lookAt(0, 0, -10);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffc0cb, 1); // Pink background
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create environment
    createEnvironment(scene);
    createRainbowRoad(scene);
    
    // Create characters
    createPlayerUnicorn(scene);
    createFriendlyDragon(scene);
    
    // Lighting
    setupLighting(scene);

    // Render loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      updateScene();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (camera && renderer) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
    };
    window.addEventListener('resize', handleResize);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const createEnvironment = (scene: THREE.Scene) => {
    // Skybox - Pastel Gradient
    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `;
    const uniforms = {
      topColor: { value: new THREE.Color(0x87CEEB) }, // Sky Blue
      bottomColor: { value: new THREE.Color(0xFFC0CB) }, // Pink
      offset: { value: 33 },
      exponent: { value: 0.6 }
    };
    const skyGeo = new THREE.SphereGeometry(500, 32, 32);
    const skyMat = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, side: THREE.BackSide });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);

    // Floating Islands / Clouds
    for (let i = 0; i < 20; i++) {
      const cloudGeo = new THREE.DodecahedronGeometry(Math.random() * 5 + 2, 0);
      const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
      const cloud = new THREE.Mesh(cloudGeo, cloudMat);
      cloud.position.set(
        (Math.random() - 0.5) * 200,
        Math.random() * 30 + 10,
        -Math.random() * 200
      );
      scene.add(cloud);
    }

    // Candy Trees
    for (let i = 0; i < 30; i++) {
        const treeGroup = new THREE.Group();
        const trunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 3, 8);
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.5;
        treeGroup.add(trunk);

        const topGeo = new THREE.SphereGeometry(2.5, 16, 16);
        const topMat = new THREE.MeshLambertMaterial({ color: Math.random() > 0.5 ? 0xFF69B4 : 0x00CED1 }); // HotPink or DarkTurquoise
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.y = 4;
        treeGroup.add(top);

        treeGroup.position.set(
            (Math.random() - 0.5) * 150,
            -5, // Below road level slightly
            -Math.random() * 150
        );
        // Keep away from center road
        if (Math.abs(treeGroup.position.x) < 15) treeGroup.position.x += 20 * (Math.sign(treeGroup.position.x) || 1);
        
        scene.add(treeGroup);
    }
  };

  const createRainbowRoad = (scene: THREE.Scene) => {
    const roadGroup = new THREE.Group();
    roadRef.current = roadGroup;

    // Rainbow stripes
    const colors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3]; // ROYGBIV
    const width = 14;
    const segmentWidth = width / colors.length;

    colors.forEach((color, idx) => {
        const geo = new THREE.PlaneGeometry(segmentWidth, 220);
        const mat = new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.9 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.x = (idx - colors.length/2 + 0.5) * segmentWidth;
        mesh.position.z = -60;
        mesh.receiveShadow = true;
        roadGroup.add(mesh);
    });

    // Sparkly edges
    for (let side of [-1, 1]) {
        const edgeGeo = new THREE.CylinderGeometry(0.2, 0.2, 220, 8);
        const edgeMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 }); // Gold
        const edge = new THREE.Mesh(edgeGeo, edgeMat);
        edge.rotation.x = -Math.PI / 2;
        edge.position.set(side * 7.5, 0.1, -60);
        roadGroup.add(edge);
    }

    scene.add(roadGroup);
  };

  const createPlayerUnicorn = (scene: THREE.Scene) => {
    const group = new THREE.Group();
    playerRef.current = group;

    // Body (White Sphere/Capsule approximation)
    const bodyGeo = new THREE.CapsuleGeometry(0.8, 1.5, 4, 8);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.z = Math.PI / 2;
    body.position.y = 1;
    body.castShadow = true;
    group.add(body);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.4, 0.6, 1, 8);
    const neck = new THREE.Mesh(neckGeo, bodyMat);
    neck.position.set(0.8, 1.8, 0);
    neck.rotation.z = -Math.PI / 4;
    group.add(neck);

    // Head
    const headGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(1.2, 2.2, 0);
    group.add(head);

    // Horn (Gold Cone)
    const hornGeo = new THREE.ConeGeometry(0.1, 0.8, 8);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.2 });
    const horn = new THREE.Mesh(hornGeo, hornMat);
    horn.position.set(1.6, 2.6, 0);
    horn.rotation.z = -Math.PI / 4;
    group.add(horn);

    // Mane (Pink)
    const maneGeo = new THREE.BoxGeometry(0.2, 1, 0.2);
    const maneMat = new THREE.MeshLambertMaterial({ color: 0xFF69B4 });
    const mane = new THREE.Mesh(maneGeo, maneMat);
    mane.position.set(0.6, 2.2, 0);
    group.add(mane);

    // Legs (Simple Cylinders)
    const legGeo = new THREE.CylinderGeometry(0.2, 0.15, 1, 8);
    const legPositions = [
        [-0.5, 0.5, 0.4], [-0.5, 0.5, -0.4],
        [0.5, 0.5, 0.4], [0.5, 0.5, -0.4]
    ];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, bodyMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        group.add(leg);
    });

    // Tail
    const tailGeo = new THREE.CylinderGeometry(0.1, 0.3, 0.8, 8);
    const tail = new THREE.Mesh(tailGeo, maneMat);
    tail.position.set(-1, 1, 0);
    tail.rotation.z = Math.PI / 3;
    group.add(tail);

    group.position.set(3, 0, 5);
    scene.add(group);

    // Sparkles (Boost particles)
    createSparkles(scene, group);
  };

  const createFriendlyDragon = (scene: THREE.Scene) => {
    const group = new THREE.Group();
    aiRef.current = group;

    // Body (Green)
    const bodyGeo = new THREE.CapsuleGeometry(0.9, 1.6, 4, 8);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x98FB98 }); // Pale Green
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.z = Math.PI / 2;
    body.position.y = 1;
    body.castShadow = true;
    group.add(body);

    // Wings (Purple)
    const wingGeo = new THREE.PlaneGeometry(2, 1);
    const wingMat = new THREE.MeshBasicMaterial({ color: 0x9370DB, side: THREE.DoubleSide });
    const wingL = new THREE.Mesh(wingGeo, wingMat);
    wingL.position.set(0, 1.5, 1);
    wingL.rotation.x = -Math.PI/4;
    group.add(wingL);
    const wingR = new THREE.Mesh(wingGeo, wingMat);
    wingR.position.set(0, 1.5, -1);
    wingR.rotation.x = Math.PI/4;
    group.add(wingR);

    // Head
    const headGeo = new THREE.BoxGeometry(0.8, 0.8, 1);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(1.2, 1.8, 0);
    group.add(head);

    group.position.set(-3, 0, 3);
    scene.add(group);
  };

  const createObstacle = (scene: THREE.Scene, zPosition: number) => {
    const group = new THREE.Group();
    
    // Storm Cloud Obstacle
    const geo = new THREE.DodecahedronGeometry(1.5, 0);
    const mat = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Grey
    const cloud = new THREE.Mesh(geo, mat);
    cloud.position.y = 1.5;
    cloud.castShadow = true;
    
    // Lightning Bolt
    const boltGeo = new THREE.ConeGeometry(0.2, 1, 4);
    const boltMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
    const bolt = new THREE.Mesh(boltGeo, boltMat);
    bolt.rotation.z = Math.PI;
    bolt.position.y = 0.5;
    
    group.add(cloud);
    group.add(bolt);

    group.position.set(0, 0, zPosition);
    scene.add(group);
    obstaclesRef.current.push(group);
    return group;
  };

  const createSparkles = (scene: THREE.Scene, parent: THREE.Group) => {
    const particleCount = 60;
    const particles = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
        particles[i*3] = (Math.random() - 0.5) * 2;
        particles[i*3+1] = Math.random() * 2;
        particles[i*3+2] = -Math.random() * 5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    const mat = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.3,
        transparent: true,
        opacity: 0.8
    });
    const system = new THREE.Points(geo, mat);
    system.visible = false;
    parent.add(system);
    boostParticlesRef.current = system;
  };

  const setupLighting = (scene: THREE.Scene) => {
    const ambient = new THREE.AmbientLight(0xFFFFFF, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xFFD700, 0.8);
    dir.position.set(10, 20, 10);
    dir.castShadow = true;
    scene.add(dir);
  };

  const updateScene = () => {
    const { playerPosition: pPos, aiPosition: aPos, boost: boostVal, speedPenaltyUntil: penaltyUntil } = stateRef.current;
    
    // Speed logic
    const baseSpeed = 6;
    const relativeLead = pPos - aPos;
    const boostBonus = boostVal > 30 ? 2 : 0;
    const underPenalty = !!(penaltyUntil && Date.now() < penaltyUntil);
    const roadSpeed = Math.max(4, (baseSpeed + relativeLead * 0.15 + boostBonus) * (underPenalty ? 0.6 : 1.0));

    const nextOffset = roadOffsetRef.current + roadSpeed;
    roadOffsetRef.current = nextOffset;
    setRoadOffset(nextOffset);

    // Scroll Road
    if (roadRef.current) {
        roadRef.current.position.z = (nextOffset % 40) - 20;
    }

    // Obstacles Logic
    obstaclesRef.current.forEach((obs, idx) => {
        if (obs) {
            obs.position.z += 0.5; // Move towards player
            if (obs.position.z > 20) {
                sceneRef.current?.remove(obs);
                obstaclesRef.current.splice(idx, 1);
            }
        }
    });

    // Spawn Obstacles & Prompt
    if (itemsPassed > 0 && itemsPassed % 5 === 0 && !showQuestionPrompt) {
        if (sceneRef.current) {
            createObstacle(sceneRef.current, -30);
            setShowQuestionPrompt(true);
        }
    }

    // Collision Detection
    if (playerRef.current && !collisionDetected) {
        const p = playerRef.current.position;
        obstaclesRef.current.forEach(obs => {
            if (obs) {
                const d = Math.sqrt(Math.pow(p.x - obs.position.x, 2) + Math.pow(p.z - obs.position.z, 2));
                if (d < 3) {
                    setCollisionDetected(true);
                    // logic for life lost would be here or handled via state
                    console.log("Hit storm cloud!");
                    sceneRef.current?.remove(obs);
                    const idx = obstaclesRef.current.indexOf(obs);
                    if (idx > -1) obstaclesRef.current.splice(idx, 1);
                }
            }
        });
    }

    // Player Movement & Animation
    if (playerRef.current) {
        playerRef.current.position.x = 3;
        const relativeLead = pPos - aPos;
        const playerZ = 2 - relativeLead * 0.25;
        playerRef.current.position.z = clamp(playerZ, -15, 15);

        // Bobbing Animation
        playerRef.current.position.y = 1 + Math.sin(Date.now() * 0.005) * 0.2;

        // Stagger
        if (characterStaggering) {
            playerRef.current.rotation.z = Math.sin(Date.now() * 0.1) * 0.2;
        } else {
            playerRef.current.rotation.z = 0;
        }

        // Boost effects
        if (boostVal > 30 && boostParticlesRef.current) {
             boostParticlesRef.current.visible = true;
             // Animate particles
             const positions = boostParticlesRef.current.geometry.attributes.position.array as Float32Array;
             for(let i=0; i<positions.length; i+=3) {
                 positions[i+2] -= 0.5;
                 if(positions[i+2] < -10) positions[i+2] = 0;
             }
             boostParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        } else if (boostParticlesRef.current) {
            boostParticlesRef.current.visible = false;
        }
    }

    // AI Movement
    if (aiRef.current) {
        aiRef.current.position.x = -3;
        const relativeLead = pPos - aPos;
        const aiZ = 2 + relativeLead * 0.25;
        aiRef.current.position.z = clamp(aiZ, -15, 15);
        aiRef.current.position.y = 1 + Math.sin(Date.now() * 0.004 + 2) * 0.2;
        
        // Flapping wings simplified (rotation)
        aiRef.current.children.forEach(child => {
             if ((child as THREE.Mesh).geometry instanceof THREE.PlaneGeometry) {
                 // rough wing animation
                 child.rotation.x += 0.1 * Math.sin(Date.now() * 0.01);
             }
        });
    }
  };

  const handleAnswer = (answer: string) => {
      if (!currentQuestion) return;
      const isCorrect = answer === currentQuestion.correctAnswer;
      setAnswerFeedback({
          show: true, isCorrect, selectedAnswer: answer, correctAnswer: currentQuestion.correctAnswer
      });

      if (isCorrect) {
          setCharacterStaggering(false);
          setShowQuestionPrompt(false);
          setCollisionDetected(false);
          setItemsPassed(prev => prev + 1);
          // Move obstacle away
          obstaclesRef.current.forEach(o => {
              if (o) o.position.x = Math.random() > 0.5 ? 8 : -8;
          });
          // Celebration jump
          if (playerRef.current) {
              playerRef.current.position.y += 2;
          }
      } else {
          setCharacterStaggering(true);
          setShowQuestionPrompt(false);
          setFailedQuestions(prev => [...prev, {
              question: currentQuestion.question,
              correctAnswer: currentQuestion.correctAnswer,
              userAnswer: answer,
              options: currentQuestion.options
          }]);
          setTimeout(() => setCharacterStaggering(false), 1500);
      }

      setTimeout(() => setAnswerFeedback(null), 2000);
      answerQuestion(answer);
  };

  useEffect(() => {
      if (sceneRef.current && isPlaying) {
          const timer = setTimeout(() => {
              createObstacle(sceneRef.current!, -30);
              setItemsPassed(1);
          }, 3000);
          return () => clearTimeout(timer);
      }
  }, [isPlaying]);

  useEffect(() => {
      if (playerPosition > 0) {
          const newItemsPassed = Math.floor(playerPosition / 20);
          if (newItemsPassed > itemsPassed) setItemsPassed(newItemsPassed);
      }
  }, [playerPosition, itemsPassed]);

  useEffect(() => {
      if (lives <= 0 && isPlaying && failedQuestions.length > 0) {
          setShowSaveMe(true);
      }
  }, [lives, isPlaying, failedQuestions]);

  return (
    <div className="relative w-full h-screen overflow-hidden select-none font-sans">
        <div ref={mountRef} className="absolute inset-0" />
        
        {/* UI Layer */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="pointer-events-auto p-4">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <LivesIndicator lives={lives} /> 
                        {/* Custom style override for lives/boost could go here if components accept it, assuming they are generic */}
                        <div className="bg-white/30 backdrop-blur-md rounded-full px-4 py-2 text-white font-bold shadow-lg border border-white/50">
                            ✨ Score: {score}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="bg-pink-500/80 backdrop-blur-md rounded-full px-6 py-2 text-white font-bold text-xl shadow-lg border-2 border-white">
                            ⏰ {formattedTime}
                        </div>
                        <div className="bg-purple-500/80 backdrop-blur-md rounded-full px-4 py-1 text-white text-sm border border-white/50">
                            Question {questionsAnswered + 1}/{maxQuestions}
                        </div>
                    </div>
                </div>
            </div>

            {/* Answer Feedback */}
            {answerFeedback?.show && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className={`transform transition-all scale-110 p-8 rounded-3xl shadow-2xl border-4 text-center ${answerFeedback.isCorrect ? 'bg-pink-400 border-white' : 'bg-purple-600 border-red-300'}`}>
                        <div className="text-6xl mb-4">{answerFeedback.isCorrect ? '🌟' : '☁️'}</div>
                        <h2 className="text-3xl font-bold text-white mb-2">{answerFeedback.isCorrect ? 'Magical!' : 'Oops!'}</h2>
                        {!answerFeedback.isCorrect && <div className="text-white">Correct: {answerFeedback.correctAnswer}</div>}
                    </div>
                </div>
            )}

            {/* Question Card */}
            {isPlaying && currentQuestion && !isLoading && !answerFeedback?.show && (
                <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-auto p-4">
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_50px_rgba(255,105,180,0.5)] max-w-2xl w-full border-4 border-pink-300 text-center">
                        <div className="text-pink-500 font-bold uppercase tracking-widest mb-4">Magical Challenge</div>
                        <h3 className="text-2xl md:text-3xl font-bold text-purple-900 mb-8">{currentQuestion.question}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentQuestion.options.map((opt, i) => (
                                <button key={i} onClick={() => handleAnswer(opt)}
                                    className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white text-xl font-bold py-4 px-6 rounded-2xl shadow-lg transform transition hover:scale-105 hover:-translate-y-1 border-2 border-white">
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Obstacle Warning */}
            {showQuestionPrompt && !answerFeedback?.show && (
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-30 animate-bounce">
                    <div className="bg-yellow-400 text-yellow-900 px-8 py-4 rounded-full font-bold text-2xl shadow-xl border-4 border-white">
                        ⚡ Storm Ahead! Answer quickly! ⚡
                    </div>
                </div>
            )}

            {/* Game Over / Victory */}
            {!isPlaying && !isLoading && !showSaveMe && (
                 <div className="absolute inset-0 bg-pink-900/80 flex items-center justify-center z-50 pointer-events-auto">
                     <div className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-lg mx-4 border-8 border-pink-300">
                         <div className="text-6xl mb-6">{lives > 0 ? '🦄' : '🌈'}</div>
                         <h2 className="text-4xl font-bold text-pink-600 mb-4">{lives > 0 ? 'Spectacular!' : 'Good Try!'}</h2>
                         <p className="text-purple-500 text-xl mb-8">Score: {score}</p>
                         <div className="flex gap-4 justify-center">
                             <button onClick={() => window.location.reload()} className="bg-pink-500 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-pink-600 transition">Play Again</button>
                             {onGameComplete && <button onClick={onGameComplete} className="bg-purple-500 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-purple-600 transition">Done</button>}
                         </div>
                     </div>
                 </div>
            )}
        </div>
    </div>
  );
};

export default MagicalAdventureGame;

