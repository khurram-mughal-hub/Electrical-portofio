export const coilVertexShader = `
  attribute vec3 aShape1;
  attribute vec3 aShape2;
  attribute vec3 aShape3;
  uniform float uProgress;
  uniform float uTime;
  varying float vPhase;
  varying float vCurrent;

  void main() {
    float towardToroid = smoothstep(0.12, 0.34, uProgress);
    float towardSine = smoothstep(0.38, 0.62, uProgress);
    float towardSpiral = smoothstep(0.67, 0.88, uProgress);
    vec3 morphed = mix(position, aShape1, towardToroid);
    morphed = mix(morphed, aShape2, towardSine);
    morphed = mix(morphed, aShape3, towardSpiral);
    vPhase = position.x * 2.0 + position.y * 1.3 + position.z;
    vCurrent = 0.62 + 0.38 * sin(vPhase * 8.0 - uTime * 2.6);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(morphed, 1.0);
  }
`

export const coilFragmentShader = `
  uniform float uGlow;
  varying float vPhase;
  varying float vCurrent;

  void main() {
    float pulse = 0.82 + 0.18 * sin(vPhase * 8.0);
    vec3 deepMaroon = vec3(0.30, 0.055, 0.09);
    vec3 roseLight = vec3(0.95, 0.68, 0.68);
    vec3 color = mix(deepMaroon, roseLight, clamp(vCurrent * 0.38, 0.0, 0.5));
    float glow = (0.72 + uGlow * 0.45) * pulse;
    gl_FragColor = vec4(color * glow, 0.94);
  }
`
