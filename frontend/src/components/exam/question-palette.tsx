'use client';

import React from 'react';
import { useExamStore } from '../../store/exam-store';
import { cn } from '../../lib/utils';
import type { AnswerStatus } from '../../types';

export function QuestionPalette() {
  const { totalQuestions, currentQuestion, goToQuestion, getStatus } = useExamStore();

  const statusColors: Record<AnswerStatus, string> = {
    NOT_VISITED: 'bg-slate-700 text-slate-400 border-slate-600',
    NOT_ANSWERED: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    ANSWERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    MARKED_FOR_REVIEW: 'bg-violet-500/20 text-violet-400 border-violet-500/40',
    ANSWERED_AND_MARKED: 'bg-emerald-500/20 text-violet-400 border-violet-500/40 ring-2 ring-emerald-500/30',
  };

  return (
    <div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/40" />
          <span className="text-slate-400">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-500/20 border border-rose-500/40" />
          <span className="text-slate-400">Not Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-violet-500/20 border border-violet-500/40" />
          <span className="text-slate-400">Marked Review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-700 border border-slate-600" />
          <span className="text-slate-400">Not Visited</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }).map((_, i) => {
          const status = getStatus(i);
          const isCurrent = i === currentQuestion;

          return (
            <button
              key={i}
              onClick={() => goToQuestion(i)}
              className={cn(
                'w-10 h-10 rounded-lg text-xs font-bold border transition-all duration-200',
                statusColors[status],
                isCurrent && 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900 scale-110',
                'hover:scale-105 hover:brightness-110'
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
