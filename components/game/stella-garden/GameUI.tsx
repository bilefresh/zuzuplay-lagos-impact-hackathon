import React from 'react';
import { useGameStore } from './GameContext';
import { Stars } from 'lucide-react';

const QuestionModal: React.FC<{ question: any }> = ({ question }) => {
  const { answerQuestion, closeQuestionModal } = useGameStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border-4 border-indigo-300 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <div className="inline-block px-4 py-1 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm mb-2 uppercase tracking-wider">
            {question.subject} Challenge
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{question.text}</h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {question.options.map((opt: any, idx: any) => (
            <button
              key={idx}
              onClick={() => answerQuestion(idx)}
              className="p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-lg font-medium text-slate-700 text-left"
            >
              {opt}
            </button>
          ))}
        </div>
        
        <div className="mt-6 flex justify-center">
            <button 
                onClick={closeQuestionModal}
                className="text-slate-400 hover:text-slate-600 text-sm underline"
            >
                Skip for now
            </button>
        </div>
      </div>
    </div>
  );
};

export const GameUI: React.FC = () => {
  const { state } = useGameStore();
  
  return (
    <div className="w-full h-full flex flex-col justify-between p-6 pointer-events-auto">
      {/* Top HUD */}
      <div className="flex justify-between items-start">
        <div className="flex items-center bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-lg border border-yellow-200">
            {/* Using Lucide icon or simple emoji */}
           <span className="text-yellow-500 mr-2 text-xl">⭐</span>
           <span className="font-bold text-xl text-slate-800">{state.starCoins}</span>
        </div>
        
        <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg border border-indigo-100">
           <h3 className="text-xs font-bold text-indigo-400 uppercase mb-2">My Seeds</h3>
           <div className="flex gap-4">
               <div className="flex flex-col items-center">
                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-1">M</div>
                   <span className="text-xs font-bold text-slate-600">{state.inventory.seeds.math}</span>
               </div>
               <div className="flex flex-col items-center">
                   <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-1">S</div>
                   <span className="text-xs font-bold text-slate-600">{state.inventory.seeds.science}</span>
               </div>
               <div className="flex flex-col items-center">
                   <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mb-1">L</div>
                   <span className="text-xs font-bold text-slate-600">{state.inventory.seeds.language}</span>
               </div>
           </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-center gap-4">
        {/* Placeholder for more tools */}
      </div>

      {/* Question Modal */}
      {/* {state.isQuestionModalOpen && state.activeQuestion && ( */}
      {state.activeQuestion && (
        <QuestionModal question={state.activeQuestion} />
      )}
    </div>
  );
};

