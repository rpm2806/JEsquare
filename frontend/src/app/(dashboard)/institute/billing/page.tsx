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
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockDetails, setMockDetails] = useState<any>(null);
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (planKey: string) => {
    if (!user) return;
    if (!user.instituteId) {
      alert("Please join or create an institute first to purchase subscription plans.");
      return;
    }

    const priceMap: Record<string, number> = {
      BASIC: 999,
      PRO: 2999,
      INSTITUTE: 9999,
    };
    const price = priceMap[planKey] || 0;

    try {
      setUpdating(planKey);
      
      // 1. Create Order on backend
      const orderRes = await api.post('/payment/order', {
        planId: planKey,
        amount: price,
      });

      const order = orderRes.data;

      // 2. If it is a developer mock order, open our premium simulator!
      if (order.isMock) {
        setMockDetails({
          orderId: order.id,
          amount: price,
          planId: planKey,
        });
        setShowMockModal(true);
        return;
      }

      // 3. Otherwise, load real Razorpay checkout
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Failed to load Razorpay SDK. Please check your connection.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency,
        name: 'JEsquare',
        description: `Upgrade to ${planKey} Plan`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            setUpdating(planKey);
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: planKey,
              instituteId: user.instituteId,
            });

            // Update user in store
            const updatedUser = { ...user, subscriptionPlan: planKey };
            setUser(updatedUser);
            setActiveSub(verifyRes.data.subscription);
            alert(`Payment successful! Your institute has been upgraded to ${planKey}.`);
          } catch (err: any) {
            alert(err.response?.data?.message || 'Payment verification failed.');
          } finally {
            setUpdating(null);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#6366f1',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      console.error("Failed to upgrade subscription:", e);
      alert(e.response?.data?.message || "Failed to initiate payment. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const handleAuthorizeMockPayment = async () => {
    if (!user || !mockDetails) return;
    try {
      setUpdating(mockDetails.planId);
      setShowMockModal(false);

      const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 10)}`;
      const mockSignature = `sig_mock_${Math.random().toString(36).substring(2, 10)}`;

      const verifyRes = await api.post('/payment/verify', {
        razorpay_order_id: mockDetails.orderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
        planId: mockDetails.planId,
        instituteId: user.instituteId,
      });

      // Update user in store
      const updatedUser = { ...user, subscriptionPlan: mockDetails.planId };
      setUser(updatedUser);
      setActiveSub(verifyRes.data.subscription);
      alert(`[Sandbox] Success! Your institute has been successfully upgraded to the ${mockDetails.planId} plan.`);
    } catch (e: any) {
      alert("Mock payment verification failed.");
    } finally {
      setUpdating(null);
      setMockDetails(null);
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
      {/* Mock Razorpay Sandbox Checkout Modal */}
      {showMockModal && mockDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl p-6 sm:p-8 animate-scale-in text-center">
            {/* Header */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">Razorpay Secure Sandbox</h3>
            <p className="text-slate-400 text-sm mt-1 mb-6">Unified mock payment integration is active.</p>

            {/* Payment card */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 mb-6 text-left space-y-3">
              <div className="flex justify-between text-xs"><span className="text-slate-500">Merchant</span><span className="text-white font-medium">JEsquare Mock Test</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Order ID</span><span className="text-indigo-400 font-mono select-all">{mockDetails.orderId}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Plan Selection</span><span className="text-white font-medium uppercase tracking-wider">{mockDetails.planId}</span></div>
              <div className="border-t border-slate-800/60 my-2" />
              <div className="flex justify-between items-baseline"><span className="text-sm text-slate-400">Total Payable</span><span className="text-2xl font-bold text-gradient">₹{mockDetails.amount}</span></div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setShowMockModal(false); setMockDetails(null); }}
                className="flex-1 justify-center order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAuthorizeMockPayment}
                className="flex-1 justify-center order-1 sm:order-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
              >
                Authorize Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
