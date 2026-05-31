'use client';

import React from 'react';
import { useExamStore } from '../../store/exam-store';
import { cn } from '../../lib/utils';

interface QuestionData {
  id: string;
  text: string;
  type: 'MCQ' | 'NUMERICAL' | 'MULTI_CORRECT';
  options?: { label: string; text: string }[];
  image?: string;
}

interface QuestionDisplayProps {
  question: QuestionData;
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
  const { currentQuestion, answers, setAnswer, clearAnswer } = useExamStore();
  const selectedAnswer = answers.get(currentQuestion);

  const handleOptionSelect = (optionLabel: string) => {
    if (question.type === 'MULTI_CORRECT') {
      const current = selectedAnswer ? selectedAnswer.split(',') : [];
      const updated = current.includes(optionLabel)
        ? current.filter((l) => l !== optionLabel)
        : [...current, optionLabel];
      if (updated.length > 0) {
        setAnswer(currentQuestion, updated.join(','));
      } else {
        clearAnswer(currentQuestion);
      }
    } else {
      setAnswer(currentQuestion, optionLabel);
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="flex items-center gap-3">
        <span className="px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 text-sm font-bold">
          Q.{currentQuestion + 1}
        </span>
        <span className="text-xs text-slate-500">
          {question.type === 'MCQ' ? 'Single Correct' : question.type === 'MULTI_CORRECT' ? 'Multiple Correct' : 'Numerical'} | Marks: +4, -1
        </span>
      </div>

      {/* Question Text */}
      <div className="text-base text-slate-200 leading-relaxed">
        {question.text}
      </div>

      {/* Question Image */}
      {question.image && (
        <div className="rounded-xl overflow-hidden border border-slate-700/50 max-w-md">
          <div className="bg-slate-800 p-4 text-center text-slate-500 text-sm">[Question Image]</div>
        </div>
      )}

      {/* Options */}
      {(question.type === 'MCQ' || question.type === 'MULTI_CORRECT') && question.options && (
        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = question.type === 'MULTI_CORRECT'
              ? selectedAnswer?.split(',').includes(option.label)
              : selectedAnswer === option.label;

            return (
              <button
                key={option.label}
                onClick={() => handleOptionSelect(option.label)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200',
                  isSelected
                    ? 'bg-indigo-500/15 border-indigo-500/50 shadow-lg shadow-indigo-500/5'
                    : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600/50'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all',
                    isSelected
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-slate-700/50 text-slate-400'
                  )}
                >
                  {option.label}
                </div>
                <span className={cn('text-sm', isSelected ? 'text-white' : 'text-slate-300')}>
                  {option.text}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Numerical Input */}
      {question.type === 'NUMERICAL' && (
        <div>
          <label className="block text-sm text-slate-400 mb-2">Enter your answer:</label>
          <input
            type="number"
            step="any"
            value={selectedAnswer || ''}
            onChange={(e) => {
              if (e.target.value) setAnswer(currentQuestion, e.target.value);
              else clearAnswer(currentQuestion);
            }}
            className="w-full max-w-xs bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            placeholder="0.00"
          />
        </div>
      )}
    </div>
  );
}
