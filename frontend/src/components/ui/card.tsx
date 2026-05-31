'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  style?: React.CSSProperties;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className,
  hover = false,
  glow = false,
  gradient = false,
  padding = 'md',
  onClick,
  style,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        'rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50',
        paddingStyles[padding],
        hover && 'hover:bg-slate-800/70 hover:border-slate-600/50 cursor-pointer transition-all duration-300 hover:-translate-y-1',
        glow && 'glow-sm',
        gradient && 'gradient-border',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-sm text-slate-400', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-slate-700/50 flex items-center', className)}>
      {children}
    </div>
  );
}
