'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { ArrowDown, Play, Volume2, VolumeX } from 'lucide-react';
import { gsap, SplitText } from '@/lib/gsap';
import { sceneState } from '@/lib/sceneState';

const FILM = {
  wide: { src: '/film/atlas-film.mp4', poster: '/film/poster.jpg' },
  tall: { src: '/film/atlas-film-9x16.mp4', poster: '/film/poster-9x16.jpg' },
};

// The film is the hero: full-bleed, autoplaying muted, feathered into the page, and it dissolves into the
// live particle helix (Backdrop) as you scroll — the film's own opening shot is that same helix.
function FilmHero() {
  const root = useRef(null);
  const video = useRef(null);
  const reduce = useReducedMotion();
  const inView = useInView(root, { amount: 0.2 });
  const [tall, setTall] = useState(null);
  const [muted, setMuted] = useState(true);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const mq = matchMedia('(max-aspect-ratio: 4/5)');
    const pick = () => setTall(mq.matches);
    pick();
    mq.addEventListener('change', pick);
    return () => mq.removeEventListener('change', pick);
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (!inView || (reduce && muted)) { v.pause(); return; }
    v.muted = muted; // React doesn't reflect `muted` to the attribute during SSR, so set it before play()
    v.play().then(() => setNeedsTap(false), (e) => setNeedsTap(e.name === 'NotAllowedError')); // AbortError = paused mid-load, not blocked
  }, [inView, reduce, muted, tall]);

  useEffect(() => {
    const mm = gsap.matchMedia(root.current);
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to('.film-layer', { scale: 1.08, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
    });
    return () => mm.revert();
  }, []);

  const toggleSound = () => {
    const v = video.current;
    if (muted && v) v.currentTime = 0; // turning sound on restarts the film so the score lands from the top
    setMuted(!muted);
  };

  const film = tall == null ? null : tall ? FILM.tall : FILM.wide;
  const paused = needsTap || (reduce && muted);

  return (
    <section id="top" ref={root} className="relative z-10 h-[100svh] overflow-hidden" aria-label="Cancer TF Atlas film">
      <div className="film-layer absolute inset-0 [mask-image:linear-gradient(to_bottom,black_62%,transparent),radial-gradient(130%_100%_at_50%_40%,black_60%,transparent)] [mask-composite:intersect] [-webkit-mask-composite:source-in]">
        {film && (
          <video
            key={film.src} ref={video} src={film.src} poster={film.poster}
            muted loop playsInline preload="auto" aria-hidden
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="absolute bottom-6 right-5 z-10 flex gap-2 md:bottom-10 md:right-10">
        {paused ? (
          <button onClick={() => { setMuted(false); setNeedsTap(false); }} className="btn-accent !py-2.5">
            <Play className="h-4 w-4" fill="currentColor" /> Play film
          </button>
        ) : (
          <button onClick={toggleSound} className="btn-ghost bg-ink/40 !py-2.5 backdrop-blur" aria-pressed={!muted}>
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {muted ? 'Sound on' : 'Sound off'}
          </button>
        )}
      </div>
      <a href="#intro" className="absolute bottom-6 left-5 z-10 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-fg-3 transition-colors hover:text-fg md:bottom-10 md:left-10">
        Scroll <ArrowDown className="h-3.5 w-3.5" />
      </a>
    </section>
  );
}

function Intro() {
  const root = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia(root.current);
    mm.add({ full: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, ({ conditions }) => {
      gsap.set('.reveal', { visibility: 'visible' });
      if (!conditions.full) return;
      const scrollTrigger = { trigger: root.current, start: 'top 75%', once: true };
      SplitText.create('.hero-title', {
        type: 'lines,words', mask: 'lines', autoSplit: true,
        onSplit: (s) => gsap.from(s.words, { yPercent: 120, duration: 1.2, ease: 'expo.out', stagger: 0.06, scrollTrigger }),
      });
      gsap.from('.hero-fade', { y: 28, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.35, scrollTrigger });
      gsap.to(sceneState, { spin: Math.PI * 0.75, dock: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="intro" ref={root} className="relative z-10 flex min-h-[100svh] flex-col justify-center px-5 py-28 md:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <p className="eyebrow reveal hero-fade mb-6">TCGA Pan-Cancer · RNA-Seq · 801 tumours</p>
        <h1 className="hero-title reveal max-w-5xl font-display text-[clamp(3rem,9vw,8.5rem)] font-medium leading-[0.92] tracking-[-0.045em]">
          Five cancers.<br />Nineteen <span className="text-accent">master switches.</span>
        </h1>
        <p className="reveal hero-fade mt-10 max-w-xl text-lg leading-relaxed text-fg-2">
          A Random Forest trained on 20,531 genes classifies five tumour subtypes at <span className="text-fg">98.76% accuracy</span> — and, unprompted, rediscovers the transcription factors that define each lineage.
        </p>
        <div className="reveal hero-fade mt-8 flex flex-wrap gap-3">
          <a href="#predictor" className="btn-accent">Run the predictor</a>
          <a href="#method" className="btn-ghost">How it works <ArrowDown className="h-4 w-4" /></a>
        </div>
      </div>
    </section>
  );
}

export default function Hero() {
  return (
    <>
      <FilmHero />
      <Intro />
    </>
  );
}
