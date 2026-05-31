'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5',
            'text-white placeholder-slate-500 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',
            'transition-all duration-300',
            'hover:border-slate-600/50',
            'min-h-[100px]',
            error && 'border-rose-500/50 focus:ring-rose-500/50',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-rose-400">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
