'use client';

import React from 'react';
import { cn } from '../../lib/utils';

export function Spinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin',
          sizes[size]
        )}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
          <div className="absolute inset-2 h-12 w-12 border-4 border-slate-800 border-t-violet-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-slate-400 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-slate-800/50 rounded-xl animate-pulse',
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-slate-800/30 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      ))}
    </div>
  );
}
