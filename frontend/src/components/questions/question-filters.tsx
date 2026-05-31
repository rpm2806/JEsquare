'use client';

import React from 'react';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import type { QuestionFilters } from '../../types';

interface QuestionFiltersProps {
  filters: QuestionFilters;
  onChange: (filters: QuestionFilters) => void;
  onReset: () => void;
}

const chapters: Record<string, { value: string; label: string }[]> = {
  PHYSICS: [
    { value: 'Mechanics', label: 'Mechanics' },
    { value: 'Kinematics', label: 'Kinematics' },
    { value: 'Thermodynamics', label: 'Thermodynamics' },
    { value: 'Electrodynamics', label: 'Electrodynamics' },
    { value: 'Optics', label: 'Optics' },
    { value: 'Modern Physics', label: 'Modern Physics' },
    { value: 'Waves', label: 'Waves' },
  ],
  CHEMISTRY: [
    { value: 'Organic Chemistry', label: 'Organic Chemistry' },
    { value: 'Inorganic Chemistry', label: 'Inorganic Chemistry' },
    { value: 'Physical Chemistry', label: 'Physical Chemistry' },
    { value: 'Chemical Bonding', label: 'Chemical Bonding' },
    { value: 'Equilibrium', label: 'Equilibrium' },
    { value: 'Electrochemistry', label: 'Electrochemistry' },
  ],
  MATHEMATICS: [
    { value: 'Algebra', label: 'Algebra' },
    { value: 'Calculus', label: 'Calculus' },
    { value: 'Coordinate Geometry', label: 'Coordinate Geometry' },
    { value: 'Trigonometry', label: 'Trigonometry' },
    { value: 'Probability', label: 'Probability' },
    { value: 'Vectors', label: 'Vectors' },
  ],
};

export function QuestionFiltersPanel({ filters, onChange, onReset }: QuestionFiltersProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <Select
        label="Subject"
        placeholder="All Subjects"
        value={filters.subject || ''}
        onChange={(e) => onChange({ ...filters, subject: e.target.value as any, chapter: undefined })}
        options={[
          { value: 'PHYSICS', label: 'Physics' },
          { value: 'CHEMISTRY', label: 'Chemistry' },
          { value: 'MATHEMATICS', label: 'Mathematics' },
        ]}
      />

      <Select
        label="Chapter"
        placeholder="All Chapters"
        value={filters.chapter || ''}
        onChange={(e) => onChange({ ...filters, chapter: e.target.value || undefined })}
        options={filters.subject ? chapters[filters.subject] || [] : []}
      />

      <Select
        label="Difficulty"
        placeholder="All Difficulties"
        value={filters.difficulty || ''}
        onChange={(e) => onChange({ ...filters, difficulty: e.target.value as any })}
        options={[
          { value: 'EASY', label: 'Easy' },
          { value: 'MEDIUM', label: 'Medium' },
          { value: 'HARD', label: 'Hard' },
        ]}
      />

      <Select
        label="Question Type"
        placeholder="All Types"
        value={filters.type || ''}
        onChange={(e) => onChange({ ...filters, type: e.target.value as any })}
        options={[
          { value: 'MCQ', label: 'MCQ' },
          { value: 'NUMERICAL', label: 'Numerical' },
          { value: 'MULTI_CORRECT', label: 'Multi Correct' },
          { value: 'ASSERTION_REASON', label: 'Assertion-Reason' },
          { value: 'MATRIX_MATCH', label: 'Matrix Match' },
        ]}
      />
    </div>
  );
}
