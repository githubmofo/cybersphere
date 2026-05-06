import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/hero/HeroSection';
import { FeatureCards } from '@/components/hero/FeatureCards';
import { TechStrip } from '@/components/hero/TechStrip';

export function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-deep)' }}>
      <Navbar />
      <main>
        <HeroSection />
        <FeatureCards />
        <TechStrip />
      </main>
      <Footer />
    </div>
  );
}
