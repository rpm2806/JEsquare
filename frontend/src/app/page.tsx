'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../store/auth-store';

const features = [
  {
    title: 'CBT Exam Interface',
    description: 'NTA-style computer-based test interface with timer, question palette, and seamless navigation.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    ),
  },
  {
    title: 'Smart Analytics',
    description: 'Deep performance insights with score trends, subject analysis, weak areas, and personalized recommendations.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    ),
  },
  {
    title: 'Question Bank',
    description: 'Massive curated question bank with LaTeX rendering, filters by subject, chapter, difficulty, and type.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    ),
  },
  {
    title: 'Institute Management',
    description: 'Multi-tenant support for coaching institutes with branding, batch management, and teacher collaboration.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    ),
  },
  {
    title: 'Doubt Resolution',
    description: 'AI-powered instant doubt solving with human expert escalation and detailed explanations.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
    ),
  },
];

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: ['50 Questions', '2 Tests/month', 'Basic Analytics', '1 Student'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Basic',
    price: '₹499',
    period: '/month',
    features: ['500 Questions', '20 Tests/month', 'Full Analytics', '50 Students', 'Syllabus Integration'],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₹999',
    period: '/month',
    features: ['Unlimited Questions', 'Unlimited Tests', 'Advanced Analytics', '200 Students', 'Doubt Resolution', 'PDF Export'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Institute',
    price: '₹4,999',
    period: '/month',
    features: ['Everything in Pro', '1000+ Students', 'Multi-teacher', 'Custom Branding', 'Batch Management', 'Priority Support', 'API Access'],
    cta: 'Contact Sales',
    popular: false,
  },
];

const testimonials = [
  { name: 'Rakesh Sharma', role: 'Physics Teacher, Allen Kota', text: 'JEsquare has revolutionized how I create and manage tests. The dynamic test generator saves me hours every week.', rating: 5 },
  { name: 'Priya Patel', role: 'JEE Aspirant, Rank 234', text: 'The CBT interface is exactly like the real NTA exam. Practicing here gave me the confidence I needed.', rating: 5 },
  { name: 'Dr. Amit Verma', role: 'Director, Resonance Institute', text: 'Managing 500+ students across batches has never been easier. The analytics alone are worth every penny.', rating: 5 },
];

export default function LandingPage() {
  const { isAuthenticated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gradient">JEsquare</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm text-slate-400 hover:text-white transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors font-medium">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-float animate-delay-1000" />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl animate-float animate-delay-500" />
        </div>
        <div className="absolute inset-0 bg-grid opacity-50" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 animate-fade-in-down">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-indigo-300 font-medium">Create tests from Latest Syllabus</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
            <span className="text-white">Create </span>
            <span className="text-gradient">Smarter</span>
            <span className="text-white"> Tests</span>
            <br />
            <span className="text-white">with </span>
            <span className="text-gradient-blue">AI Precision</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200">
            Access JEE-caliber questions, conduct NTA-style CBT exams, and unlock deep analytics — all in one powerful platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 animate-fade-in-up animate-delay-300">
            <Link
              href={isAuthenticated ? '/dashboard' : '/register'}
              className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/50 transition-all duration-300 hover:-translate-y-0.5"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 text-base font-semibold text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in-up animate-delay-500">
            {[
              { value: '50K+', label: 'Questions Generated' },
              { value: '10K+', label: 'Tests Created' },
              { value: '25K+', label: 'Students' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-5">
                <p className="text-3xl font-bold text-gradient">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.02] to-transparent" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Features</span>
            <h2 className="text-4xl font-bold text-white mt-3 mb-4">Everything You Need to Excel</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              A complete ecosystem for JEE test preparation, from question creation to performance analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group glass rounded-2xl p-6 hover:bg-slate-800/70 hover:border-slate-600/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/5"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-500/20 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Pricing</span>
            <h2 className="text-4xl font-bold text-white mt-3 mb-4">Plans for Every Scale</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              From individual students to large coaching institutes — we have you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-indigo-500/20 to-violet-500/10 border-2 border-indigo-500/50 shadow-xl shadow-indigo-500/10'
                    : 'glass hover:border-slate-600/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full text-xs font-semibold text-white shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials Section ─── */}
      <section id="testimonials" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/[0.02] to-transparent" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl font-bold text-white mt-3 mb-4">Loved by Educators & Students</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:-translate-y-1">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="relative rounded-3xl bg-gradient-to-r from-indigo-600/20 via-violet-600/20 to-purple-600/20 border border-indigo-500/20 p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-indigo-500/20 blur-3xl" />
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Teaching?</h2>
              <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of educators and students who trust JEsquare for their JEE preparation.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href={isAuthenticated ? '/dashboard' : '/register'}
                  className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/50 transition-all duration-300"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Start Free — No Card Needed'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-800/50 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm text-slate-400">© 2026 JEE JEsquare. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Terms</a>
            <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
