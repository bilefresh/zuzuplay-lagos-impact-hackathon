import React from 'react';

interface NewLivesIndicatorProps {
  lives: number;
}

const NewLivesIndicator: React.FC<NewLivesIndicatorProps> = ({ lives }) => {
  return (
    <div className="absolute top-5 left-5 flex gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={`w-8 h-8 transition-all duration-300 ${
            index < lives 
              ? 'bg-red-500 scale-100' 
              : 'bg-red-500 scale-0'
          }`}
          style={{
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
          }}
        />
      ))}
    </div>
  );
};

export default NewLivesIndicator; 