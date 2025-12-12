
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface LivesIndicatorProps {
  lives: number;
}

const LivesIndicator: React.FC<LivesIndicatorProps> = ({ lives }) => {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const getResponsiveSize = () => {
    return screenSize.width < 768 ? 18 : screenSize.width < 1024 ? 20 : 24;
  };

  const getResponsiveSpacing = () => {
    return screenSize.width < 768 ? 'space-x-1' : 'space-x-2';
  };

  const getResponsivePosition = () => {
    return screenSize.width < 768 ? 'top-2 left-2' : 'top-4 left-4';
  };

  return (
    <div className={`absolute ${getResponsivePosition()} flex items-center ${getResponsiveSpacing()}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Heart
          key={index}
          className={`transition-all duration-300 ${
            index < lives ? 'text-red-500 fill-red-500 scale-100' : 'text-gray-400 fill-gray-400 scale-75 opacity-50'
          }`}
          size={getResponsiveSize()}
        />
      ))}
    </div>
  );
};

export default LivesIndicator;
