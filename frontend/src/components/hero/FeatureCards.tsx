import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Globe, Brain, Radio } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: '3D Attack Map',
    description:
      'Visualize network topology and attack propagation in real-time 3D. Globe and graph modes reveal threats as glowing trails across your infrastructure.',
    accent: 'hsl(185, 100%, 50%)',
  },
  {
    icon: Brain,
    title: 'AI Threat Detection',
    description:
      'Machine learning models trained on CICIDS2017 classify attacks and detect anomalies. Every event gets scored for risk — DDoS, brute force, port scans, and more.',
    accent: 'hsl(220, 100%, 60%)',
  },
  {
    icon: Radio,
    title: 'Real-Time Simulation',
    description:
      'Generate synthetic network traffic with configurable attack scenarios. Watch how your defenses respond to DDoS bursts, malware propagation, and port scanning.',
    accent: 'hsl(145, 70%, 50%)',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  }),
};

export function FeatureCards() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      id="features"
      style={{
        position: 'relative',
        padding: '6rem 1.5rem',
        background: 'var(--color-bg-deep)',
      }}
    >
      <div style={{ maxWidth: '72rem', marginLeft: 'auto', marginRight: 'auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
            Core{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-blue))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Capabilities
            </span>
          </h2>
          <p style={{ maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto', color: 'var(--color-text-muted)' }}>
            Three pillars powering a new way to understand cyber threats.
          </p>
        </div>

        {/* Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={cardVariants}
              style={{
                position: 'relative',
                padding: '2rem',
                borderRadius: '1rem',
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-subtle)',
                boxShadow: 'var(--shadow-card)',
                cursor: 'default',
                overflow: 'hidden',
              }}
              whileHover={{
                y: -6,
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4), 0 10px 10px -5px rgba(0,0,0,0.2)',
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  background: `${feature.accent}15`,
                  border: `1px solid ${feature.accent}30`,
                }}
              >
                <feature.icon
                  size={24}
                  style={{ color: feature.accent }}
                  strokeWidth={1.5}
                />
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  color: 'var(--color-text-primary)',
                }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.7,
                  color: 'var(--color-text-secondary)',
                }}
              >
                {feature.description}
              </p>

              {/* Bottom accent line on hover */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '2rem',
                  right: '2rem',
                  height: '2px',
                  borderRadius: '9999px',
                  background: `linear-gradient(90deg, transparent, ${feature.accent}, transparent)`,
                  opacity: 0,
                  transition: 'opacity 0.5s ease',
                }}
                className="card-accent-line"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
