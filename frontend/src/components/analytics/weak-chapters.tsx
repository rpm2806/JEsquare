'use client';

import React from 'react';
import { cn } from '../../lib/utils';

const mockWeakChapters = [
  { chapter: 'Thermodynamics', subject: 'PHYSICS', accuracy: 35, attempts: 24, trend: 'improving' },
  { chapter: 'Organic Chemistry - Reactions', subject: 'CHEMISTRY', accuracy: 42, attempts: 18, trend: 'declining' },
  { chapter: 'Matrices & Determinants', subject: 'MATHEMATICS', accuracy: 48, attempts: 15, trend: 'stable' },
  { chapter: 'Electromagnetic Induction', subject: 'PHYSICS', accuracy: 52, attempts: 20, trend: 'improving' },
  { chapter: 'Coordination Compounds', subject: 'CHEMISTRY', accuracy: 55, attempts: 12, trend: 'declining' },
];

const subjectColors: Record<string, string> = {
  PHYSICS: 'text-indigo-400',
  CHEMISTRY: 'text-purple-400',
  MATHEMATICS: 'text-cyan-400',
};

const trendIcons: Record<string, { icon: string; color: string }> = {
  improving: { icon: '↑', color: 'text-emerald-400' },
  declining: { icon: '↓', color: 'text-rose-400' },
  stable: { icon: '→', color: 'text-amber-400' },
};

export function WeakChapters({ chapters = [] }: { chapters?: any[] }) {
  const list = chapters.length > 0
    ? chapters.slice(0, 5).map((c) => ({
        chapter: c.chapterName,
        subject: c.subjectName.toUpperCase(),
        accuracy: c.accuracy,
        attempts: c.total,
        trend: 'stable',
      }))
    : mockWeakChapters;

  return (
    <div className="space-y-3">
      {list.map((ch) => (
        <div key={ch.chapter} className="p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-sm font-medium text-white">{ch.chapter}</h4>
              <span className={cn('text-xs', subjectColors[ch.subject] || 'text-slate-400')}>{ch.subject}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('text-xs font-medium', trendIcons[ch.trend].color)}>
                {trendIcons[ch.trend].icon}
              </span>
              <span className="text-sm font-bold text-white">{ch.accuracy}%</span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                ch.accuracy < 40 ? 'bg-rose-500' : ch.accuracy < 60 ? 'bg-amber-500' : 'bg-emerald-500'
              )}
              style={{ width: `${ch.accuracy}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">{ch.attempts} questions attempted</p>
        </div>
      ))}
    </div>
  );
}

