import React from "react";

const NewMountains: React.FC = () => {
  return (
    <div 
      className="absolute bottom-[15%] left-0 w-[200%] h-[200px] z-3 animate-scroll-mountains"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 200'><path d='M0 200 L0 120 L50 100 L100 130 L180 80 L250 150 L300 120 L380 180 L450 100 L550 160 L620 110 L700 170 L800 140 L800 200 Z' fill='%232c1a3b'/></svg>")`,
        backgroundRepeat: 'repeat-x',
      }}
    />
  );
};

export default NewMountains; 