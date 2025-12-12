import React, { useEffect, useState } from "react";

interface NewRaceTrackProps {
  playerPosition: number;
  aiPosition: number;
}

const NewRaceTrack: React.FC<NewRaceTrackProps> = ({ playerPosition, aiPosition }) => {
  const [trackPosition, setTrackPosition] = useState(0);

  useEffect(() => {
    // Create continuous track movement animation based on car positions
    const moveInterval = setInterval(() => {
      // Use the average of both car positions to determine track movement speed
      const averagePosition = (playerPosition + aiPosition) / 2;
      const movementSpeed = Math.max(2, averagePosition * 0.1); // Base speed + position-based speed
      
      setTrackPosition((prev) => (prev + movementSpeed) % 100);
    }, 50);

    return () => clearInterval(moveInterval);
  }, [playerPosition, aiPosition]);

  // Generate track elements - road, lines, and background elements
  const generateTrackElements = () => {
    const elements = [];

    // Create the dashed center line on the track - VERTICAL orientation
    for (let i = 0; i < 25; i++) {
      const position = (i * 5 - trackPosition * 2) % 100; // Faster movement

      elements.push(
        <div
          key={`center-line-${i}`}
          className="absolute w-2 h-20 bg-white"
          style={{
            top: `${position}%`,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: 0.9,
            borderRadius: "1px",
          }}
        />
      );
    }

    // Create additional road texture lines - VERTICAL orientation
    for (let i = 0; i < 40; i++) {
      const position = (i * 3 - trackPosition * 1.5) % 100; // Faster movement
      const opacity = Math.random() * 0.4 + 0.2;

      elements.push(
        <div
          key={`texture-${i}`}
          className="absolute w-1 h-12 bg-white/30"
          style={{
            top: `${position}%`,
            left: `${Math.random() * 60 + 20}%`,
            opacity: opacity,
            borderRadius: "1px",
          }}
        />
      );
    }

    // Create side lane markers for better racing effect
    for (let i = 0; i < 20; i++) {
      const leftPosition = (i * 8 - trackPosition * 1.8) % 100;
      const rightPosition = (i * 8 - trackPosition * 1.8) % 100;

      elements.push(
        <div
          key={`left-lane-${i}`}
          className="absolute w-1 h-16 bg-yellow-300/60"
          style={{
            top: `${leftPosition}%`,
            left: "25%",
            opacity: 0.7,
            borderRadius: "1px",
          }}
        />
      );

      elements.push(
        <div
          key={`right-lane-${i}`}
          className="absolute w-1 h-16 bg-yellow-300/60"
          style={{
            top: `${rightPosition}%`,
            left: "75%",
            opacity: 0.7,
            borderRadius: "1px",
          }}
        />
      );
    }

    return elements;
  };

  // Generate roadside posts - DISABLED to remove blocks
  const generateRoadsidePosts = () => {
    // Return empty array to remove all roadside posts/blocks
    return [];
  };

  return (
    <div className="new-race-track h-full w-full relative bg-[#4a4a4a] transform-style-preserve-3d transform rotate-x-50 z-4">
      {/* Track markings */}
      {generateTrackElements()}
      
      {/* Roadside posts */}
      {generateRoadsidePosts()}
      
      {/* Track edges - yellow lines - VERTICAL orientation */}
      <div className="absolute top-0 left-0 bottom-0 w-3 bg-yellow-400 opacity-80"></div>
      <div className="absolute top-0 right-0 bottom-0 w-3 bg-yellow-400 opacity-80"></div>
      
      {/* Lane markers - white lines - VERTICAL orientation */}
      <div className="absolute top-0 left-1/3 bottom-0 w-1 bg-white/40"></div>
      <div className="absolute top-0 right-1/3 bottom-0 w-1 bg-white/40"></div>
      
      {/* Road texture overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/10"></div>
    </div>
  );
};

export default NewRaceTrack; 