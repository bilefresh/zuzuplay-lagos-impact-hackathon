import React, { useState, useEffect } from "react";
import Image from "next/image";
import playerCar from "../../assets/icons/playerCar.svg";

interface PlayerCarProps {
  position: number;
  boost: number;
}

const PlayerCar: React.FC<PlayerCarProps> = ({ position, boost }) => {
  const [smokeParticles, setSmokeParticles] = useState<
    Array<{ id: number; size: number; left: number; opacity: number }>
  >([]);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  // Track screen size for responsive scaling
  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Calculate responsive scaling factor based on screen size
  const getResponsiveScale = () => {
    const baseWidth = 1024; // Base design width
    const scaleFactor = Math.min(screenSize.width / baseWidth, 1);
    return Math.max(0.3, scaleFactor); // Minimum scale of 0.3 for mobile
  };

  // Generate smoke effect when boost is high
  useEffect(() => {
    if (boost > 50) {
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: Date.now() + i,
        size: Math.random() * 15 + 8,
        left: Math.random() * 40 - 20,
        opacity: 0.7,
      }));

      setSmokeParticles((prev) => [...prev, ...newParticles]);

      const timer = setTimeout(() => {
        setSmokeParticles((prev) =>
          prev.filter((p) => p.id !== newParticles[0].id)
        );
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [boost]);

  // Calculate car position in 3D space - moving into the distance
  const getCarPosition = () => {
    // Position represents progress along the track (0-100)
    // Invert the progress so high position values make car appear to come toward camera
    const progress = (100 - (position % 100)) / 100; // Normalized progress 1 to 0

    // Cars start small at the top/horizon (progress=0) and get larger as they approach (progress=1)
    const baseScale = 0.2; // Small at horizon
    const scaleFactor = 1.8; // How much bigger they get
    const scale = baseScale + progress * scaleFactor;

    // Cars start high (at horizon) and move down toward camera
    const baseBottom = 70; // Start high (horizon)
    const bottomRange = -50; // Move down toward camera
    const bottomPosition = baseBottom + progress * bottomRange;
    
    return {
      bottom: `${bottomPosition}%`,
      left: "55%", // Player car on right lane
      scale: Math.max(0.1, scale),
    };
  };

  // Calculate final car scale combining position, boost, and screen size
  const getFinalCarScale = () => {
    const carPos = getCarPosition();
    const positionScale = carPos.scale; // 3D perspective scaling
    const boostScale = 1 + (boost / 100 * 0.2); // Boost adds up to 20% size
    const responsiveScale = getResponsiveScale(); // Screen size scaling
    return positionScale * boostScale * responsiveScale;
  };

  // Get speed lines based on boost - adjusted for 3D perspective
  const getSpeedLines = () => {
    if (boost < 20) return null;

    const lines = [];
    const numLines = Math.floor(boost / 20); // More lines at higher boost
    const carPos = getCarPosition();
    const scale = carPos.scale;

    for (let i = 0; i < numLines; i++) {
      const width = Math.max(1, Math.min(4, boost / 15)) * scale;
      const delay = i * 0.05;

      lines.push(
        <div
          key={`speed-line-${i}`}
          className="absolute bg-white animate-wind"
          style={{
            width: `${width}px`,
            height: `${2 * scale}px`,
            left: `-${i * 2 + width}px`,
            top: `${5 * scale + i * 2 * scale}px`,
            animationDelay: `${delay}s`,
            opacity: 0.8 * scale,
          }}
        />
      );
    }

    return lines;
  };

  const carPosition = getCarPosition();
  
  return (
    <div
      className="absolute z-20"
      style={{
        bottom: carPosition.bottom,
        left: carPosition.left,
        transform: `scale(${getFinalCarScale()})`,
        transition: "all 0.3s ease-out, transform 0.1s ease-out", // Added transform transition
      }}
    >
      {/* Smoke particles behind the car */}
      {smokeParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-t from-white/90 to-white/30 animate-fade-out"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            bottom: `-2px`,
            left: `${particle.left}px`,
            opacity: particle.opacity,
            zIndex: -1,
          }}
        />
      ))}

      {/* 3D Formula 1 Car Design */}
      <div className="relative transform-gpu">
        {/* Car shadow on road */}
        <div className="absolute top-full w-20 h-3 bg-black/30 blur-md rounded-full left-1/2 transform -translate-x-1/2 mt-2"></div>

        {/* Main car body - Formula 1 style */}
        <div 
          className="relative transform-gpu"
          style={{
            width: `${64 * getResponsiveScale()}px`,
            height: `${128 * getResponsiveScale()}px`
          }}
        >
          {/* Rear wing */}
          <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-red-800 rounded-sm shadow-lg"
            style={{
              width: `${48 * getResponsiveScale()}px`,
              height: `${8 * getResponsiveScale()}px`
            }}
          ></div>
          
          {/* Main chassis */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 bg-gradient-to-b from-red-600 via-red-700 to-red-800 rounded-lg shadow-xl"
            style={{
              top: `${8 * getResponsiveScale()}px`,
              width: `${32 * getResponsiveScale()}px`,
              height: `${96 * getResponsiveScale()}px`
            }}
          >
            {/* Cockpit */}
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 bg-black/60 rounded-lg border border-gray-300"
              style={{
                top: `${32 * getResponsiveScale()}px`,
                width: `${24 * getResponsiveScale()}px`,
                height: `${32 * getResponsiveScale()}px`
              }}
            ></div>
            
            {/* Side panels */}
            <div className="absolute top-4 -left-1 w-2 h-16 bg-red-500 rounded-sm"></div>
            <div className="absolute top-4 -right-1 w-2 h-16 bg-red-500 rounded-sm"></div>
            
            {/* Engine air intake */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-black/50 rounded-sm"></div>
          </div>

          {/* Front nose cone */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-6 bg-gradient-to-b from-red-700 to-red-900 rounded-b-lg"></div>

          {/* Wheels */}
          <div className="absolute top-4 -left-2 w-3 h-3 bg-black rounded-full border border-gray-400">
            <div className="absolute inset-0.5 bg-gray-600 rounded-full"></div>
          </div>
          <div className="absolute top-4 -right-2 w-3 h-3 bg-black rounded-full border border-gray-400">
            <div className="absolute inset-0.5 bg-gray-600 rounded-full"></div>
          </div>
          <div className="absolute bottom-4 -left-2 w-3 h-3 bg-black rounded-full border border-gray-400">
            <div className="absolute inset-0.5 bg-gray-600 rounded-full"></div>
          </div>
          <div className="absolute bottom-4 -right-2 w-3 h-3 bg-black rounded-full border border-gray-400">
            <div className="absolute inset-0.5 bg-gray-600 rounded-full"></div>
          </div>

          {/* Car number */}
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/90 rounded flex items-center justify-center">
            <span className="text-xs font-bold text-red-600">1</span>
          </div>

          {/* Reflective highlights */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white/40 rounded-full"></div>
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-5 h-0.5 bg-white/30 rounded-full"></div>
        </div>
      </div>

      {/* Speed lines effect */}
      {getSpeedLines()}

      {/* Boost exhaust effect - scaled with perspective */}
      {boost > 70 && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div 
            className="bg-blue-400 blur-sm animate-pulse"
            style={{
              width: `${2 * carPosition.scale}px`,
              height: `${8 * carPosition.scale}px`
            }}
          ></div>
          <div 
            className="bg-cyan-300 blur-md animate-pulse absolute top-0 left-1/2 transform -translate-x-1/2"
            style={{
              width: `${1 * carPosition.scale}px`,
              height: `${12 * carPosition.scale}px`
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default PlayerCar; 