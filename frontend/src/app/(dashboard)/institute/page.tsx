'use client';
 
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useAuthStore } from '../../../store/auth-store';
import api from '../../../lib/api';
import { Loader2 } from 'lucide-react';

export default function InstitutePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      if (!user || !user.instituteId) return;
      try {
        setLoading(true);
        const [statsRes, activityRes] = await Promise.all([
          api.get(`/analytics/institute/${user.instituteId}`),
          api.get(`/institutes/${user.instituteId}/activity`),
        ]);
        setStats(statsRes.data.stats || null);
        setActivities(activityRes.data || []);
      } catch (err) {
        console.error('Failed to load institute dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  const formatActivityTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">Synchronizing institute practice networks...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Teachers', value: stats?.totalTeachers ?? 0, icon: '👨‍🏫', change: 'Manage staff roles' },
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: '🎓', change: 'Active practice cohort' },
    { label: 'Tests Created', value: stats?.totalTests ?? 0, icon: '📝', change: 'Mock exams catalog' },
    { label: 'Syllabus Questions', value: stats?.totalQuestions ?? 0, icon: '❓', change: 'Dynamically generated' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Institute Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your institute, teachers, and batches</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/institute/branding">
            <Button variant="secondary">🎨 Branding</Button>
          </Link>
          <Link href="/institute/billing">
            <Button variant="outline">💳 Billing</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-xs text-indigo-400 mt-1">{stat.change}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: 'Teachers', description: 'Manage teachers and permissions', href: '/institute/teachers', icon: '👨‍🏫', count: `${stats?.totalTeachers ?? 0} teachers` },
          { title: 'Batches', description: 'Create and manage student batches', href: '/institute/batches', icon: '📚', count: 'Active Batches' },
          { title: 'Billing', description: 'Subscription and usage details', href: '/institute/billing', icon: '💳', count: 'Pro Tier' },
        ].map((link) => (
          <Link key={link.href} href={link.href}>
            <Card hover className="group h-full">
              <div className="flex items-start gap-4">
                <span className="text-3xl group-hover:scale-110 transition-transform">{link.icon}</span>
                <div>
                  <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors">{link.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{link.description}</p>
                  <Badge variant="default" className="mt-2">{link.count}</Badge>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/30 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  activity.type === 'QUESTION_UPLOAD' ? 'bg-indigo-500/20 text-indigo-400' :
                  activity.type === 'TEST_CREATE' ? 'bg-violet-500/20 text-violet-400' :
                  activity.type === 'STUDENT_ENROLL' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-350">{activity.message}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatActivityTime(activity.date)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              No recent activity logged for this institute yet. Enroll students or construct mock exams to populate activity logs!
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
