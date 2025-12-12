import React, { useState, useEffect } from "react";

interface NewPlayerCarProps {
  position: number;
  boost: number;
}

const NewPlayerCar: React.FC<NewPlayerCarProps> = ({ position, boost }) => {
  const [smokeParticles, setSmokeParticles] = useState<
    Array<{ id: number; size: number; left: number; opacity: number }>
  >([]);


  // Generate smoke effect when boost is high
  useEffect(() => {
    if (boost > 30) {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        size: Math.random() * 12 + 6,
        left: Math.random() * 30 - 15,
        opacity: 0.6,
      }));

      setSmokeParticles((prev) => [...prev, ...newParticles]);

      const timer = setTimeout(() => {
        setSmokeParticles((prev) =>
          prev.filter((p) => p.id !== newParticles[0].id)
        );
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [boost]);

  // Calculate car position based on game position - VERTICAL track
  const getCarPosition = () => {
    // Player car stays on the right side of the track
    const basePosition = 70; // Right side of track
    return `${basePosition}%`;
  };

  // Calculate car bottom position for vertical movement
  const getCarBottomPosition = () => {
    // Convert horizontal position to vertical bottom position
    const maxBottom = 80; // Maximum bottom position
    const minBottom = 20; // Minimum bottom position
    // Use modulo to create continuous movement that wraps around
    const positionPercentage = (position % 200) / 200; // Use 200 for longer track
    return minBottom + (positionPercentage * (maxBottom - minBottom));
  };

  // Calculate car scale based on boost
  const getCarScale = () => {
    const baseScale = 1;
    const boostScale = boost / 100 * 0.2; // Boost adds up to 20% size
    return baseScale + boostScale;
  };

  // Get speed lines based on boost
  const getSpeedLines = () => {
    if (boost < 25) return null;

    const lines = [];
    const numLines = Math.floor(boost / 25); // More lines at higher boost

    for (let i = 0; i < numLines; i++) {
      const width = Math.max(2, Math.min(5, boost / 20));
      const delay = i * 0.04;

      lines.push(
        <div
          key={`speed-line-${i}`}
          className="absolute h-1 bg-white animate-wind"
          style={{
            width: `${width}px`,
            left: `-${i * 2 + width}px`,
            top: `${5 + i * 2}px`,
            animationDelay: `${delay}s`,
            opacity: 0.7,
          }}
        />
      );
    }

    return lines;
  };

  return (
    <div
      className="absolute z-20 w-[100px] h-[180px] transition-all duration-300 ease-out"
      style={{
        bottom: `${getCarBottomPosition()}%`,
        left: getCarPosition(),
        transform: `translateX(-50%) scale(${getCarScale()})`,
        filter: boost > 50 ? 'brightness(1.2) saturate(1.3)' : 'none',
      }}
    >
      {/* Smoke particles behind the car */}
      {smokeParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-t from-white/80 to-white/20 animate-fade-out"
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

      {/* Car SVG */}
      <svg 
        className="w-full h-full filter drop-shadow-lg" 
        viewBox="0 0 200 400" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#D90429">
          <path d="M80 300 L120 300 L130 250 L140 200 L140 100 L120 50 L80 50 L60 100 L60 200 L70 250 Z"/>
          <path d="M60 220 L40 240 L40 280 L60 260 Z"/>
          <path d="M140 220 L160 240 L160 280 L140 260 Z"/>
          <path d="M70 80 L130 80 L130 40 L70 40 Z"/>
          <path d="M70 300 L130 300 L120 350 L80 350 Z"/>
          <rect x="40" y="280" width="120" height="20" rx="5"/>
          <rect x="75" y="150" width="50" height="80" fill="#2B2D42"/>
        </g>
      </svg>

      {/* Speed lines effect */}
      {getSpeedLines()}
    </div>
  );
};

export default NewPlayerCar; 