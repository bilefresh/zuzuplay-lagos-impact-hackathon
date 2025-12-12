import React from "react";

interface NewBoostIndicatorProps {
  boost: number;
}

const NewBoostIndicator: React.FC<NewBoostIndicatorProps> = ({ boost }) => {
  return (
    <div className="absolute top-5 right-5 bg-black/30 p-3 rounded-xl w-[250px]">
      <div className="text-white font-orbitron text-sm text-center mb-2">
        BOOST
      </div>
      
      {/* Boost progress bar */}
      <div className="w-full h-5 bg-[#333] rounded-lg overflow-hidden border-2 border-[#555]">
        <div
          className="h-full bg-gradient-to-r from-[#00f2ff] to-[#00c6ff] transition-all duration-500 ease-in-out rounded"
          style={{ width: `${boost}%` }}
        >
          {/* Highlight strip */}
          <div className="h-1/2 bg-white/30 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default NewBoostIndicator; 