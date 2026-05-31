'use client';

import React from 'react';
import { useExamStore } from '../../store/exam-store';
import { Button } from '../ui/button';

export function ExamNavigation() {
  const {
    currentQuestion,
    totalQuestions,
    nextQuestion,
    prevQuestion,
    markForReview,
    clearAnswer,
    openSubmitModal,
    answers,
    markedForReview,
  } = useExamStore();

  const hasAnswer = answers.has(currentQuestion);
  const isMarked = markedForReview.has(currentQuestion);

  const handleSaveNext = () => {
    nextQuestion();
  };

  const handleClear = () => {
    clearAnswer(currentQuestion);
  };

  const handleMarkReview = () => {
    markForReview(currentQuestion);
    nextQuestion();
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800/50">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClear}
          disabled={!hasAnswer}
        >
          Clear Response
        </Button>
        <Button
          variant={isMarked ? 'primary' : 'outline'}
          size="sm"
          onClick={handleMarkReview}
        >
          {isMarked ? '★ Marked' : 'Mark for Review & Next'}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          }
        >
          Previous
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSaveNext}
          disabled={currentQuestion === totalQuestions - 1}
        >
          Save & Next
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={openSubmitModal}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
