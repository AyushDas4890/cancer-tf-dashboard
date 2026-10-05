'use client';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { sceneState } from '@/lib/sceneState';
import { CANCER_TYPES } from '@/lib/data';

const STEPS = [
  { tag: 'Input', title: '20,531 genes per tumour', stat: '801 × 20,531', body: 'Every TCGA patient is a vector of log2-normalised RNA-Seq expression across the whole transcriptome.' },
  { tag: 'Select', title: '500 genes that matter', stat: '500 features', body: 'Feature selection keeps the 500 most informative genes, then median imputation and standard scaling.' },
  { tag: 'Learn', title: '100 decision trees vote', stat: '100 trees', body: 'A Random Forest learns split points on those genes; its Gini importances rank every one of them.' },
  { tag: 'Discover', title: 'Five subtypes, cleanly apart', stat: '98.76%', body: 'Tumours separate by lineage — and 19 of the top 500 genes are transcription factors, 3.36× more important than the rest.' },
];

export default function Pipeline() {
  const root = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia(root.current);
    mm.add({ full: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, ({ conditions: { full } }) => {
      const steps = gsap.utils.toArray('.step');
      const ticks = gsap.utils.toArray('.tick');
      gsap.set(steps.slice(1), { autoAlpha: 0 });
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=320%', pin: true, scrub: full ? 0.7 : true, snap: full ? undefined : { snapTo: [0, 1 / 3, 2 / 3, 1] } },
      });
      tl.to(sceneState, { morph: 3, duration: 3, ease: full ? 'none' : 'steps(3)' }, 0.25)
        .fromTo('.rail-fill', { scaleY: 0 }, { scaleY: 1, duration: 3, ease: 'none' }, 0.25)
        .to({}, { duration: 0.25 });
      steps.forEach((s, i) => {
        if (!i) return;
        const at = i - 0.2;
        tl.to(steps[i - 1], { autoAlpha: 0, yPercent: full ? -25 : 0, duration: 0.15, ease: 'power2.in' }, at)
          .fromTo(s, { autoAlpha: 0, yPercent: full ? 25 : 0 }, { autoAlpha: 1, yPercent: 0, duration: 0.25 }, at + 0.15)
          .to(ticks[i], { color: '#F2C14E', duration: 0.1 }, at + 0.15);
      });
      // Dim the particle field once the story is told so content below stays legible.
      gsap.fromTo(sceneState, { fade: 1 }, { fade: 0.16, ease: 'none', immediateRender: false, scrollTrigger: { trigger: document.getElementById('results'), start: 'top bottom', end: 'top 35%', scrub: true } });
    });
    return () => { mm.revert(); sceneState.morph = 0; sceneState.fade = 1; };
  }, []);

  return (
    <section id="method" ref={root} className="relative z-10 flex h-[100svh] items-end px-5 pb-12 md:items-center md:px-10 md:pb-0">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr] gap-6 md:gap-10">
        <ol className="relative flex flex-col justify-between py-1" aria-hidden>
          <span className="absolute left-[3px] top-0 h-full w-px bg-line-2" />
          <span className="rail-fill absolute left-[3px] top-0 h-full w-px origin-top bg-accent" />
          {STEPS.map((s, i) => <li key={s.tag} className={`tick relative pl-5 font-mono text-[11px] ${i ? 'text-fg-3' : 'text-accent'}`}><span className="absolute left-0 top-1.5 h-[7px] w-[7px] rounded-full bg-current" />0{i + 1}</li>)}
        </ol>
        <div className="grid max-w-xl [&>*]:[grid-area:1/1]">
          {STEPS.map((s, i) => (
            <article key={s.tag} className="step rounded-2xl bg-ink/60 p-1 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-0">
              <p className="eyebrow mb-4">01 — Method · {i + 1}/4 {s.tag}</p>
              <h2 className="h-section">{s.title}</h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-fg-2 md:text-lg">{s.body}</p>
              <p className="mt-8 font-mono text-3xl text-accent md:text-4xl">{s.stat}</p>
              {i === STEPS.length - 1 && (
                <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2" aria-label="Cluster legend">
                  {CANCER_TYPES.map((c) => <li key={c.code} className="flex items-center gap-2 font-mono text-xs text-fg-2"><span className="h-2 w-2 rounded-full" style={{ background: c.color }} />{c.code}</li>)}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
