import React from "react";

const NewOilSpill: React.FC = () => {
  return (
    <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-5">
      {/* Main oil spill */}
      <div className="relative">
        {/* Primary oil spill */}
        <div className="w-16 h-8 bg-black/80 rounded-full blur-sm"></div>
        
        {/* Oil streaks trailing behind */}
        <div className="absolute top-1/2 left-0 w-12 h-1 bg-black/60 rounded-full transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-2 w-8 h-0.5 bg-black/40 rounded-full transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-4 w-6 h-0.5 bg-black/30 rounded-full transform -translate-y-1/2"></div>
        
        {/* Oil splatter effects */}
        <div className="absolute top-2 left-2 w-2 h-2 bg-black/70 rounded-full"></div>
        <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-black/60 rounded-full"></div>
        <div className="absolute bottom-2 left-4 w-1 h-1 bg-black/50 rounded-full"></div>
        <div className="absolute bottom-3 right-2 w-1.5 h-1.5 bg-black/65 rounded-full"></div>
      </div>
      
      {/* Warning glow effect */}
      <div className="absolute inset-0 w-20 h-12 bg-red-500/20 rounded-full blur-md animate-pulse"></div>
    </div>
  );
};

export default NewOilSpill; 