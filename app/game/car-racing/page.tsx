"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ThreeJSCarRacingGame from '@/components/game/ThreeJSCarRacingGame';

export const dynamic = 'force-dynamic';

function CarRacingGameContent() {
  const searchParams = useSearchParams();

  const lessonId = parseInt(searchParams.get('lessonId') || '1', 10);
  const subjectId = searchParams.get('subjectId') || 'math';
  const lessonName = searchParams.get('lessonName') || 'Car Racing Challenge';

  return (
    <div className="min-h-screen bg-black">
      <ThreeJSCarRacingGame
        lessonId={lessonId}
        subjectId={subjectId}
        lessonName={lessonName}
        onGameComplete={() => {
          window.location.href = '/';
        }}
      />
    </div>
  );
}

export default function CarRacingGamePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CarRacingGameContent />
    </Suspense>
  );
}
