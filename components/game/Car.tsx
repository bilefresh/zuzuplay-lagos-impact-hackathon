import Image from "next/image";
import React, { useState, useEffect } from "react";
import playerCar from "../../assets/icons/playerCar.svg";
import ghostCar from "../../assets/icons/ghostCar.svg";

interface CarProps {
  position: number;
  type: "player" | "ghost";
  speed?: number;
  showSmoke?: boolean;
  playerPosition?: number; // Added to know the player's position for ghost cars
}

const Car: React.FC<CarProps> = ({
  position,
  type,
  speed = 1,
  showSmoke = false,
  playerPosition = 20, // Default to 0 if not provided
}) => {
  // Car styling based on type
  const carStyles = {
    player: {
      body: "bg-gradient-to-r from-violet-600 to-purple-700",
      windows: "bg-sky-200",
      lights: "bg-yellow-300",
      details: "bg-slate-800",
      wheels: "bg-gray-800",
      wheelborder: "border-gray-300",
      shadow: "shadow-lg shadow-purple-900/50",
      glow: "before:absolute before:inset-0 before:bg-purple-500/20 before:blur-lg before:rounded-lg before:z-[-1]",
    },
    ghost: {
      body: "bg-gradient-to-r from-blue-400 to-cyan-300",
      windows: "bg-sky-100/80",
      lights: "bg-blue-200",
      details: "bg-blue-700/50",
      wheels: "bg-blue-900/60",
      wheelborder: "border-blue-200/50",
      shadow: "shadow-md shadow-cyan-500/30",
      glow: "before:absolute before:inset-0 before:bg-cyan-300/10 before:blur-md before:rounded-lg before:z-[-1]",
    },
  };

  const [smokeParticles, setSmokeParticles] = useState<
    Array<{ id: number; size: number; left: number; opacity: number }>
  >([]);

  // Generate smoke effect when showSmoke is true
  useEffect(() => {
    if (showSmoke) {
      // Create more smoke particles for a more dramatic effect
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: Date.now() + i,
        size: Math.random() * 20 + 10, // Larger particles
        left: Math.random() * 50 - 40, // More spread, mostly behind the car
        opacity: 0.9, // More visible
      }));

      setSmokeParticles((prev) => [...prev, ...newParticles]);

      // Remove particles after animation
      const timer = setTimeout(() => {
        setSmokeParticles((prev) =>
          prev.filter((p) => p.id !== newParticles[0].id)
        );
      }, 1800); // Longer smoke duration

      return () => clearTimeout(timer);
    }
  }, [showSmoke]);

  // Add more speed lines based on speed
  const getSpeedLines = () => {
    if (type !== "player" || speed < 1) return null;

    const lines = [];
    const numLines = Math.floor(speed * 4); // More lines at higher speeds

    for (let i = 0; i < numLines; i++) {
      const width = Math.max(3, Math.min(8, speed * 2));
      const delay = i * 0.08;

      lines.push(
        <div
          key={`speed-line-${i}`}
          className="absolute h-[2px] bg-white animate-wind"
          style={{
            width: `${width}px`,
            left: `-${i * 3 + width}px`,
            top: `${5 + i * 3}px`,
            animationDelay: `${delay}s`,
            opacity: 0.7,
          }}
        />
      );
    }

    return lines;
  };

  // Calculate horizontal position for the car types
  const getHorizontalPosition = () => {
    if (type === "player") {
      // Player car is always fixed at a consistent position, centered slightly to the left
      return "40%";
    } else {
      // Ghost car position is relative to the player's actual position on the track
      // Calculate the relative position of the ghost car compared to the player
      // A positive difference means the ghost is ahead of the player
      const positionDifference = position - playerPosition;

      // Convert the position difference to screen percentage
      // 1 position unit = 2% of screen width
      const screenPositionDifference = positionDifference * 2;

      // 40% is the player's fixed position, so add the difference
      const ghostPosition = 40 + screenPositionDifference;

      // Ghost cars that are far ahead or behind won't be visible
      // Only show ghost cars that are within reasonable view range
      // (between -20% and 120% of screen width)
      // console.log(ghostPosition, screenPositionDifference, positionDifference);
      if (ghostPosition < -20 || ghostPosition > 12000) {
        return `-100%`; // Hide the ghost car off-screen
      }

      return `${ghostPosition}%`;
    }
  };

  return (
    <div
      className={`absolute ${type === "player" ? "z-20" : "z-10"} ${
        type === "player" ? "animate-bounce-car" : ""
      }`}
      style={{
        bottom: type === "player" ? "40%" : "85%",
        left: getHorizontalPosition(),
        transform:
          type === "player" ? `scale(${0.1 + speed * 0.05})` : `scale(1)`,
        transition:
          type === "player"
            ? "transform 0.3s ease"
            : "transform 0.3s ease, left 0.5s ease-out",
        animationDuration: "1.5s",
      }}
    >
      {/* Enhanced smoke particles - behind the car */}
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
            zIndex: -1, // Ensure smoke appears behind the car
          }}
        />
      ))}

      {/* More dynamic car with enhanced 3D effect */}
      {/* <div className={`relative ${carStyles[type].glow}`}>
        <div className="absolute -bottom-2 w-full h-1 bg-black/20 blur-md rounded-full"></div>

        <div
          className={`h-9 w-28 ${carStyles[type].body} ${carStyles[type].shadow} rounded-lg relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-white/30 rounded-t-lg"></div>

          <div className="absolute top-3 left-1 w-6 h-4 bg-gradient-to-t from-transparent to-black/10 rounded-sm"></div>

          <div className="absolute top-1 left-9 right-5 h-6 rounded-t-lg bg-gradient-to-b from-black/20 to-transparent"></div>

          <div
            className={`absolute h-5 w-8 ${carStyles[type].windows} rounded-sm top-1 right-7 opacity-80 backdrop-blur-sm`}
          ></div>

          <div
            className={`absolute h-3 w-5 ${carStyles[type].windows} rounded-sm top-1 right-14 opacity-70`}
          ></div>

          <div
            className={`absolute -bottom-2 left-5 h-4 w-4 ${carStyles[type].wheels} rounded-full border ${carStyles[type].wheelborder} flex items-center justify-center`}
          >
            <div className="h-1/2 w-1/2 bg-gray-400/40 rounded-full"></div>
          </div>
          <div
            className={`absolute -bottom-2 right-5 h-4 w-4 ${carStyles[type].wheels} rounded-full border ${carStyles[type].wheelborder} flex items-center justify-center`}
          >
            <div className="h-1/2 w-1/2 bg-gray-400/40 rounded-full"></div>
          </div>

          <div
            className={`absolute h-2 w-2 ${carStyles[type].lights} rounded-full left-1 top-3 shadow-lg shadow-yellow-200/50`}
          ></div>

          <div className="absolute h-1.5 w-2 bg-red-600 rounded-sm right-1 top-3 opacity-90"></div>

          <div
            className={`absolute h-1 w-4 ${carStyles[type].details} top-5 left-2 rounded-sm`}
          ></div>

          {type === "player" && (
            <div className="absolute h-2 w-4 bg-purple-900 top-0 right-2 rounded-sm"></div>
          )}
        </div>
      </div> */}

      <Image
        src={type === "player" ? playerCar : ghostCar}
        alt={""}
        className="w-full h-[75px] object-cover"
      />

      {/* Speed lines effect */}
      {getSpeedLines()}

      {/* Ground reflection for player car */}
      {type === "player" && (
        <div className="absolute -bottom-5 w-24 h-3 bg-purple-600/10 blur-md rounded-full mx-auto left-2"></div>
      )}
    </div>
  );
};

export default Car;
