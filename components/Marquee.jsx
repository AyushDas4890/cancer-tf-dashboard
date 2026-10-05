'use client';
import { motion } from 'motion/react';
import { CANCER_TYPES } from '@/lib/data';

const half = [...CANCER_TYPES, ...CANCER_TYPES];

export default function Marquee() {
  return (
    <div className="relative z-10 overflow-hidden border-y border-line bg-ink/70 py-5 backdrop-blur-sm">
      <motion.ul
        className="flex w-max"
        animate={{ transform: ['translateX(0%)', 'translateX(-50%)'] }}
        transition={{ duration: 45, ease: 'linear', repeat: Infinity }}
      >
        {[...half, ...half].map((c, i) => (
          <li key={i} aria-hidden={i >= CANCER_TYPES.length} className="flex items-center gap-3 whitespace-nowrap pr-14">
            <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
            <span className="font-mono text-sm text-fg">{c.code}</span>
            <span className="text-sm text-fg-3">{c.name} · {c.count} tumours</span>
          </li>
        ))}
      </motion.ul>
    </div>
  );
}
