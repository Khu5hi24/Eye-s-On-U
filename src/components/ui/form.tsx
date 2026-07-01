'use client';

import * as React from 'react';
import { cn } from '../../utils';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | { message?: string };
}

const getErrorMessage = (error?: string | { message?: string }): string | undefined => {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) return error.message;
  return undefined;
};

export const InputField = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, id, error, className, ...props }, ref) => {
    const errorMessage = getErrorMessage(error);
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-semibold text-foreground">
          {label}
        </label>
        <input
          id={id}
          ref={ref}
          className={cn(
            'w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-[0_10px_30px_-20px_rgba(15,23,42,0.4)] transition focus:outline-none focus:ring-2 focus:ring-primary/30',
            errorMessage && 'border-destructive focus:ring-destructive/30',
            className
          )}
          {...props}
        />
        {errorMessage ? <p className="text-xs font-medium text-destructive">{errorMessage}</p> : null}
      </div>
    );
  }
);
InputField.displayName = 'InputField';

export const PasswordField = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, id, error, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const errorMessage = getErrorMessage(error);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-semibold text-foreground">
          <label htmlFor={id}>{label}</label>
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="text-xs text-primary hover:text-primary-foreground"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <input
          id={id}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={cn(
            'w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-[0_10px_30px_-20px_rgba(15,23,42,0.4)] transition focus:outline-none focus:ring-2 focus:ring-primary/30',
            errorMessage && 'border-destructive focus:ring-destructive/30',
            className
          )}
          {...props}
        />
        {errorMessage ? <p className="text-xs font-medium text-destructive">{errorMessage}</p> : null}
      </div>
    );
  }
);
PasswordField.displayName = 'PasswordField';

export const FileInputField = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, id, error, className, ...props }, ref) => {
    const errorMessage = getErrorMessage(error);
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-semibold text-foreground">
          {label}
        </label>
        <input
          id={id}
          ref={ref}
          type="file"
          accept="image/svg+xml,image/jpeg,image/png"
          className={cn(
            'w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-[0_10px_30px_-20px_rgba(15,23,42,0.4)] transition file:cursor-pointer file:border-0 file:bg-secondary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-foreground file:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30',
            errorMessage && 'border-destructive focus:ring-destructive/30',
            className
          )}
          {...props}
        />
        {errorMessage ? <p className="text-xs font-medium text-destructive">{errorMessage}</p> : null}
      </div>
    );
  }
);
FileInputField.displayName = 'FileInputField';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string | { message?: string };
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, id, error, className, children, ...props }, ref) => {
    const errorMessage = getErrorMessage(error as any);
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-semibold text-foreground">
          {label}
        </label>
        <select
          id={id}
          ref={ref}
          className={cn(
            'w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-[0_10px_30px_-20px_rgba(15,23,42,0.4)] transition focus:outline-none focus:ring-2 focus:ring-primary/30',
            errorMessage && 'border-destructive focus:ring-destructive/30',
            className
          )}
          {...props}
        >
        {children}
      </select>
      {errorMessage ? <p className="text-xs font-medium text-destructive">{errorMessage}</p> : null}
    </div>
    );
  }
);
SelectField.displayName = 'SelectField';
