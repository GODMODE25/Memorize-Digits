import React, { useState, useEffect } from 'react';

interface Breakdown {
  accuracyBonus: number;
  speedBonus: number;
  baseScore: number;
}

interface ScoreDisplayProps {
  score: number;
  isHighScore: boolean;
  breakdown: Breakdown;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, isHighScore, breakdown }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1500; // 1.5 seconds animation
    const steps = 45;
    const increment = score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [score]);

  const getStars = (score: number) => {
    if (score >= 900) return 3;
    if (score >= 600) return 2;
    return 1;
  };

  const stars = getStars(score);

  return (
    <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] p-6 rounded-2xl shadow-theme-glow text-white text-center border border-white/10 relative overflow-hidden">
      {/* Decorative backdrop glow */}
      <div className="absolute -inset-10 bg-white/5 blur-xl rounded-full pointer-events-none" />
      
      <div className="text-5xl font-black mb-2 tracking-wide font-mono relative z-10">
        {animatedScore.toLocaleString()}
      </div>
      
      <div className="text-xs font-bold uppercase tracking-wider text-white/75 relative z-10 mb-4">
        Total Score Points
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80 bg-black/15 p-3 rounded-xl mb-4 relative z-10">
        <div>
          <span className="block text-white/60 mb-0.5">Base</span>
          <span className="text-sm font-black text-white">{breakdown.baseScore}</span>
        </div>
        <div>
          <span className="block text-white/60 mb-0.5">Accuracy</span>
          <span className="text-sm font-black text-white">+{breakdown.accuracyBonus}</span>
        </div>
        <div>
          <span className="block text-white/60 mb-0.5">Bonus</span>
          <span className="text-sm font-black text-white">+{breakdown.speedBonus}</span>
        </div>
      </div>
      
      <div className="flex justify-center space-x-2.5 relative z-10">
        {Array.from({ length: 3 }, (_, i) => (
          <span key={i} className={`text-2xl transition-all duration-300 ${i < stars ? 'text-yellow-300 drop-shadow-[0_0_5px_rgba(253,224,71,0.6)] scale-110' : 'text-white/20'}`}>
            ★
          </span>
        ))}
      </div>
      
      {isHighScore && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-yellow-300 shadow-md rotate-6">
          High Score!
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;