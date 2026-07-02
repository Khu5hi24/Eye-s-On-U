'use client';

import * as React from 'react';
import { cn } from '../../utils';
import { Eye, EyeOff } from 'lucide-react';

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
      <div className="space-y-1.5">
        <label htmlFor={id} className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
          {label}
        </label>
        <input
          id={id}
          ref={ref}
          className={cn(
            'w-full rounded-md border border-border bg-input px-3.5 py-2 text-sm text-foreground transition duration-150 placeholder-muted-foreground/60 focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring',
            errorMessage && 'border-destructive focus:border-destructive focus:ring-destructive/30',
            className
          )}
          {...props}
        />
        {errorMessage ? <p className="text-xs font-medium text-destructive mt-1">{errorMessage}</p> : null}
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
      <div className="space-y-1.5">
        <label htmlFor={id} className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
          {label}
        </label>
        <div className="relative flex items-center">
          <input
            id={id}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'w-full rounded-md border border-border bg-input pl-3.5 pr-10 py-2 text-sm text-foreground transition duration-150 placeholder-muted-foreground/60 focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring',
              errorMessage && 'border-destructive focus:border-destructive focus:ring-destructive/30',
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-hidden flex items-center justify-center cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errorMessage ? <p className="text-xs font-medium text-destructive mt-1">{errorMessage}</p> : null}
      </div>
    );
  }
);
PasswordField.displayName = 'PasswordField';

export const FileInputField = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, id, error, className, ...props }, ref) => {
    const errorMessage = getErrorMessage(error);
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
          {label}
        </label>
        <input
          id={id}
          ref={ref}
          type="file"
          accept="image/svg+xml,image/jpeg,image/png"
          className={cn(
            'w-full rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground transition file:mr-3 file:cursor-pointer file:border-0 file:bg-secondary file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-foreground file:rounded-sm focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring',
            errorMessage && 'border-destructive focus:border-destructive focus:ring-destructive/30',
            className
          )}
          {...props}
        />
        {errorMessage ? <p className="text-xs font-medium text-destructive mt-1">{errorMessage}</p> : null}
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
      <div className="space-y-1.5">
        <label htmlFor={id} className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
          {label}
        </label>
        <select
          id={id}
          ref={ref}
          className={cn(
            'w-full rounded-md border border-border bg-input px-3.5 py-2 text-sm text-foreground transition duration-150 focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring',
            errorMessage && 'border-destructive focus:border-destructive focus:ring-destructive/30',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {errorMessage ? <p className="text-xs font-medium text-destructive mt-1">{errorMessage}</p> : null}
      </div>
    );
  }
);
SelectField.displayName = 'SelectField';
