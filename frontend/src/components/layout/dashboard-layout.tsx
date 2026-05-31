'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { ToastProvider } from '../ui/toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-950 bg-grid">
        <Sidebar />
        <div className="pl-64 transition-all duration-300">
          <Header />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
