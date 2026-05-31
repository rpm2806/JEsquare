'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Loader2, ArrowLeft, RefreshCw, Trophy, Users, TrendingUp, BarChart3 } from 'lucide-react';
import api from '../../../../../lib/api';
import { useAuthStore } from '../../../../../store/auth-store';
import Link from 'next/link';
import { formatDuration } from '../../../../../lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const BUCKET_COLORS: Record<string, string> = {
  '0-20%': '#ef4444',
  '20-40%': '#f97316',
  '40-60%': '#eab308',
  '60-80%': '#22c55e',
  '80-100%': '#6366f1',
};

export default function TestAnalyticsPage() {
  const params = useParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myAttempt, setMyAttempt] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      if (!params.id) return;
      try {
        setLoading(true);
        const [testRes, analyticsRes, leaderboardRes] = await Promise.all([
          api.get(`/tests/${params.id}`),
          api.get(`/analytics/test/${params.id}`),
          api.get(`/analytics/leaderboard/${params.id}`),
        ]);

        setTest(testRes.data);
        setAnalytics(analyticsRes.data);
        setLeaderboard(leaderboardRes.data?.leaderboard || []);

        // Check if current student has attempted this test
        if (user?.role === 'STUDENT') {
          try {
            const attemptsRes = await api.get('/attempts/my');
            const completed = attemptsRes.data?.attempts?.find(
              (a: any) => a.testId === params.id && (a.status === 'EVALUATED' || a.status === 'SUBMITTED')
            );
            setMyAttempt(completed || null);
          } catch {}
        }
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id, user]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">Aggregating cohort performance data...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-medium text-white">Analytics not available</h3>
        <p className="text-slate-400 mt-1 text-sm">No attempts have been made for this test yet.</p>
        <Link href={`/tests/${params.id}`}>
          <Button className="mt-4" variant="outline">Back to Test</Button>
        </Link>
      </div>
    );
  }

  const { stats, distribution } = analytics;
  const totalMarks = analytics.test?.totalMarks || test?.totalMarks || 300;

  const distributionData = Object.entries(distribution || {}).map(([bucket, count]) => ({
    bucket,
    count: count as number,
    color: BUCKET_COLORS[bucket] || '#6366f1',
  }));

  // Find the student's rank in leaderboard
  const myRank = user?.role === 'STUDENT'
    ? leaderboard.find((l: any) => l.student?.id === user?.id)
    : null;

  const cohortCards = [
    {
      label: 'Total Attempts',
      value: stats?.totalAttempts ?? 0,
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      sub: 'students appeared',
      color: 'indigo',
    },
    {
      label: 'Highest Score',
      value: `${stats?.maxScore ?? 0}/${totalMarks}`,
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      sub: `${Math.round(((stats?.maxScore ?? 0) / totalMarks) * 100)}% achieved`,
      color: 'amber',
    },
    {
      label: 'Average Score',
      value: `${stats?.avgScore ?? 0}/${totalMarks}`,
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      sub: `${stats?.avgPercentage ?? 0}% class average`,
      color: 'emerald',
    },
    {
      label: 'Median Score',
      value: `${stats?.medianScore ?? 0}/${totalMarks}`,
      icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
      sub: 'middle performer',
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/tests/${params.id}`} className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Badge variant="primary">Test Analytics</Badge>
          </div>
          <h1 className="text-3xl font-bold text-white">
            {analytics.test?.title || test?.title || 'Test Analytics'}
          </h1>
          <p className="text-slate-400 mt-1">Cohort performance breakdown and score distribution</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {myAttempt && (
            <Link href={`/exam/${params.id}/result?attemptId=${myAttempt.id}`}>
              <Button variant="outline" size="sm" icon={<BarChart3 className="w-4 h-4" />}>
                My Scorecard
              </Button>
            </Link>
          )}
          {user?.role === 'STUDENT' && (
            <Link href={`/exam/${params.id}`}>
              <Button size="sm" icon={<RefreshCw className="w-4 h-4" />}>
                {myAttempt ? 'Re-attempt' : 'Attempt Test'}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* My Rank Banner (only for students) */}
      {myRank && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/15 to-violet-500/15 border border-indigo-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-2xl font-extrabold text-white">#{myRank.rank}</span>
            </div>
            <div>
              <p className="text-sm text-slate-400">Your Rank</p>
              <p className="text-xl font-bold text-white">
                {myRank.score ?? 0}/{totalMarks}
                <span className="text-sm font-normal text-indigo-300 ml-2">{myRank.percentage}%</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                ✅ {myRank.totalCorrect ?? 0} correct &nbsp;·&nbsp; ❌ {myRank.totalWrong ?? 0} wrong &nbsp;·&nbsp; ⏱️ {myRank.timeTaken ? `${Math.floor(myRank.timeTaken / 60)}m ${myRank.timeTaken % 60}s` : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={myRank.rank <= 3 ? 'success' : myRank.rank <= 10 ? 'warning' : 'default'} size="md">
              {myRank.rank <= 3 ? '🥇 Top 3' : myRank.rank <= 10 ? '🌟 Top 10' : `Rank ${myRank.rank}`}
            </Badge>
          </div>
        </div>
      )}

      {/* Cohort Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cohortCards.map((card) => (
          <Card key={card.label} hover className={`border-${card.color}-500/15 bg-${card.color}-950/5`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-${card.color}-500/15 flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
            <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
          </Card>
        ))}
      </div>

      {/* Score Distribution Chart */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Score Distribution</h2>
            <p className="text-sm text-slate-400 mt-0.5">Number of students in each percentage bracket</p>
          </div>
          <Badge variant="default">{stats?.totalAttempts ?? 0} attempts</Badge>
        </div>
        {distributionData.every(d => d.count === 0) ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm">
            <BarChart3 className="w-10 h-10 mb-3 opacity-40" />
            <p>Not enough data to display distribution yet.</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bucket" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                  formatter={(value: any) => [`${value} student${value !== 1 ? 's' : ''}`, 'Count']}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {distributionData.map((entry) => (
                    <Cell key={entry.bucket} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-800/50">
          {distributionData.map((d) => (
            <div key={d.bucket} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
              {d.bucket}: <span className="text-white font-medium">{d.count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Leaderboard */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">🏆 Official Leaderboard</h2>
            <p className="text-sm text-slate-400 mt-0.5">Ranked by first-attempt score (ties broken by time taken)</p>
          </div>
        </div>
        {leaderboard.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-sm">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No evaluated attempts yet. Be the first to attempt!</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-6">Rank</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Correct</th>
                  <th className="py-3 px-4">Wrong</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {leaderboard.map((entry: any) => {
                  const isMe = user?.id === entry.student?.id;
                  const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;
                  return (
                    <tr
                      key={entry.rank}
                      className={`transition-colors ${isMe ? 'bg-indigo-500/8 border-l-2 border-indigo-500' : 'hover:bg-slate-800/20'}`}
                    >
                      <td className="py-3.5 px-6 font-bold">
                        {medal ? (
                          <span className="text-lg">{medal}</span>
                        ) : (
                          <span className="text-slate-400">#{entry.rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {entry.student?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className={`font-medium ${isMe ? 'text-indigo-300' : 'text-white'}`}>
                              {entry.student?.name || 'Anonymous'}
                              {isMe && <span className="ml-2 text-xs text-indigo-400">(You)</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {entry.score ?? 0}
                        <span className="text-slate-500 font-normal text-xs ml-1">/ {totalMarks}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-semibold ${(entry.percentage ?? 0) >= 70 ? 'text-emerald-400' : (entry.percentage ?? 0) >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {entry.percentage ?? 0}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400 font-medium">{entry.totalCorrect ?? 0}</td>
                      <td className="py-3.5 px-4 text-rose-400 font-medium">{entry.totalWrong ?? 0}</td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {entry.timeTaken ? `${Math.floor(entry.timeTaken / 60)}m ${entry.timeTaken % 60}s` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
