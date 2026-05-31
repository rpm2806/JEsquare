'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

const stats = [
  { label: 'Total Teachers', value: '12', icon: '👨‍🏫', change: '+2 this month' },
  { label: 'Total Students', value: '456', icon: '🎓', change: '+34 this month' },
  { label: 'Active Batches', value: '8', icon: '📚', change: '2 tests this week' },
  { label: 'Tests Created', value: '89', icon: '📝', change: '+12 this month' },
];

const recentActivity = [
  { text: 'Teacher Amit added 20 questions to Physics bank', time: '30 min ago', type: 'question' },
  { text: 'Batch "2025 Regular" completed Mock Test 15', time: '1 hour ago', type: 'test' },
  { text: 'New student Rohan enrolled in Dropper batch', time: '2 hours ago', type: 'student' },
  { text: 'Teacher Priya published Chemistry Chapter Test', time: '3 hours ago', type: 'test' },
  { text: 'Subscription renewed — Pro Plan active', time: '1 day ago', type: 'billing' },
];

export default function InstitutePage() {
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
        {stats.map((stat) => (
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

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: 'Teachers', description: 'Manage teachers and permissions', href: '/institute/teachers', icon: '👨‍🏫', count: '12 teachers' },
          { title: 'Batches', description: 'Create and manage student batches', href: '/institute/batches', icon: '📚', count: '8 batches' },
          { title: 'Billing', description: 'Subscription and usage details', href: '/institute/billing', icon: '💳', count: 'Pro Plan' },
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
          {recentActivity.map((activity, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/30 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                activity.type === 'question' ? 'bg-indigo-500/20 text-indigo-400' :
                activity.type === 'test' ? 'bg-violet-500/20 text-violet-400' :
                activity.type === 'student' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-300">{activity.text}</p>
                <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
