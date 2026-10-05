'use client';
import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, Play } from 'lucide-react';
import { gsap, SplitText } from '@/lib/gsap';
import { sceneState } from '@/lib/sceneState';
import { useFilm } from '@/components/Providers';
import { FILM } from '@/components/FilmPlayer';

export default function Hero() {
  const root = useRef(null);
  const { open, setOpen } = useFilm();
  const reduce = useReducedMotion();

  useEffect(() => {
    const mm = gsap.matchMedia(root.current);
    mm.add({ full: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, ({ conditions }) => {
      gsap.set('.reveal', { visibility: 'visible' });
      if (!conditions.full) return;
      SplitText.create('.hero-title', {
        type: 'lines,words', mask: 'lines', autoSplit: true,
        onSplit: (s) => gsap.from(s.words, { yPercent: 120, duration: 1.2, ease: 'expo.out', stagger: 0.06, delay: 0.1 }),
      });
      gsap.from('.hero-fade', { y: 28, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.55 });
      gsap.to(sceneState, { spin: Math.PI * 0.75, dock: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="top" ref={root} className="relative z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-10 pt-28 md:px-10 md:pb-14">
      <div className="mx-auto w-full max-w-7xl">
        <p className="eyebrow reveal hero-fade mb-6">TCGA Pan-Cancer · RNA-Seq · 801 tumours</p>
        <h1 className="hero-title reveal max-w-5xl font-display text-[clamp(3rem,9vw,8.5rem)] font-medium leading-[0.92] tracking-[-0.045em]">
          Five cancers.<br />Nineteen <span className="text-accent">master switches.</span>
        </h1>
        <div className="mt-10 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="reveal hero-fade text-lg leading-relaxed text-fg-2">
              A Random Forest trained on 20,531 genes classifies five tumour subtypes at <span className="text-fg">98.76% accuracy</span> — and, unprompted, rediscovers the transcription factors that define each lineage.
            </p>
            <div className="reveal hero-fade mt-8 flex flex-wrap gap-3">
              <a href="#predictor" className="btn-accent">Run the predictor</a>
              <a href="#method" className="btn-ghost">How it works <ArrowDown className="h-4 w-4" /></a>
            </div>
          </div>
          <div className="reveal hero-fade w-full md:w-[380px]">
            {open ? <div className="aspect-video w-full" /> : (
              <motion.button
                layoutId="film-frame" onClick={() => setOpen(true)}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="group relative block aspect-video w-full overflow-hidden rounded-2xl border border-line-2 bg-ink-2 text-left"
                aria-label="Watch the film"
              >
                <video src={FILM.loop} poster={FILM.poster} autoPlay={!reduce} muted loop playsInline className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/90 to-transparent p-3 pt-10">
                  <span className="flex items-center gap-2.5 text-sm font-medium">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-ink transition-transform group-hover:scale-110"><Play className="h-3.5 w-3.5" fill="currentColor" /></span>
                    Watch the film
                  </span>
                  <span className="font-mono text-xs text-fg-2">0:20</span>
                </span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
