import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

/**
 * Scene environment: cinematic 4-point lighting rig, post-processing bloom,
 * fog, and a dense starfield. Provides the cyberpunk atmosphere for the 3D scene.
 */
export function SceneEnvironment() {
  return (
    <>
      {/* Void background */}
      <color attach="background" args={['#020406']} />

      {/* Volumetric depth fog */}
      <fog attach="fog" args={['#020406', 30, 100]} />

      {/* 4-point cinematic lighting rig */}
      {/* Ambient fill — nothing is fully black */}
      <ambientLight intensity={0.12} color="#1a2332" />

      {/* Key light — cool white from top right */}
      <directionalLight position={[15, 30, 15]} intensity={1.8} color="#d0e0ff" />

      {/* Fill light — cyan from opposite side for rim effect */}
      <directionalLight position={[-15, -10, -15]} intensity={0.6} color="#00bcd4" />

      {/* Center fill — subtle core glow */}
      <pointLight position={[0, 0, 0]} intensity={0.4} color="#00bcd4" distance={60} />

      {/* Bottom accent */}
      <pointLight position={[0, -8, 15]} intensity={0.35} color="#0097a7" />

      {/* Dense star field background */}
      <Stars
        radius={100}
        depth={60}
        count={3500}
        factor={4}
        saturation={0.1}
        fade
        speed={0.5}
      />

      {/* Post-processing Bloom — makes neon elements glow */}
      <EffectComposer disableNormalPass multisampling={4}>
        <Bloom
          luminanceThreshold={0.15}
          luminanceSmoothing={0.8}
          intensity={1.5}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}
