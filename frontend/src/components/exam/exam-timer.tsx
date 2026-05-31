'use client';

import React, { useEffect, useRef } from 'react';
import { useExamStore } from '../../store/exam-store';
import { cn } from '../../lib/utils';

export function ExamTimer() {
  const { timeRemaining, decrementTime } = useExamStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(decrementTime, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [decrementTime]);

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  const isWarning = timeRemaining <= 300; // 5 minutes
  const isCritical = timeRemaining <= 60; // 1 minute

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold transition-all duration-500',
        isCritical
          ? 'bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/30'
          : isWarning
          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
          : 'bg-slate-800/50 text-white border border-slate-700/50'
      )}
    >
      <svg
        className={cn('w-5 h-5', isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-slate-400')}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
