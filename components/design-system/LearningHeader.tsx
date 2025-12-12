import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import BackButton from '@/components/common/BackButton';
import coin from '@/assets/images/coin.png';

interface LearningHeaderProps {
  title: string;
  subtitle?: string;
  coins?: number;
  showBackButton?: boolean;
  className?: string;
}

const LearningHeader: React.FC<LearningHeaderProps> = ({
  title,
  subtitle,
  coins = 0,
  showBackButton = true,
  className
}) => {
  return (
    <div className={cn('mb-6', className)}>
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-4">
        {showBackButton && (
          <div className="flex items-center space-x-3">
            <BackButton />
          </div>
        )}
        <div className="flex bg-[#06113C] text-white space-x-1 rounded-full items-center pr-2 font-bold shadow-lg">
          <Image src={coin} alt="Coins" className="w-10 h-10 object-cover" />
          <p className="text-lg">{coins}</p>
        </div>
      </div>

      {/* Header Card */}
      <div className="flex flex-row rounded-xl p-4 bg-[#06113C] shadow-lg">
        <div className="border-r w-3/4 border-white/20 flex flex-col justify-between gap-y-4">
          <p className="uppercase font-bold text-[#3651AB] text-sm tracking-wide">
            {title}
          </p>
          <p className="text-white text-lg font-semibold">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center justify-center w-1/4">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M29.3333 6.46664V22.32C29.3333 23.6133 28.28 24.8 26.9867 24.96L26.5733 25.0133C24.3867 25.3066 21.3067 26.2133 18.8267 27.2533C17.96 27.6133 17 26.96 17 26.0133V7.46664C17 6.9733 17.28 6.51997 17.72 6.27997C20.16 4.95997 23.8533 3.78664 26.36 3.5733H26.44C28.04 3.5733 29.3333 4.86664 29.3333 6.46664Z"
              fill="currentColor"
            />
            <path
              d="M14.28 6.27997C11.84 4.95997 8.14665 3.78664 5.63999 3.5733H5.54665C3.94665 3.5733 2.65332 4.86664 2.65332 6.46664V22.32C2.65332 23.6133 3.70665 24.8 4.99999 24.96L5.41332 25.0133C7.59999 25.3066 10.68 26.2133 13.16 27.2533C14.0267 27.6133 14.9867 26.96 14.9867 26.0133V7.46664C14.9867 6.95997 14.72 6.51997 14.28 6.27997ZM6.66665 10.32H9.66665C10.2133 10.32 10.6667 10.7733 10.6667 11.32C10.6667 11.88 10.2133 12.32 9.66665 12.32H6.66665C6.11999 12.32 5.66665 11.88 5.66665 11.32C5.66665 10.7733 6.11999 10.32 6.66665 10.32ZM10.6667 16.32H6.66665C6.11999 16.32 5.66665 15.88 5.66665 15.32C5.66665 14.7733 6.11999 14.32 6.66665 14.32H10.6667C11.2133 14.32 11.6667 14.7733 11.6667 15.32C11.6667 15.88 11.2133 16.32 10.6667 16.32Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export { LearningHeader };
