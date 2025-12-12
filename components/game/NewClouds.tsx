import React from "react";

const NewClouds: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-2 overflow-hidden">
      {/* Cloud 1 */}
      <div 
        className="absolute bg-gradient-radial from-white/10 to-transparent rounded-full animate-move-clouds"
        style={{
          width: '400px',
          height: '150px',
          top: '10%',
          left: '-400px',
          animationDuration: '50s',
        }}
      />
      
      {/* Cloud 2 */}
      <div 
        className="absolute bg-gradient-radial from-white/10 to-transparent rounded-full animate-move-clouds"
        style={{
          width: '300px',
          height: '100px',
          top: '25%',
          left: '-300px',
          animationDuration: '35s',
          animationDelay: '-5s',
        }}
      />
      
      {/* Cloud 3 */}
      <div 
        className="absolute bg-gradient-radial from-white/10 to-transparent rounded-full animate-move-clouds"
        style={{
          width: '500px',
          height: '200px',
          top: '15%',
          left: '-500px',
          animationDuration: '70s',
          animationDelay: '-15s',
        }}
      />
    </div>
  );
};

export default NewClouds; 