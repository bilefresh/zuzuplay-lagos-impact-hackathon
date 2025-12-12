"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGameState } from "@/hooks/useGameState";
import QuestionCard from "./QuestionCard";
import LivesIndicator from "./LivesIndicator";
import BoostIndicator from "./BoostIndicator";

interface ThreeJSCarRacingGameProps {
  lessonId?: number;
  subjectId?: string;
  lessonName?: string;
  onGameComplete?: () => void;
}

const ThreeJSCarRacingGame: React.FC<ThreeJSCarRacingGameProps> = ({ 
  lessonId,
  subjectId,
  lessonName,
  onGameComplete 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const playerCarRef = useRef<THREE.Group>();
  const roadChunksRef = useRef<THREE.Group[]>([]);
  const obstacleCarsRef = useRef<THREE.Group[]>([]);
  const frameRef = useRef<number>();
  const boostParticlesRef = useRef<THREE.Points>();
  const playerExhaustRef = useRef<THREE.Points>();

  const {
    score,
    lives,
    playerPosition,
    currentQuestion,
    isPlaying,
    boost,
    currentDifficulty,
    questionsAnswered,
    maxQuestions,
    isLoading,
    answerQuestion,
    formattedTime,
  } = useGameState(lessonId, subjectId);

  const [roadOffset, setRoadOffset] = useState(0);
  const [answerFeedback, setAnswerFeedback] = useState<{show: boolean; isCorrect: boolean; selectedAnswer: string; correctAnswer: string} | null>(null);
  const [showQuestionPrompt, setShowQuestionPrompt] = useState(false);
  const [collisionDetected, setCollisionDetected] = useState(false);
  const [carsPassed, setCarsPassed] = useState(0);
  const [playerSpeed, setPlayerSpeed] = useState(1.4);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [showSaveMe, setShowSaveMe] = useState(false);
  const [failedQuestions, setFailedQuestions] = useState<any[]>([]);
  const [questionTriggered, setQuestionTriggered] = useState(false);
  const [obstacleCarNearby, setObstacleCarNearby] = useState(false);
  const [autoMovementEnabled, setAutoMovementEnabled] = useState(true);
  const [currentQuestionDifficulty, setCurrentQuestionDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [autoSteerDirection, setAutoSteerDirection] = useState<'left' | 'right' | 'center'>('center');
  const [showDifficultyChange, setShowDifficultyChange] = useState(false);
  const [previousDifficulty, setPreviousDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  // Game constants
  const ROAD_CHUNK_SIZE = 40;
  const RENDER_DISTANCE = 8;
  const CAR_SPAWN_DISTANCE = 200;
  const QUESTION_TRIGGER_INTERVAL = 5; // Every 5-6 cars
  const AUTO_STEER_SPEED = 0.15;
  const MAX_STEER_ANGLE = 30;

  // Initialize Three.js scene
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup - positioned like carv2 game
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.set(0, 45, 30);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x69c6d0, 1); // Sky blue like carv2
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create racing environment
    createEnvironment(scene);
    createRoadChunks(scene);
    createPlayerCar(scene);
    setupLighting(scene);

    // Add fog for depth
    scene.fog = new THREE.Fog(0x69c6d0, 0.01, 400);

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

    // Add keyboard controls for manual steering
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!autoMovementEnabled && playerCarRef.current) {
        const car = playerCarRef.current;
        switch (event.key) {
          case 'ArrowLeft':
          case 'a':
          case 'A':
            if (car.position.x > -15) {
              car.position.x -= AUTO_STEER_SPEED * 2;
              car.rotation.y = Math.min(car.rotation.y + 0.02, MAX_STEER_ANGLE * Math.PI / 180);
            }
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            if (car.position.x < 15) {
              car.position.x += AUTO_STEER_SPEED * 2;
              car.rotation.y = Math.max(car.rotation.y - 0.02, -MAX_STEER_ANGLE * Math.PI / 180);
            }
            break;
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!autoMovementEnabled && playerCarRef.current) {
        const car = playerCarRef.current;
        if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A' ||
            event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
          // Gradually return to center
          car.rotation.y *= 0.95;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [autoMovementEnabled]);

  const createEnvironment = (scene: THREE.Scene) => {
    // Grass on sides
    const grassGeometry = new THREE.PlaneGeometry(400, 400);
    const grassMaterial = new THREE.MeshLambertMaterial({ color: 0xbbe868 });
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(0, -0.05, 0);
    grass.receiveShadow = true;
    scene.add(grass);
  };

  const createRoadChunks = (scene: THREE.Scene) => {
    for (let i = 1; i > -RENDER_DISTANCE; i--) {
      const chunk = createRoadChunk(i * ROAD_CHUNK_SIZE);
      roadChunksRef.current.push(chunk);
      scene.add(chunk);
    }
  };

  const createRoadChunk = (zPosition: number) => {
    const chunkGroup = new THREE.Group();
    chunkGroup.position.set(0, 0, zPosition);
    
    // Road surface
    const surfaceGeometry = new THREE.PlaneGeometry(ROAD_CHUNK_SIZE, ROAD_CHUNK_SIZE);
    const surfaceMaterial = new THREE.MeshLambertMaterial({ color: 0x575757 });
    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surface.rotation.x = -Math.PI / 2;
    surface.position.set(0, 0, 0);
    surface.receiveShadow = true;
    chunkGroup.add(surface);

    // Shoulder lines
    const lineGeometry = new THREE.PlaneGeometry(1, ROAD_CHUNK_SIZE);
    const lineMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    
    const leftShoulder = new THREE.Mesh(lineGeometry, lineMaterial);
    leftShoulder.rotation.x = -Math.PI / 2;
    leftShoulder.position.set(-ROAD_CHUNK_SIZE * 0.375, 0.01, 0);
    chunkGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(lineGeometry, lineMaterial);
    rightShoulder.rotation.x = -Math.PI / 2;
    rightShoulder.position.set(ROAD_CHUNK_SIZE * 0.375, 0.01, 0);
    chunkGroup.add(rightShoulder);

    // Dotted center lines
    const dotLineGeometry = new THREE.PlaneGeometry(1, 4);
    const dotLineMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    
    for (let l = 0; l < 3; l++) {
      const y = ROAD_CHUNK_SIZE / 2 - (ROAD_CHUNK_SIZE / 3) * l - 2;
      
      const leftLine = new THREE.Mesh(dotLineGeometry, dotLineMaterial);
      leftLine.rotation.x = -Math.PI / 2;
      leftLine.position.set(-ROAD_CHUNK_SIZE * 0.125, 0.01, y);
      chunkGroup.add(leftLine);

      const rightLine = new THREE.Mesh(dotLineGeometry, dotLineMaterial);
      rightLine.rotation.x = -Math.PI / 2;
      rightLine.position.set(ROAD_CHUNK_SIZE * 0.125, 0.01, y);
      chunkGroup.add(rightLine);
    }

    return chunkGroup;
  };

  const createPlayerCar = (scene: THREE.Scene) => {
    const carGroup = new THREE.Group();
    playerCarRef.current = carGroup;
    
    // Car body - red like in carv2
    const bodyGeometry = new THREE.BoxGeometry(5, 3, 10);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff1717 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 1.5, 0);
    body.castShadow = true;
    carGroup.add(body);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 24);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x171717 });
    
    const wheelPositions = [
      { x: -2.25, y: 0, z: 3, name: "BL" },
      { x: 2.25, y: 0, z: 3, name: "BR" },
      { x: -2.25, y: 0, z: -3, name: "FL" },
      { x: 2.25, y: 0, z: -3, name: "FR" }
    ];
    
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = -Math.PI / 2;
      wheel.position.set(pos.x, pos.y, pos.z);
      wheel.name = pos.name;
      wheel.castShadow = true;
      carGroup.add(wheel);
    });

    // Windows
    const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x171717 });
    
    // Front and back windows
    const frontWindowGeometry = new THREE.PlaneGeometry(4.4, 0.8);
    const frontWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
    frontWindow.position.set(0, 2.4, -5.01);
    frontWindow.rotation.y = Math.PI;
    frontWindow.receiveShadow = true;
    carGroup.add(frontWindow);

    const backWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
    backWindow.position.set(0, 2.4, 5.01);
    backWindow.receiveShadow = true;
    carGroup.add(backWindow);

    // Side windows
    const sideWindowGeometry = new THREE.PlaneGeometry(2.3, 0.8);
    const leftWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
    leftWindow.position.set(-2.51, 2.4, -0.4);
    leftWindow.rotation.y = -Math.PI / 2;
    leftWindow.receiveShadow = true;
    carGroup.add(leftWindow);

    const rightWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
    rightWindow.position.set(2.51, 2.4, -0.4);
    rightWindow.rotation.y = Math.PI / 2;
    rightWindow.receiveShadow = true;
    carGroup.add(rightWindow);

    // Lights
    const lightGeometry = new THREE.PlaneGeometry(1, 0.5);
    const frontLightMaterial = new THREE.MeshLambertMaterial({ color: 0xf1f1f1 });
    const backLightMaterial = new THREE.MeshLambertMaterial({ color: 0xf65555 });
    
    const frontLeftLight = new THREE.Mesh(lightGeometry, frontLightMaterial);
    frontLeftLight.position.set(-2, 0.25, -5.01);
    frontLeftLight.rotation.y = Math.PI;
    carGroup.add(frontLeftLight);

    const frontRightLight = new THREE.Mesh(lightGeometry, frontLightMaterial);
    frontRightLight.position.set(2, 0.25, -5.01);
    frontRightLight.rotation.y = Math.PI;
    carGroup.add(frontRightLight);

    const backLeftLight = new THREE.Mesh(lightGeometry, backLightMaterial);
    backLeftLight.position.set(-2, 0.25, 5.01);
    carGroup.add(backLeftLight);

    const backRightLight = new THREE.Mesh(lightGeometry, backLightMaterial);
    backRightLight.position.set(2, 0.25, 5.01);
    carGroup.add(backRightLight);

    // Position car
    carGroup.position.set(0, 2, 0);
    carGroup.castShadow = true;
    scene.add(carGroup);

    // Create boost particles
    createBoostParticles(scene, carGroup);
    createExhaustParticles(carGroup, playerExhaustRef);
  };

  const createObstacleCar = (scene: THREE.Scene, zPosition: number) => {
    const carGroup = new THREE.Group();
    
    // Random car color
    const colors = [0x666666, 0x444444, 0x888888, 0x333333];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Car body
    const bodyGeometry = new THREE.BoxGeometry(5, 3, 10);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 1.5, 0);
    body.castShadow = true;
    carGroup.add(body);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 24);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x171717 });
    
    const wheelPositions = [
      { x: -2.25, y: 0, z: 3 },
      { x: 2.25, y: 0, z: 3 },
      { x: -2.25, y: 0, z: -3 },
      { x: 2.25, y: 0, z: -3 }
    ];
    
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = -Math.PI / 2;
      wheel.position.set(pos.x, pos.y, pos.z);
      wheel.castShadow = true;
      carGroup.add(wheel);
    });

    // Position obstacle car
    carGroup.position.set(0, 2, zPosition);
    carGroup.castShadow = true;
    carGroup.userData = { type: 'obstacle', id: Date.now() + Math.random() };
    
    scene.add(carGroup);
    obstacleCarsRef.current.push(carGroup);
    
    return carGroup;
  };

  const createBoostParticles = (scene: THREE.Scene, playerCar: THREE.Group) => {
    const particleCount = 50;
    const particles = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      particles[i * 3] = (Math.random() - 0.5) * 2;
      particles[i * 3 + 1] = Math.random() * 0.5;
      particles[i * 3 + 2] = -Math.random() * 5;
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.2,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.visible = false;
    playerCar.add(particleSystem);
    boostParticlesRef.current = particleSystem;
  };

  const createExhaustParticles = (car: THREE.Group, exhaustRef: React.MutableRefObject<THREE.Points | undefined>) => {
    const particleCount = 20;
    const particles = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      particles[i * 3] = (Math.random() - 0.5) * 0.5;
      particles[i * 3 + 1] = 0.2 + Math.random() * 0.3;
      particles[i * 3 + 2] = -1.5 - Math.random() * 2;
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x888888,
      size: 0.15,
      transparent: true,
      opacity: 0.4,
      blending: THREE.NormalBlending
    });
    
    const exhaustSystem = new THREE.Points(particleGeometry, particleMaterial);
    car.add(exhaustSystem);
    exhaustRef.current = exhaustSystem;
  };

  const setupLighting = (scene: THREE.Scene) => {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Hemisphere light
    const hemiLight = new THREE.HemisphereLight(0x0044ff, 0xffffff, 0.5);
    hemiLight.position.set(0, 5, 0);
    scene.add(hemiLight);
    
    // Point light (following camera)
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 60, -60);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    scene.add(pointLight);
  };

  // Function to determine difficulty based on question level
  const getDifficultyFromQuestion = (question: any): 'easy' | 'medium' | 'hard' => {
    if (!question) return 'easy';
    
    // Use the question's difficulty property if available
    if (question.difficulty) {
      return question.difficulty;
    }
    
    // Fallback: determine difficulty based on question complexity
    const questionText = question.question.toLowerCase();
    const hasComplexTerms = questionText.includes('calculate') || 
                           questionText.includes('solve') || 
                           questionText.includes('determine') ||
                           questionText.includes('analyze') ||
                           questionText.includes('equation') ||
                           questionText.includes('formula');
    
    const hasMediumTerms = questionText.includes('what is') ||
                          questionText.includes('which') ||
                          questionText.includes('how many');
    
    if (hasComplexTerms) return 'hard';
    if (hasMediumTerms || questionText.length > 50) return 'medium';
    return 'easy';
  };

  // Function to update game difficulty based on current question
  const updateGameDifficulty = (question: any) => {
    const newDifficulty = getDifficultyFromQuestion(question);
    
    // Show difficulty change notification if it changed
    if (newDifficulty !== currentQuestionDifficulty) {
      setPreviousDifficulty(currentQuestionDifficulty);
      setCurrentQuestionDifficulty(newDifficulty);
      setShowDifficultyChange(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowDifficultyChange(false);
      }, 3000);
    } else {
      setCurrentQuestionDifficulty(newDifficulty);
    }
    
    // Adjust game speed and spawn rate based on difficulty
    switch (newDifficulty) {
      case 'easy':
        setGameSpeed(1.0);
        break;
      case 'medium':
        setGameSpeed(1.3);
        break;
      case 'hard':
        setGameSpeed(1.6);
        break;
    }
  };

  // Function to handle automatic car movement
  const handleAutoMovement = () => {
    if (!autoMovementEnabled || !playerCarRef.current) return;
    
    const car = playerCarRef.current;
    const currentX = car.position.x;
    
    // Auto-steer logic based on current direction
    switch (autoSteerDirection) {
      case 'left':
        if (currentX > -15) {
          car.position.x -= AUTO_STEER_SPEED;
          car.rotation.y = Math.min(car.rotation.y + 0.01, MAX_STEER_ANGLE * Math.PI / 180);
        }
        break;
      case 'right':
        if (currentX < 15) {
          car.position.x += AUTO_STEER_SPEED;
          car.rotation.y = Math.max(car.rotation.y - 0.01, -MAX_STEER_ANGLE * Math.PI / 180);
        }
        break;
      case 'center':
        // Return to center
        if (Math.abs(currentX) > 0.5) {
          const direction = currentX > 0 ? -1 : 1;
          car.position.x += direction * AUTO_STEER_SPEED;
          car.rotation.y *= 0.95; // Gradually straighten
        } else {
          car.rotation.y *= 0.95;
        }
        break;
    }
  };

  const updateScene = () => {
    if (!isPlaying) return;

    // Handle automatic car movement
    handleAutoMovement();

    // Update road movement
    // Tie road speed to player speed so motion is obvious even when gameSpeed is low
    const roadSpeed = (gameSpeed * 1.5) + (playerSpeed * 1.2);
    setRoadOffset(prev => prev + roadSpeed);
    
    // Move road chunks
    roadChunksRef.current.forEach((chunk, index) => {
      if (chunk) {
        chunk.position.z += roadSpeed;
        
        // Reset chunk position when it goes too far back
        if (chunk.position.z > ROAD_CHUNK_SIZE) {
          chunk.position.z -= ROAD_CHUNK_SIZE * (RENDER_DISTANCE + 1);
        }
      }
    });

    // Update obstacle cars
    obstacleCarsRef.current.forEach((car, index) => {
      if (car) {
        // Move obstacle cars forward along the track (same direction as player)
        car.position.z -= gameSpeed * 1.0;
        
        // Remove cars that are behind the player
        if (car.position.z > 50) {
          sceneRef.current?.remove(car);
          obstacleCarsRef.current.splice(index, 1);
        }
      }
    });

    // Spawn new obstacle cars and trigger questions
    if (carsPassed > 0 && carsPassed % QUESTION_TRIGGER_INTERVAL === 0 && !questionTriggered) {
      if (sceneRef.current) {
        createObstacleCar(sceneRef.current, -CAR_SPAWN_DISTANCE);
        setQuestionTriggered(true);
        setShowQuestionPrompt(true);
        
        // Update game difficulty based on current question
        if (currentQuestion) {
          updateGameDifficulty(currentQuestion);
        }
      }
    }

    // Check for collisions and proximity to obstacle cars
    if (playerCarRef.current && !collisionDetected) {
      const playerPos = playerCarRef.current.position;
      let nearbyCar = false;
      
      obstacleCarsRef.current.forEach((obstacleCar) => {
        if (obstacleCar) {
          const obstaclePos = obstacleCar.position;
          const distance = Math.sqrt(
            Math.pow(playerPos.x - obstaclePos.x, 2) + 
            Math.pow(playerPos.z - obstaclePos.z, 2)
          );
          
          // Check if car is nearby (for question triggering)
          if (distance < 15 && !obstacleCarNearby) {
            setObstacleCarNearby(true);
            nearbyCar = true;
          }
          
          // Collision detection
          if (distance < 6) {
            setCollisionDetected(true);
            handleCollision();
            
            // Remove the obstacle car
            sceneRef.current?.remove(obstacleCar);
            const carIndex = obstacleCarsRef.current.indexOf(obstacleCar);
            if (carIndex > -1) {
              obstacleCarsRef.current.splice(carIndex, 1);
            }
          }
        }
      });
      
      if (!nearbyCar) {
        setObstacleCarNearby(false);
      }
    }

    // Update player car position and effects
    if (playerCarRef.current) {
      // Car movement based on speed
      playerCarRef.current.position.z -= playerSpeed;
      
      // Boost effects
      if (boost > 30) {
        if (boostParticlesRef.current) {
          boostParticlesRef.current.visible = true;
          
          const positions = boostParticlesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] -= 0.3;
            
            if (positions[i + 2] < -10) {
              positions[i] = (Math.random() - 0.5) * 2;
              positions[i + 1] = Math.random() * 0.5;
              positions[i + 2] = 1;
            }
          }
          boostParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
      } else {
        if (boostParticlesRef.current) {
          boostParticlesRef.current.visible = false;
        }
      }
      
      // Rotate wheels
      const wheels = playerCarRef.current.children.filter(child => 
        child instanceof THREE.Mesh && child.geometry instanceof THREE.CylinderGeometry
      );
      wheels.forEach(wheel => {
        if (wheel instanceof THREE.Mesh) {
          wheel.rotation.x += playerSpeed * 0.1;
        }
      });
      
      // Animate exhaust particles
      if (playerExhaustRef.current) {
        const positions = playerExhaustRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += 0.02;
          positions[i + 2] -= 0.1;
          positions[i] += (Math.random() - 0.5) * 0.01;
          
          if (positions[i + 2] < -8 || positions[i + 1] > 2) {
            positions[i] = (Math.random() - 0.5) * 0.5;
            positions[i + 1] = 0.2 + Math.random() * 0.3;
            positions[i + 2] = -1.5;
          }
        }
        playerExhaustRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }

    // Update camera to follow player
    if (cameraRef.current && playerCarRef.current) {
      const targetZ = playerCarRef.current.position.z + 30;
      cameraRef.current.position.z += (targetZ - cameraRef.current.position.z) * 0.05;
    }
  };

  const handleCollision = () => {
    // Reduce lives and speed
    setPlayerSpeed(prev => Math.max(prev - 0.3, 0.1)); // Reduce speed more
    setGameSpeed(prev => Math.max(prev - 0.2, 0.3)); // Reduce game speed more
    
    // Show collision feedback
    setTimeout(() => {
      setCollisionDetected(false);
    }, 1000);
  };

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;
    
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    // Show answer feedback
    setAnswerFeedback({
      show: true,
      isCorrect,
      selectedAnswer: answer,
      correctAnswer: currentQuestion.correctAnswer
    });
    
    if (isCorrect) {
      // Correct answer: avoid collision and get boost
      setShowQuestionPrompt(false);
      setCollisionDetected(false);
      setCarsPassed(prev => prev + 1);
      setQuestionTriggered(false);
      
      // Automatically avoid obstacle cars by steering away
      const avoidDirection = Math.random() > 0.5 ? 'left' : 'right';
      setAutoSteerDirection(avoidDirection);
      
      // Automatically move obstacle cars out of the way
      obstacleCarsRef.current.forEach((obstacleCar) => {
        if (obstacleCar) {
          obstacleCar.position.x = avoidDirection === 'left' ? 15 : -15;
        }
      });
      
      // Speed boost based on current question difficulty level
      const difficultyMultiplier = currentQuestionDifficulty === 'easy' ? 0.2 : 
                                  currentQuestionDifficulty === 'medium' ? 0.3 : 0.4;
      setPlayerSpeed(prev => Math.min(prev + difficultyMultiplier, 3));
      setGameSpeed(prev => Math.min(prev + difficultyMultiplier * 0.7, 2));
      
      // Return to center after avoiding
      setTimeout(() => {
        setAutoSteerDirection('center');
      }, 1000);
    } else {
      // Wrong answer: reduce speed and track failed questions
      const difficultyPenalty = currentQuestionDifficulty === 'easy' ? 0.3 : 
                               currentQuestionDifficulty === 'medium' ? 0.4 : 0.5;
      setPlayerSpeed(prev => Math.max(prev - difficultyPenalty, 0.1));
      setGameSpeed(prev => Math.max(prev - difficultyPenalty * 0.7, 0.3));
      setShowQuestionPrompt(false);
      setQuestionTriggered(false);
      
      // Auto-steer to avoid collision (less effective than correct answer)
      const avoidDirection = Math.random() > 0.5 ? 'left' : 'right';
      setAutoSteerDirection(avoidDirection);
      
      // Return to center after a shorter time
      setTimeout(() => {
        setAutoSteerDirection('center');
      }, 500);
      
      setFailedQuestions(prev => [...prev, {
        question: currentQuestion.question,
        correctAnswer: currentQuestion.correctAnswer,
        userAnswer: answer,
        options: currentQuestion.options,
        category: currentQuestion.category,
        timestamp: new Date().toISOString()
      }]);
    }
    
    // Hide feedback after 2 seconds
    setTimeout(() => {
      setAnswerFeedback(null);
    }, 2000);
    
    answerQuestion(answer);
  };

  // Spawn initial obstacle cars
  useEffect(() => {
    if (sceneRef.current && isPlaying) {
      const timer = setTimeout(() => {
        createObstacleCar(sceneRef.current!, -CAR_SPAWN_DISTANCE);
        setCarsPassed(1);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying]);

  // Update cars passed counter
  useEffect(() => {
    if (playerPosition > 0) {
      const newCarsPassed = Math.floor(playerPosition / 20);
      if (newCarsPassed > carsPassed) {
        setCarsPassed(newCarsPassed);
      }
    }
  }, [playerPosition, carsPassed]);

  // Check for game over and show Save Me prompt
  useEffect(() => {
    if (lives <= 0 && isPlaying && failedQuestions.length > 0) {
      setShowSaveMe(true);
    }
  }, [lives, isPlaying, failedQuestions]);

  // Update game difficulty when current question changes
  useEffect(() => {
    if (currentQuestion) {
      updateGameDifficulty(currentQuestion);
    }
  }, [currentQuestion]);

  const handleSaveMe = () => {
    const questionsParam = encodeURIComponent(
      failedQuestions.map(q => `${q.question} (Correct: ${q.correctAnswer}, You answered: ${q.userAnswer})`).join('; ')
    );
    
    window.location.href = `/ask?q=Please explain these questions I got wrong and help me understand the concepts: ${questionsParam}`;
  };

  const handleNoThanks = () => {
    setShowSaveMe(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden touch-manipulation">
      {/* Three.js mount point */}
      <div ref={mountRef} className="absolute inset-0 touch-none" />
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Game UI Elements */}
        <div className="pointer-events-auto">
          <LivesIndicator lives={lives} />
          <BoostIndicator boost={boost} />
          
          {/* Auto-movement toggle */}
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setAutoMovementEnabled(!autoMovementEnabled)}
              className={`px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition-all ${
                autoMovementEnabled 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              {autoMovementEnabled ? '🤖 Auto ON' : '👤 Manual'}
            </button>
          </div>
          
          {/* Timer */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
              {formattedTime}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg border border-white/20">
            <div className="text-sm font-medium text-white text-center">
              Question {questionsAnswered + 1}/{maxQuestions}
            </div>
            <div className="text-xs text-blue-200 text-center">
              Question Level: {currentQuestionDifficulty.charAt(0).toUpperCase() + currentQuestionDifficulty.slice(1)}
            </div>
            <div className="text-xs text-green-200 text-center">
              Auto-Move: {autoMovementEnabled ? 'ON' : 'OFF'}
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-auto">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 shadow-lg text-center">
              <div className="text-lg font-bold text-white mb-2">🏎️ Loading Race...</div>
              <div className="w-32 h-2 bg-purple-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 animate-pulse rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Answer Feedback Overlay */}
        {answerFeedback?.show && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40 pointer-events-none">
            <div className={`p-8 rounded-2xl shadow-2xl text-center transform animate-bounce ${
              answerFeedback.isCorrect 
                ? 'bg-green-500 border-4 border-green-300' 
                : 'bg-red-500 border-4 border-red-300'
            }`}>
              <div className="text-6xl mb-4">
                {answerFeedback.isCorrect ? '✅' : '❌'}
              </div>
              <div className="text-2xl font-bold text-white mb-4">
                {answerFeedback.isCorrect ? 'Correct!' : 'Wrong Answer!'}
              </div>
              {!answerFeedback.isCorrect && (
                <div className="text-lg text-white">
                  <div className="mb-2">You chose: <span className="bg-red-700 px-3 py-1 rounded">{answerFeedback.selectedAnswer}</span></div>
                  <div>Correct answer: <span className="bg-green-600 px-3 py-1 rounded">{answerFeedback.correctAnswer}</span></div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Difficulty change notification */}
        {showDifficultyChange && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 backdrop-blur-md border-4 border-yellow-400 shadow-2xl rounded-2xl p-6 text-white text-center animate-bounce">
              <div className="text-4xl mb-3">📈</div>
              <div className="text-xl font-bold mb-2">
                Difficulty Changed!
              </div>
              <div className="text-lg">
                {previousDifficulty.charAt(0).toUpperCase() + previousDifficulty.slice(1)} → {currentQuestionDifficulty.charAt(0).toUpperCase() + currentQuestionDifficulty.slice(1)}
              </div>
              <div className="text-sm text-yellow-200 mt-2">
                Game speed adjusted automatically
              </div>
            </div>
          </div>
        )}

        {/* Auto-steering indicator */}
        {autoMovementEnabled && autoSteerDirection !== 'center' && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
            <div className="bg-blue-500/80 backdrop-blur-md border border-blue-300 shadow-2xl rounded-2xl p-4 text-white text-center">
              <div className="text-2xl mb-2">
                {autoSteerDirection === 'left' ? '⬅️' : '➡️'}
              </div>
              <div className="text-sm font-bold">
                Auto-Steering {autoSteerDirection === 'left' ? 'Left' : 'Right'}
              </div>
            </div>
          </div>
        )}

        {/* Question Card - show when approaching obstacle cars */}
        {isPlaying && currentQuestion && !isLoading && !answerFeedback?.show && (showQuestionPrompt || obstacleCarNearby) && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-8 w-[600px] text-white text-center">
              <div className="text-sm opacity-70 mb-2 text-blue-200">
                {currentQuestion.category || "Math"}
              </div>
              
              <div className="text-2xl font-bold mb-6 min-h-[50px] leading-relaxed">
                {currentQuestion.question}
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all duration-200 hover:scale-105 hover:-translate-y-1 min-w-[120px] shadow-lg touch-manipulation"
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Obstacle Warning - show when question is triggered */}
        {showQuestionPrompt && !answerFeedback?.show && !obstacleCarNearby && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto">
            <div className="bg-red-500/90 backdrop-blur-md border-4 border-red-300 shadow-2xl rounded-2xl p-8 text-white text-center animate-pulse">
              <div className="text-6xl mb-4">⚠️</div>
              <div className="text-2xl font-bold mb-4">
                Obstacle Ahead!
              </div>
              <div className="text-xl mb-4">
                Answer the question correctly to avoid collision!
              </div>
              <div className="text-sm text-red-100">
                Wrong answer = Life lost!
              </div>
            </div>
          </div>
        )}

        {/* Save Me Prompt */}
        {showSaveMe && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-60 pointer-events-auto">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl text-center max-w-lg border-4 border-yellow-400">
              <div className="text-4xl mb-4">🆘</div>
              <div className="text-2xl font-bold text-white mb-4">Game Over! Need Help?</div>
              <div className="text-lg text-yellow-100 mb-6">
                I noticed you struggled with some questions. Let me explain the concepts and help you learn!
              </div>
              <div className="text-sm text-yellow-200 mb-6">
                Score: {score} | Time: {formattedTime} | Questions: {questionsAnswered}/{maxQuestions}
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleSaveMe}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-colors shadow-lg touch-manipulation"
                >
                  🎓 Ask Zuzuplay for Help!
                </button>
                <button
                  onClick={handleNoThanks}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-colors shadow-lg touch-manipulation"
                >
                  No Thanks
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Game Over Screen */}
        {!isPlaying && !isLoading && !showSaveMe && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 pointer-events-auto">
            <div className="bg-gradient-to-br from-purple-800 via-purple-600 to-blue-600 rounded-2xl p-8 shadow-2xl text-center border border-purple-400">
              <h2 className="text-4xl font-bold text-white mb-4">
                🏎️ {lives > 0 ? "Victory!" : "Try Again!"} 🏁
              </h2>
              <div className="text-lg text-purple-100 mb-6">
                Final Score: {score} | Time: {formattedTime}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all font-bold text-lg shadow-lg touch-manipulation"
                >
                  🏎️ Race Again
                </button>
                {onGameComplete && (
                  <button
                    onClick={onGameComplete}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-bold text-lg shadow-lg touch-manipulation"
                  >
                    📚 Back to Lessons
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Game status indicator */}
        <div className="absolute bottom-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg p-3 text-white text-xs pointer-events-none">
          <div className="flex items-center space-x-2">
            <span>🏁</span>
            <span>Car Racing</span>
          </div>
          <div className="text-purple-200 mt-1">Powered by Three.js</div>
          <div className="text-blue-200 mt-1 text-[10px]">
            Speed: {playerSpeed.toFixed(1)} | Cars Passed: {carsPassed}
          </div>
          <div className="text-cyan-200 mt-1 text-[10px]">
            Boost: {boost}% | Game Speed: {gameSpeed.toFixed(1)}
          </div>
          <div className="text-yellow-200 mt-1 text-[10px]">
            Q-Difficulty: {currentQuestionDifficulty} | Lives: {lives}
          </div>
          <div className="text-green-200 mt-1 text-[10px]">
            Auto-Steer: {autoSteerDirection} | Speed: {gameSpeed.toFixed(1)}x
          </div>
          {obstacleCarNearby && (
            <div className="text-red-200 mt-1 text-[10px] animate-pulse">
              ⚠️ Obstacle Nearby!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreeJSCarRacingGame;
