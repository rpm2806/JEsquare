'use client';

import React from 'react';
import { useExamStore } from '../../store/exam-store';
import { Button } from '../ui/button';

interface SubmitModalProps {
  onSubmit: () => void;
}

export function SubmitModal({ onSubmit }: SubmitModalProps) {
  const { isSubmitModalOpen, closeSubmitModal, getSummary } = useExamStore();

  if (!isSubmitModalOpen) return null;

  const summary = getSummary();

  const items = [
    { label: 'Answered', value: summary.answered, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
    { label: 'Not Answered', value: summary.notAnswered, color: 'bg-rose-500', textColor: 'text-rose-400' },
    { label: 'Marked for Review', value: summary.markedForReview, color: 'bg-violet-500', textColor: 'text-violet-400' },
    { label: 'Answered & Marked', value: summary.answeredAndMarked, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
    { label: 'Not Visited', value: summary.notVisited, color: 'bg-slate-600', textColor: 'text-slate-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeSubmitModal} />

      <div className="relative w-full max-w-md mx-4 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Submit Test?</h2>
          <p className="text-sm text-slate-400 mt-1">Please review your attempt summary before submitting.</p>
        </div>

        {/* Summary */}
        <div className="p-6 space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm text-slate-300">{item.label}</span>
              </div>
              <span className={`text-lg font-bold ${item.textColor}`}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-800 flex items-center gap-3">
          <Button variant="ghost" className="flex-1" onClick={closeSubmitModal}>
            Go Back
          </Button>
          <Button variant="danger" className="flex-1" onClick={onSubmit}>
            Confirm Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
