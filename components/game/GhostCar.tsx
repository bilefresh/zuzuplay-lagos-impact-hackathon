import React from "react";
import Car from "./Car";

interface GhostCarProps {
  position: number;
}

const GhostCar: React.FC<GhostCarProps> = ({ position }) => {
  const ghostPosition = position + 10; // Give the ghost car a slight offset

  return (
    <div className="opacity-80 hover:opacity-100 transition-opacity duration-300">
      <Car position={ghostPosition} type="ghost" speed={1.5} />
    </div>
  );
};

export default GhostCar;
