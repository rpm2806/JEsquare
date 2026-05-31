'use client';

import React from 'react';
import { cn } from '../../lib/utils';

const rankings = [
  { rank: 1, name: 'Arjun Mehta', score: 278, percentile: 99.8, change: 0 },
  { rank: 2, name: 'Sneha Sharma', score: 265, percentile: 99.5, change: 1 },
  { rank: 3, name: 'Vikram Singh', score: 258, percentile: 99.2, change: -1 },
  { rank: 4, name: 'Priya Patel', score: 245, percentile: 98.6, change: 2 },
  { rank: 5, name: 'Rahul Kumar', score: 238, percentile: 98.1, change: 0 },
  { rank: 6, name: 'Ananya Desai', score: 231, percentile: 97.5, change: -2 },
  { rank: 7, name: 'Karan Joshi', score: 224, percentile: 96.8, change: 1 },
  { rank: 8, name: 'Neha Gupta', score: 218, percentile: 96.1, change: -1 },
  { rank: 9, name: 'Aditya Rao', score: 210, percentile: 95.2, change: 3 },
  { rank: 10, name: 'Ishita Verma', score: 205, percentile: 94.5, change: 0 },
];

export function RankingTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700/30">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-800/50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rank</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Score</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Percentile</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Change</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {rankings.map((student) => (
            <tr key={student.rank} className="hover:bg-slate-800/30 transition-colors">
              <td className="px-4 py-3">
                <span className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                  student.rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                  student.rank === 2 ? 'bg-slate-400/20 text-slate-300' :
                  student.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-slate-800 text-slate-400'
                )}>
                  {student.rank}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm font-medium text-white">{student.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-sm font-bold text-white">{student.score}/300</span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-sm text-indigo-400 font-medium">{student.percentile}%</span>
              </td>
              <td className="px-4 py-3 text-right">
                {student.change !== 0 && (
                  <span className={cn('text-xs font-medium', student.change > 0 ? 'text-emerald-400' : 'text-rose-400')}>
                    {student.change > 0 ? `↑${student.change}` : `↓${Math.abs(student.change)}`}
                  </span>
                )}
                {student.change === 0 && <span className="text-xs text-slate-500">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
