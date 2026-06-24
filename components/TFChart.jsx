'use client';
import { useEffect, useRef, useState } from 'react';
import { TFS, CANCER_COLORS } from '@/lib/data';

export default function TFChart() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const maxImp = TFS[0].importance;

  return (
    <div ref={ref} className="space-y-2">
      {TFS.map((tf, i) => {
        const pct    = (tf.importance / maxImp) * 100;
        const color  = CANCER_COLORS[tf.cancer];
        const isHov  = hovered === tf.name;

        return (
          <div
            key={tf.name}
            className="group relative"
            onMouseEnter={() => setHovered(tf.name)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center gap-3">
              {/* Rank badge */}
              <span className="w-8 text-right text-xs font-mono text-gray-500 shrink-0">
                #{tf.rank}
              </span>

              {/* Gene name */}
              <span
                className="w-20 text-sm font-bold font-mono shrink-0 transition-all duration-200"
                style={{ color: isHov ? color : '#e2e8f0' }}
              >
                {tf.name}
              </span>

              {/* Bar */}
              <div className="flex-1 relative h-6 bg-white/5 rounded overflow-hidden border border-white/5">
                <div
                  className="absolute inset-y-0 left-0 rounded transition-all duration-700 ease-out"
                  style={{
                    width: visible ? `${pct}%` : '0%',
                    transitionDelay: `${i * 40}ms`,
                    background: `linear-gradient(90deg, ${color}33, ${color}cc)`,
                    boxShadow: isHov ? `0 0 12px ${color}88` : 'none',
                  }}
                />
                {/* Glow edge */}
                <div
                  className="absolute inset-y-0 rounded transition-all duration-700 ease-out w-0.5"
                  style={{
                    left: visible ? `${pct}%` : '0%',
                    transitionDelay: `${i * 40}ms`,
                    background: color,
                    boxShadow: `0 0 6px ${color}`,
                    opacity: 0.9,
                  }}
                />
              </div>

              {/* Value */}
              <span className="w-20 text-right text-xs font-mono shrink-0" style={{ color }}>
                {tf.importance.toFixed(4)}
              </span>

              {/* Cancer badge */}
              <span
                className="w-12 text-center text-xs font-bold px-1 py-0.5 rounded shrink-0"
                style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
              >
                {tf.cancer}
              </span>
            </div>

            {/* Tooltip */}
            {isHov && (
              <div
                className="absolute left-32 top-8 z-50 px-3 py-2 rounded-lg border text-xs font-mono pointer-events-none whitespace-nowrap"
                style={{
                  background: '#0a0f1e',
                  borderColor: `${color}66`,
                  color: '#cbd5e1',
                  boxShadow: `0 0 20px ${color}33`,
                }}
              >
                <div className="font-bold mb-1" style={{ color }}>{tf.name}</div>
                <div>{tf.role}</div>
                <div className="text-gray-500 mt-1">Gini importance: {tf.importance.toFixed(5)}</div>
                <div className="text-gray-500">Overall rank: #{tf.rank} / 500</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
