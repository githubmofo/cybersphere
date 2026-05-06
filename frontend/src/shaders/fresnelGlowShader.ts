export const fresnelInstancedVertexShader = /* glsl */ `
  attribute vec3 instanceColor;
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vPositionNormal;

  void main() {
    vColor = instanceColor;
    mat3 m = mat3(modelViewMatrix * instanceMatrix);
    vNormal = normalize(m * normal);
    
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vPositionNormal = normalize(mvPosition.xyz);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const fresnelInstancedFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vPositionNormal;

  void main() {
    float fresnel = dot(vPositionNormal, vNormal);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, 2.5);
    gl_FragColor = vec4(vColor, fresnel * 0.8);
  }
`;
