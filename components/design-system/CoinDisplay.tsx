import React from 'react';
import { cn } from '@/lib/utils';

interface CoinDisplayProps {
  coins: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({
  coins,
  className,
  size = 'md',
  showLabel = true,
  animated = false
}) => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={cn(
      'inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full shadow-md',
      sizes[size],
      animated && 'animate-pulse',
      className
    )}>
      <span className={cn('text-yellow-300', iconSizes[size])}>
        🪙
      </span>
      <span className="font-bold">
        {coins.toLocaleString()}
      </span>
      {showLabel && (
        <span className="text-yellow-100 text-xs">
          coins
        </span>
      )}
    </div>
  );
};

export { CoinDisplay };
