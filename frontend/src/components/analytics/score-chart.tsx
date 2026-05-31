'use client';

import React from 'react';
import { AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, ResponsiveContainer } from 'recharts';

const mockData = [
  { test: 'Mock 1', score: 145, date: 'Jan 5' },
  { test: 'Mock 2', score: 168, date: 'Jan 15' },
  { test: 'Mock 3', score: 156, date: 'Jan 25' },
  { test: 'Mock 4', score: 189, date: 'Feb 5' },
  { test: 'Mock 5', score: 178, date: 'Feb 15' },
  { test: 'Mock 6', score: 201, date: 'Feb 25' },
  { test: 'Mock 7', score: 195, date: 'Mar 5' },
  { test: 'Mock 8', score: 218, date: 'Mar 15' },
  { test: 'Mock 9', score: 209, date: 'Mar 25' },
  { test: 'Mock 10', score: 234, date: 'Apr 5' },
];

export function ScoreChart({ attempts = [] }: { attempts?: any[] }) {
  const chartData = attempts.length > 0
    ? [...attempts].reverse().map((a, i) => ({
        test: a.testTitle,
        score: a.score,
        date: a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Mock ${i + 1}`,
      }))
    : mockData;

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '13px',
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#scoreGradient)"
            dot={{ r: 4, fill: '#6366f1', stroke: '#1e1b4b', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#818cf8', stroke: '#6366f1', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

