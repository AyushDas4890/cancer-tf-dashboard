'use client';
import { useEffect, useRef, useState } from 'react';

export default function AnimatedCounter({ value, decimals = 0, duration = 1800, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const end   = parseFloat(value);
        const tick  = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          setDisplay(+(eased * end).toFixed(decimals));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, decimals, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toFixed(decimals)}{suffix}
    </span>
  );
}
