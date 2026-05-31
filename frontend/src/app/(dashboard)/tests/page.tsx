'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { cn, formatDuration } from '../../../lib/utils';
import type { TestStatus } from '../../../types';
import api from '../../../lib/api';
import { Loader2, Wallet, Plus, Lock, Sparkles, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../../store/auth-store';

const statusConfig: Record<string, { variant: 'success' | 'primary' | 'warning' | 'default'; dot: boolean }> = {
  COMPLETED: { variant: 'success', dot: true },
  ACTIVE: { variant: 'primary', dot: true },
  PUBLISHED: { variant: 'warning', dot: true },
  DRAFT: { variant: 'default', dot: false },
};

function AddBalanceModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (newBalance: number) => void }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const presets = [10, 25, 50, 100];

  const handleAdd = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/users/add-balance', { amount: num });
      onSuccess(res.data.balance);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add balance. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl p-8 animate-scale-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Add to Wallet</h2>
            <p className="text-slate-400 text-sm">Each additional test costs ₹5</p>
          </div>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p.toString())}
              className={cn(
                'py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200',
                amount === p.toString()
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-white'
              )}
            >
              ₹{p}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 font-medium mb-2 block">Custom Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
            <input
              type="number"
              min="1"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); }}
              className="w-full pl-8 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-400 mb-4 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">{error}</p>
        )}

        {/* Disclaimer */}
        <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 mb-6">
          <p className="text-xs text-amber-300/80 leading-relaxed">
            💡 This is a demo wallet. In production, a secure payment gateway (Razorpay/UPI) would process the transaction. Balance ₹{amount || 0} will be credited instantly.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAdd} isLoading={loading} className="flex-1" icon={<Wallet className="w-4 h-4" />}>
            Add ₹{amount || '0'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TestsPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TestStatus | 'ALL'>('ALL');
  const [dbTests, setDbTests] = useState<any[]>([]);
  const [myAttempts, setMyAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [myTestCount, setMyTestCount] = useState(0);

  // Sync user profile on mount to get fresh balance
  useEffect(() => {
    async function syncUser() {
      if (user) {
        try {
          const res = await api.get('/users/me');
          setUser(res.data);
        } catch (err) {
          console.error('Error syncing user profile:', err);
        }
      }
    }
    syncUser();
  }, []);

  useEffect(() => {
    async function loadTestsAndAttempts() {
      try {
        setLoading(true);
        const [testsRes, attemptsRes] = await Promise.all([
          api.get('/tests'),
          user?.role === 'STUDENT' ? api.get('/attempts/my') : Promise.resolve({ data: { attempts: [] } }),
        ]);
        const tests = testsRes.data?.tests || [];
        setDbTests(tests);
        setMyAttempts(attemptsRes.data?.attempts || []);

        // Count tests this student has created
        if (user?.role === 'STUDENT') {
          try {
            const allTests = await api.get('/tests');
            // backend already filters to 5 latest for students, so count by other means
            // we just show count from user profile context via separate check
          } catch {}
        }
      } catch (err) {
        console.error('Error fetching tests or attempts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTestsAndAttempts();
  }, [user]);

  const handleWalletSuccess = (newBalance: number) => {
    setUser({ ...(user as any), balance: newBalance });
    setShowWalletModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">Fetching mock test listings...</p>
      </div>
    );
  }

  // Map database test formats cleanly
  const mappedDbTests = dbTests.map((t) => {
    let status: TestStatus = t.isPublished ? 'PUBLISHED' : 'DRAFT';

    if (user?.role === 'STUDENT') {
      const studentAttemptsForTest = myAttempts.filter((att) => att.testId === t.id);
      const hasCompleted = studentAttemptsForTest.some((att) => att.status === 'EVALUATED' || att.status === 'SUBMITTED');
      const hasActive = studentAttemptsForTest.some((att) => att.status === 'IN_PROGRESS');

      if (hasCompleted) {
        status = 'COMPLETED';
      } else if (hasActive) {
        status = 'ACTIVE';
      } else if (t.isPublished) {
        status = 'ACTIVE';
      }
    }

    return {
      id: t.id,
      title: t.title,
      status,
      type: t.type,
      duration: t.duration,
      totalQuestions: t._count?.questions !== undefined ? t._count.questions : (t.questions?.length || 0),
      totalMarks: t.totalMarks,
      attemptCount: t._count?.attempts || 0,
      avgScore: 0,
      description: t.description || 'Auto-generated syllabus mock test.',
    };
  });

  const allTestsList = [...mappedDbTests];

  const activeTabs = user?.role === 'STUDENT'
    ? [
        { label: 'All', value: 'ALL' as const },
        { label: 'Active', value: 'ACTIVE' as const },
        { label: 'Completed', value: 'COMPLETED' as const },
      ]
    : [
        { label: 'All', value: 'ALL' as const },
        { label: 'Draft', value: 'DRAFT' as const },
        { label: 'Published', value: 'PUBLISHED' as const },
      ];

  const filteredTests = activeTab === 'ALL'
    ? allTestsList
    : allTestsList.filter((t) => t.status === activeTab);

  const balance = (user as any)?.balance ?? 0;
  const isStudent = user?.role === 'STUDENT';

  return (
    <div className="animate-fade-in">
      {/* Wallet Modal */}
      {showWalletModal && (
        <AddBalanceModal
          onClose={() => setShowWalletModal(false)}
          onSuccess={handleWalletSuccess}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Tests</h1>
          <p className="text-slate-400 mt-1">
            {isStudent ? 'Browse & attempt the 5 latest published mock tests' : 'Create and manage your tests'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Student Wallet Widget */}
          {isStudent && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-sm">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">Wallet:</span>
                <span className="text-emerald-400 font-bold">₹{balance.toFixed(2)}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWalletModal(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Balance
              </Button>
            </div>
          )}
          <Link href="/tests/create">
            <Button icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            }>
              Create Test
            </Button>
          </Link>
        </div>
      </div>

      {/* Student Info Banner */}
      {isStudent && (
        <div className="mb-6 grid sm:grid-cols-2 gap-4">
          {/* Free Tests Info */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Self-Practice Tests</p>
              <p className="text-xs text-slate-400 mt-0.5">2 free tests included • ₹5/test after that</p>
            </div>
          </div>
          {/* Wallet Balance Reminder */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Your Wallet Balance</p>
                <p className="text-xs text-slate-400">Used to create additional tests</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-emerald-400">₹{balance.toFixed(0)}</p>
              {balance < 5 && (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors mt-0.5 flex items-center gap-1"
                >
                  Low balance <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Test Limit warning for students */}
      {isStudent && balance < 5 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/8 border border-amber-500/20 flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-300">Need more tests?</p>
            <p className="text-xs text-slate-400 mt-0.5">You can only generate 2 free self-practice tests. Add at least ₹5 to your wallet to generate more.</p>
          </div>
          <Button size="sm" onClick={() => setShowWalletModal(true)} icon={<Plus className="w-3.5 h-3.5" />}>
            Add ₹5+
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-xl w-fit mb-8">
        {activeTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === tab.value
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            )}
          >
            {tab.label}
            {tab.value !== 'ALL' && (
              <span className="ml-1.5 text-xs opacity-60">
                {allTestsList.filter(t => t.status === tab.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Test Cards */}
      <div className="grid gap-4">
        {filteredTests.map((test) => {
          const config = statusConfig[test.status] || statusConfig.DRAFT;
          const isCompleted = test.status === 'COMPLETED';
          return (
            <Card key={test.id} hover className={cn(
              'transition-all duration-300',
              isCompleted && 'border-emerald-500/20 bg-emerald-950/5'
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Link href={`/tests/${test.id}`} className="text-base font-semibold text-white hover:text-indigo-400 transition-colors truncate">
                      {test.title}
                    </Link>
                    <Badge variant={config.variant} dot={config.dot}>{test.status}</Badge>
                  </div>
                  {test.description && (
                    <p className="text-sm text-slate-400 mb-3 line-clamp-1">{test.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {formatDuration(test.duration)}
                    </span>
                    <span>{test.totalQuestions} questions</span>
                    <span>{test.totalMarks} marks</span>
                    <Badge variant="default" size="sm">{test.type.replace(/_/g, ' ')}</Badge>
                    {test.attemptCount > 0 && (
                      <>
                        <span>•</span>
                        <span>{test.attemptCount} attempts</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isCompleted && isStudent ? (
                    <>
                      <Link href={`/tests/${test.id}`}>
                        <Button variant="ghost" size="sm">Details</Button>
                      </Link>
                      <Link href={`/exam/${test.id}`}>
                        <Button variant="outline" size="sm">Re-attempt</Button>
                      </Link>
                    </>
                  ) : isStudent ? (
                    <>
                      <Link href={`/tests/${test.id}`}>
                        <Button variant="ghost" size="sm">Details</Button>
                      </Link>
                      <Link href={`/exam/${test.id}`}>
                        <Button size="sm" icon={
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                        }>
                          Attempt
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href={`/tests/${test.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                      {test.status === 'DRAFT' && (
                        <Link href={`/tests/${test.id}`}>
                          <Button variant="outline" size="sm">Publish</Button>
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-1">No tests found</h3>
          <p className="text-sm text-slate-400">
            {isStudent ? 'No published mock tests available yet. Check back soon!' : 'Create your first test to get started.'}
          </p>
        </div>
      )}
    </div>
  );
}
