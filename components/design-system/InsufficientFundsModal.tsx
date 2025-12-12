import React from 'react';
import { cn } from '@/lib/utils';
import { LearningButton } from './LearningButton';
import { LearningCard } from './LearningCard';
import Link from 'next/link';

interface InsufficientFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCoins: number;
  currentCoins: number;
  characterName: string;
}

const InsufficientFundsModal: React.FC<InsufficientFundsModalProps> = ({
  isOpen,
  onClose,
  requiredCoins,
  currentCoins,
  characterName
}) => {
  if (!isOpen) return null;

  const coinsNeeded = requiredCoins - currentCoins;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-scale-up">
        <LearningCard className="p-0 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Insufficient Coins
            </h2>
            <p className="text-white/90 text-sm">
              You need more coins to buy this character
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {characterName}
              </h3>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <span className="font-medium">Required:</span>
                  <span className="text-[#4fc3f7]-600 font-bold">{requiredCoins}</span>
                  <span className="text-yellow-500">🪙</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-medium">You have:</span>
                  <span className="text-green-600 font-bold">{currentCoins}</span>
                  <span className="text-yellow-500">🪙</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-[#4fc3f7]-800 font-medium">
                  You need {coinsNeeded} more coins
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-gray-700 text-center text-sm leading-relaxed">
                Want to get more coins? Play more games to earn coins and unlock amazing characters!
              </p>
              
              <div className="flex space-x-3">
                <LearningButton
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                >
                  Maybe Later
                </LearningButton>
                
                <Link href="/games/mathracer-man" className="flex-1">
                  <LearningButton
                    variant="accent"
                    className="w-full"
                  >
                    Play Math Game
                  </LearningButton>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer decoration */}
          <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500" />
        </LearningCard>
      </div>
    </div>
  );
};

export { InsufficientFundsModal };
