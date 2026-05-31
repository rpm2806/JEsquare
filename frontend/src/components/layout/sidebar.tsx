'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/auth-store';
import { getInitials } from '../../lib/utils';

const navSections = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        label: 'Questions',
        href: '/questions',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        label: 'Tests',
        href: '/tests',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Insights',
    items: [
      {
        label: 'Analytics',
        href: '/analytics',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
      {
        label: 'Doubts',
        href: '/doubts',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        label: 'Institute',
        href: '/institute',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
      },
      {
        label: 'Settings',
        href: '/settings',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const filteredNavSections = navSections.map((section) => {
    const items = section.items.filter((item) => {
      if (!user) return false;
      if (user.role === 'SOLVER') {
        return ['Dashboard', 'Doubts', 'Settings'].includes(item.label);
      }
      if (user.role === 'STUDENT') {
        return ['Dashboard', 'Tests', 'Analytics', 'Doubts', 'Settings'].includes(item.label);
      }
      if (user.role === 'TEACHER' || user.role === 'INSTITUTE_ADMIN') {
        return ['Dashboard', 'Questions', 'Tests', 'Analytics', 'Institute', 'Settings'].includes(item.label);
      }
      return true;
    });
    return { ...section, items };
  }).filter((section) => section.items.length > 0);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-slate-900/80 backdrop-blur-2xl border-r border-slate-800/50 flex flex-col z-40 transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-gradient whitespace-nowrap">JEsquare</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {filteredNavSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-indigo-500/15 text-indigo-400 shadow-lg shadow-indigo-500/5'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className={cn('shrink-0', isActive && 'text-indigo-400')}>
                      {item.icon}
                    </span>
                    {!collapsed && item.label}
                    {isActive && !collapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-800/50 p-3">
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer',
            collapsed && 'justify-center px-2'
          )}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-lg object-cover border border-slate-850 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user ? getInitials(user.name) : 'U'}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                {user?.role && (
                  <span className="shrink-0 text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/25 text-indigo-300 border border-indigo-500/30">
                    {user.role === 'SUPER_ADMIN'
                      ? 'Admin'
                      : user.role === 'INSTITUTE_ADMIN'
                      ? 'Institute'
                      : user.role === 'TEACHER'
                      ? 'Teacher'
                      : user.role === 'SOLVER'
                      ? 'Solver'
                      : 'Student'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || 'user@email.com'}</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
        >
          <svg
            className={cn('w-4 h-4 transition-transform duration-300', collapsed && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
