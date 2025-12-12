
import React, { useEffect, useState } from 'react';
import { Weather as WeatherType } from '@/hooks/useGameState';

interface WeatherProps {
  type: WeatherType;
}

const Weather: React.FC<WeatherProps> = ({ type }) => {
  const [elements, setElements] = useState<JSX.Element[]>([]);
  
  useEffect(() => {
    const generateWeatherElements = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const elements: JSX.Element[] = [];
      
      if (type === 'sunny') {
        // Generate dust particles for wind effect
        for (let i = 0; i < 25; i++) {
          const size = Math.random() * 8 + 3;
          elements.push(
            <div
              key={`dust-${i}`}
              className="dust absolute rounded-full bg-yellow-200/60 animate-wind"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * windowWidth}px`,
                top: `${Math.random() * windowHeight * 0.6}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          );
        }
        
        // Add sun
        elements.push(
          <div
            key="sun"
            className="absolute w-20 h-20 bg-yellow-400 rounded-full shadow-lg shadow-yellow-300/50"
            style={{
              top: '10%',
              right: '10%',
            }}
          >
            <div className="absolute inset-0 bg-yellow-300 rounded-full animate-pulse"></div>
          </div>
        );
      } else if (type === 'rainy') {
        // Generate raindrops
        for (let i = 0; i < 60; i++) {
          elements.push(
            <div
              key={`rain-${i}`}
              className="raindrop absolute bg-blue-400/80 animate-rain"
              style={{
                width: '2px',
                height: '20px',
                left: `${Math.random() * windowWidth}px`,
                top: `${Math.random() * windowHeight * 0.4}px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 1 + 0.5}s`
              }}
            />
          );
        }
        
        // Add clouds
        for (let i = 0; i < 6; i++) {
          const width = Math.random() * 150 + 100;
          elements.push(
            <div
              key={`cloud-${i}`}
              className="cloud absolute bg-gray-300/80 rounded-full animate-cloud"
              style={{
                width: `${width}px`,
                height: `${width * 0.5}px`,
                left: `${Math.random() * windowWidth}px`,
                top: `${Math.random() * windowHeight * 0.2}px`,
                animationDuration: `${Math.random() * 20 + 30}s`
              }}
            />
          );
        }
      } else if (type === 'winter') {
        // Generate snowflakes
        for (let i = 0; i < 60; i++) {
          const size = Math.random() * 4 + 2;
          elements.push(
            <div
              key={`snow-${i}`}
              className="snowflake absolute bg-white/90 rounded-full animate-snow"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * windowWidth}px`,
                top: `${Math.random() * windowHeight * 0.4}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          );
        }
        
        // Add clouds
        for (let i = 0; i < 5; i++) {
          const width = Math.random() * 180 + 120;
          elements.push(
            <div
              key={`cloud-winter-${i}`}
              className="cloud absolute bg-gray-200/70 rounded-full animate-cloud"
              style={{
                width: `${width}px`,
                height: `${width * 0.5}px`,
                left: `${Math.random() * windowWidth}px`,
                top: `${Math.random() * windowHeight * 0.2}px`,
                animationDuration: `${Math.random() * 25 + 35}s`
              }}
            />
          );
        }
      }
      
      setElements(elements);
    };
    
    generateWeatherElements();
    
    // Re-generate on window resize
    window.addEventListener('resize', generateWeatherElements);
    
    return () => {
      window.removeEventListener('resize', generateWeatherElements);
    };
  }, [type]);
  
  // Apply different background colors based on weather
  const getBackgroundStyle = () => {
    switch (type) {
      case 'sunny':
        return 'bg-gradient-to-b from-sky-400 via-sky-300 to-orange-200';
      case 'rainy':
        return 'bg-gradient-to-b from-gray-400 via-gray-300 to-gray-200';
      case 'winter':
        return 'bg-gradient-to-b from-blue-200 via-blue-100 to-white';
      default:
        return 'bg-gradient-to-b from-sky-400 to-orange-200';
    }
  };
  
  return (
    <div className={`weather-container ${getBackgroundStyle()} transition-colors duration-1000 absolute inset-0`}>
      {/* Render weather elements */}
      {elements}
    </div>
  );
};

export default Weather;
