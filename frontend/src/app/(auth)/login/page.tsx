'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { useAuthStore } from '../../../store/auth-store';
import api from '../../../lib/api';
import { cn } from '../../../lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Custom interactive Google Sign-in simulation states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleAvatar, setGoogleAvatar] = useState('https://lh3.googleusercontent.com/a/default-user');

  // Auto-detect and fetch the real Google Profile picture dynamically on email typing!
  useEffect(() => {
    if (googleEmail && googleEmail.includes('@') && googleEmail.includes('.')) {
      setGoogleAvatar(`https://unavatar.io/google/${googleEmail}`);
    } else if (googleName) {
      // Fallback to beautiful initial letter avatar if email is incomplete
      setGoogleAvatar(`https://ui-avatars.com/api/?name=${encodeURIComponent(googleName)}&background=6366f1&color=fff&size=128`);
    } else {
      setGoogleAvatar('https://lh3.googleusercontent.com/a/default-user');
    }
  }, [googleEmail, googleName]);

  const { login } = useAuthStore();
  const router = useRouter();

  const handleGoogleLogin = () => {
    // Open the Google Sign-in details modal so they can customize their identity!
    setShowGoogleModal(true);
  };

  const executeGoogleLogin = async () => {
    setError('');
    setLoading(true);
    setShowGoogleModal(false);
    try {
      const mockGoogleToken = 'mock-google-token-' + Math.random().toString(36).substring(2);
      const res = await api.post('/auth/google', {
        token: mockGoogleToken,
        email: googleEmail,
        name: googleName,
        avatar: googleAvatar,
      });
      
      login(res.data.user, res.data.accessToken, res.data.refreshToken);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.accessToken, res.data.refreshToken);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleClipboard = (e: React.ClipboardEvent) => {
    if (email !== 'admin@jeesaas.com') {
      e.preventDefault();
    }
  };

  const handleDragDrop = (e: React.DragEvent) => {
    if (email !== 'admin@jeesaas.com') {
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-slate-950">
        <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-30" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Logo */}
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

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl shadow-black/20">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-slate-400 mt-1">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
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
              autoComplete={email === 'admin@jeesaas.com' ? 'email' : 'new-password'}
              onPaste={handleClipboard}
              onCopy={handleClipboard}
              onCut={handleClipboard}
              onDragOver={handleDragDrop}
              onDrop={handleDragDrop}
              spellCheck={false}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={email === 'admin@jeesaas.com' ? 'current-password' : 'new-password'}
              onPaste={handleClipboard}
              onCopy={handleClipboard}
              onCut={handleClipboard}
              onDragOver={handleDragDrop}
              onDrop={handleDragDrop}
              spellCheck={false}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-white transition-colors">
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              }
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50"
                />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" isLoading={loading} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-950 px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full justify-center"
            icon={
              <svg className="w-4 h-4 shrink-0 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
            }
          >
            Continue with Google
          </Button>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Google Sign-in Details Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl p-8 animate-scale-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg relative overflow-hidden shrink-0">
                {/* Dynamically loads Google Profile Picture or Initials */}
                <img 
                  src={googleAvatar} 
                  alt="Google Avatar" 
                  className="w-full h-full object-cover animate-fade-in"
                  onError={(e) => {
                    // Fail-safe default
                    (e.target as HTMLImageElement).src = 'https://lh3.googleusercontent.com/a/default-user';
                  }}
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Google Account Setup</h2>
                <p className="text-slate-400 text-sm">Real-time profile picture sync active</p>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4 mb-6">
              {/* Circular Avatar Preview with pulse effect */}
              <div className="flex justify-center my-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md group-hover:bg-indigo-500/30 transition-all duration-300 animate-pulse" />
                  <div className="w-24 h-24 rounded-full border-2 border-indigo-500/50 p-1 relative z-10 bg-slate-950 overflow-hidden shadow-xl">
                    <img 
                      src={googleAvatar} 
                      alt="Google Avatar Preview" 
                      className="w-full h-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://lh3.googleusercontent.com/a/default-user';
                      }}
                    />
                  </div>
                </div>
              </div>

              <Input
                label="Full Name"
                type="text"
                placeholder="Enter your name"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                required
              />
              <Input
                label="Google Email"
                type="email"
                placeholder="your.email@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowGoogleModal(false)}
                className="flex-1 justify-center"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={executeGoogleLogin}
                className="flex-1 justify-center"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
