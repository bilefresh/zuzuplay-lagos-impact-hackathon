import React from "react";

interface NewAiCarProps {
  position: number;
}

const NewAiCar: React.FC<NewAiCarProps> = ({ position }) => {

  // Calculate car position based on game position - VERTICAL track
  const getCarPosition = () => {
    // AI car stays on the left side of the track
    const basePosition = 30; // Left side of track
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

  return (
    <div
      className="absolute z-10 w-[100px] h-[180px] transition-all duration-300 ease-out"
      style={{
        bottom: `${getCarBottomPosition()}%`,
        left: getCarPosition(),
        transform: "translateX(-50%) scale(1)",
        filter: position > 50 ? 'brightness(1.1) saturate(1.2)' : 'none',
      }}
    >
      {/* Car SVG */}
      <svg 
        className="w-full h-full filter drop-shadow-lg" 
        viewBox="0 0 200 400" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#FF69B4">
          <path d="M80 300 L120 300 L130 250 L140 200 L140 100 L120 50 L80 50 L60 100 L60 200 L70 250 Z"/>
          <path d="M60 220 L40 240 L40 280 L60 260 Z"/>
          <path d="M140 220 L160 240 L160 280 L140 260 Z"/>
          <path d="M70 80 L130 80 L130 40 L70 40 Z"/>
          <path d="M70 300 L130 300 L120 350 L80 350 Z"/>
          <rect x="40" y="280" width="120" height="20" rx="5"/>
          <rect x="75" y="150" width="50" height="80" fill="#2B2D42"/>
        </g>
      </svg>
    </div>
  );
};

export default NewAiCar; 