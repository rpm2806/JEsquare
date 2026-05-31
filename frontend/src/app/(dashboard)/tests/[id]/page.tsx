'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { formatDuration } from '../../../../lib/utils';
import Link from 'next/link';
import api from '../../../../lib/api';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../../store/auth-store';

const mockTestFallback = {
  id: '1',
  title: 'JEE Main Full Mock Test 15',
  description: 'Complete JEE Main pattern test covering Physics, Chemistry, and Mathematics with 75 questions across 3 sections.',
  type: 'FULL_SYLLABUS',
  status: 'PUBLISHED',
  duration: 180,
  totalQuestions: 75,
  totalMarks: 300,
  attemptCount: 245,
  avgScore: 52.3,
  sections: [
    { id: 's1', name: 'Physics', subject: 'PHYSICS', questionCount: 25, marksPerQuestion: 4, negativeMarks: 1 },
    { id: 's2', name: 'Chemistry', subject: 'CHEMISTRY', questionCount: 25, marksPerQuestion: 4, negativeMarks: 1 },
    { id: 's3', name: 'Mathematics', subject: 'MATHEMATICS', questionCount: 25, marksPerQuestion: 4, negativeMarks: 1 },
  ],
  batches: ['2025 Regular', '2025 Dropper'],
};

export default function TestDetailPage() {
  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadTestDetails() {
      if (!params.id) return;
      


      try {
        setLoading(true);
        const res = await api.get(`/tests/${params.id}`);
        const dbTest = res.data;

        // Map backend details structure to UI structure
        const mappedTest = {
          id: dbTest.id,
          title: dbTest.title,
          description: dbTest.description || 'Auto-generated dynamic mock test.',
          type: dbTest.type,
          status: dbTest.isPublished ? 'PUBLISHED' : 'DRAFT',
          duration: dbTest.duration || 180,
          totalQuestions: dbTest.questions?.length || 0,
          totalMarks: dbTest.totalMarks || 0,
          attemptCount: dbTest._count?.attempts || 0,
          avgScore: 0,
          sections: dbTest.sections?.map((s: any) => ({
            id: s.id,
            name: s.name,
            subject: s.name.toUpperCase(),
            questionCount: s.maxQuestions || s.questions?.length || 0,
            marksPerQuestion: s.marksPerQuestion || 4,
            negativeMarks: s.negativeMarksPerQuestion || 1,
          })) || [],
          batches: dbTest.testBatches?.map((b: any) => b.batch?.name) || ['General Batch'],
          previewQuestions: dbTest.questions?.map((q: any) => ({
            id: q.question.id,
            text: q.question.text,
            type: q.question.type,
            difficulty: q.question.difficulty || 'MEDIUM',
          })) || [],
        };
        setTest(mappedTest);

        // Fetch my attempts to check if already attempted
        try {
          const attemptsRes = await api.get('/attempts/my');
          const myAttempts = attemptsRes.data?.attempts || [];
          const completedAttempt = myAttempts.find((att: any) => att.testId === params.id && att.status === 'EVALUATED');
          if (completedAttempt) {
            setHasAttempted(true);
            setAttemptId(completedAttempt.id);
          }
        } catch (err) {
          console.error('Error checking user attempts status:', err);
        }
      } catch (err) {
        console.error('Error fetching test detail, using fallback:', err);
        setTest(mockTestFallback);
      } finally {
        setLoading(false);
      }
    }
    loadTestDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading mock test specifications...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h3 className="text-lg font-medium text-white">Mock test not found</h3>
        <p className="text-slate-400 mt-1">Please return to the list and select a valid examination schedule.</p>
        <Link href="/tests">
          <Button className="mt-4">Back to Tests</Button>
        </Link>
      </div>
    );
  }

  // Preview questions list fallback to mocks if empty
  const previewQuestions = test.previewQuestions && test.previewQuestions.length > 0
    ? test.previewQuestions
    : [
        { id: 'pq1', text: 'A particle is thrown vertically upward with velocity $u$. Find the time when it reaches maximum height.', type: 'MCQ', difficulty: 'EASY' },
        { id: 'pq2', text: 'Calculate the pH of 0.01M HCl solution at 25°C.', type: 'MCQ', difficulty: 'EASY' },
        { id: 'pq3', text: 'Find the derivative of $f(x) = x^3 \\sin(x)$.', type: 'MCQ', difficulty: 'MEDIUM' },
      ];

  const handleExportPDF = async () => {
    if (!test?.id) return;
    try {
      setExporting(true);
      const response = await api.post(`/pdf/generate/${test.id}`, {}, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${test.title.replace(/[^a-zA-Z0-9]/g, '_')}_Question_Paper.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error('Error exporting PDF:', err);
      alert(err.response?.data?.message || 'Failed to export PDF.');
    } finally {
      setExporting(false);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      await api.post(`/tests/${test.id}/publish`);
      setTest((prev: any) => ({ ...prev, status: 'PUBLISHED' }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish test.');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive/delete this test?')) return;
    try {
      setLoading(true);
      await api.delete(`/tests/${test.id}`);
      router.push('/tests');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete test.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">{test.title}</h1>
            <Badge variant={test.status === 'PUBLISHED' ? 'warning' : 'default'} dot={test.status === 'PUBLISHED'}>
              {test.status}
            </Badge>
          </div>
          <p className="text-slate-400">{test.description}</p>
        </div>
        <div className="flex items-center gap-3">
          {(!user || user.role !== 'STUDENT' || hasAttempted) ? (
            <Button
              variant="secondary"
              onClick={handleExportPDF}
              disabled={exporting}
              icon={
                exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                )
              }
            >
              {exporting ? 'Exporting...' : 'Export PDF'}
            </Button>
          ) : (
            <Button
              variant="secondary"
              disabled
              className="opacity-50 cursor-not-allowed border-slate-700/50 bg-slate-800/40 text-slate-400"
              title="Unlock PDF export after attempting this test"
              icon={
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              }
            >
              PDF Locked 🔒
            </Button>
          )}
          {/* Analytics button: visible to teachers/admins always; to students only after completing */}
          {(user?.role !== 'STUDENT' || hasAttempted) && (
            <Link href={`/tests/${test.id}/analytics`}>
              <Button variant="secondary" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              }>
                Analytics 📊
              </Button>
            </Link>
          )}
          {hasAttempted && attemptId && (
            <Link href={`/exam/${test.id}/result?attemptId=${attemptId}`}>
              <Button variant="secondary" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              }>
                View Scorecard
              </Button>
            </Link>
          )}
          {/* Only students can attempt; disable for teachers/admins */}
          {user?.role === 'STUDENT' ? (
            <Link href={`/exam/${test.id}`}>
              <Button icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
              }>
                {hasAttempted ? 'Re-attempt Test' : 'Attempt Test'}
              </Button>
            </Link>
          ) : (
            <Button
              disabled
              className="opacity-40 cursor-not-allowed"
              title="Only students can attempt tests"
            >
              🚫 Students Only
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Duration', value: formatDuration(test.duration), icon: '⏱️' },
          { label: 'Questions', value: test.totalQuestions.toString(), icon: '📝' },
          { label: 'Total Marks', value: test.totalMarks.toString(), icon: '🏆' },
          { label: 'Attempts', value: test.attemptCount.toString(), icon: '👥' },
          { label: 'Avg Score', value: `${test.avgScore || 0}%`, icon: '📊' },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="text-lg font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sections */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white">Sections</h2>
          {test.sections && test.sections.length > 0 ? (
            test.sections.map((section: any, i: number) => (
              <Card key={section.id} hover>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      i === 0 ? 'bg-indigo-500/20' : i === 1 ? 'bg-purple-500/20' : 'bg-cyan-500/20'
                    }`}>
                      {i === 0 ? '⚡' : i === 1 ? '🧪' : '📐'}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{section.name}</h3>
                      <p className="text-xs text-slate-500">
                        {section.questionCount} questions • +{section.marksPerQuestion} / -{section.negativeMarks} marks
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">{section.questionCount * section.marksPerQuestion} marks</Badge>
                </div>
              </Card>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500 text-sm">
              No sections defined for this mock test.
            </div>
          )}

          {/* Question Preview - Locked for students who haven't attempted */}
          <h2 className="text-lg font-semibold text-white mt-8">Question Preview</h2>
          {user?.role !== 'STUDENT' || hasAttempted ? (
            previewQuestions.map((q: any, i: number) => (
              <Card key={q.id || i} className="group hover:bg-slate-800/60 transition-colors">
                <div className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-sm font-bold text-slate-400 shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300">
                      {q.text}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={q.difficulty === 'EASY' ? 'success' : q.difficulty === 'MEDIUM' ? 'warning' : 'danger'} size="sm">
                        {q.difficulty}
                      </Badge>
                      <Badge variant="default" size="sm">{q.type}</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="text-center py-10 border-dashed border-amber-500/20 bg-amber-500/5">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl">
                  🔒
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Question Preview Locked</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Question previews are unlocked after you complete your first attempt. Attempt the test to see the question paper.
                  </p>
                </div>
                <Link href={`/exam/${test.id}`}>
                  <Button size="sm" icon={
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                  }>
                    Attempt Now
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Settings */}
          <Card>
            <h3 className="text-sm font-semibold text-white mb-4">Test Settings</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Type</span><span className="text-white">{test.type?.replace(/_/g, ' ')}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Duration</span><span className="text-white">{formatDuration(test.duration)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Questions</span><span className="text-white">{test.totalQuestions}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Total Marks</span><span className="text-white">{test.totalMarks}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Marking</span><span className="text-white">+4 / -1</span></div>
            </div>
          </Card>

          {/* Assigned Batches */}
          <Card>
            <h3 className="text-sm font-semibold text-white mb-3">Assigned Batches</h3>
            <div className="space-y-2">
              {test.batches?.map((batch: string) => (
                <div key={batch} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-sm text-slate-300">{batch}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          {user?.role !== 'STUDENT' && (
            <Card>
              <h3 className="text-sm font-semibold text-white mb-3">Actions</h3>
              <div className="space-y-2">
                {test.status === 'DRAFT' && (
                  <Button onClick={handlePublish} variant="outline" className="w-full justify-start" size="sm">
                    ✨ Publish Test
                  </Button>
                )}
                <Button onClick={handleArchive} variant="danger" className="w-full justify-start" size="sm">
                  🗑️ Delete Test
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
