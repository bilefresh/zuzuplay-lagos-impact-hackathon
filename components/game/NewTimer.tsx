import React from 'react';

interface NewTimerProps {
  time: string;
}

const NewTimer: React.FC<NewTimerProps> = ({ time }) => {
  return (
    <div className="absolute top-5 left-32 flex items-center space-x-2">
      {/* Timer icon */}
      <div className="w-5 h-5 bg-[#ff4d4d] rounded-sm relative">
        <div className="absolute inset-1 bg-white rounded-sm"></div>
      </div>
      <span className="text-lg font-bold text-white font-orbitron">
        {time}
      </span>
    </div>
  );
};

export default NewTimer; 