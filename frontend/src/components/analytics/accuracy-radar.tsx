'use client';

import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { subject: 'Physics', accuracy: 72, fullMark: 100 },
  { subject: 'Chemistry', accuracy: 65, fullMark: 100 },
  { subject: 'Mathematics', accuracy: 78, fullMark: 100 },
  { subject: 'Speed', accuracy: 60, fullMark: 100 },
  { subject: 'Accuracy', accuracy: 70, fullMark: 100 },
  { subject: 'Consistency', accuracy: 55, fullMark: 100 },
];

export function AccuracyRadar() {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={12} />
          <PolarRadiusAxis stroke="#334155" fontSize={10} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '13px',
            }}
          />
          <Radar
            name="Performance"
            dataKey="accuracy"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
