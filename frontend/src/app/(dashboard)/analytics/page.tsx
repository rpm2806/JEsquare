'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { ScoreChart } from '../../../components/analytics/score-chart';
import { AccuracyRadar } from '../../../components/analytics/accuracy-radar';
import { WeakChapters } from '../../../components/analytics/weak-chapters';
import { RankingTable } from '../../../components/analytics/ranking-table';
import { useAuthStore } from '../../../store/auth-store';
import api from '../../../lib/api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [weakChs, setWeakChs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;
      
      // If user is not a student, let them preview general/mock stats cleanly
      if (user.role !== 'STUDENT') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [statsRes, weakRes] = await Promise.all([
          api.get(`/analytics/student/${user.id}`),
          api.get(`/analytics/student/${user.id}/weak-chapters`)
        ]);
        setStats(statsRes.data);
        setWeakChs(weakRes.data.allChapters || []);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [user]);

  // Compute subject wise stats dynamically
  const subjectStats = useMemo(() => {
    if (!weakChs || weakChs.length === 0) {
      return [
        { subject: 'Physics', accuracy: 72, avgTime: '2.1 min', correct: 156, total: 217, color: 'indigo' },
        { subject: 'Chemistry', accuracy: 65, avgTime: '1.8 min', correct: 132, total: 203, color: 'purple' },
        { subject: 'Mathematics', accuracy: 78, avgTime: '3.2 min', correct: 168, total: 215, color: 'cyan' },
      ];
    }

    const subjects: Record<string, { correct: number; total: number }> = {
      PHYSICS: { correct: 0, total: 0 },
      CHEMISTRY: { correct: 0, total: 0 },
      MATHEMATICS: { correct: 0, total: 0 },
    };

    weakChs.forEach((ch) => {
      const sub = ch.subjectName.toUpperCase();
      if (!subjects[sub]) {
        subjects[sub] = { correct: 0, total: 0 };
      }
      subjects[sub].correct += ch.correct || 0;
      subjects[sub].total += ch.total || 0;
    });

    return [
      {
        subject: 'Physics',
        accuracy: subjects.PHYSICS?.total > 0 ? Math.round((subjects.PHYSICS.correct / subjects.PHYSICS.total) * 100) : 0,
        avgTime: '2.4 min',
        correct: subjects.PHYSICS?.correct || 0,
        total: subjects.PHYSICS?.total || 0,
        color: 'indigo'
      },
      {
        subject: 'Chemistry',
        accuracy: subjects.CHEMISTRY?.total > 0 ? Math.round((subjects.CHEMISTRY.correct / subjects.CHEMISTRY.total) * 100) : 0,
        avgTime: '1.9 min',
        correct: subjects.CHEMISTRY?.correct || 0,
        total: subjects.CHEMISTRY?.total || 0,
        color: 'purple'
      },
      {
        subject: 'Mathematics',
        accuracy: subjects.MATHEMATICS?.total > 0 ? Math.round((subjects.MATHEMATICS.correct / subjects.MATHEMATICS.total) * 100) : 0,
        avgTime: '3.1 min',
        correct: subjects.MATHEMATICS?.correct || 0,
        total: subjects.MATHEMATICS?.total || 0,
        color: 'cyan'
      },
    ];
  }, [weakChs]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">Aggregating cohort performance metrics...</p>
      </div>
    );
  }

  // If student has NOT attempted any tests, show premium empty state overlay
  if (user?.role === 'STUDENT' && (!stats || stats.summary.totalTests === 0)) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">Track your performance and identify areas for improvement</p>
        </div>

        <Card className="p-8 md:p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto border-dashed border-slate-700/60 bg-slate-900/30 backdrop-blur-md rounded-2xl shadow-xl animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl mb-6 animate-pulse">
            🎯
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No Mock Test Attempts Found</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-8">
            You haven't attempted any mock examinations yet. Start your first NTA-style JEE CBT attempt on JEsquare to generate in-depth analytics, speed metrics, chapter weaknesses, and cohort leaderboard rankings.
          </p>
          <Link href="/tests">
            <Button size="lg" className="px-8 font-semibold shadow-lg shadow-indigo-500/20 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98] duration-300 transition-all">
              🚀 Attempt First Test
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Otherwise map actual metrics
  const totalAttempted = stats?.summary?.totalTests || 24;
  const avgPct = stats?.summary?.avgPercentage !== undefined ? `${stats.summary.avgPercentage}%` : '72.4%';
  const bestScore = stats?.summary?.bestScore !== undefined ? `${stats.summary.bestScore}/300` : '234/300';
  const accuracy = stats?.summary?.accuracy !== undefined ? `${stats.summary.accuracy}%` : '70.8%';

  const overviewStats = [
    { label: 'Tests Attempted', value: totalAttempted.toString(), icon: '📝', change: user?.role === 'STUDENT' ? 'Live attempted exams' : '+3 this month' },
    { label: 'Average Score', value: avgPct, icon: '📊', change: user?.role === 'STUDENT' ? `Avg ${stats?.summary?.avgScore || 0} marks` : '+5.2% improvement' },
    { label: 'Best Score', value: bestScore, icon: '🏆', change: user?.role === 'STUDENT' ? 'Highest evaluation score' : 'Mock Test 10' },
    { label: 'Overall Accuracy', value: accuracy, icon: '🎯', change: user?.role === 'STUDENT' ? 'Correct/attempted questions' : 'Top 5 percentile' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">Track your performance and identify areas for improvement</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overviewStats.map((stat) => (
          <Card key={stat.label} hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-xs text-emerald-400 mt-1">{stat.change}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Score Progression</h3>
          <ScoreChart attempts={stats?.recentAttempts} />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Performance Radar</h3>
          <AccuracyRadar />
        </Card>
      </div>

      {/* Subject-wise Stats */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Subject-wise Performance</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {subjectStats.map((subject) => (
            <Card key={subject.subject} hover gradient>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white">{subject.subject}</h3>
                <Badge variant={subject.accuracy >= 70 ? 'success' : subject.accuracy >= 50 ? 'warning' : 'danger'}>
                  {subject.accuracy}%
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Accuracy</span>
                    <span className="text-white font-medium">{subject.correct}/{subject.total}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-700">
                    <div
                      className={`h-full rounded-full ${
                        subject.accuracy >= 70 ? 'bg-emerald-500' : subject.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      } transition-all duration-500`}
                      style={{ width: `${subject.accuracy}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Avg. Time per Q</span>
                  <span className="text-white font-medium">{subject.avgTime}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Weak Chapters & Rankings */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Weak Chapters</h3>
          <WeakChapters chapters={weakChs.filter(c => c.accuracy < 50)} />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Leaderboard</h3>
          <RankingTable />
        </Card>
      </div>

      {/* Recent Test Attempts History */}
      {user?.role === 'STUDENT' && (
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Recent Test Attempts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Test Title</th>
                  <th className="py-3 px-4">Exam Type</th>
                  <th className="py-3 px-4">Score Secured</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Date Taken</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
                  stats.recentAttempts.map((att: any) => (
                    <tr key={att.attemptId} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-4 px-4 font-medium text-white">{att.testTitle}</td>
                      <td className="py-4 px-4">
                        <Badge variant="default" size="sm">
                          {att.testType?.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-indigo-300 font-semibold">
                        {att.score} <span className="text-slate-500 text-xs font-normal">/ {att.totalMarks}</span>
                      </td>
                      <td className="py-4 px-4 text-emerald-400 font-semibold">
                        {att.percentage}%
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {att.date ? new Date(att.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : '—'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {att.attemptId && (
                          <Link href={`/exam/${att.testId}/result?attemptId=${att.attemptId}`}>
                            <Button size="sm" variant="outline">
                              View Scorecard
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                      No attempts completed yet. Sit for a mock test to see your scorecard history.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
