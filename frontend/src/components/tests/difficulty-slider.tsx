'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface DifficultySliderProps {
  easy: number;
  medium: number;
  hard: number;
  onChange: (values: { easy: number; medium: number; hard: number }) => void;
  totalQuestions?: number;
}

export function DifficultySlider({ easy, medium, hard, onChange, totalQuestions = 0 }: DifficultySliderProps) {
  const total = easy + medium + hard;

  const handleChange = (level: 'easy' | 'medium' | 'hard', value: number) => {
    const newValues = { easy, medium, hard };
    newValues[level] = value;
    const newTotal = newValues.easy + newValues.medium + newValues.hard;
    if (newTotal <= 100) {
      onChange(newValues);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Distribution</span>
          <span className={cn(total === 100 ? 'text-emerald-400' : 'text-amber-400')}>
            {total}% / 100%
          </span>
        </div>
        <div className="h-4 rounded-full bg-slate-800 flex overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${easy}%` }}
          />
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
            style={{ width: `${medium}%` }}
          />
          <div
            className="bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-300"
            style={{ width: `${hard}%` }}
          />
        </div>
      </div>

      {/* Sliders */}
      {[
        { label: 'Easy', value: easy, key: 'easy' as const, color: 'emerald', questions: Math.round((easy / 100) * totalQuestions) },
        { label: 'Medium', value: medium, key: 'medium' as const, color: 'amber', questions: Math.round((medium / 100) * totalQuestions) },
        { label: 'Hard', value: hard, key: 'hard' as const, color: 'rose', questions: Math.round((hard / 100) * totalQuestions) },
      ].map((item) => (
        <div key={item.key} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
              <span className="text-sm font-medium text-slate-300">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{item.value}%</span>
              {totalQuestions > 0 && (
                <span className="text-xs text-slate-500">({item.questions} Q)</span>
              )}
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={item.value}
            onChange={(e) => handleChange(item.key, parseInt(e.target.value))}
            className={cn(
              'w-full h-2 rounded-full appearance-none cursor-pointer',
              'bg-slate-800',
              '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg',
              item.color === 'emerald' && '[&::-webkit-slider-thumb]:bg-emerald-500',
              item.color === 'amber' && '[&::-webkit-slider-thumb]:bg-amber-500',
              item.color === 'rose' && '[&::-webkit-slider-thumb]:bg-rose-500',
            )}
          />
        </div>
      ))}
    </div>
  );
}
