'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import api from '../../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-slate-950">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gradient">JEsquare</span>
          </Link>
        </div>

        <div className="glass rounded-2xl p-8 shadow-2xl shadow-black/20">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-slate-400 text-sm mb-6">
                We&apos;ve sent a password reset link to <span className="text-white font-medium">{email}</span>
              </p>
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
                <p className="text-slate-400 mt-1 text-sm">No worries, we&apos;ll send you reset instructions.</p>
              </div>

              {error && (
                <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  }
                />
                <Button type="submit" isLoading={loading} className="w-full" size="lg">
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-8 text-center">
                <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
                  ← Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
