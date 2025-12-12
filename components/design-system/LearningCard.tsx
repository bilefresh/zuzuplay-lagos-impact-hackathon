import React from 'react';
import { cn } from '@/lib/utils';

interface LearningCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
}

const LearningCard = React.forwardRef<HTMLDivElement, LearningCardProps>(
  ({ children, className, variant = 'default', padding = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-200 shadow-sm',
      elevated: 'bg-white shadow-lg border-0',
      outlined: 'bg-white border-2 border-[#06113C] shadow-sm'
    };

    const paddings = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl transition-all duration-200 hover:shadow-md',
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

LearningCard.displayName = 'LearningCard';

export { LearningCard };
