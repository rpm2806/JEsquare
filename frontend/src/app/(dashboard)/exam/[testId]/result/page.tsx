'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Loader2, ArrowLeft, RefreshCw, BarChart2, CheckCircle2, XCircle, HelpCircle, BookOpen } from 'lucide-react';
import { LaTeXRenderer } from '../../../../../components/questions/latex-renderer';
import { cn, formatDuration } from '../../../../../lib/utils';
import api from '../../../../../lib/api';
import Link from 'next/link';

export default function ExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  const handleFlagQuestion = async (questionId: string) => {
    if (flaggedQuestions.has(questionId)) {
      alert("You have already reported this question.");
      return;
    }
    
    const confirmReport = confirm("Are you sure you want to report this question as incorrect?");
    if (!confirmReport) return;

    try {
      await api.patch(`/questions/${questionId}/flag`);
      setFlaggedQuestions((prev) => {
        const next = new Set(prev);
        next.add(questionId);
        return next;
      });
      alert("Thank you! The question has been flagged for admin review.");
    } catch (err) {
      console.error("Error flagging question:", err);
      alert("Failed to report question. Make sure your network is online.");
    }
  };

  useEffect(() => {
    async function loadAttemptDetails() {
      if (!attemptId) {
        // Fallback mock details if no attemptId is found (for static/mock schedules)
        setAttempt({
          score: 180,
          totalCorrect: 48,
          totalWrong: 12,
          totalSkipped: 15,
          totalAttempted: 60,
          timeTaken: 5400,
          test: {
            title: 'JEE Main Full Mock Test 15',
            totalMarks: 300,
            duration: 180,
            type: 'FULL_SYLLABUS',
          },
          answers: [
            {
              isCorrect: true,
              marksAwarded: 4,
              selectedOption: 'B',
              question: {
                id: 'mock-q1',
                type: 'MCQ',
                text: 'A particle is thrown vertically upward with velocity $u$. Find the time when it reaches maximum height.',
                optionA: '$u/2g$',
                optionB: '$u/g$',
                optionC: '$2u/g$',
                optionD: '$u^2/2g$',
                correctAnswer: 'B',
                solution: 'At maximum height, final velocity $v = 0$. Using $v = u - gt$, we get $0 = u - gt \\implies t = u/g$.',
                subject: { name: 'Physics' },
                chapter: { name: 'Kinematics' },
              },
            },
            {
              isCorrect: false,
              marksAwarded: -1,
              selectedOption: 'A',
              question: {
                id: 'mock-q2',
                type: 'MCQ',
                text: 'Calculate the pH of 0.01M HCl solution at 25°C.',
                optionA: '1',
                optionB: '2',
                optionC: '7',
                optionD: '0',
                correctAnswer: 'B',
                solution: 'HCl is a strong acid, so $[H^+] = 0.01M = 10^{-2}M$. Therefore, $pH = -\\log[H^+] = -\\log(10^{-2}) = 2$.',
                subject: { name: 'Chemistry' },
                chapter: { name: 'Ionic Equilibrium' },
              },
            },
            {
              isCorrect: null,
              marksAwarded: 0,
              selectedOption: null,
              question: {
                id: 'mock-q3',
                type: 'MCQ',
                text: 'Find the derivative of $f(x) = x^3 \\sin(x)$.',
                optionA: '$3x^2 \\cos(x)$',
                optionB: '$3x^2 \\sin(x) - x^3 \\cos(x)$',
                optionC: '$3x^2 \\sin(x) + x^3 \\cos(x)$',
                optionD: '$3x^2 \\cos(x) + x^3 \\sin(x)$',
                correctAnswer: 'C',
                solution: 'Using the product rule: $f\'(x) = \\frac{d}{dx}(x^3) \\cdot \\sin(x) + x^3 \\cdot \\frac{d}{dx}(\\sin(x)) = 3x^2 \\sin(x) + x^3 \\cos(x)$.',
                subject: { name: 'Mathematics' },
                chapter: { name: 'Limits and Derivatives' },
              },
            },
          ],
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get(`/attempts/${attemptId}`);
        setAttempt(res.data);
      } catch (err) {
        console.error('Error fetching attempt evaluation details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAttemptDetails();
  }, [attemptId]);

  // Grouped subjects tabs
  const subjectTabs = useMemo(() => {
    if (!attempt?.answers) return ['ALL'];
    const subjects = new Set<string>();
    attempt.answers.forEach((ans: any) => {
      const name = ans.question?.subject?.name;
      if (name) subjects.add(name);
    });
    return ['ALL', ...Array.from(subjects)];
  }, [attempt]);

  // Filtered answers list
  const filteredAnswers = useMemo(() => {
    if (!attempt?.answers) return [];
    if (activeTab === 'ALL') return attempt.answers;
    return attempt.answers.filter((ans: any) => ans.question?.subject?.name === activeTab);
  }, [attempt, activeTab]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">Aggregating CBT responses & calculating marks...</p>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-medium text-white">Evaluation report not found</h3>
        <p className="text-slate-400 mt-1">Make sure you have completed the exam and submitted it online.</p>
        <Link href="/tests">
          <Button className="mt-4">Back to Tests</Button>
        </Link>
      </div>
    );
  }

  const totalQuestions = attempt.answers?.length || 0;
  const maxMarks = attempt.test?.totalMarks || (totalQuestions * 4);
  const userScore = attempt.score ?? 0;
  const accuracyRate = attempt.totalAttempted > 0
    ? Math.round((attempt.totalCorrect / attempt.totalAttempted) * 100 * 10) / 10
    : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Back Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/analytics" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Badge variant="success">EVALUATED</Badge>
          </div>
          <h1 className="text-3xl font-bold text-white">{attempt.test?.title} — Scorecard</h1>
          <p className="text-slate-400 mt-1">Detailed evaluation report and question-by-question correction</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/exam/${params.testId}`}>
            <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
              Re-attempt Test
            </Button>
          </Link>
          <Link href={`/tests/${params.testId}/analytics`}>
            <Button icon={<BarChart2 className="w-4 h-4" />}>
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Evaluation Core Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-indigo-500/20 shadow-lg shadow-indigo-500/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">TOTAL SCORE</p>
              <p className="text-3xl font-bold text-white mt-1">
                {userScore} <span className="text-sm font-normal text-slate-500">/ {maxMarks}</span>
              </p>
              <p className="text-xs text-indigo-400 mt-1">
                {Math.max(0, Math.round((userScore / maxMarks) * 100))}% marks secured
              </p>
            </div>
            <span className="text-2xl">🏆</span>
          </div>
        </Card>

        <Card className="bg-slate-900/40 border-emerald-500/20 shadow-lg shadow-emerald-500/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">ACCURACY RATE</p>
              <p className="text-3xl font-bold text-white mt-1">{accuracyRate}%</p>
              <p className="text-xs text-emerald-400 mt-1">
                {attempt.totalCorrect} correct answers
              </p>
            </div>
            <span className="text-2xl">🎯</span>
          </div>
        </Card>

        <Card className="bg-slate-900/40 border-purple-500/20 shadow-lg shadow-purple-500/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">TIME TAKEN</p>
              <p className="text-3xl font-bold text-white mt-1">
                {Math.floor(attempt.timeTaken / 60)}m <span className="text-sm font-normal text-slate-500">{attempt.timeTaken % 60}s</span>
              </p>
              <p className="text-xs text-purple-400 mt-1">
                Out of {attempt.test?.duration} mins limit
              </p>
            </div>
            <span className="text-2xl">⏱️</span>
          </div>
        </Card>

        <Card className="bg-slate-900/40 border-amber-500/20 shadow-lg shadow-amber-500/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">QUESTIONS METRIC</p>
              <p className="text-3xl font-bold text-white mt-1">
                {attempt.totalCorrect} <span className="text-sm font-normal text-slate-500">correct • {attempt.totalWrong} wrong</span>
              </p>
              <p className="text-xs text-amber-400 mt-1">
                {attempt.totalSkipped} questions unattempted
              </p>
            </div>
            <span className="text-2xl">📊</span>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-xl w-fit">
        {subjectTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            )}
          >
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Question List Breakdown */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Correction & Solution Analysis</h2>
        
        {filteredAnswers.map((ans: any, index: number) => {
          const q = ans.question;
          if (!q) return null;

          const isMCQ = q.type === 'MCQ' || q.type === 'MULTI_CORRECT';
          const isCorrect = ans.isCorrect === true;
          const isWrong = ans.isCorrect === false;
          const isSkipped = ans.isCorrect === null || (!ans.selectedOption && ans.numericalAnswer === null);

          return (
            <Card
              key={q.id || index}
              className={cn(
                'border transition-colors duration-300',
                isCorrect
                  ? 'border-emerald-500/20 bg-emerald-950/5 hover:border-emerald-500/35'
                  : isWrong
                  ? 'border-rose-500/20 bg-rose-950/5 hover:border-rose-500/35'
                  : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
              )}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
                    isCorrect
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isWrong
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-slate-700/30 text-slate-400'
                  )}>
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Badge variant="default" size="sm">{q.subject?.name || 'Syllabus'}</Badge>
                      <Badge variant="default" size="sm">{q.chapter?.name || 'Chapter'}</Badge>
                      <Badge variant={isCorrect ? 'success' : isWrong ? 'danger' : 'default'} size="sm">
                        {isCorrect ? 'Correct (+4)' : isWrong ? 'Incorrect (-1)' : 'Unattempted (0)'}
                      </Badge>
                      <button
                        onClick={() => handleFlagQuestion(q.id)}
                        className={cn(
                          "px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all border",
                          flaggedQuestions.has(q.id)
                            ? "bg-rose-500/20 border-rose-500/30 text-rose-400 cursor-not-allowed"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/20"
                        )}
                        disabled={flaggedQuestions.has(q.id)}
                        title="Report question as incorrect"
                      >
                        🚩 {flaggedQuestions.has(q.id) ? "Flagged for Review" : "Report Error"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  {isCorrect && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </div>
                  )}
                  {isWrong && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </div>
                  )}
                  {isSkipped && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                      <HelpCircle className="w-3.5 h-3.5" /> Unattempted
                    </div>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm text-slate-200 mb-6 pl-0 md:pl-11 leading-relaxed">
                <LaTeXRenderer content={q.text} />
              </div>

              {/* MCQ Options Display */}
              {isMCQ && (
                <div className="grid md:grid-cols-2 gap-3 mb-6 pl-0 md:pl-11">
                  {[
                    { label: 'A', text: q.optionA },
                    { label: 'B', text: q.optionB },
                    { label: 'C', text: q.optionC },
                    { label: 'D', text: q.optionD },
                  ].map((opt) => {
                    const isSelected = ans.selectedOption === opt.label;
                    const isCorrectOption = q.correctAnswer === opt.label;

                    return (
                      <div
                        key={opt.label}
                        className={cn(
                          'p-3.5 rounded-xl border text-sm flex items-center justify-between transition-colors duration-200',
                          isCorrectOption
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200 font-medium'
                            : isSelected && !isCorrectOption
                            ? 'bg-rose-500/10 border-rose-500/40 text-rose-200 font-medium'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={cn(
                            'w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0',
                            isCorrectOption
                              ? 'bg-emerald-500 text-white'
                              : isSelected && !isCorrectOption
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-700 text-slate-300'
                          )}>
                            {opt.label}
                          </span>
                          <LaTeXRenderer content={opt.text || ''} />
                        </div>
                        {isCorrectOption && (
                          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Correct Option
                          </span>
                        )}
                        {isSelected && !isCorrectOption && (
                          <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Numerical Response Display */}
              {q.type === 'NUMERICAL' && (
                <div className="grid md:grid-cols-2 gap-4 mb-6 pl-0 md:pl-11">
                  <div className={cn(
                    'p-3.5 rounded-xl border text-sm flex flex-col gap-1',
                    isWrong ? 'bg-rose-500/5 border-rose-500/20 text-rose-300' : 'bg-slate-800/30 border-slate-700/50 text-slate-300'
                  )}>
                    <span className="text-xs text-slate-500 uppercase font-medium">Your Numerical Answer</span>
                    <span className="font-bold text-white text-base">
                      {ans.numericalAnswer !== null ? ans.numericalAnswer : '—'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-sm flex flex-col gap-1">
                    <span className="text-xs text-slate-500 uppercase font-medium">Correct Numerical Answer</span>
                    <span className="font-bold text-emerald-400 text-base">{q.numericalAnswer}</span>
                  </div>
                </div>
              )}

              {/* Solution Segment */}
              {q.solution && (
                <div className="mt-4 pl-0 md:pl-11 pt-4 border-t border-slate-800/60">
                  <details className="group">
                    <summary className="flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer list-none select-none">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>💡 View Step-by-Step Solution</span>
                    </summary>
                    <div className="mt-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-sm text-slate-300 leading-relaxed animate-fade-in">
                      <p className="font-semibold text-indigo-300 mb-2">Step-by-step Explanation:</p>
                      <LaTeXRenderer content={q.solution} />
                    </div>
                  </details>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
