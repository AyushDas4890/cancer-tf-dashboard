'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useInView, useReducedMotion } from 'motion/react';
import { CANCER_COLORS, CANCER_TYPES } from '@/lib/data';

const CLUSTERS = { BRCA: [45, 30], KIRC: [-20, 150], COAD: [60, -90], LUAD: [-50, 60], PRAD: [15, -150] };
const HOTSPOTS = [['HNF1B', 'KIRC'], ['GATA3', 'BRCA'], ['NKX2-1', 'LUAD'], ['NKX3-1', 'PRAD'], ['CDX2', 'COAD']];
const toXYZ = (lat, lon, r) => new THREE.Vector3().setFromSphericalCoords(r, ((90 - lat) * Math.PI) / 180, ((lon + 180) * Math.PI) / 180);

function Samples() {
  const geometry = useMemo(() => {
    let s = 7;
    const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const pos = [], col = [], c = new THREE.Color();
    for (const { code, count } of CANCER_TYPES) {
      const [lat, lon] = CLUSTERS[code];
      c.set(CANCER_COLORS[code]);
      for (let i = 0; i < count; i++) {
        pos.push(...toXYZ(lat + (r() - 0.5) * 38, lon + (r() - 0.5) * 55, 1.53 + r() * 0.06).toArray());
        col.push(c.r, c.g, c.b);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return g;
  }, []);
  const dot = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const g = c.getContext('2d');
    g.arc(16, 16, 15, 0, Math.PI * 2);
    g.fillStyle = '#fff';
    g.fill();
    return new THREE.CanvasTexture(c);
  }, []);
  return <points geometry={geometry}><pointsMaterial size={0.05} map={dot} alphaTest={0.5} vertexColors sizeAttenuation /></points>;
}

function Hotspot({ name, code, globe, index }) {
  const ring = useRef();
  const p = useMemo(() => toXYZ(...CLUSTERS[code], 1.6), [code]);
  useFrame(({ clock }) => {
    const k = (clock.elapsedTime * 0.6 + index * 0.2) % 1;
    ring.current.scale.setScalar(1 + k * 2.2);
    ring.current.material.opacity = 0.8 * (1 - k);
  });
  return (
    <group position={p} onUpdate={(g) => g.lookAt(0, 0, 0)}>
      <mesh ref={ring}><ringGeometry args={[0.05, 0.065, 32]} /><meshBasicMaterial color={CANCER_COLORS[code]} transparent side={THREE.DoubleSide} /></mesh>
      <mesh><circleGeometry args={[0.03, 16]} /><meshBasicMaterial color="#EDEFF2" side={THREE.DoubleSide} /></mesh>
      <Html center occlude={[globe]} distanceFactor={3.2} zIndexRange={[20, 0]}>
        <span className="pointer-events-none block translate-x-1/2 whitespace-nowrap rounded-full border border-line-2 bg-ink/80 px-2.5 py-1 font-mono text-[11px] text-fg backdrop-blur">{name} <span className="text-fg-3">{code}</span></span>
      </Html>
    </group>
  );
}

export default function GenomeGlobe() {
  const wrap = useRef(null);
  const globe = useRef();
  const inView = useInView(wrap, { margin: '10% 0px' });
  const reduce = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => setFinePointer(matchMedia('(pointer: fine)').matches), []);

  return (
    <div ref={wrap} className="relative h-[420px] w-full md:h-[560px]" aria-label="3D globe of 801 tumour samples clustered by subtype, with top transcription factor per subtype" role="img">
      <Canvas frameloop={inView ? 'always' : 'never'} camera={{ position: [0, 0.6, 4.6], fov: 45 }} dpr={[1, 2]}>
        <group rotation={[0.35, 0, 0]}>
          <mesh ref={globe}><sphereGeometry args={[1.5, 64, 64]} /><meshBasicMaterial color="#0C0F14" /></mesh>
          <mesh><sphereGeometry args={[1.505, 36, 18]} /><meshBasicMaterial color="#EDEFF2" wireframe transparent opacity={0.05} /></mesh>
          <Samples />
          {HOTSPOTS.map(([name, code], i) => <Hotspot key={name} name={name} code={code} globe={globe} index={i} />)}
        </group>
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={finePointer} autoRotate={!reduce} autoRotateSpeed={0.5} enableDamping />
      </Canvas>
    </div>
  );
}
