"use client";
import React from 'react';
import MagicalGardenGame from '@/components/game/MagicalGardenGame';
import { useRouter } from 'next/navigation';

const MagicalGamePage: React.FC = () => {
  const router = useRouter();

  const handleExit = () => {
    // Navigate back to a dashboard or home page
    router.push('/dashboard'); // Adjust route as needed
  };

  return (
    <MagicalGardenGame onExit={handleExit} />
  );
};

export default MagicalGamePage;
