"use client";
import React from "react";
import NewGameContainer from "@/components/game/NewGameContainer";

const Game: React.FC = () => {
  return (
    <div className="w-full min-h-screen overflow-hidden">
      <NewGameContainer lessonId={1} subjectId="math" />
    </div>
  );
};

export default Game;
