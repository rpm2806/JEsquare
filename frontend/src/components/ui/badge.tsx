'use client';

import React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
  primary: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  info: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  primary: 'bg-indigo-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-rose-400',
  info: 'bg-cyan-400',
  purple: 'bg-purple-400',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({ children, variant = 'default', size = 'sm', dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}
