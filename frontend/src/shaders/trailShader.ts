/** Trail particle vertex/fragment shaders — animated points along attack path */
export const trailVertexShader = /* glsl */ `
  attribute float aOpacity;
  varying float vOpacity;

  void main() {
    vOpacity = aOpacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 6.0 * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const trailFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vOpacity;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    // Bright core + soft outer glow
    float glow = exp(-dist * 6.0);
    gl_FragColor = vec4(uColor, vOpacity * glow);
  }
`;
