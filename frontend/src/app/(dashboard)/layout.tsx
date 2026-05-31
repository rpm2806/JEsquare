'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../../components/layout/dashboard-layout';
import { useAuthStore } from '../../store/auth-store';
import { PageLoader } from '../../components/ui/loading';
import api from '../../lib/api';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';

interface RoleSelectionModalProps {
  user: any;
  onConfirmed: (updatedUser: any) => void;
}

function RoleSelectionModal({ user, onConfirmed }: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER' | 'INSTITUTE_ADMIN'>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmRole = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.patch(`/users/${user.id}/select-role`, { role: selectedRole });
      onConfirmed(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to select role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const rolesList = [
    {
      id: 'STUDENT' as const,
      icon: '🎓',
      title: 'Student',
      description: 'Take examinations, solve dynamic test series, and ask doubts.',
      features: ['Give Mock Tests (CBT)', 'Ask Doubts in Marketplace', 'View Personal Analytics'],
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30 hover:border-blue-500/50',
      activeColor: 'ring-2 ring-indigo-500 bg-indigo-500/10 border-indigo-500',
    },
    {
      id: 'TEACHER' as const,
      icon: '👨‍🏫',
      title: 'Teacher',
      description: 'Educate students, construct high-quality customized question papers.',
      features: ['Create Tests (Max 1 active)', 'Enrolled cap (100 students)', 'Batch analytics'],
      color: 'from-violet-500/10 to-purple-500/10 border-violet-500/30 hover:border-violet-500/50',
      activeColor: 'ring-2 ring-violet-500 bg-violet-500/10 border-violet-500',
    },
    {
      id: 'INSTITUTE_ADMIN' as const,
      icon: '🏫',
      title: 'Institute Admin',
      description: 'Supervise batch rosters, deploy tests, and configure coaching branding.',
      features: ['Create Tests (Max 10 active)', 'Enrolled cap (100 students)', 'Custom white-label branding'],
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 hover:border-emerald-500/50',
      activeColor: 'ring-2 ring-emerald-500 bg-emerald-500/10 border-emerald-500',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black animate-scale-in">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 text-white text-xl font-bold mb-4">
            🚀
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Select Your Role
          </h2>
          <p className="text-slate-400 mt-2 text-sm md:text-base max-w-md mx-auto">
            Choose your account role to personalize your JEE SaaS layout. Note: Once chosen, your role will be locked.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {rolesList.map((item) => {
            const isActive = selectedRole === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedRole(item.id)}
                className={cn(
                  'cursor-pointer rounded-2xl border p-5 transition-all duration-300 flex flex-col justify-between hover:scale-[1.02]',
                  isActive ? item.activeColor : cn('bg-slate-800/25 border-slate-700/50', item.color)
                )}
              >
                <div>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="border-t border-slate-800 pt-4 mt-2">
                  <ul className="space-y-2">
                    {item.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                        <span className="text-indigo-400 shrink-0">✔</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Changing account roles subsequently requires contacting the system admin via <a href="mailto:admin@jeesaas.com" className="text-indigo-400 hover:underline">admin@jeesaas.com</a>.
          </p>
          <Button
            onClick={handleConfirmRole}
            isLoading={loading}
            className="w-full sm:w-auto px-8 py-3 rounded-xl shadow-lg shadow-indigo-500/20 font-semibold"
            size="lg"
          >
            Confirm & Lock Role
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, hydrate, user, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (user && user.role !== 'SUPER_ADMIN') {
        e.preventDefault();
      }
    };
    
    const handleCopy = (e: ClipboardEvent) => {
      if (user && user.role !== 'SUPER_ADMIN') {
        e.preventDefault();
      }
    };

    document.addEventListener('paste', handlePaste);
    document.addEventListener('copy', handleCopy);
    
    return () => {
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('copy', handleCopy);
    };
  }, [user]);

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return null;

  const showRoleSelection = user && user.roleConfirmed === false && user.role !== 'SUPER_ADMIN';

  return (
    <DashboardLayout>
      {showRoleSelection ? (
        <RoleSelectionModal user={user} onConfirmed={(updatedUser) => setUser(updatedUser)} />
      ) : (
        children
      )}
    </DashboardLayout>
  );
}
