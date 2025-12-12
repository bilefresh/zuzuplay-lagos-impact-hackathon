import React from 'react';
import { LearningCard } from './LearningCard';
import { LearningButton } from './LearningButton';
import { cn } from '@/lib/utils';

interface UpNextSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  onJumpToNext?: () => void;
  className?: string;
}

const UpNextSection: React.FC<UpNextSectionProps> = ({
  title = "Up Next",
  subtitle = "SECTION 2",
  description = "Learn factors, prime factors, normal factors",
  onJumpToNext,
  className
}) => {
  return (
    <div className={cn('fixed bottom-0 left-0 right-0 bg-gray-100 p-4 border-t border-gray-200 shadow-lg', className)}>
      <div className="text-center mb-3">
        <p className="text-sm font-semibold text-gray-600">{title}</p>
      </div>
      
      <LearningCard variant="elevated" className="mb-3 bg-gray-700 border-0">
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <p className="text-white text-sm font-bold">{subtitle}</p>
        </div>
        <p className="text-gray-300 text-xs">{description}</p>
      </LearningCard>
      
      <LearningButton
        variant="ghost"
        fullWidth
        onClick={onJumpToNext}
        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        Jump to next session!
      </LearningButton>
    </div>
  );
};

export { UpNextSection };
