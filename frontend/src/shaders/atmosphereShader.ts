export const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Atmosphere fragment shader — soft limb glow effect.
 *
 * Changes from original:
 * - Base value changed from 0.6 → 0.75: brings the glow closer to the limb,
 *   giving a tighter, more controlled halo rather than a wide blue ring.
 * - Exponent raised from 3.0 → 4.5: steeper falloff = thinner, crisper edge.
 * - Multiplier reduced from 1.5 → 0.55: significantly less overall brightness.
 *   The bloom post-process was amplifying the original 1.5 into an overpowering ring.
 *   At 0.55 + bloom, the result is a soft atmospheric limb, not a neon halo.
 */
export const atmosphereFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.75 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.5);
    intensity = clamp(intensity, 0.0, 1.0);
    gl_FragColor = vec4(uColor, intensity * 0.55);
  }
`;
