import React from 'react';
import { Level } from '../types/game';
import { audioEngine } from '../utils/audio';

interface LevelCardProps {
  level: Level;
  isLocked: boolean;
  highScore?: number;
  onSelect: (level: Level) => void;
}

const LevelCard: React.FC<LevelCardProps> = ({ level, isLocked, highScore, onSelect }) => {
  const handleClick = () => {
    if (!isLocked) {
      audioEngine.playClick();
      onSelect(level);
    } else {
      audioEngine.playWrong();
    }
  };

  const difficultyColors: Record<string, string> = {
    Beginner: 'text-white bg-green-600 border-green-500 shadow-md',
    Easy: 'text-white bg-blue-600 border-blue-500 shadow-md',
    Medium: 'text-black bg-yellow-400 border-yellow-300 shadow-md',
    Hard: 'text-white bg-orange-600 border-orange-500 shadow-md',
    Expert: 'text-white bg-red-600 border-red-500 shadow-md',
    Master: 'text-white bg-purple-600 border-purple-500 shadow-md',
  };

  const difficultyBorders: Record<string, string> = {
    Beginner: 'border-green-500/50 hover:border-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    Easy: 'border-blue-500/50 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    Medium: 'border-yellow-500/50 hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]',
    Hard: 'border-orange-500/50 hover:border-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]',
    Expert: 'border-red-500/50 hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    Master: 'border-purple-500/50 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
  };

  const difficultyClass = difficultyColors[level.difficulty] || 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  const borderClass = difficultyBorders[level.difficulty] || 'border-theme';

  return (
    <div
      onClick={handleClick}
      className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
        isLocked
          ? 'opacity-40 cursor-not-allowed bg-theme-card border-theme'
          : `cursor-pointer bg-theme-input ${borderClass}`
      }`}
    >
      {isLocked ? (
        <div className="absolute top-3 right-3 text-theme-muted text-sm">
          🔒
        </div>
      ) : (
        <div className="absolute top-3 right-3 text-lg">
          {level.icon}
        </div>
      )}
      <div className="text-center">
        <h3 className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-1">Level {level.id}</h3>
        <p className="text-lg font-black text-theme-main mb-3 truncate">{level.name}</p>
        
        <div className="flex flex-wrap justify-center gap-1.5 mb-3">
          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase ${difficultyClass}`}>
            {level.difficulty}
          </span>
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border border-theme text-theme-main bg-theme-input">
            {level.digitCount} Digits
          </span>
        </div>

        {highScore !== undefined && highScore > 0 ? (
          <div className="mt-2 text-xs font-bold text-theme-secondary flex items-center justify-center space-x-1">
            <span>🏆 H.S. {highScore}</span>
          </div>
        ) : (
          <div className="mt-2 text-xs text-theme-muted font-semibold">Unplayed</div>
        )}
      </div>
    </div>
  );
};

export default LevelCard;