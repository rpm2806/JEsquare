'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { DifficultySlider } from '../../../../components/tests/difficulty-slider';
import { cn } from '../../../../lib/utils';
import api from '../../../../lib/api';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../../store/auth-store';

const steps = ['Basic Info', 'Subjects & Chapters', 'Difficulty', 'Review & Generate'];

export default function CreateTestPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [dbSubjects, setDbSubjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'FULL_SYLLABUS',
    duration: '180',
    questionCount: '30',
    subjects: [] as string[],
    chapters: [] as string[],
    difficulty: { easy: 30, medium: 50, hard: 20 },
  });

  useEffect(() => {
    async function loadMeta() {
      try {
        setMetaLoading(true);
        const res = await api.get('/questions/meta/subjects');
        setDbSubjects(res.data || []);
      } catch (err) {
        console.error('Error loading subject metadata:', err);
      } finally {
        setMetaLoading(false);
      }
    }
    loadMeta();
  }, []);

  const toggleSubject = (subjectId: string) => {
    setFormData((prev) => {
      const isSelected = prev.subjects.includes(subjectId);
      const newSubjects = isSelected
        ? prev.subjects.filter((id) => id !== subjectId)
        : [...prev.subjects, subjectId];
      
      // Clear chapters belonging to deselected subject
      let newChapters = [...prev.chapters];
      if (isSelected) {
        const subjectObj = dbSubjects.find((s) => s.id === subjectId);
        const chapterIdsToRemove = subjectObj?.chapters?.map((c: any) => c.id) || [];
        newChapters = newChapters.filter((id) => !chapterIdsToRemove.includes(id));
      }

      return {
        ...prev,
        subjects: newSubjects,
        chapters: newChapters,
      };
    });
  };

  const toggleChapter = (chapterId: string) => {
    setFormData((prev) => ({
      ...prev,
      chapters: prev.chapters.includes(chapterId)
        ? prev.chapters.filter((id) => id !== chapterId)
        : [...prev.chapters, chapterId],
    }));
  };

  const handleGenerate = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a test title');
      return;
    }
    if (formData.subjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }

    setLoading(true);
    try {
      const totalQ = parseInt(formData.questionCount) || 30;
      const countPerSubject = Math.round(totalQ / formData.subjects.length);

      const sections = formData.subjects.map((subId) => {
        const subjectObj = dbSubjects.find((s) => s.id === subId);
        const subChapterIds = subjectObj?.chapters
          ?.map((c: any) => c.id)
          ?.filter((id: string) => formData.chapters.includes(id)) || [];

        return {
          name: subjectObj?.name || 'Section',
          subjectId: subId,
          chapterIds: subChapterIds.length > 0 ? subChapterIds : undefined,
          questionCount: countPerSubject,
          marksPerQuestion: 4,
          negativeMarksPerQuestion: 1,
          difficultyDistribution: {
            easy: formData.difficulty.easy,
            medium: formData.difficulty.medium,
            hard: formData.difficulty.hard,
          },
        };
      });

      const payload = {
        title: formData.title,
        description: formData.description || `Auto-generated mock test covering ${formData.subjects.length} subjects`,
        type: formData.type,
        duration: parseInt(formData.duration) || 180,
        sections,
      };

      await api.post('/tests/generate', payload);
      router.push('/tests');
    } catch (err: any) {
      console.error('Error generating test:', err);
      alert(
        err.response?.data?.message ||
          'Failed to generate test. Make sure you have enough questions in the database.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (metaLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading syllabus configurations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create Test</h1>
        <p className="text-slate-400 mt-1">Configure and assemble a test from the question pool</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((step, i) => (
          <React.Fragment key={step}>
            <button
              onClick={() => i < currentStep && setCurrentStep(i)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                i === currentStep
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : i < currentStep
                  ? 'bg-indigo-500/15 text-indigo-400 cursor-pointer hover:bg-indigo-500/20'
                  : 'bg-slate-800/50 text-slate-500'
              )}
            >
              <span className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                i === currentStep ? 'bg-white/20' : i < currentStep ? 'bg-indigo-500/30' : 'bg-slate-700'
              )}>
                {i < currentStep ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{step}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={cn('flex-1 h-0.5 rounded', i < currentStep ? 'bg-indigo-500' : 'bg-slate-800')} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <Card className="animate-fade-in-up">
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <div className="space-y-5">
            <Input
              label="Test Title"
              placeholder="e.g., JEE Main Full Mock Test 16"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              label="Description (optional)"
              placeholder="Describe this test..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
            <div className="grid md:grid-cols-3 gap-4">
              <Select
                label="Test Type"
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                options={[
                  { value: 'FULL_SYLLABUS', label: 'Full Syllabus' },
                  { value: 'PART_SYLLABUS', label: 'Part Syllabus' },
                  { value: 'CHAPTER_WISE', label: 'Chapter Wise' },
                  { value: 'CUSTOM', label: 'Custom' },
                ]}
              />
              <Input
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
              />
              <Input
                label="Total Questions"
                type="number"
                value={formData.questionCount}
                onChange={(e) => setFormData((prev) => ({ ...prev, questionCount: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* Step 2: Subjects & Chapters */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Select Subjects</h3>
              <div className="flex gap-3">
                {dbSubjects.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => toggleSubject(sub.id)}
                    className={cn(
                      'px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 border',
                      formData.subjects.includes(sub.id)
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    {sub.name === 'Physics' ? '⚡' : sub.name === 'Chemistry' ? '🧪' : '📐'} {sub.name}
                  </button>
                ))}
              </div>
            </div>

            {formData.subjects.length > 0 && (
              <div className="space-y-4">
                {formData.subjects.map((subId) => {
                  const subject = dbSubjects.find((s) => s.id === subId);
                  if (!subject) return null;
                  return (
                    <div key={subId}>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">{subject.name} Chapters</h4>
                      <div className="flex flex-wrap gap-2">
                        {subject.chapters?.map((ch: any) => (
                          <button
                            key={ch.id}
                            onClick={() => toggleChapter(ch.id)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                              formData.chapters.includes(ch.id)
                                ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                            )}
                          >
                            {ch.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Difficulty */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Difficulty Distribution</h3>
              <p className="text-sm text-slate-400 mb-6">Adjust the percentage of easy, medium, and hard questions.</p>
              <DifficultySlider
                easy={formData.difficulty.easy}
                medium={formData.difficulty.medium}
                hard={formData.difficulty.hard}
                onChange={(values) => setFormData((prev) => ({ ...prev, difficulty: values }))}
                totalQuestions={parseInt(formData.questionCount) || 0}
              />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Review Your Test</h3>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Title', value: formData.title || '—' },
                { label: 'Type', value: formData.type.replace(/_/g, ' ') },
                { label: 'Duration', value: `${formData.duration} minutes` },
                { label: 'Questions', value: formData.questionCount },
                {
                  label: 'Subjects',
                  value:
                    formData.subjects
                      .map((id) => dbSubjects.find((s) => s.id === id)?.name)
                      .join(', ') || '—',
                },
                { label: 'Chapters', value: formData.chapters.length > 0 ? `${formData.chapters.length} selected` : 'All' },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl bg-slate-800/30">
                  <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                  <p className="text-sm font-medium text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-800/30">
              <p className="text-xs text-slate-500 mb-2">Difficulty Distribution</p>
              <div className="flex items-center gap-6">
                <span className="text-sm text-emerald-400">Easy: {formData.difficulty.easy}%</span>
                <span className="text-sm text-amber-400">Medium: {formData.difficulty.medium}%</span>
                <span className="text-sm text-rose-400">Hard: {formData.difficulty.hard}%</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-sm text-indigo-300">The system will automatically select and arrange questions from your uploaded question pool matching your criteria.</span>
              </div>
            </div>

            {user?.role === 'STUDENT' && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2.5">
                  <span className="text-lg shrink-0">💡</span>
                  <div>
                    <p className="text-sm text-amber-300 font-semibold mb-1">Student Self-Practice Limit</p>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      You get <strong>2 free self-practice tests</strong>. After that, each additional test costs <strong>₹5</strong> from your wallet.
                      Make sure you have sufficient balance before generating.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="ghost"
          onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : router.back()}
          disabled={loading}
        >
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>
        <div className="flex items-center gap-3">
          {currentStep < steps.length - 1 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={loading}>
              Next Step
            </Button>
          ) : (
            <Button onClick={handleGenerate} isLoading={loading} icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }>
              Generate Test
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
