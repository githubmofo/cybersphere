const capabilities = [
  { name: 'Global Threat Detection', color: 'hsl(0, 100%, 68%)' },
  { name: 'Live Event Streaming', color: 'hsl(175, 100%, 65%)' },
  { name: 'XGBoost Risk Scoring', color: 'hsl(42, 100%, 68%)' },
  { name: '3D Network Topology', color: 'hsl(280, 80%, 65%)' },
  { name: 'Cinematic Visualization', color: 'hsl(210, 85%, 62%)' },
  { name: 'Real-time Dashboards', color: 'hsl(150, 80%, 50%)' },
];

export function TechStrip() {
  return (
    <section
      className="py-16 px-6 overflow-hidden"
      style={{
        background: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border-subtle)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <p
          className="text-center text-xs uppercase tracking-[0.2em] mb-10 font-medium"
          style={{ color: 'var(--color-text-muted)' }}
        >
          System Capabilities
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {capabilities.map((cap) => (
            <div
              key={cap.name}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 cursor-default"
              style={{
                background: `${cap.color}08`,
                border: `1px solid ${cap.color}20`,
                color: cap.color,
                fontFamily: 'var(--font-mono)',
                transitionDuration: 'var(--duration-fast)',
              }}
            >
              {cap.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
