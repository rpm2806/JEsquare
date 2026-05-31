'use client';

import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { truncate } from '../../lib/utils';
import type { Question } from '../../types';

interface QuestionCardProps {
  question: Question;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const difficultyColor: Record<string, 'success' | 'warning' | 'danger'> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'danger',
};

const typeLabels: Record<string, string> = {
  MCQ: 'MCQ',
  NUMERICAL: 'Numerical',
  MULTI_CORRECT: 'Multi Correct',
  ASSERTION_REASON: 'Assertion-Reason',
  MATRIX_MATCH: 'Matrix Match',
};

const subjectColors: Record<string, 'primary' | 'purple' | 'info'> = {
  PHYSICS: 'primary',
  CHEMISTRY: 'purple',
  MATHEMATICS: 'info',
};

export function QuestionCard({ question, onEdit, onDelete }: QuestionCardProps) {
  return (
    <Card hover className="group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant={subjectColors[question.subject] || 'default'}>
              {question.subject}
            </Badge>
            <Badge variant={difficultyColor[question.difficulty]}>
              {question.difficulty}
            </Badge>
            <Badge variant="default">{typeLabels[question.type] || question.type}</Badge>
            {question.isAIGenerated && (
              <Badge variant="purple" dot>AI Generated</Badge>
            )}
            {question.isVerified && (
              <Badge variant="success" dot>Verified</Badge>
            )}
          </div>

          {/* Question text */}
          <p className="text-sm text-slate-300 leading-relaxed">
            {truncate(question.text, 200)}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
            <span>{question.chapter}</span>
            {question.topic && (
              <>
                <span>•</span>
                <span>{question.topic}</span>
              </>
            )}
            <span>•</span>
            <span>+{question.marks} / -{question.negativeMarks}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(question.id)}
              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(question.id)}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
