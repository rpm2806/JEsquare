'use client';

import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { formatDuration } from '../../lib/utils';
import type { Test } from '../../types';

interface TestCardProps {
  test: Test;
  onView?: (id: string) => void;
  onPublish?: (id: string) => void;
}

const statusConfig: Record<string, { variant: 'success' | 'primary' | 'warning' | 'default' | 'danger'; dot: boolean }> = {
  COMPLETED: { variant: 'success', dot: true },
  ACTIVE: { variant: 'primary', dot: true },
  PUBLISHED: { variant: 'warning', dot: true },
  DRAFT: { variant: 'default', dot: false },
  ARCHIVED: { variant: 'danger', dot: false },
};

const typeLabels: Record<string, string> = {
  FULL_SYLLABUS: 'Full Syllabus',
  PART_SYLLABUS: 'Part Syllabus',
  CHAPTER_WISE: 'Chapter Wise',
  CUSTOM: 'Custom',
};

export function TestCard({ test, onView, onPublish }: TestCardProps) {
  const config = statusConfig[test.status] || statusConfig.DRAFT;

  return (
    <Card hover className="group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-semibold text-white truncate">{test.title}</h3>
            <Badge variant={config.variant} dot={config.dot}>
              {test.status}
            </Badge>
          </div>

          {test.description && (
            <p className="text-sm text-slate-400 mb-3 line-clamp-2">{test.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {formatDuration(test.duration)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              {test.totalQuestions} questions
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              {test.totalMarks} marks
            </span>
            <Badge variant="default" size="sm">{typeLabels[test.type]}</Badge>
          </div>

          {(test.attemptCount !== undefined && test.attemptCount > 0) && (
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className="text-slate-400">{test.attemptCount} attempts</span>
              {test.avgScore !== undefined && (
                <span className="text-slate-400">Avg: {test.avgScore.toFixed(1)}%</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          {onView && (
            <Button variant="ghost" size="sm" onClick={() => onView(test.id)}>
              View
            </Button>
          )}
          {test.status === 'DRAFT' && onPublish && (
            <Button variant="outline" size="sm" onClick={() => onPublish(test.id)}>
              Publish
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
