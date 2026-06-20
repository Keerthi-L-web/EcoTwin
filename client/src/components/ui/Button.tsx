import { type ButtonHTMLAttributes, forwardRef, memo } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = memo(forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eco-400 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-eco-500 text-white hover:bg-eco-600 active:bg-eco-700 shadow-lg shadow-eco-500/25',
      secondary: 'bg-surface-700 text-surface-50 hover:bg-surface-700/80 border border-surface-200/10',
      outline: 'border-2 border-eco-500 text-eco-400 hover:bg-eco-500/10',
      ghost: 'text-surface-200 hover:bg-surface-700/50 hover:text-eco-400',
      danger: 'bg-accent-rose text-white hover:bg-accent-rose/80',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-5 text-sm gap-2',
      lg: 'h-12 px-8 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
));

Button.displayName = 'Button';
export default Button;
