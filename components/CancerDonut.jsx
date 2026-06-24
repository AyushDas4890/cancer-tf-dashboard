'use client';
import { useEffect, useRef, useState } from 'react';
import { CANCER_TYPES } from '@/lib/data';

const TOTAL = CANCER_TYPES.reduce((s, c) => s + c.count, 0);
const R = 80, CX = 110, CY = 110, STROKE = 28;
const circumference = 2 * Math.PI * R;

function buildArcs() {
  let offset = 0;
  return CANCER_TYPES.map((ct) => {
    const pct  = ct.count / TOTAL;
    const dash = pct * circumference;
    const gap  = circumference - dash;
    const arc  = { ...ct, pct, dashArray: `${dash} ${gap}`, dashOffset: -offset, startOffset: offset };
    offset += dash;
    return arc;
  });
}

export default function CancerDonut() {
  const [active, setActive]   = useState(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const arcs = buildArcs();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const hov = active ? CANCER_TYPES.find(c => c.code === active) : null;

  return (
    <div ref={ref} className="flex flex-col lg:flex-row items-center gap-10">
      {/* SVG donut */}
      <div className="relative shrink-0">
        <svg width="220" height="220" className="transform -rotate-90">
          {/* bg ring */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#ffffff0a" strokeWidth={STROKE} />

          {arcs.map((arc) => (
            <circle
              key={arc.code}
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={arc.color}
              strokeWidth={active === arc.code ? STROKE + 4 : STROKE}
              strokeDasharray={visible ? arc.dashArray : `0 ${circumference}`}
              strokeDashoffset={-arc.startOffset}
              strokeLinecap="butt"
              className="transition-all duration-700 cursor-pointer"
              style={{
                transitionDelay: '200ms',
                filter: active === arc.code ? `drop-shadow(0 0 8px ${arc.color})` : 'none',
                opacity: active && active !== arc.code ? 0.35 : 1,
              }}
              onMouseEnter={() => setActive(arc.code)}
              onMouseLeave={() => setActive(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hov ? (
            <>
              <span className="text-2xl font-bold font-mono" style={{ color: hov.color }}>{hov.count}</span>
              <span className="text-xs font-mono text-gray-400">{hov.code}</span>
              <span className="text-xs font-mono text-gray-500">{((hov.count/TOTAL)*100).toFixed(1)}%</span>
            </>
          ) : (
            <>
              <span className="text-3xl font-bold font-mono text-white">{TOTAL}</span>
              <span className="text-xs font-mono text-gray-400 tracking-widest">SAMPLES</span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3 w-full">
        {CANCER_TYPES.map((ct) => (
          <div
            key={ct.code}
            className="flex items-center gap-3 cursor-pointer group"
            onMouseEnter={() => setActive(ct.code)}
            onMouseLeave={() => setActive(null)}
          >
            <div
              className="w-3 h-3 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-150"
              style={{ background: ct.color, boxShadow: `0 0 6px ${ct.color}` }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold font-mono" style={{ color: active === ct.code ? ct.color : '#e2e8f0' }}>
                  {ct.code}
                </span>
                <span className="text-xs font-mono text-gray-500">{ct.count} samples</span>
              </div>
              <div className="text-xs text-gray-500 truncate">{ct.name}</div>
              {/* mini bar */}
              <div className="mt-1 h-1 bg-white/5 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-700"
                  style={{
                    width: visible ? `${(ct.count / TOTAL) * 100}%` : '0%',
                    background: `linear-gradient(90deg, ${ct.color}66, ${ct.color})`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
