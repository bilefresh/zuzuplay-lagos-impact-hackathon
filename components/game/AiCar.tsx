import React, { useState, useEffect } from "react";

interface AiCarProps {
  position: number;
}

const AiCar: React.FC<AiCarProps> = ({ position }) => {
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
  // Calculate car position in 3D space - moving into the distance
  const getCarPosition = () => {
    // Position represents progress along the track (0-100)
    // Invert the progress so high position values make car appear to come toward camera
    const progress = (100 - (position % 100)) / 100; // Normalized progress 1 to 0

    // Cars start small at the top/horizon (progress=0) and get larger as they approach (progress=1)
    const baseScale = 0.2; // Small at horizon
    const scaleFactor = 1.1; // How much bigger they get
    const scale = baseScale + progress * scaleFactor;

    // Cars start high (at horizon) and move down toward camera
    const baseBottom = 70; // Start high (horizon)
    const bottomRange = -50; // Move down toward camera
    const bottomPosition = baseBottom + progress * bottomRange;
    
    return {
      bottom: `${bottomPosition}%`,
      left: "40%", // AI car on left lane
      scale: Math.max(0.1, scale),
    };
  };

  const carPosition = getCarPosition();
  
  return (
    <div
      className="absolute z-10"
      style={{
        bottom: carPosition.bottom,
        left: carPosition.left,
        transform: `scale(${carPosition.scale * 0.9})`, // Removed translateX
        transition: "all 0.3s ease-out, transform 0.1s ease-out", // Added transform transition
      }}
    >
      {/* 3D Formula 1 AI Car Design */}
      <div className="relative transform-gpu">
        {/* Car shadow on road */}
        <div className="absolute top-full w-18 h-3 bg-black/25 blur-md rounded-full left-1/2 transform -translate-x-1/2 mt-2"></div>

        {/* Main car body - Formula 1 style (Pink/Purple for AI) */}
        <div 
          className="relative transform-gpu"
          style={{
            width: `${64 * getResponsiveScale()}px`,
            height: `${128 * getResponsiveScale()}px`
          }}
        >
          {/* Rear wing */}
          <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-pink-800 rounded-sm shadow-lg"
            style={{
              width: `${48 * getResponsiveScale()}px`,
              height: `${8 * getResponsiveScale()}px`
            }}
          ></div>
          
          {/* Main chassis */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 bg-gradient-to-b from-pink-500 via-pink-600 to-pink-700 rounded-lg shadow-xl"
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
            <div className="absolute top-4 -left-1 w-2 h-16 bg-pink-400 rounded-sm"></div>
            <div className="absolute top-4 -right-1 w-2 h-16 bg-pink-400 rounded-sm"></div>
            
            {/* Engine air intake */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-black/50 rounded-sm"></div>
            
            {/* AI indicator badge */}
            <div className="absolute top-4 right-0 transform translate-x-1/2 w-5 h-3 bg-blue-500 rounded-sm flex items-center justify-center shadow-lg">
              <span className="text-[6px] text-white font-bold">AI</span>
            </div>
          </div>

          {/* Front nose cone */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-6 bg-gradient-to-b from-pink-600 to-pink-800 rounded-b-lg"></div>

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
            <span className="text-xs font-bold text-pink-600">2</span>
          </div>

          {/* Reflective highlights */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white/40 rounded-full"></div>
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-5 h-0.5 bg-white/30 rounded-full"></div>

          {/* AI glow effect */}
          <div className="absolute inset-0 bg-blue-400/10 rounded-lg animate-pulse"></div>
        </div>

        {/* AI particle trail - scaled with perspective */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div 
            className="bg-blue-400/60 blur-sm animate-pulse"
            style={{
              width: `${1 * carPosition.scale}px`,
              height: `${2 * carPosition.scale}px`
            }}
          ></div>
          <div 
            className="bg-cyan-300/40 blur-md animate-pulse absolute top-0 left-0"
            style={{
              width: `${1 * carPosition.scale}px`,
              height: `${4 * carPosition.scale}px`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AiCar; 