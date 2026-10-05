'use client';
import { useEffect, useLayoutEffect } from 'react';
import { gsap, ScrollSmoother } from '@/lib/gsap';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Smoothed scrolling for the whole page. A layout effect so the smoother exists before the sections' ScrollTriggers
// (created in passive effects) — pinned triggers must know to pin with transforms.
export default function SmoothScroll({ children }) {
  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1.1, smoothTouch: 0.1 });
    });
    return () => mm.revert();
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
