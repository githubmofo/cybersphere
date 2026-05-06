export const gridVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const gridFragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uColor;

  void main() {
    // Basic lat/lon grid lines
    float lat = fract(vUv.y * 20.0);
    float lon = fract(vUv.x * 40.0);
    
    float lineY = smoothstep(0.0, 0.05, lat) * smoothstep(1.0, 0.95, lat);
    float lineX = smoothstep(0.0, 0.05, lon) * smoothstep(1.0, 0.95, lon);
    
    float grid = 1.0 - (lineY * lineX);
    gl_FragColor = vec4(uColor, grid * 0.10);
  }
`;
