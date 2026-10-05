'use client';
import { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import SectionHead from '@/components/SectionHead';
import { METRICS } from '@/lib/data';

const CARDS = [
  { to: METRICS.accuracy, decimals: 2, suffix: '%', label: 'Classification accuracy', note: 'Random Forest · 100 trees · 5 subtypes' },
  { to: METRICS.tfCount, decimals: 0, suffix: '', label: 'Transcription factors', note: 'found among the top 500 predictive genes' },
  { to: METRICS.tfRatio, decimals: 2, suffix: '×', label: 'TF enrichment', note: 'mean importance vs. non-TF genes' },
  { to: METRICS.samples, decimals: 0, suffix: '', label: 'Patient tumours', note: 'TCGA Pan-Cancer · UCI dataset #401' },
];

function Counter({ to, decimals, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: reduce ? 0 : 1.6, ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { ref.current.textContent = v.toFixed(decimals) + suffix; },
    });
    return () => controls.stop();
  }, [inView, to, decimals, suffix, reduce]);
  return <span ref={ref}>{(0).toFixed(decimals) + suffix}</span>;
}

function TiltCard({ index, children }) {
  const px = useMotionValue(0.5), py = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 22 };
  const rotateX = useSpring(useTransform(py, [0, 1], [9, -9]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-11, 11]), spring);
  const gx = useTransform(px, [0, 1], [0, 100]), gy = useTransform(py, [0, 1], [0, 100]);
  const sheen = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, #F2C14E1a, transparent 60%)`;
  const track = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width); py.set((e.clientY - r.top) / r.height);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ type: 'spring', bounce: 0, visualDuration: 0.8, delay: index * 0.08 }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={track} onPointerLeave={() => { px.set(0.5); py.set(0.5); }}
      className="panel relative overflow-hidden p-7"
    >
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: sheen }} />
      {children}
    </motion.div>
  );
}

export default function Metrics() {
  return (
    <section id="results" className="relative z-10 px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-7xl">
        <SectionHead eyebrow="02 — Results" title={<>The numbers, <span className="text-fg-3">held to account.</span></>} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c, i) => (
            <TiltCard key={c.label} index={i}>
              <p className="eyebrow">{c.label}</p>
              <p className="mt-10 font-mono text-5xl tabular-nums tracking-tight text-fg lg:text-6xl"><Counter {...c} /></p>
              <p className="mt-4 text-sm text-fg-3">{c.note}</p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
