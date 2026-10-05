'use client';
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from 'motion/react';
import { CANCER_TYPES } from '@/lib/data';
import { sceneState } from '@/lib/sceneState';

const COLS = 100, ROWS = 60, N = COLS * ROWS;

const lcg = (s) => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);

// Four target shapes per particle, morphed on the GPU: helix → expression matrix → decision space → clusters.
function buildShapes() {
  const r = lcg(42);
  const gauss = () => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());
  const buf = () => new Float32Array(N * 3);
  const A = buf(), B = buf(), C = buf(), D = buf(), cA = buf(), cB = buf(), cD = buf();
  const seed = new Float32Array(N), size = new Float32Array(N);
  const [fg, gold, mute, cold] = ['#EDEFF2', '#F2C14E', '#7C8592', '#334055'].map((c) => new THREE.Color(c));
  const total = CANCER_TYPES.reduce((s, c) => s + c.count, 0);
  const clusters = CANCER_TYPES.map((c, k) => {
    const a = (k / CANCER_TYPES.length) * Math.PI * 2 + Math.PI / 2;
    return { color: new THREE.Color(c.color), w: c.count / total, at: [Math.cos(a) * 4.4, Math.sin(a) * 3.6, k % 2 ? -0.8 : 0.8], sd: 0.2 + Math.sqrt(c.count / total) * 0.75 };
  });
  const tmp = new THREE.Color();
  const set = (arr, i, x, y, z) => { arr[i * 3] = x; arr[i * 3 + 1] = y; arr[i * 3 + 2] = z; };

  for (let i = 0; i < N; i++) {
    const t = i / N, strand = i % 3;
    // A: double helix with discrete base-pair rungs
    const R = 2.3, ang = t * 4.5 * Math.PI * 2;
    if (strand < 2) {
      const a = ang + strand * Math.PI;
      set(A, i, Math.cos(a) * R + gauss() * 0.05, (t - 0.5) * 13, Math.sin(a) * R + gauss() * 0.05);
      tmp.copy(strand ? gold : fg);
    } else {
      const tq = Math.round(t * 64) / 64, aq = tq * 4.5 * Math.PI * 2, f = r() * 2 - 1;
      set(A, i, Math.cos(aq) * R * f, (tq - 0.5) * 13, Math.sin(aq) * R * f);
      tmp.copy(mute).multiplyScalar(0.55);
    }
    set(cA, i, tmp.r, tmp.g, tmp.b);

    // B: tilted expression matrix (genes × patients), height = expression
    const col = i % COLS, row = Math.floor(i / COLS);
    const v = Math.min(1, Math.max(0, 0.5 + 0.35 * Math.sin(col * 0.31) * Math.cos(row * 0.47) + gauss() * 0.15));
    const gx = (col / (COLS - 1) - 0.5) * 15, gy = (row / (ROWS - 1) - 0.5) * 9, gz = v * 1.2;
    set(B, i, gx, gy * 0.82 - gz * 0.57, gy * 0.57 + gz * 0.82);
    tmp.copy(cold).lerp(gold, v * v);
    set(cB, i, tmp.r, tmp.g, tmp.b);

    // C: decision space — Fibonacci sphere shell
    const phi = Math.acos(1 - (2 * (i + 0.5)) / N), th = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5), rad = 4.6 + gauss() * 0.12;
    set(C, i, rad * Math.sin(phi) * Math.cos(th), rad * Math.cos(phi), rad * Math.sin(phi) * Math.sin(th));

    // D: one Gaussian cluster per subtype, sized by sample count
    let pick = r(), k = 0;
    while (k < clusters.length - 1 && (pick -= clusters[k].w) > 0) k++;
    const c = clusters[k];
    set(D, i, c.at[0] + gauss() * c.sd, c.at[1] + gauss() * c.sd, c.at[2] + gauss() * c.sd);
    set(cD, i, c.color.r, c.color.g, c.color.b);

    seed[i] = r();
    size[i] = strand < 2 ? 0.9 + r() * 0.8 : 0.5 + r() * 0.5;
  }
  const g = new THREE.BufferGeometry();
  const attr = { position: A, posB: B, posC: C, posD: D, colA: cA, colB: cB, colD: cD };
  for (const k in attr) g.setAttribute(k, new THREE.BufferAttribute(attr[k], 3));
  g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  g.setAttribute('size', new THREE.BufferAttribute(size, 1));
  return g;
}

const vertexShader = /* glsl */ `
  uniform float uMorph, uTime, uScale;
  attribute vec3 posB, posC, posD, colA, colB, colD;
  attribute float seed, size;
  varying vec3 vCol;
  float st(float k) { return smoothstep(0.0, 1.0, clamp((uMorph - k - seed * 0.35) / 0.65, 0.0, 1.0)); }
  void main() {
    float s1 = st(0.0), s2 = st(1.0), s3 = st(2.0);
    vec3 p = mix(mix(mix(position, posB, s1), posC, s2), posD, s3);
    p += 0.05 * vec3(sin(uTime * 0.9 + seed * 40.0), cos(uTime * 0.7 + seed * 31.0), sin(uTime * 0.8 + seed * 17.0));
    vCol = mix(mix(mix(colA, colB, s1), mix(colB, colD, 0.45), s2), colD, s3);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = size * uScale / -mv.z;
  }`;

const fragmentShader = /* glsl */ `
  uniform float uFade;
  varying vec3 vCol;
  void main() {
    float a = smoothstep(0.5, 0.15, length(gl_PointCoord - 0.5));
    if (a < 0.01) discard;
    gl_FragColor = vec4(vCol, a * uFade * 0.85);
  }`;

function Field({ pointer }) {
  const group = useRef();
  const reduce = useReducedMotion();
  const { viewport, size, gl } = useThree();
  const geometry = useMemo(buildShapes, []);
  const uniforms = useMemo(() => ({ uMorph: { value: 0 }, uTime: { value: 0 }, uScale: { value: 60 }, uFade: { value: sceneState.fade } }), []);
  const base = useRef(0);

  useFrame((_, dt) => {
    const g = group.current, u = uniforms, damp = THREE.MathUtils.damp;
    u.uMorph.value = damp(u.uMorph.value, sceneState.morph, 5, dt);
    const wide = viewport.aspect > 1.1;
    // On phones the helix sits behind the intro copy until the story docks it above the text, so keep it quieter there.
    u.uFade.value = damp(u.uFade.value, sceneState.fade * (wide ? 1 : 0.4 + 0.6 * sceneState.dock), 4, dt);
    u.uScale.value = 62 * gl.getPixelRatio() * (size.height / 900);
    g.visible = u.uFade.value > 0.01;
    if (!reduce) { u.uTime.value += dt; base.current += dt * 0.1; }
    const dock = sceneState.dock;
    g.position.x = damp(g.position.x, wide ? viewport.width * 0.2 : viewport.width * 0.52 * (1 - dock), 3, dt);
    g.position.y = damp(g.position.y, wide ? 0 : viewport.height * 0.2 * dock, 3, dt);
    g.rotation.y = base.current + sceneState.spin;
    g.rotation.x = damp(g.rotation.x, 0.25 + pointer.current.y * 0.12, 3, dt);
    g.rotation.z = damp(g.rotation.z, -0.18 + pointer.current.x * 0.06, 3, dt);
    g.scale.setScalar(wide ? 1 : 0.7);
  });

  return (
    <group ref={group}>
      <points geometry={geometry}>
        <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

export default function ParticleField() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e) => { pointer.current.x = (e.clientX / innerWidth) * 2 - 1; pointer.current.y = (e.clientY / innerHeight) * 2 - 1; };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return (
    <Canvas camera={{ position: [0, 0, 18], fov: 45 }} dpr={[1, 1.75]} gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}>
      <Field pointer={pointer} />
    </Canvas>
  );
}
