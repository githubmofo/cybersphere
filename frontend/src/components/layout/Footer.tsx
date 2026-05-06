import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

export function Footer() {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format as IST (UTC+5:30)
      const formatted = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(now);
      
      setTimeStr(`${formatted} IST | Monitoring 24/7`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer
      className="relative py-12 px-6"
      style={{
        borderTop: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-deep)',
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield size={20} style={{ color: 'var(--color-accent-cyan)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            CyberSphere AI
          </span>
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            — AI-Powered Threat Visualization
          </span>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-sm" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            {timeStr}
          </span>
        </div>
      </div>
    </footer>
  );
}
