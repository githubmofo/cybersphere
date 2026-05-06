/** Pulse shockwave vertex/fragment shader — expands outward as a 3D sphere */
export const pulseVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uRadius;
  varying vec3 vPositionNormal;

  void main() {
    vPositionNormal = normalize(position);
    vec3 pos = position * uRadius * (1.0 + uTime * 3.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const pulseFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec3 vPositionNormal;

  void main() {
    // Basic spherical fade
    float alpha = 1.0 - uTime;
    gl_FragColor = vec4(uColor, alpha * 0.4);
  }
`;
