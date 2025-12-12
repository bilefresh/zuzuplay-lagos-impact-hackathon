import React from 'react';
import { Weather } from '@/hooks/useGameState';

interface RaceTrackProps {
  weather: Weather;
}

const RaceTrack: React.FC<RaceTrackProps> = ({ weather }) => {
  const roadColor = weather === 'rainy' ? 'bg-gray-800' : 'bg-gray-700';

  // Add road shine for rainy weather for a 'wet' look
  const roadShine =
    weather === 'rainy' ? (
      <div className="absolute inset-0 bg-gradient-to-t from-gray-500/20 via-transparent to-transparent"></div>
    ) : null;

  return (
    <>
      <div
        className="road-container absolute h-full w-full"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className={`road absolute bottom-0 h-full w-[400%] left-[-150%] ${roadColor}`}
          style={{
            // transform: 'rotateX(60deg)',
            // transformOrigin: 'bottom center',
          }}
        >
          {/* Road surface with animated markings */}
          <div className="road-surface absolute inset-0 animate-road-scroll">
            {/* Center dashed line - responsive */}
            <div
              className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-1 sm:w-2"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, #FBBF24 0, #FBBF24 20px, transparent 20px, transparent 50px)',
              }}
            ></div>
            {/* Side solid lines - responsive lane markings */}
            <div className="absolute left-[calc(50%-80px)] sm:left-[calc(50%-120px)] top-0 h-full w-1 sm:w-2 bg-white/70"></div>
            <div className="absolute right-[calc(50%-80px)] sm:right-[calc(50%-120px)] top-0 h-full w-1 sm:w-2 bg-white/70"></div>
            
            {/* Additional lane markings for better track definition */}
            <div className="absolute left-[calc(50%-40px)] sm:left-[calc(50%-60px)] top-0 h-full w-0.5 sm:w-1 bg-white/40"></div>
            <div className="absolute right-[calc(50%-40px)] sm:right-[calc(50%-60px)] top-0 h-full w-0.5 sm:w-1 bg-white/40"></div>
          </div>
          {roadShine}
        </div>
      </div>
      <style jsx>{`
        @keyframes road-scroll {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(70px);
          }
        }
        .animate-road-scroll {
          animation: road-scroll 0.2s linear infinite;
        }
      `}</style>
      {weather !== 'sunny' && (
        <div className="weather-effects absolute inset-0 pointer-events-none z-30">
          {Array.from({ length: weather === 'rainy' ? 80 : 60 }).map((_, i) => (
            <div
              key={i}
              className={`particle ${weather === 'rainy' ? 'rain' : 'snow'}`}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${weather === 'rainy' ? 0.3 + Math.random() * 0.5 : 1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}
      <style jsx>{`
        @keyframes fall {
          from {
            transform: translateY(-10vh) scale(1);
            opacity: 1;
          }
          to {
            transform: translateY(100vh) scale(0.5);
            opacity: 0;
          }
        }
        .particle {
          position: absolute;
          top: -10vh;
          background: white;
          border-radius: 50%;
          animation: fall linear infinite;
        }
        .rain {
          width: 2px;
          height: 15px;
          background: linear-gradient(to bottom, rgba(173, 216, 230, 0.8), rgba(173, 216, 230, 0.3));
          border-radius: 0;
        }
        .snow {
          width: 4px;
          height: 4px;
          background: white;
          box-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
};

export default RaceTrack;