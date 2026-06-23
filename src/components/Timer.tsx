import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
  mode: 'countdown' | 'stopwatch';
  duration?: number; // for countdown mode
  isPaused?: boolean;
  onComplete: () => void;
}

const Timer: React.FC<TimerProps> = ({ mode, duration = 0, isPaused = false, onComplete }) => {
  const [time, setTime] = useState<number>(mode === 'countdown' ? duration : 0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(isPaused);

  // Keep the ref in sync with the prop
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    // Reset timer when mode or duration changes
    setTime(mode === 'countdown' ? duration : 0);
  }, [mode, duration]);

  useEffect(() => {
    const startTimer = () => {
      intervalRef.current = setInterval(() => {
        if (isPausedRef.current) return;
        setTime((prev) => {
          if (mode === 'countdown') {
            const newTime = prev - 0.1;
            if (newTime <= 0) {
              clearInterval(intervalRef.current!);
              onComplete();
              return 0;
            }
            return newTime;
          } else {
            return prev + 0.1;
          }
        });
      }, 100);
    };

    startTimer();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mode, onComplete]);

  const getColor = (): string => {
    if (mode === 'stopwatch') return 'var(--color-accent)';
    const ratio = time / (duration || 1);
    if (ratio > 0.5) return 'var(--color-accent)';
    if (ratio > 0.25) return 'var(--color-secondary)';
    return 'var(--color-primary)';
  };

  const activeColor = getColor();
  const progress = mode === 'countdown' ? (time / (duration || 1)) * 100 : 100;

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="120" height="120" className="transform -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="var(--border-color)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={activeColor}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-100"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-theme-main font-mono">
            {time.toFixed(1)}s
          </span>
        </div>
      </div>
    </div>
  );
};

export default Timer;