'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import type { QuestionType, Difficulty, Subject } from '../../../../types';

export default function CreateQuestionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    type: 'MCQ' as QuestionType,
    difficulty: 'MEDIUM' as Difficulty,
    subject: '' as string,
    chapter: '',
    topic: '',
    marks: '4',
    negativeMarks: '1',
    solution: '',
    options: [
      { label: 'A', text: '', isCorrect: false },
      { label: 'B', text: '', isCorrect: false },
      { label: 'C', text: '', isCorrect: false },
      { label: 'D', text: '', isCorrect: false },
    ],
    numericalAnswer: '',
  });

  const handleOptionChange = (index: number, text: string) => {
    const options = [...formData.options];
    options[index] = { ...options[index], text };
    setFormData((prev) => ({ ...prev, options }));
  };

  const handleCorrectAnswer = (index: number) => {
    const options = formData.options.map((opt, i) => ({
      ...opt,
      isCorrect: formData.type === 'MULTI_CORRECT' ? (i === index ? !opt.isCorrect : opt.isCorrect) : i === index,
    }));
    setFormData((prev) => ({ ...prev, options }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // API call would go here
    setTimeout(() => {
      setLoading(false);
      router.push('/questions');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create Question</h1>
        <p className="text-slate-400 mt-1">Add a new question to your bank</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Type & Difficulty */}
        <div className="grid md:grid-cols-3 gap-4">
          <Select
            label="Question Type"
            value={formData.type}
            onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as QuestionType }))}
            options={[
              { value: 'MCQ', label: 'MCQ (Single Correct)' },
              { value: 'MULTI_CORRECT', label: 'Multi Correct' },
              { value: 'NUMERICAL', label: 'Numerical' },
              { value: 'ASSERTION_REASON', label: 'Assertion-Reason' },
              { value: 'MATRIX_MATCH', label: 'Matrix Match' },
            ]}
          />
          <Select
            label="Difficulty"
            value={formData.difficulty}
            onChange={(e) => setFormData((prev) => ({ ...prev, difficulty: e.target.value as Difficulty }))}
            options={[
              { value: 'EASY', label: '🟢 Easy' },
              { value: 'MEDIUM', label: '🟡 Medium' },
              { value: 'HARD', label: '🔴 Hard' },
            ]}
          />
          <Select
            label="Subject"
            value={formData.subject}
            onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
            placeholder="Select Subject"
            options={[
              { value: 'PHYSICS', label: 'Physics' },
              { value: 'CHEMISTRY', label: 'Chemistry' },
              { value: 'MATHEMATICS', label: 'Mathematics' },
            ]}
          />
        </div>

        {/* Chapter & Topic */}
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Chapter"
            placeholder="e.g., Kinematics"
            value={formData.chapter}
            onChange={(e) => setFormData((prev) => ({ ...prev, chapter: e.target.value }))}
          />
          <Input
            label="Topic (optional)"
            placeholder="e.g., Projectile Motion"
            value={formData.topic}
            onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
          />
        </div>

        {/* Question Text */}
        <Card>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            Question Text
            <span className="text-xs text-slate-500 font-normal">(LaTeX supported: use $...$ for inline, $$...$$ for display)</span>
          </h3>
          <Textarea
            placeholder="Enter your question here... e.g., A particle of mass $m$ is projected with velocity $v$ at angle $\theta$..."
            value={formData.text}
            onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
            className="min-h-[120px]"
          />

          {/* Image upload area */}
          <div className="mt-4 border-2 border-dashed border-slate-700/50 rounded-xl p-6 text-center hover:border-indigo-500/30 transition-colors cursor-pointer">
            <svg className="w-8 h-8 text-slate-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-slate-500">Drag & drop an image or <span className="text-indigo-400">browse</span></p>
            <p className="text-xs text-slate-600 mt-1">PNG, JPG up to 5MB</p>
          </div>
        </Card>

        {/* Options (for MCQ types) */}
        {(formData.type === 'MCQ' || formData.type === 'MULTI_CORRECT' || formData.type === 'ASSERTION_REASON') && (
          <Card>
            <h3 className="text-sm font-semibold text-white mb-4">
              Options
              <span className="text-xs text-slate-500 font-normal ml-2">
                {formData.type === 'MULTI_CORRECT' ? '(Select all correct)' : '(Select one correct)'}
              </span>
            </h3>
            <div className="space-y-3">
              {formData.options.map((opt, i) => (
                <div key={opt.label} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleCorrectAnswer(i)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 shrink-0 ${
                      opt.isCorrect
                        ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                  <Input
                    placeholder={`Option ${opt.label} (LaTeX supported)`}
                    value={opt.text}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Numerical Answer */}
        {formData.type === 'NUMERICAL' && (
          <Card>
            <h3 className="text-sm font-semibold text-white mb-3">Correct Answer</h3>
            <Input
              type="number"
              step="any"
              placeholder="Enter the numerical answer"
              value={formData.numericalAnswer}
              onChange={(e) => setFormData((prev) => ({ ...prev, numericalAnswer: e.target.value }))}
            />
          </Card>
        )}

        {/* Marks */}
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Marks for Correct Answer"
            type="number"
            value={formData.marks}
            onChange={(e) => setFormData((prev) => ({ ...prev, marks: e.target.value }))}
          />
          <Input
            label="Negative Marks"
            type="number"
            value={formData.negativeMarks}
            onChange={(e) => setFormData((prev) => ({ ...prev, negativeMarks: e.target.value }))}
          />
        </div>

        {/* Solution */}
        <Card>
          <h3 className="text-sm font-semibold text-white mb-3">Solution (optional)</h3>
          <Textarea
            placeholder="Enter the detailed solution here... (LaTeX supported)"
            value={formData.solution}
            onChange={(e) => setFormData((prev) => ({ ...prev, solution: e.target.value }))}
            className="min-h-[100px]"
          />
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="secondary" type="button">
            Save as Draft
          </Button>
          <Button type="submit" isLoading={loading}>
            Create Question
          </Button>
        </div>
      </form>
    </div>
  );
}
