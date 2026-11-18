import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options?: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, id, children, options, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <select
          id={id}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800',
            'transition-colors duration-150 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
            error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, rows = 3, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          rows={rows}
          className={cn(
            'flex w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
            error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
