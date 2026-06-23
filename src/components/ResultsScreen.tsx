import React from 'react';
import ScoreDisplay from './ScoreDisplay';
import DigitBreakdown from './DigitBreakdown';
import { GameResult, Level, Achievement } from '../types/game';

interface ResultsScreenProps {
  result: GameResult & { isHighScore: boolean; unlockedAchievements: Achievement[]; canGoNext: boolean };
  level: Level | null;
  onRetry: () => void;
  onNextLevel: () => void;
  onMenu: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  level,
  onRetry,
  onNextLevel,
  onMenu,
}) => {
  const {
    success,
    score,
    timeElapsed,
    correctDigits,
    totalDigits,
    isHighScore,
    unlockedAchievements,
    canGoNext,
    correctAnswer,
    userAnswer,
  } = result;

  const accuracy = totalDigits > 0 ? (correctDigits / totalDigits) * 100 : 0;
  const isPerfect = accuracy === 100;

  // Compute a clean breakdown for the ScoreDisplay component
  const baseScore = Math.floor((correctDigits / (totalDigits || 1)) * 1000);
  const bonus = Math.max(0, score - baseScore);

  const breakdown = {
    baseScore,
    accuracyBonus: Math.round(accuracy * 5),
    speedBonus: bonus,
  };

  return (
    <div className="min-h-screen w-full bg-theme-app flex flex-col items-center justify-center p-6 text-theme-main">
      {isPerfect && <Confetti />}
      
      <div className="bg-theme-card border border-theme rounded-3xl p-8 max-w-2xl w-full shadow-theme-glow space-y-6">
        
        {/* Status Header */}
        <div className="text-center">
          {success ? (
            <div className="space-y-2">
              <span className="text-5xl block animate-bounce">🏆</span>
              <h2 className="text-3xl font-black text-theme-accent uppercase tracking-wider">Success!</h2>
              <p className="text-xs text-theme-muted">You recalled the sequence correctly.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-5xl block animate-pulse">❌</span>
              <h2 className="text-3xl font-black text-theme-primary uppercase tracking-wider">Try Again!</h2>
              <p className="text-xs text-theme-muted">Keep practicing to improve your recall.</p>
            </div>
          )}
        </div>

        {/* Score Display Card */}
        <ScoreDisplay score={score} isHighScore={isHighScore} breakdown={breakdown} />

        {/* Accuracy and Timer Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-theme-input border border-theme p-4 rounded-2xl text-center">
            <span className="block text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-1">Accuracy</span>
            <span className="text-2xl font-black text-theme-accent">{accuracy.toFixed(1)}%</span>
          </div>
          <div className="bg-theme-input border border-theme p-4 rounded-2xl text-center">
            <span className="block text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-1">Time Elapsed</span>
            <span className="text-2xl font-black text-theme-secondary">{timeElapsed.toFixed(1)}s</span>
          </div>
        </div>

        {/* Answer Breakdown Detail */}
        <div className="bg-theme-input border border-theme p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-theme-main uppercase tracking-widest text-center mb-4">Digit Breakdown</h3>
          <DigitBreakdown correctAnswer={correctAnswer} userAnswer={userAnswer} />
        </div>

        {/* Unlocked Achievements list */}
        {unlockedAchievements.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-theme-secondary uppercase tracking-widest text-center">New Achievements Unlocked!</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {unlockedAchievements.map((ach) => (
                <div key={ach.id} className="bg-theme-input border-2 border-yellow-500/25 rounded-2xl p-4 flex items-center space-x-3 shadow-md animate-pulse">
                  <span className="text-3xl">{ach.icon}</span>
                  <div>
                    <h4 className="font-bold text-theme-main text-sm">{ach.name}</h4>
                    <p className="text-[10px] text-theme-muted leading-tight mt-0.5">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons Panel */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={onRetry}
            className="flex-1 py-3 bg-theme-input hover:bg-theme-card-hover border border-theme text-theme-main font-bold rounded-xl text-sm transition-all"
          >
            Try Again
          </button>
          
          {canGoNext && onNextLevel && (
            <button
              onClick={onNextLevel}
              className="flex-1 py-3 bg-theme-primary text-white font-bold rounded-xl text-sm hover:opacity-90 shadow-theme-glow transition-all"
            >
              Next Level &rarr;
            </button>
          )}

          <button
            onClick={onMenu}
            className="flex-1 py-3 bg-theme-secondary text-white font-bold rounded-xl text-sm hover:opacity-90 shadow-theme-glow transition-all"
          >
            Back to Menu
          </button>
        </div>

      </div>
    </div>
  );
};

const Confetti: React.FC = () => {
  const pieces = Array.from({ length: 40 }, (_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 2;
    const duration = 2.5 + Math.random() * 2;
    const color = ['bg-yellow-400', 'bg-pink-500', 'bg-cyan-400', 'bg-green-400'][Math.floor(Math.random() * 4)];
    
    return (
      <div
        key={i}
        className={`absolute w-2.5 h-2.5 ${color} rounded-full opacity-75`}
        style={{
          left: `${left}%`,
          animation: `fall ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
        }}
      />
    );
  });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces}
    </div>
  );
};

export default ResultsScreen;