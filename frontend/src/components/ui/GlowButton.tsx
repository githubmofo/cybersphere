import { type ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  to?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function GlowButton({
  children,
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: GlowButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, hsl(185, 100%, 50%, 0.15), hsl(220, 100%, 60%, 0.1))',
      color: 'var(--color-accent-cyan)',
      border: '1px solid hsl(185, 100%, 50%, 0.4)',
      boxShadow: '0 0 20px hsl(185, 100%, 50%, 0.15), inset 0 0 20px hsl(185, 100%, 50%, 0.05)',
    },
    secondary: {
      background: 'hsl(210, 18%, 8%, 0.8)',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border-subtle)',
      boxShadow: 'none',
    },
  };

  const baseClass = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-xl
    transition-all cursor-pointer
    hover:scale-[1.03] active:scale-[0.97]
    focus-visible:outline-2 focus-visible:outline-offset-2
    ${sizeClasses[size]}
    ${className}
  `.trim();

  const style = {
    ...variantStyles[variant],
    transitionDuration: 'var(--duration-normal)',
    transitionTimingFunction: 'var(--ease-out-expo)',
    fontFamily: 'var(--font-sans)',
  };

  const hoverStyle = variant === 'primary'
    ? { boxShadow: '0 0 30px hsl(185, 100%, 50%, 0.3), inset 0 0 30px hsl(185, 100%, 50%, 0.08)' }
    : {};

  if (to) {
    return (
      <Link
        to={to}
        className={baseClass}
        style={style}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyle)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, { boxShadow: variantStyles[variant].boxShadow })}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={baseClass}
      style={style}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyle)}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, { boxShadow: variantStyles[variant].boxShadow })}
      {...props}
    >
      {children}
    </button>
  );
}
