'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/auth-store';
import { getInitials } from '../../lib/utils';

export function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const getBreadcrumb = () => {
    if (!pathname) return ['Dashboard'];
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return ['Dashboard'];
    return ['Dashboard', ...parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1))];
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumb.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              <span
                className={
                  i === breadcrumb.length - 1
                    ? 'text-white font-medium'
                    : 'text-slate-500 hover:text-slate-300 cursor-pointer transition-colors'
                }
              >
                {item}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="w-64 bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-scale-in">
                <div className="p-4 border-b border-slate-800">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-white">New test results available</p>
                          <p className="text-xs text-slate-500 mt-0.5">{i}h ago</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center">
                  <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/50 transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-700/50"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {user ? getInitials(user.name) : 'U'}
                </div>
              )}
              <svg className="w-4 h-4 text-slate-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-scale-in">
                <div className="p-4 border-b border-slate-800">
                  <div className="flex items-center justify-between gap-1.5">
                    <p className="text-sm font-semibold text-white truncate max-w-[120px]">{user?.name || 'User'}</p>
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
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{user?.email || 'user@email.com'}</p>
                </div>
                <div className="p-2">
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                    Settings
                  </Link>
                </div>
                <div className="p-2 border-t border-slate-800">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
