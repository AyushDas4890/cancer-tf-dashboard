'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ──────────────────────────────────────────────────────────────
   ScrollDNA — a double helix that UNFOLDS as the user scrolls.
   
   At scroll 0%  → tightly wound helix (4 full turns, small radius)
   At scroll 100% → almost completely flat / unravelled (wide, ~0 turns)
   
   The scroll position is read from the page, normalised 0→1 and
   passed into the Three.js render loop every frame.
   ────────────────────────────────────────────────────────────── */

function ScrollDNA({ scrollProgress }) {
  const groupRef = useRef();
  const meshRefs = useRef([]);

  /* Base geometry constants */
  const NUM_PAIRS  = 50;
  const HEIGHT     = 24;
  const MAX_TURNS  = 4;          // turns at scroll 0 (tight helix)
  const MIN_TURNS  = 0.15;       // turns at scroll 1 (almost flat)
  const MIN_RADIUS = 1.8;        // helix radius at scroll 0
  const MAX_RADIUS = 7.0;        // helix radius at scroll 1 (spread out)
  const RUNG_STEPS = 5;          // interpolation steps between strands

  const colorBlue = useMemo(() => new THREE.Color('#3b82f6'), []);
  const colorGold = useMemo(() => new THREE.Color('#FFD700'), []);

  /* Build initial positions (will be overwritten every frame) */
  const meshCount = useMemo(() => {
    return NUM_PAIRS * 2 + NUM_PAIRS * (RUNG_STEPS - 1);
  }, []);

  /* Pre-compute per-particle metadata so we know what each mesh represents */
  const particleMeta = useMemo(() => {
    const meta = [];
    for (let i = 0; i < NUM_PAIRS; i++) {
      const t = i / NUM_PAIRS;
      // Strand 1
      meta.push({ type: 'strand', strand: 0, t, color: colorBlue, scale: 0.18 });
      // Strand 2
      meta.push({ type: 'strand', strand: 1, t, color: colorGold, scale: 0.18 });
      // Rungs
      for (let j = 1; j < RUNG_STEPS; j++) {
        const f = j / RUNG_STEPS;
        const c = new THREE.Color().lerpColors(colorBlue, colorGold, f);
        meta.push({ type: 'rung', t, f, color: c, scale: 0.06 });
      }
    }
    return meta;
  }, [colorBlue, colorGold]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const s = scrollProgress.current; // 0 → 1

    /* Derived values from scroll */
    const turns  = THREE.MathUtils.lerp(MAX_TURNS, MIN_TURNS, s);
    const radius = THREE.MathUtils.lerp(MIN_RADIUS, MAX_RADIUS, s);
    const separation = THREE.MathUtils.lerp(0, 2.5, s); // rungs push apart

    /* Gentle continuous rotation */
    groupRef.current.rotation.y = time * 0.15 + s * Math.PI * 0.5;
    groupRef.current.position.y = Math.sin(time * 0.3) * 0.3;

    /* Update each mesh position */
    let idx = 0;
    for (let i = 0; i < NUM_PAIRS; i++) {
      const t = i / NUM_PAIRS;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * HEIGHT;

      const r = radius;
      const x1 = Math.cos(angle) * r;
      const z1 = Math.sin(angle) * r;
      const x2 = Math.cos(angle + Math.PI) * r;
      const z2 = Math.sin(angle + Math.PI) * r;

      /* Unfolding effect: strands separate vertically as scroll increases */
      const verticalSep = separation * Math.sin(t * Math.PI); // max at middle

      // Strand 1
      const m1 = meshRefs.current[idx];
      if (m1) {
        m1.position.set(x1, y + verticalSep, z1);
        // Scale up slightly as DNA unwinds
        const sc = 0.18 + s * 0.08;
        m1.scale.setScalar(sc / 0.18);
      }
      idx++;

      // Strand 2
      const m2 = meshRefs.current[idx];
      if (m2) {
        m2.position.set(x2, y - verticalSep, z2);
        const sc = 0.18 + s * 0.08;
        m2.scale.setScalar(sc / 0.18);
      }
      idx++;

      // Rungs — fade and separate
      for (let j = 1; j < RUNG_STEPS; j++) {
        const f = j / RUNG_STEPS;
        const mesh = meshRefs.current[idx];
        if (mesh) {
          const cx = x1 + (x2 - x1) * f;
          const cz = z1 + (z2 - z1) * f;
          const cy = y + verticalSep * (1 - 2 * f); // interpolate vertical sep
          mesh.position.set(cx, cy, cz);
          // Rungs fade out as DNA unfolds
          const rungOpacity = Math.max(0.1, 1 - s * 1.2);
          mesh.scale.setScalar(rungOpacity);
          if (mesh.material) {
            mesh.material.opacity = rungOpacity;
            mesh.material.transparent = true;
          }
        }
        idx++;
      }
    }
  });

  return (
    <group ref={groupRef} rotation={[0.3, 0, 0.15]}>
      {particleMeta.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
        >
          <sphereGeometry args={[p.scale, 12, 12]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={p.type === 'strand' ? 1.0 : 0.5}
            roughness={0.2}
            metalness={0.8}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────
   Floating nucleotide letters that drift across the screen
   as the DNA unfolds — adds to the "data is being revealed" feel
   ────────────────────────────────────────────────────────────── */
function FloatingLetters({ scrollProgress }) {
  const groupRef = useRef();
  const meshRefs = useRef([]);

  const letters = useMemo(() => {
    const bases = ['A', 'T', 'G', 'C'];
    const items = [];
    for (let i = 0; i < 30; i++) {
      items.push({
        char: bases[i % 4],
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20,
        z: (Math.random() - 0.5) * 8 - 5,
        speed: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return items;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const s = scrollProgress.current;

    letters.forEach((l, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      // Letters only appear as DNA unfolds
      const appear = Math.max(0, (s - 0.15) * 2);
      mesh.material.opacity = appear * 0.4;
      mesh.position.y = l.y + Math.sin(time * l.speed + l.phase) * 1.5;
      mesh.position.x = l.x + Math.cos(time * l.speed * 0.7 + l.phase) * 0.5;
      mesh.rotation.y = time * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {letters.map((l, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          position={[l.x, l.y, l.z]}
        >
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color={l.char === 'A' || l.char === 'T' ? '#3b82f6' : '#FFD700'}
            emissive={l.char === 'A' || l.char === 'T' ? '#3b82f6' : '#FFD700'}
            emissiveIntensity={0.6}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main wrapper — reads scroll position from the page and feeds
   it as a ref into the Three.js scene (no re-renders)
   ────────────────────────────────────────────────────────────── */
export default function DNABackground() {
  const scrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
      <Canvas camera={{ position: [0, 0, 18], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={2.5} color="#FFD700" />
        <pointLight position={[-10, -10, -10]} intensity={2.5} color="#3b82f6" />
        <pointLight position={[0, 0, 10]} intensity={1} color="#ffffff" />
        <ScrollDNA scrollProgress={scrollRef} />
        <FloatingLetters scrollProgress={scrollRef} />
      </Canvas>

      {/* Gradient overlays for blending into the page */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020813]/40 via-transparent to-[#020813]/60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020813] to-transparent pointer-events-none" />

      {/* Scroll progress indicator — a thin gold line on the left edge */}
      <div className="absolute top-0 left-0 w-[2px] h-full pointer-events-none">
        <div
          className="w-full bg-gradient-to-b from-[#FFD700] to-[#3b82f6] origin-top transition-transform"
          style={{ height: '100%' }}
          id="dna-scroll-indicator"
        />
      </div>
    </div>
  );
}
