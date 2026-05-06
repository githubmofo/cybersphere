import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ArrowRight, Zap } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { ParticleGrid } from '@/components/hero/ParticleGrid';

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      defaults: { ease: 'power4.out' },
    });

    tl.fromTo(
      badgeRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 }
    )
      .fromTo(
        headlineRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.3'
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.4'
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.3'
      );
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      id="hero"
      style={{
        background: 'var(--color-bg-deep)',
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Animated Grid Background */}
      <ParticleGrid />

      {/* Radial glow behind content */}
      <div
        style={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, hsl(185, 100%, 50%, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '56rem',
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '0 1.5rem',
          textAlign: 'center',
        }}
      >
        {/* Status Badge */}
        <div ref={badgeRef} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', opacity: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 500,
              background: 'hsl(185, 100%, 50%, 0.08)',
              border: '1px solid hsl(185, 100%, 50%, 0.2)',
              color: 'var(--color-accent-cyan)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Zap size={14} />
            <span>AI-Powered Threat Intelligence</span>
          </div>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          style={{
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            opacity: 0,
          }}
        >
          <span style={{ color: 'var(--color-text-primary)' }}>See Threats</span>
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-blue))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Before They Strike
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          style={{
            maxWidth: '42rem',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: '2.5rem',
            fontSize: '1.125rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            opacity: 0,
          }}
        >
          Transform raw network data into an immersive 3D battlefield.
          CyberSphere AI visualizes attacks in real time, powered by machine
          learning anomaly detection and cinematic WebGL rendering.
        </p>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            opacity: 0,
          }}
        >
          <GlowButton to="/visualizer" size="lg">
            Enter CyberSphere
            <ArrowRight size={20} />
          </GlowButton>
          <GlowButton to="/dashboard" variant="secondary" size="lg">
            View Dashboard
          </GlowButton>
        </div>

        {/* Stats Strip */}
        <div
          style={{
            marginTop: '4rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
            maxWidth: '32rem',
            marginLeft: 'auto',
            marginRight: 'auto',
            color: 'var(--color-text-muted)',
          }}
        >
          {[
            { value: '500+', label: 'Nodes Monitored' },
            { value: '<150ms', label: 'ML Inference' },
            { value: '60 FPS', label: '3D Rendering' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '0.25rem',
                  color: 'var(--color-accent-cyan)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade gradient */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '8rem',
          background: 'linear-gradient(to top, var(--color-bg-deep), transparent)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
    </section>
  );
}
