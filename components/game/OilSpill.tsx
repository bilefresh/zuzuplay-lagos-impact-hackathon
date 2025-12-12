import React, { useState, useEffect } from "react";

const OilSpill: React.FC = () => {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const getResponsiveScale = () => {
    const baseWidth = 1024;
    const scaleFactor = Math.min(screenSize.width / baseWidth, 1);
    return Math.max(0.5, scaleFactor);
  };

  const scale = getResponsiveScale();

  return (
    <div className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-5">
      {/* Main oil spill */}
      <div className="relative" style={{ transform: `scale(${scale})` }}>
        {/* Primary oil spill */}
        <div className="w-12 sm:w-16 h-6 sm:h-8 bg-black/80 rounded-full blur-sm"></div>
        
        {/* Oil streaks trailing behind */}
        <div className="absolute top-1/2 left-0 w-8 sm:w-12 h-0.5 sm:h-1 bg-black/60 rounded-full transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1 sm:left-2 w-6 sm:w-8 h-0.5 bg-black/40 rounded-full transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-2 sm:left-4 w-4 sm:w-6 h-0.5 bg-black/30 rounded-full transform -translate-y-1/2"></div>
        
        {/* Oil splatter effects */}
        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-black/70 rounded-full"></div>
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-black/60 rounded-full"></div>
        <div className="absolute bottom-1 sm:bottom-2 left-2 sm:left-4 w-0.5 sm:w-1 h-0.5 sm:h-1 bg-black/50 rounded-full"></div>
        <div className="absolute bottom-2 sm:bottom-3 right-1 sm:right-2 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-black/65 rounded-full"></div>
      </div>
      
      {/* Warning glow effect */}
      <div className="absolute inset-0 w-16 sm:w-20 h-8 sm:h-12 bg-red-500/20 rounded-full blur-md animate-pulse" style={{ transform: `scale(${scale})` }}></div>
    </div>
  );
};

export default OilSpill; 