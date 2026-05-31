'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5',
              'text-white appearance-none cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',
              'transition-all duration-300',
              'hover:border-slate-600/50',
              error && 'border-rose-500/50',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" className="bg-slate-900 text-slate-500">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-rose-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
