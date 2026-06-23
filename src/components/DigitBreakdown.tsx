import React, { useState, useEffect } from 'react';

interface DigitBreakdownProps {
  correctAnswer: string;
  userAnswer: string;
}

const DigitBreakdown: React.FC<DigitBreakdownProps> = ({ correctAnswer, userAnswer }) => {
  // Automatically detect if comparing words or raw characters
  const isWordsMode = correctAnswer.includes(' ');
  
  const correctItems = isWordsMode 
    ? correctAnswer.split(' ').filter(Boolean) 
    : Array.from(correctAnswer);
    
  const userItems = isWordsMode 
    ? userAnswer.split(' ').filter(Boolean) 
    : Array.from(userAnswer);

  const maxLength = Math.max(correctItems.length, userItems.length);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    setRevealed(0);
    const interval = setInterval(() => {
      setRevealed((prev) => (prev < maxLength ? prev + 1 : prev));
    }, 150); // 150ms delay between reveals
    return () => clearInterval(interval);
  }, [maxLength]);

  const items = Array.from({ length: maxLength }, (_, i) => {
    const correctItem = correctItems[i] || '';
    const userItem = userItems[i] || '';
    const isCorrect = correctItem.toLowerCase() === userItem.toLowerCase() && correctItem !== '';
    const isRevealed = i < revealed;
    return { correctItem, userItem, isCorrect, isRevealed };
  });

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Correct answer display */}
        <div className="bg-theme-card p-4 rounded-xl border border-theme text-center">
          <h4 className="text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-2">Target Sequence</h4>
          <div className="flex flex-wrap justify-center gap-1.5">
            {items.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-center border rounded-lg transition-all duration-300 ${
                  isWordsMode ? 'px-3 py-1.5 text-xs font-semibold' : 'w-9 h-10 text-lg font-bold font-mono'
                } ${
                  item.isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                } bg-theme-input border-theme text-theme-main`}
              >
                {item.correctItem || ' '}
              </div>
            ))}
          </div>
        </div>

        {/* User's entry display */}
        <div className="bg-theme-card p-4 rounded-xl border border-theme text-center">
          <h4 className="text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-2">Your Recall</h4>
          <div className="flex flex-wrap justify-center gap-1.5">
            {items.map((item, i) => {
              const borderClass = item.isCorrect 
                ? 'bg-green-500/10 border-green-500/30 text-green-500 shadow-[0_0_8px_rgba(34,197,94,0.15)]' 
                : 'bg-red-500/10 border-red-500/30 text-red-500';
              return (
                <div
                  key={i}
                  className={`flex items-center justify-center border rounded-lg transition-all duration-300 ${
                    isWordsMode ? 'px-3 py-1.5 text-xs font-semibold' : 'w-9 h-10 text-lg font-bold font-mono'
                  } ${
                    item.isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                  } ${borderClass}`}
                >
                  {item.userItem || 'Ø'}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Row of status checkmarks / crosses */}
      <div className="flex flex-wrap justify-center gap-1.5 pt-1.5 border-t border-theme border-dashed">
        {items.map((item, i) => (
          <div
            key={i}
            className={`w-9 h-6 flex items-center justify-center transition-all duration-300 ${
              item.isRevealed ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {item.isCorrect ? (
              <span className="text-green-500 text-lg font-bold">✓</span>
            ) : (
              <span className="text-red-500 text-lg font-bold">✗</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DigitBreakdown;