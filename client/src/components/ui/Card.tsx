import { type HTMLAttributes, memo } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

const Card = memo(function Card({ className, hover, glow, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-surface-800/60 border border-surface-700/50 p-6',
        'backdrop-blur-sm',
        hover && 'card-hover cursor-pointer',
        glow && 'animate-pulse-glow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold text-surface-50', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-surface-200', className)} {...props}>
      {children}
    </div>
  );
}
