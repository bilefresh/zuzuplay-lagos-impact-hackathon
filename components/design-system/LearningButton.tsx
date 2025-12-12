import React from 'react';
import { cn } from '@/lib/utils';

interface LearningButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const LearningButton = React.forwardRef<HTMLButtonElement, LearningButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false, 
    loading = false,
    children,
    disabled,
    ...props 
  }, ref) => {
    const variants = {
      primary: 'bg-[#06113C] text-white hover:bg-[#0a1a4a] active:bg-[#0d1f52]',
      secondary: 'bg-[#3651AB] text-white hover:bg-[#2d4299] active:bg-[#243a87]',
      accent: 'bg-[#A95124] text-white hover:bg-[#96421f] active:bg-[#83391a]',
      ghost: 'bg-transparent text-[#58514D] hover:bg-gray-100 active:bg-gray-200',
      success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
      warning: 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700',
      danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg'
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06113C] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

LearningButton.displayName = 'LearningButton';

export { LearningButton };
