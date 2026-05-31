'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';

const doubts = [
  { id: '1', title: 'How to solve projectile motion problems with air resistance?', subject: 'PHYSICS', chapter: 'Kinematics', status: 'AI_RESPONDED', rating: null, time: '2 hours ago', asker: 'Rahul K.' },
  { id: '2', title: 'Explain SN1 vs SN2 mechanism with examples', subject: 'CHEMISTRY', chapter: 'Organic Chemistry', status: 'HUMAN_RESPONDED', rating: 5, time: '5 hours ago', asker: 'Sneha S.' },
  { id: '3', title: 'Integration by parts — when to use LIATE rule?', subject: 'MATHEMATICS', chapter: 'Calculus', status: 'OPEN', rating: null, time: '1 day ago', asker: 'Vikram S.' },
  { id: '4', title: 'Confusion in Gauss law for non-uniform charge distribution', subject: 'PHYSICS', chapter: 'Electrostatics', status: 'RESOLVED', rating: 4, time: '2 days ago', asker: 'Priya P.' },
  { id: '5', title: 'How does Le Chatelier principle apply to gaseous equilibrium?', subject: 'CHEMISTRY', chapter: 'Equilibrium', status: 'AI_RESPONDED', rating: null, time: '3 days ago', asker: 'Karan J.' },
];

const statusConfig: Record<string, { variant: 'primary' | 'success' | 'warning' | 'default' | 'info'; label: string }> = {
  OPEN: { variant: 'warning', label: 'Open' },
  AI_RESPONDED: { variant: 'info', label: 'AI Answered' },
  HUMAN_RESPONDED: { variant: 'primary', label: 'Expert Answered' },
  RESOLVED: { variant: 'success', label: 'Resolved' },
  CLOSED: { variant: 'default', label: 'Closed' },
};

const subjectColors: Record<string, string> = {
  PHYSICS: 'text-indigo-400',
  CHEMISTRY: 'text-purple-400',
  MATHEMATICS: 'text-cyan-400',
};

export default function DoubtsPage() {
  const [tab, setTab] = useState<'my' | 'available'>('my');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Doubt Marketplace</h1>
          <p className="text-slate-400 mt-1">Ask doubts and get instant AI + expert answers</p>
        </div>
        <Link href="/doubts/ask">
          <Button icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          }>
            Ask a Doubt
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-xl w-fit">
        {[
          { label: 'My Doubts', value: 'my' as const },
          { label: 'Available to Solve', value: 'available' as const },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.value
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Doubt Cards */}
      <div className="space-y-4">
        {doubts.map((doubt) => {
          const config = statusConfig[doubt.status] || statusConfig.OPEN;
          return (
            <Link key={doubt.id} href={`/doubts/${doubt.id}`}>
              <Card hover className="group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-white group-hover:text-indigo-400 transition-colors">
                      {doubt.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <Badge variant={config.variant} dot>{config.label}</Badge>
                      <span className={cn('text-xs font-medium', subjectColors[doubt.subject])}>{doubt.subject}</span>
                      <span className="text-xs text-slate-500">{doubt.chapter}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-500">by {doubt.asker}</span>
                    </div>
                    {doubt.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg key={i} className={cn('w-3.5 h-3.5', i < doubt.rating! ? 'text-amber-400' : 'text-slate-600')} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{doubt.time}</span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
