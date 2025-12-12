import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'scaleIn' | 'slideIn' | 'bounce';
  delay?: number;
  duration?: number;
  className?: string;
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 300,
  className
}) => {
  const animations = {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    scaleIn: 'animate-scale-up',
    slideIn: 'animate-slide-in',
    bounce: 'animate-bounce'
  };

  const style = {
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`
  };

  return (
    <div
      className={cn(animations[animation], className)}
      style={style}
    >
      {children}
    </div>
  );
};

export { AnimatedContainer };
