import React, { useState, useEffect } from "react";

interface BoostIndicatorProps {
  boost: number;
}

const BoostIndicator: React.FC<BoostIndicatorProps> = ({ boost }) => {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const getResponsiveStyles = () => {
    const isMobile = screenSize.width < 768;
    const isTablet = screenSize.width >= 768 && screenSize.width < 1024;
    
    return {
      position: isMobile ? 'top-2 right-2' : 'top-4 right-4',
      padding: isMobile ? 'p-2' : isTablet ? 'p-3' : 'p-4',
      minWidth: isMobile ? 'min-w-[140px]' : isTablet ? 'min-w-[160px]' : 'min-w-[180px]',
      textSize: isMobile ? 'text-xs' : 'text-sm',
      barHeight: isMobile ? 'h-3' : 'h-4'
    };
  };

  const responsiveStyles = getResponsiveStyles();

  return (
    <div className={`absolute ${responsiveStyles.position} bg-black/30 backdrop-blur-sm rounded-xl ${responsiveStyles.padding} shadow-lg ${responsiveStyles.minWidth}`}>
      <div className={`flex items-center space-x-2 ${screenSize.width < 768 ? 'mb-2' : 'mb-3'}`}>
        <span className={`${responsiveStyles.textSize} font-bold text-white`}>BOOST</span>
        <div className="flex-1"></div>
        <span className="text-xs text-white/80">{boost}%</span>
      </div>
      
      {/* Boost progress bar */}
      <div className={`w-full ${responsiveStyles.barHeight} bg-gray-700 rounded-full overflow-hidden border border-gray-600`}>
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 ease-out rounded-full relative"
          style={{ width: `${boost}%` }}
        >
          {/* Animated highlight strip */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
          {/* Glow effect */}
          <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default BoostIndicator; 