import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      id="navbar"
      className="fixed top-0 left-0 right-0 z-50 transition-all"
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: scrolled
          ? 'hsl(210, 20%, 4%, 0.9)'
          : 'hsl(210, 20%, 4%, 0.3)',
        borderBottom: scrolled
          ? '1px solid hsl(210, 15%, 15%, 0.6)'
          : '1px solid transparent',
        transitionDuration: 'var(--duration-normal)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" aria-label="CyberSphere AI Home">
          <Shield
            size={28}
            style={{ color: 'var(--color-accent-cyan)' }}
            className="transition-transform group-hover:scale-110"
            strokeWidth={2}
          />
          <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Cyber<span className="text-gradient-cyan">Sphere</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { to: '/', label: 'Home', active: true },
            { to: '/visualizer', label: '3D View', active: false },
            { to: '/dashboard', label: 'Dashboard', active: false },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium transition-colors relative py-1"
              style={{
                color: link.active
                  ? 'var(--color-accent-cyan)'
                  : 'var(--color-text-secondary)',
              }}
            >
              {link.label}
              {link.active && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ background: 'var(--color-accent-cyan)' }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link
          to="/visualizer"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'hsl(185, 100%, 50%, 0.1)',
            color: 'var(--color-accent-cyan)',
            border: '1px solid hsl(185, 100%, 50%, 0.3)',
          }}
        >
          Launch App
        </Link>
      </div>
    </nav>
  );
}
