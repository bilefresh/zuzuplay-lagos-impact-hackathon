"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGameState } from "@/hooks/useGameState";
import QuestionCard from "./QuestionCard";
import LivesIndicator from "./LivesIndicator";
import BoostIndicator from "./BoostIndicator";

const ThreeJSRacingGame: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const playerCarRef = useRef<THREE.Group>();
  const aiCarRef = useRef<THREE.Group>();
  const roadRef = useRef<THREE.Group>();
  const frameRef = useRef<number>();
  const boostParticlesRef = useRef<THREE.Points>();
  const playerExhaustRef = useRef<THREE.Points>();
  const aiExhaustRef = useRef<THREE.Points>();

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
    showOilSpill,
    isLoading,
    answerQuestion,
    formattedTime,
  } = useGameState();

  const [roadOffset, setRoadOffset] = useState(0);
  const [answerFeedback, setAnswerFeedback] = useState<{show: boolean; isCorrect: boolean; selectedAnswer: string; correctAnswer: string} | null>(null);
  const [showRocks, setShowRocks] = useState(true);
  const [rockBreaking, setRockBreaking] = useState(false);
  const [carStaggering, setCarStaggering] = useState(false);
  const [failedQuestions, setFailedQuestions] = useState<any[]>([]);
  const [showSaveMe, setShowSaveMe] = useState(false);
  const rocksRef = useRef<THREE.Group>();

  // Initialize Three.js scene
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup - positioned to capture both cars in the scene
    const camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 9, 16);
    camera.lookAt(0, 0, -10);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create racing environment
    createEnvironment(scene);
    
    // Create racing track
    createRacingTrack(scene);
    
    // Create cars
    createPlayerCar(scene);
    createAICar(scene);
    
    // Enhanced lighting setup
    setupLighting(scene);
    
    // Add some atmospheric fog for depth
    scene.fog = new THREE.Fog(0x6b4a8c, 30, 200);

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
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createEnvironment = (scene: THREE.Scene) => {
    // Purple/violet sky gradient to match reference image
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x2d1b3e) }, // Deep purple
        bottomColor: { value: new THREE.Color(0x6b4a8c) }, // Lighter purple
        offset: { value: 33 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
  };
  
  const createObstacleRocks = (scene: THREE.Scene) => {
    const rockGroup = new THREE.Group();
    rocksRef.current = rockGroup;
    
    // Create 3 rocks as obstacles on the track
    for (let i = 0; i < 3; i++) {
      const rockGeometry = new THREE.BoxGeometry(2.5, 2, 2.5);
      const rockMaterial = new THREE.MeshLambertMaterial({
        color: 0x8B4513, // Brown color for rocks
        transparent: true
      });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(
        (i - 1) * 3, // Spread across the track
        1,
        -30 - (i * 15) // Stagger them down the track
      );
      rock.castShadow = true;
      rock.userData = { id: i, broken: false };
      rockGroup.add(rock);
    }
    
    scene.add(rockGroup);

    // Purple mountains in the distance to match reference
    for (let i = 0; i < 12; i++) {
      const mountainGeometry = new THREE.ConeGeometry(
        Math.random() * 25 + 15,
        Math.random() * 40 + 30,
        8
      );
      const mountainMaterial = new THREE.MeshLambertMaterial({
        color: new THREE.Color().setHSL(0.75, 0.4, 0.15 + Math.random() * 0.15) // Purple hues
      });
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
      mountain.position.set(
        (Math.random() - 0.5) * 300,
        -10,
        -120 - Math.random() * 80
      );
      scene.add(mountain);
    }

    // Add some scattered rocks/debris
    for (let i = 0; i < 8; i++) {
      const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 2 + 1, 0);
      const rockMaterial = new THREE.MeshLambertMaterial({
        color: new THREE.Color().setHSL(0.75, 0.3, 0.2 + Math.random() * 0.1)
      });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(
        (Math.random() - 0.5) * 80,
        0,
        -Math.random() * 60 - 15
      );
      rock.scale.setScalar(0.3 + Math.random() * 0.7);
      scene.add(rock);
    }
    
    // Create interactive rocks on the track
    createObstacleRocks(scene);
  };

  const createAcaciaTree = () => {
    const tree = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2;
    tree.add(trunk);
    
    // Canopy (flat-topped like acacia)
    const canopyGeometry = new THREE.CylinderGeometry(4, 2, 1.5, 8);
    const canopyMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
    canopy.position.y = 5;
    tree.add(canopy);
    
    return tree;
  };

  const createRacingTrack = (scene: THREE.Scene) => {
    const roadGroup = new THREE.Group();
    roadRef.current = roadGroup;
    
    // Main road surface - teal/turquoise to match reference
    const roadGeometry = new THREE.PlaneGeometry(14, 220);
    const roadMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x4ECDC4, // Teal/turquoise color from reference
      transparent: true,
      opacity: 0.95
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.z = -60;
    road.receiveShadow = true;
    roadGroup.add(road);
    
    // Road markings - center dashed lines (yellow/white)
    for (let i = 0; i < 50; i++) {
      const markingGeometry = new THREE.PlaneGeometry(0.4, 4);
      const markingMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFFD700, // Gold/yellow
        transparent: true,
        opacity: 0.9
      });
      const marking = new THREE.Mesh(markingGeometry, markingMaterial);
      marking.rotation.x = -Math.PI / 2;
      marking.position.set(0, 0.02, -i * 6 + 30);
      roadGroup.add(marking);
    }
    
    // Side road edges - yellow lines like in reference
    for (let side of [-1, 1]) {
      const edgeGeometry = new THREE.PlaneGeometry(0.6, 220);
      const edgeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFFD700,
        transparent: true,
        opacity: 0.8
      });
      const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
      edge.rotation.x = -Math.PI / 2;
      edge.position.set(side * 6.5, 0.03, -60);
      roadGroup.add(edge);
    }
    
    // Side barriers/walls
    for (let side of [-1, 1]) {
      for (let i = 0; i < 45; i++) {
        const barrierGeometry = new THREE.BoxGeometry(0.8, 1.5, 3);
        const barrierMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x2D1B3E // Dark purple to blend with environment
        });
        const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        barrier.position.set(side * 8.5, 0.75, -i * 6);
        barrier.castShadow = true;
        roadGroup.add(barrier);
      }
    }
    
    scene.add(roadGroup);
  };

  const createPlayerCar = (scene: THREE.Scene) => {
    const carGroup = new THREE.Group();
    playerCarRef.current = carGroup;
    
    // Modern racing car design - red color like in reference
    const bodyGeometry = new THREE.BoxGeometry(1.8, 0.6, 4);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xD90429 }); // Bright red
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.3;
    body.castShadow = true;
    carGroup.add(body);
    
    // Car cockpit/cabin
    const cockpitGeometry = new THREE.BoxGeometry(1.4, 0.4, 2);
    const cockpitMaterial = new THREE.MeshLambertMaterial({ color: 0x2B2D42 }); // Dark blue-gray
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0, 0.8, 0.3);
    cockpit.castShadow = true;
    carGroup.add(cockpit);
    
    // Front wing
    const frontWingGeometry = new THREE.BoxGeometry(2.2, 0.1, 0.8);
    const frontWingMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const frontWing = new THREE.Mesh(frontWingGeometry, frontWingMaterial);
    frontWing.position.set(0, 0.1, 1.8);
    frontWing.castShadow = true;
    carGroup.add(frontWing);
    
    // Rear wing
    const rearWingGeometry = new THREE.BoxGeometry(1.6, 0.8, 0.1);
    const rearWingMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const rearWing = new THREE.Mesh(rearWingGeometry, rearWingMaterial);
    rearWing.position.set(0, 1.2, -1.8);
    rearWing.castShadow = true;
    carGroup.add(rearWing);
    
    // Wheels - Formula 1 style
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    
    const wheelPositions = [
      [-1.0, 0, 1.5],   // Front left
      [1.0, 0, 1.5],    // Front right
      [-1.0, 0, -1.5],  // Rear left
      [1.0, 0, -1.5]    // Rear right
    ];
    
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheel.castShadow = true;
      carGroup.add(wheel);
    });
    
    // Car number decal
    const numberGeometry = new THREE.PlaneGeometry(0.6, 0.4);
    const numberMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const number = new THREE.Mesh(numberGeometry, numberMaterial);
    number.position.set(0, 0.9, 0);
    number.rotation.x = -Math.PI / 2;
    carGroup.add(number);
    
    // Position car on right side like in reference image
    carGroup.position.set(3, 0.5, 5);
    carGroup.castShadow = true;
    scene.add(carGroup);
    
    // Create boost particle system
    createBoostParticles(scene, carGroup);
    
    // Create exhaust particles
    createExhaustParticles(carGroup, playerExhaustRef);
  };

  const createAICar = (scene: THREE.Scene) => {
    const carGroup = new THREE.Group();
    aiCarRef.current = carGroup;
    
    // AI car - pink/magenta color like in reference
    const bodyGeometry = new THREE.BoxGeometry(1.8, 0.6, 4);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFF1493 }); // Deep pink
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.3;
    body.castShadow = true;
    carGroup.add(body);
    
    // Car cockpit/cabin
    const cockpitGeometry = new THREE.BoxGeometry(1.4, 0.4, 2);
    const cockpitMaterial = new THREE.MeshLambertMaterial({ color: 0x2B2D42 });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0, 0.8, 0.3);
    cockpit.castShadow = true;
    carGroup.add(cockpit);
    
    // Front wing
    const frontWingGeometry = new THREE.BoxGeometry(2.2, 0.1, 0.8);
    const frontWingMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const frontWing = new THREE.Mesh(frontWingGeometry, frontWingMaterial);
    frontWing.position.set(0, 0.1, 1.8);
    frontWing.castShadow = true;
    carGroup.add(frontWing);
    
    // Rear wing
    const rearWingGeometry = new THREE.BoxGeometry(1.6, 0.8, 0.1);
    const rearWingMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const rearWing = new THREE.Mesh(rearWingGeometry, rearWingMaterial);
    rearWing.position.set(0, 1.2, -1.8);
    rearWing.castShadow = true;
    carGroup.add(rearWing);
    
    // Wheels - Formula 1 style
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    
    const wheelPositions = [
      [-1.0, 0, 1.5], [1.0, 0, 1.5], [-1.0, 0, -1.5], [1.0, 0, -1.5]
    ];
    
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheel.castShadow = true;
      carGroup.add(wheel);
    });
    
    // Car number decal
    const numberGeometry = new THREE.PlaneGeometry(0.6, 0.4);
    const numberMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const number = new THREE.Mesh(numberGeometry, numberMaterial);
    number.position.set(0, 0.9, 0);
    number.rotation.x = -Math.PI / 2;
    carGroup.add(number);
    
    // Position car on left side like in reference image
    carGroup.position.set(-3, 0.5, 3);
    carGroup.castShadow = true;
    scene.add(carGroup);
    
    // Create exhaust particles for AI car
    createExhaustParticles(carGroup, aiExhaustRef);
  };

  const createBoostParticles = (scene: THREE.Scene, playerCar: THREE.Group) => {
    const particleCount = 50;
    const particles = new Float32Array(particleCount * 3);
    
    // Initialize particle positions behind the car
    for (let i = 0; i < particleCount; i++) {
      particles[i * 3] = (Math.random() - 0.5) * 2; // x
      particles[i * 3 + 1] = Math.random() * 0.5; // y
      particles[i * 3 + 2] = -Math.random() * 5; // z (behind car)
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff, // Cyan color for boost
      size: 0.2,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.visible = false; // Initially hidden
    playerCar.add(particleSystem);
    boostParticlesRef.current = particleSystem;
  };

  const createExhaustParticles = (car: THREE.Group, exhaustRef: React.MutableRefObject<THREE.Points | undefined>) => {
    const particleCount = 20;
    const particles = new Float32Array(particleCount * 3);
    
    // Initialize exhaust particle positions at the rear of the car
    for (let i = 0; i < particleCount; i++) {
      particles[i * 3] = (Math.random() - 0.5) * 0.5; // x - small spread
      particles[i * 3 + 1] = 0.2 + Math.random() * 0.3; // y - slightly above ground
      particles[i * 3 + 2] = -1.5 - Math.random() * 2; // z - behind car
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x888888, // Gray smoke color
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
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
  };

  const updateScene = () => {
    // Move road backwards to simulate forward movement
    setRoadOffset(prev => prev + 2); // Increased speed for better effect
    
    if (roadRef.current) {
      roadRef.current.position.z = (roadOffset % 40) - 20; // Better road movement cycle
    }
    
    // Move rocks towards the camera for progression effect
    if (rocksRef.current) {
      rocksRef.current.position.z += 1.5; // Rocks move towards player
      if (rocksRef.current.position.z > 50) {
        rocksRef.current.position.z = -100; // Reset rocks position
        // Reset rock states
        rocksRef.current.children.forEach((rock) => {
          if (rock instanceof THREE.Mesh) {
            rock.userData.broken = false;
            rock.visible = showRocks;
            rock.material.opacity = 1;
          }
        });
      }
    }
    
    // Update car positions based on game state with better scaling and progression
    if (playerCarRef.current) {
      // Keep cars in their lanes but allow some movement
      playerCarRef.current.position.x = 3 + (playerPosition - 50) * 0.05;
      
      // Car progression based on position - move forward as player progresses
      const progressionZ = 5 + (playerPosition / 100) * 15;
      
      // Add stagger effect when wrong answer
      if (carStaggering) {
        playerCarRef.current.position.y = 0.5 + Math.sin(Date.now() * 0.05) * 0.3;
        playerCarRef.current.rotation.z = Math.sin(Date.now() * 0.03) * 0.1;
      } else {
        playerCarRef.current.rotation.z += (0 - playerCarRef.current.rotation.z) * 0.1;
      }
      
      // Add boost effects - more dramatic
      if (boost > 30) {
        // Boost makes car move forward and add visual effects
        playerCarRef.current.position.z = progressionZ + (boost / 100) * 3; // Move forward when boosting
        
        // Add slight bouncing effect during boost
        if (!carStaggering) {
          playerCarRef.current.position.y = 0.5 + Math.sin(Date.now() * 0.02) * 0.1;
        }
        
        // Scale car slightly when boosting
        const boostScale = 1 + (boost / 100) * 0.3;
        playerCarRef.current.scale.setScalar(boostScale);
        
        // Show and animate boost particles
        if (boostParticlesRef.current) {
          boostParticlesRef.current.visible = true;
          
          // Animate particles
          const positions = boostParticlesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < positions.length; i += 3) {
            // Move particles backward (away from car)
            positions[i + 2] -= 0.3;
            
            // Reset particles that moved too far
            if (positions[i + 2] < -10) {
              positions[i] = (Math.random() - 0.5) * 2;
              positions[i + 1] = Math.random() * 0.5;
              positions[i + 2] = 1;
            }
          }
          boostParticlesRef.current.geometry.attributes.position.needsUpdate = true;
          
          // Pulse particle color based on boost level
          const material = boostParticlesRef.current.material as THREE.PointsMaterial;
          material.opacity = 0.5 + (boost / 100) * 0.5;
          material.size = 0.1 + (boost / 100) * 0.3;
        }
      } else {
        // Return to normal position when not boosting
        playerCarRef.current.position.z = progressionZ;
        if (!carStaggering) {
          playerCarRef.current.position.y = 0.5;
        }
        playerCarRef.current.scale.setScalar(1);
        
        // Hide boost particles
        if (boostParticlesRef.current) {
          boostParticlesRef.current.visible = false;
        }
      }
      
      // Rotate wheels based on movement (simulate driving)
      const wheels = playerCarRef.current.children.filter(child => 
        child instanceof THREE.Mesh && child.geometry instanceof THREE.CylinderGeometry
      );
      wheels.forEach(wheel => {
        if (wheel instanceof THREE.Mesh) {
          wheel.rotation.x += 0.2; // Continuous wheel rotation
        }
      });
      
      // Animate exhaust particles
      if (playerExhaustRef.current) {
        const positions = playerExhaustRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          // Move particles backward and upward
          positions[i + 1] += 0.02; // y - rise up
          positions[i + 2] -= 0.1; // z - move backward
          
          // Add some horizontal drift
          positions[i] += (Math.random() - 0.5) * 0.01;
          
          // Reset particles that moved too far
          if (positions[i + 2] < -8 || positions[i + 1] > 2) {
            positions[i] = (Math.random() - 0.5) * 0.5;
            positions[i + 1] = 0.2 + Math.random() * 0.3;
            positions[i + 2] = -1.5;
          }
        }
        playerExhaustRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
    
    if (aiCarRef.current) {
      // AI car movement with better scaling and progression
      aiCarRef.current.position.x = -3 + (aiPosition - 50) * 0.05;
      
      // AI car progression based on position
      const aiProgressionZ = 3 + (aiPosition / 100) * 15;
      aiCarRef.current.position.z = aiProgressionZ;
      
      // AI car has subtle movement animation
      aiCarRef.current.position.y = 0.5 + Math.sin(Date.now() * 0.01) * 0.05;
      
      // Rotate AI car wheels
      const aiWheels = aiCarRef.current.children.filter(child => 
        child instanceof THREE.Mesh && child.geometry instanceof THREE.CylinderGeometry
      );
      aiWheels.forEach(wheel => {
        if (wheel instanceof THREE.Mesh) {
          wheel.rotation.x += 0.15; // Slightly slower than player
        }
      });
      
      // Animate AI exhaust particles
      if (aiExhaustRef.current) {
        const positions = aiExhaustRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          // Move particles backward and upward
          positions[i + 1] += 0.015; // y - rise up (slightly slower than player)
          positions[i + 2] -= 0.08; // z - move backward
          
          // Add some horizontal drift
          positions[i] += (Math.random() - 0.5) * 0.008;
          
          // Reset particles that moved too far
          if (positions[i + 2] < -6 || positions[i + 1] > 1.8) {
            positions[i] = (Math.random() - 0.5) * 0.5;
            positions[i + 1] = 0.2 + Math.random() * 0.3;
            positions[i + 2] = -1.5;
          }
        }
        aiExhaustRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
    
    // Update camera to follow the action smoothly
    if (cameraRef.current && playerCarRef.current) {
      // Dynamic camera positioning for better view
      const targetX = (playerCarRef.current.position.x + (aiCarRef.current?.position.x || 0)) / 2;
      cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 0.08;
      
      // Adjust camera based on boost and game state
      if (boost > 50) {
        cameraRef.current.position.z = 18 + (boost / 100) * 4; // Pull camera back during boost
        cameraRef.current.position.y = 10 + (boost / 100) * 3; // Raise camera during boost
        cameraRef.current.lookAt(0, 0, -15); // Look further ahead during boost
      } else {
        cameraRef.current.position.z += (16 - cameraRef.current.position.z) * 0.05;
        cameraRef.current.position.y += (9 - cameraRef.current.position.y) * 0.05;
        cameraRef.current.lookAt(0, 0, -10); // Normal look ahead
      }
    }
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
    
    // Add visual effects based on answer correctness
    if (isCorrect) {
      // Correct answer: Break through rocks
      setRockBreaking(true);
      if (rocksRef.current && playerCarRef.current) {
        // Find the nearest rock and break it
        const nearestRock = rocksRef.current.children.find(rock => 
          rock instanceof THREE.Mesh && !rock.userData.broken && 
          Math.abs(rock.position.z - playerCarRef.current!.position.z) < 20
        ) as THREE.Mesh;
        
        if (nearestRock) {
          nearestRock.userData.broken = true;
          // Animate rock breaking
          const material = nearestRock.material as THREE.MeshLambertMaterial;
          let opacity = 1;
          const breakAnimation = () => {
            opacity -= 0.05;
            material.opacity = opacity;
            nearestRock.scale.setScalar(1 + (1 - opacity) * 2);
            nearestRock.rotation.x += 0.1;
            nearestRock.rotation.y += 0.1;
            
            if (opacity > 0) {
              requestAnimationFrame(breakAnimation);
            } else {
              nearestRock.visible = false;
            }
          };
          breakAnimation();
        }
      }
      
      setTimeout(() => setRockBreaking(false), 1000);
    } else {
      // Wrong answer: Reduce boost and stagger
      setCarStaggering(true);
      
      // Track failed questions for Ask Zuzuplay
      setFailedQuestions(prev => [...prev, {
        question: currentQuestion.question,
        correctAnswer: currentQuestion.correctAnswer,
        userAnswer: answer,
        options: currentQuestion.options,
        category: currentQuestion.category,
        timestamp: new Date().toISOString()
      }]);
      
      setTimeout(() => setCarStaggering(false), 1500);
    }
    
    // Hide feedback after 2 seconds
    setTimeout(() => {
      setAnswerFeedback(null);
    }, 2000);
    
    answerQuestion(answer);
  };
  
  // Check for game over and show Save Me prompt
  useEffect(() => {
    if (lives <= 0 && isPlaying && failedQuestions.length > 0) {
      setShowSaveMe(true);
    }
  }, [lives, isPlaying, failedQuestions]);
  
  const handleSaveMe = () => {
    const questionsParam = encodeURIComponent(
      failedQuestions.map(q => `${q.question} (Correct: ${q.correctAnswer}, You answered: ${q.userAnswer})`).join('; ')
    );
    
    // Redirect to Ask Zuzuplay
    window.location.href = `/ask?q=Please explain these questions I got wrong and help me understand the concepts: ${questionsParam}`;
  };
  
  const handleNoThanks = () => {
    setShowSaveMe(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Three.js mount point */}
      <div ref={mountRef} className="absolute inset-0" />
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Game UI Elements */}
        <div className="pointer-events-auto">
          <LivesIndicator lives={lives} />
          <BoostIndicator boost={boost} />
          
          {/* Timer with modern styling to match reference */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg" style={{clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 20px 100%)'}}>
              {formattedTime}
            </div>
          </div>

          {/* Progress indicator with modern styling */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg border border-white/20">
            <div className="text-sm font-medium text-white text-center">
              Question {questionsAnswered + 1}/{maxQuestions}
            </div>
            <div className="text-xs text-blue-200 text-center">
              {currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}
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
        
        {/* Question Card - styled to match reference */}
        {isPlaying && currentQuestion && !isLoading && !answerFeedback?.show && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-8 w-[600px] max-w-[90vw] text-white text-center relative">
              {/* Category label */}
              <div className="text-sm opacity-70 mb-2 text-blue-200">
                {currentQuestion.category || "Math"}
              </div>
              
              {/* Question Text */}
              <div className="text-2xl font-bold mb-6 min-h-[50px] leading-relaxed">
                {currentQuestion.question}
              </div>
              
              {/* Answer Options - horizontal layout like reference */}
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all duration-200 hover:scale-105 hover:-translate-y-1 min-w-[120px] shadow-lg"
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save Me Prompt - Ask Zuzuplay Integration */}
        {showSaveMe && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-60 pointer-events-auto">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl text-center max-w-lg mx-4 border-4 border-yellow-400">
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
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-colors shadow-lg"
                >
                  🎓 Ask Zuzuplay for Help!
                </button>
                <button
                  onClick={handleNoThanks}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-colors shadow-lg"
                >
                  No Thanks
                </button>
              </div>
              <div className="text-xs text-yellow-200 mt-4 opacity-75">
                Get personalized explanations for the questions you missed
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
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all font-bold text-lg shadow-lg"
              >
                🏎️ Race Again
              </button>
            </div>
          </div>
        )}

        {/* Racing game status indicator */}
        <div className="absolute bottom-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg p-3 text-white text-xs pointer-events-none">
          <div className="flex items-center space-x-2">
            <span>🏁</span>
            <span>Formula Racing</span>
          </div>
          <div className="text-purple-200 mt-1">Powered by Three.js</div>
          <div className="text-blue-200 mt-1 text-[10px]">
            Player: {Math.round(playerPosition)} | AI: {Math.round(aiPosition)}
          </div>
          <div className="text-cyan-200 mt-1 text-[10px]">
            Boost: {boost}% | Speed: {boost > 30 ? '🚀' : '🏎️'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeJSRacingGame;
