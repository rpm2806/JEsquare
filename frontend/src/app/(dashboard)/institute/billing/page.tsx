'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { cn } from '../../../../lib/utils';
import { useAuthStore } from '../../../../store/auth-store';
import api from '../../../../lib/api';
import { Loader2 } from 'lucide-react';

const PLANS_CONFIG = [
  {
    key: 'FREE',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: { questions: '50', tests: '10/mo', students: '50', analytics: 'Basic', ai: false, doubts: false },
  },
  {
    key: 'BASIC',
    name: 'Basic',
    price: '₹999',
    period: '/month',
    features: { questions: 'Unlimited', tests: '50/mo', students: '200', analytics: 'Advanced', ai: true, doubts: false },
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: '₹2,999',
    period: '/month',
    features: { questions: 'Unlimited', tests: 'Unlimited', students: '1000', analytics: 'Full', ai: true, doubts: true },
  },
  {
    key: 'INSTITUTE',
    name: 'Institute',
    price: '₹9,999',
    period: '/month',
    features: { questions: 'Unlimited', tests: 'Unlimited', students: 'Unlimited', analytics: 'Full', ai: true, doubts: true },
  },
];

export default function BillingPage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<any>(null);
  const [usageStats, setUsageStats] = useState({
    questionsUsed: 0,
    testsUsed: 0,
    studentsUsed: 0,
  });

  useEffect(() => {
    async function loadBillingDetails() {
      if (!user) return;
      try {
        setLoading(true);
        if (user.instituteId) {
          // 1. Get active subscription
          const subRes = await api.get(`/subscriptions/${user.instituteId}`);
          setActiveSub(subRes.data);

          // 2. Get usage stats
          const analyticsRes = await api.get(`/analytics/institute/${user.instituteId}`);
          const stats = analyticsRes.data.stats;
          setUsageStats({
            questionsUsed: stats.totalQuestions || 0,
            testsUsed: stats.totalTests || 0,
            studentsUsed: stats.totalStudents || 0,
          });
        } else {
          setActiveSub({ plan: 'FREE', status: 'ACTIVE' });
        }
      } catch (e) {
        console.error("Error loading subscription details:", e);
      } finally {
        setLoading(false);
      }
    }
    loadBillingDetails();
  }, [user]);

  const handleUpgrade = async (planKey: string) => {
    if (!user) return;
    if (!user.instituteId) {
      alert("Please join or create an institute first to purchase subscription plans.");
      return;
    }
    try {
      setUpdating(planKey);
      const res = await api.post('/subscriptions', {
        instituteId: user.instituteId,
        plan: planKey,
        paymentId: `mock_pay_${Date.now()}`
      });

      // Update local auth store
      const updatedUser = { ...user, subscriptionPlan: planKey };
      setUser(updatedUser);

      // Update local state
      setActiveSub(res.data);
      alert(`Success! Your institute is now subscribed to the ${planKey} plan.`);
    } catch (e) {
      console.error("Failed to upgrade subscription:", e);
      alert("Failed to upgrade subscription. Please check your network or try again.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading subscription billing details...</p>
      </div>
    );
  }

  const currentPlanKey = activeSub?.plan || 'FREE';
  const currentPlanConfig = PLANS_CONFIG.find(p => p.key === currentPlanKey) || PLANS_CONFIG[0];

  const usageItems = [
    { label: 'Questions Uploaded', used: usageStats.questionsUsed, total: currentPlanKey === 'FREE' ? 50 : -1 },
    { label: 'Tests Assembled', used: usageStats.testsUsed, total: currentPlanKey === 'FREE' ? 10 : currentPlanKey === 'BASIC' ? 50 : -1 },
    { label: 'Students Enrolled', used: usageStats.studentsUsed, total: currentPlanKey === 'FREE' ? 50 : currentPlanKey === 'BASIC' ? 200 : currentPlanKey === 'PRO' ? 1000 : -1 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
        <p className="text-slate-400 mt-1">Manage your subscription plan, pricing, and system usage.</p>
      </div>

      {/* Current Plan Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full -mr-20 -mt-20" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <Badge variant="primary" dot>Active Plan</Badge>
            <h2 className="text-2xl font-bold text-white mt-2">{currentPlanConfig.name} Plan</h2>
            <p className="text-slate-400 mt-1">
              {currentPlanKey === 'FREE' ? 'Free tier active forever' : `Renews monthly via mock payments`}
            </p>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-4xl font-bold text-gradient">{currentPlanConfig.price}</span>
              <span className="text-slate-500">{currentPlanConfig.period}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Current Usage */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Resource Usage</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {usageItems.map((item) => {
            const hasLimit = item.total > 0;
            const percentage = hasLimit ? Math.min(Math.round((item.used / item.total) * 100), 100) : 0;
            return (
              <Card key={item.label}>
                <p className="text-xs text-slate-500 mb-2">{item.label}</p>
                <p className="text-2xl font-bold text-white">
                  {item.used}
                  <span className="text-sm text-slate-500 font-normal"> / {hasLimit ? item.total : '∞'}</span>
                </p>
                {hasLimit && (
                  <div className="mt-3">
                    <div className="w-full h-2 rounded-full bg-slate-700">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          percentage > 85 ? 'bg-rose-500' : percentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{percentage}% used</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Plans List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Choose Your Plan</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS_CONFIG.map((plan) => {
            const isCurrent = plan.key === currentPlanKey;
            const isUpdating = updating === plan.key;
            return (
              <Card
                key={plan.name}
                className={cn(
                  isCurrent && 'border-indigo-500/50 bg-indigo-500/5 shadow-lg shadow-indigo-500/5'
                )}
              >
                {isCurrent && (
                  <Badge variant="primary" className="mb-3">Current Plan</Badge>
                )}
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4 mt-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Questions</span><span className="text-white">{plan.features.questions}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Tests</span><span className="text-white">{plan.features.tests}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Students</span><span className="text-white">{plan.features.students}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Analytics</span><span className="text-white">{plan.features.analytics}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Doubt Marketplace</span><span className={plan.features.doubts ? 'text-emerald-400' : 'text-slate-600'}>
                    {plan.features.doubts ? '✓' : '✗'}
                  </span></div>
                </div>
                <Button
                  variant={isCurrent ? 'secondary' : 'primary'}
                  className="w-full"
                  size="sm"
                  disabled={isCurrent || isUpdating}
                  onClick={() => handleUpgrade(plan.key)}
                >
                  {isUpdating ? 'Upgrading...' : isCurrent ? 'Current Plan' : 'Upgrade'}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
