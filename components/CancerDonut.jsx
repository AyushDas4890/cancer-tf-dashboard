'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { CANCER_TYPES } from '@/lib/data';

const TOTAL = CANCER_TYPES.reduce((s, c) => s + c.count, 0);
const R = 84, C = 110, GAP = 2 / R; // 2px surface gap between segments

const arcs = CANCER_TYPES.reduce((acc, ct) => {
  const a0 = acc.length ? acc[acc.length - 1].a1 + GAP : -Math.PI / 2;
  const a1 = a0 + (ct.count / TOTAL) * (Math.PI * 2) - GAP;
  const pt = (a) => `${C + R * Math.cos(a)} ${C + R * Math.sin(a)}`;
  return [...acc, { ...ct, a1, d: `M${pt(a0)} A${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${pt(a1)}` }];
}, []);

export default function CancerDonut() {
  const [active, setActive] = useState(null);
  const hov = CANCER_TYPES.find((c) => c.code === active);

  return (
    <div className="flex flex-col items-center gap-10 sm:flex-row">
      <div className="relative shrink-0">
        <svg width="220" height="220" viewBox="0 0 220 220" role="img" aria-label={`Cohort composition: ${CANCER_TYPES.map((c) => `${c.code} ${c.count}`).join(', ')}`}>
          {arcs.map((a, i) => (
            <motion.path
              key={a.code} d={a.d} fill="none" stroke={a.color} strokeWidth={active === a.code ? 26 : 22}
              initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              style={{ opacity: active && active !== a.code ? 0.3 : 1, transition: 'opacity .2s, stroke-width .2s' }}
              onPointerEnter={() => setActive(a.code)} onPointerLeave={() => setActive(null)}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl text-fg">{hov ? hov.count : TOTAL}</span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-fg-3">{hov ? `${hov.code} · ${((hov.count / TOTAL) * 100).toFixed(1)}%` : 'tumours'}</span>
        </div>
      </div>
      <ul className="w-full space-y-1">
        {CANCER_TYPES.map((ct) => (
          <li key={ct.code}>
            <button
              onPointerEnter={() => setActive(ct.code)} onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(ct.code)} onBlur={() => setActive(null)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${active === ct.code ? 'bg-white/5' : ''}`}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: ct.color }} />
              <span className="w-12 font-mono text-sm text-fg">{ct.code}</span>
              <span className="flex-1 truncate text-sm text-fg-3">{ct.name}</span>
              <span className="font-mono text-sm tabular-nums text-fg-2">{ct.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
