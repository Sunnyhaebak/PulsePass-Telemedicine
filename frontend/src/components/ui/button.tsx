import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      default: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
      secondary: 'bg-secondary text-white hover:bg-secondary-hover',
      outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-800',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700',
      danger: 'bg-rose-600 text-white hover:bg-rose-700',
    };

    const sizes = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-8 px-3 text-xs rounded-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-9 w-9',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
