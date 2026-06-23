import { useState, useEffect, useRef, useCallback } from 'react';

type TimerMode = 'countdown' | 'stopwatch';

interface UseTimerOptions {
  mode: TimerMode;
  initialTime?: number; // in milliseconds
  onComplete?: () => void;
}

export const useTimer = ({ mode, initialTime = 0, onComplete }: UseTimerOptions) => {
  const [time, setTime] = useState(mode === 'countdown' ? initialTime : 0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const totalElapsedRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateTime = useCallback(() => {
    if (!startTimeRef.current) return;
    const currentElapsed = totalElapsedRef.current + (Date.now() - startTimeRef.current);
    if (mode === 'countdown') {
      const remaining = Math.max(0, initialTime - currentElapsed);
      setTime(remaining);
      if (remaining === 0) {
        setIsRunning(false);
        onComplete?.();
      }
    } else {
      setTime(currentElapsed);
    }
  }, [mode, initialTime, onComplete]);

  const start = useCallback(() => {
    if (isRunning) return;
    startTimeRef.current = Date.now();
    setIsRunning(true);
  }, [isRunning]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    if (startTimeRef.current) {
      totalElapsedRef.current += Date.now() - startTimeRef.current;
      startTimeRef.current = null;
    }
    setIsRunning(false);
  }, [isRunning]);

  const reset = useCallback(() => {
    setIsRunning(false);
    totalElapsedRef.current = 0;
    startTimeRef.current = null;
    setTime(mode === 'countdown' ? initialTime : 0);
  }, [mode, initialTime]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(updateTime, 100); // Update every 100ms for smoothness
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, updateTime]);

  return { time, isRunning, start, pause, reset };
};