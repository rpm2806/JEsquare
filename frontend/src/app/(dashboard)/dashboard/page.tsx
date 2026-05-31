'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useAuthStore } from '../../../store/auth-store';
import api from '../../../lib/api';
import { Loader2 } from 'lucide-react';

const statusColors: Record<string, 'success' | 'primary' | 'warning' | 'default'> = {
  COMPLETED: 'success',
  ACTIVE: 'primary',
  PUBLISHED: 'warning',
  DRAFT: 'default',
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [testsData, setTestsData] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // ─── Interactive Tour States & Logic ───
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const tourSteps = [
    {
      targetId: 'tour-welcome',
      title: '🚀 Welcome to JEsquare!',
      content: 'This is your centralized control panel. From here, you can manage your mock exams, check performance summaries, or monitor batches.',
    },
    {
      targetId: 'tour-stats',
      title: '📈 Performance Analytics',
      content: 'See active score progression, average test accuracy, completed evaluations, and historical indicators dynamically populated.',
    },
    {
      targetId: 'tour-actions',
      title: '⚡ Quick Actions',
      content: 'Construct high-quality customized question papers, verify listings, or resolve doubt marketplace tickets in one click.',
    },
    {
      targetId: 'tour-tests',
      title: '📝 Examination Schedules',
      content: 'Manage drafts, published examinations, and evaluate batches directly. Students can launch mock tests instantly.',
    },
    {
      targetId: 'tour-notifications',
      title: '🔔 Targeted Alerts',
      content: 'Stay informed on batch listings, doubt-solving payouts, and system alerts instantly from your notification log.',
    },
  ];

  useEffect(() => {
    // Automatically trigger tour on first-ever dashboard login
    const hasTakenTour = localStorage.getItem('hasTakenTour');
    if (!hasTakenTour && user && user.roleConfirmed) {
      setTourActive(true);
      localStorage.setItem('hasTakenTour', 'true');
    }
  }, [user]);

  useEffect(() => {
    if (tourActive) {
      const step = tourSteps[tourStep];
      const el = document.getElementById(step.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight element
        el.classList.add('ring-4', 'ring-indigo-500', 'ring-offset-4', 'ring-offset-slate-950', 'scale-[1.01]', 'duration-500');
      }
      return () => {
        if (el) {
          el.classList.remove('ring-4', 'ring-indigo-500', 'ring-offset-4', 'ring-offset-slate-950', 'scale-[1.01]');
        }
      };
    }
  }, [tourStep, tourActive]);

  const handleNext = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep((prev) => prev + 1);
    } else {
      setTourActive(false);
    }
  };

  const handleBack = () => {
    if (tourStep > 0) {
      setTourStep((prev) => prev - 1);
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        setLoading(true);
        // 1. Fetch Stats based on Role
        if (user.role === 'STUDENT') {
          try {
            const res = await api.get(`/analytics/student/${user.id}`);
            const summary = res.data.summary || { totalTests: 0, avgScore: 0, bestScore: 0, accuracy: 0 };
            setStatsData({
              type: 'STUDENT',
              items: [
                { title: 'Tests Attempted', value: summary.totalTests, icon: '📝', color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-500/10' },
                { title: 'Average Score', value: typeof summary.avgScore === 'number' ? Math.round(summary.avgScore) : summary.avgScore, icon: '📊', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10' },
                { title: 'Best Score', value: summary.bestScore, icon: '🏆', color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10' },
                { title: 'Accuracy', value: `${typeof summary.accuracy === 'number' ? Math.round(summary.accuracy) : summary.accuracy}%`, icon: '🎯', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10' },
              ]
            });
          } catch (e) {
            console.error("Error fetching student stats:", e);
            setStatsData({
              type: 'STUDENT',
              items: [
                { title: 'Tests Attempted', value: 0, icon: '📝', color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-500/10' },
                { title: 'Average Score', value: 0, icon: '📊', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10' },
                { title: 'Best Score', value: 0, icon: '🏆', color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10' },
                { title: 'Accuracy', value: '0%', icon: '🎯', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10' },
              ]
            });
          }
        } else if (user.role === 'SUPER_ADMIN') {
          try {
            const [saRes, tRes] = await Promise.all([
              api.get('/analytics/super-admin'),
              api.get('/tests', { params: { limit: 5 } })
            ]);
            const saStats = saRes.data || { totalStudents: 0, activeAttempts: 0, totalRevenue: 0 };
            setTestsData(tRes.data.data || []);

            const totalTestsCount = tRes.data?.pagination?.total ?? tRes.data?.length ?? 0;

            setStatsData({
              type: 'SUPER_ADMIN',
              items: [
                { title: 'Total Students', value: saStats.totalStudents, icon: '👥', color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-500/10' },
                { title: 'Active Exam Takers', value: saStats.activeAttempts, icon: '⚡', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10' },
                { title: 'Platform Revenue', value: `₹${saStats.totalRevenue}`, icon: '💰', color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10' },
                { title: 'Test Templates', value: totalTestsCount, icon: '📝', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10' },
              ]
            });
          } catch (e) {
            console.error("Error fetching super admin stats:", e);
          }
        } else {
          // Admin / Teacher
          const instituteId = user.instituteId;
          let stats = { totalStudents: 0, totalTests: 0, totalQuestions: 0, avgScore: 0 };
          
          if (instituteId) {
            try {
              const res = await api.get(`/analytics/institute/${instituteId}`);
              stats = res.data.stats || stats;
            } catch (e) {
              console.error("Error fetching institute stats:", e);
            }
          }
          
          setStatsData({
            type: 'ADMIN',
            items: [
              { title: 'Total Questions', value: stats.totalQuestions || 0, icon: '❓', color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-500/10' },
              { title: 'Tests Created', value: stats.totalTests || 0, icon: '📝', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10' },
              { title: 'Students', value: stats.totalStudents || 0, icon: '👥', color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10' },
              { title: 'Avg. Score', value: stats.avgScore ? Math.round(stats.avgScore) : '0', icon: '📈', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10' },
            ]
          });

          const params: any = { limit: 5 };
          if (user.instituteId) {
            params.instituteId = user.instituteId;
          }
          const testsRes = await api.get('/tests', { params });
          setTestsData(testsRes.data.data || []);
        }

        // 3. Fetch Notifications
        try {
          const notifRes = await api.get('/notifications');
          setNotifications(notifRes.data || []);
        } catch (eNotif) {
          console.error('Failed to load dashboard notifications:', eNotif);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Dynamic quick actions based on user role
  const quickActions = user?.role === 'STUDENT' ? [
    { label: 'Attempt Test', href: '/tests', icon: '📝', color: 'from-indigo-500 to-blue-500' },
    { label: 'Create Test', href: '/tests/create', icon: '✨', color: 'from-violet-500 to-purple-500' },
    { label: 'Ask a Doubt', href: '/doubts/ask', icon: '❓', color: 'from-emerald-500 to-green-500' },
    { label: 'My Performance', href: '/analytics', icon: '📊', color: 'from-amber-500 to-orange-500' },
  ] : [
    { label: 'Upload Question', href: '/questions/create', icon: '➕', color: 'from-indigo-500 to-blue-500' },
    { label: 'Create Test', href: '/tests/create', icon: '📝', color: 'from-violet-500 to-purple-500' },
    { label: 'Extract from PDF', href: '/questions/extract', icon: '📄', color: 'from-emerald-500 to-green-500' },
    { label: 'View Analytics', href: '/analytics', icon: '📊', color: 'from-amber-500 to-orange-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading dashboard analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div id="tour-welcome" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/40 transition-all duration-300">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name || 'User'}! 👋</h1>
          <p className="text-slate-400 mt-1">
            {user?.role === 'STUDENT' 
              ? "Here's your latest exam preparation progress."
              : "Here's what's happening with your JEsquare dashboard today."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setTourActive(true);
              setTourStep(0);
            }}
            variant="secondary"
            size="sm"
            className="text-xs font-semibold shadow-lg shadow-indigo-500/10 hover:border-indigo-500/30 transition-all gap-1.5 shrink-0"
          >
            ✨ Take a Tour
          </Button>
          {user?.subscriptionPlan && (
            <Badge variant="primary" className="text-xs py-1.5 px-3 shrink-0">
              👑 {user.subscriptionPlan} Plan
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div id="tour-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 transition-all duration-300">
        {statsData?.items.map((stat: any, i: number) => (
          <Card key={stat.title} hover className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` } as React.CSSProperties}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center text-xl`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div id="tour-actions" className="transition-all duration-300">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Card hover className="text-center group cursor-pointer hover:border-slate-600 transition-colors">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{action.icon}</div>
                <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{action.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Tests & Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Tests */}
        <div id="tour-tests" className="lg:col-span-2 transition-all duration-300">
          <Card padding="none">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Tests</h2>
              <Link href="/tests">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="divide-y divide-slate-700/30">
              {testsData.length > 0 ? (
                testsData.map((test) => (
                  <div key={test.id} className="px-6 py-4 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-medium text-white truncate">{test.title}</p>
                          <Badge variant={test.isPublished ? 'success' : 'default'}>
                            {test.isPublished ? 'PUBLISHED' : 'DRAFT'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5">
                          <span className="text-xs text-slate-500">{test.type.replace(/_/g, ' ')}</span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-500">{test.duration} mins</span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-500">{test.totalMarks} Marks</span>
                        </div>
                      </div>
                      <Link href={`/tests/${test.id}`}>
                        <Button size="sm" variant="outline">View Details</Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No tests found. {user?.role !== 'STUDENT' && "Create one using the 'Create Test' action."}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div id="tour-notifications" className="transition-all duration-300">
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">Latest Notifications</h2>
            <div className="space-y-4 animate-fade-in">
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      n.type === 'WALLET' ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{n.title}</p>
                      <p className="text-sm text-slate-350 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No notifications found.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Floating Interactive Tour Guide Overlay */}
      {tourActive && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm glass rounded-2xl p-6 shadow-2xl border-indigo-500/40 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full">
              Step {tourStep + 1} of {tourSteps.length}
            </span>
            <button
              onClick={() => setTourActive(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            {tourSteps[tourStep].title}
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            {tourSteps[tourStep].content}
          </p>
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <button
              onClick={() => setTourActive(false)}
              className="text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors"
            >
              Skip Tour
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBack}
                disabled={tourStep === 0}
                className="text-[11px] px-3 h-8"
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                className="text-[11px] px-4 h-8 animate-pulse"
              >
                {tourStep === tourSteps.length - 1 ? 'Finish' : 'Next →'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
