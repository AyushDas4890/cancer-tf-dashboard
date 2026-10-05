'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { Play } from 'lucide-react';
import { useFilm } from '@/components/Providers';

const LINKS = [['method', 'Method'], ['results', 'Results'], ['tfs', 'TFs'], ['atlas', 'Atlas'], ['predictor', 'Predictor']];

export default function Nav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState(null);
  const { setOpen } = useFilm();

  useMotionValueEvent(scrollY, 'change', (y) => setHidden(y > 160 && y > scrollY.getPrevious()));

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    LINKS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8"
      animate={{ y: hidden ? '-120%' : '0%' }}
      transition={{ type: 'spring', bounce: 0, visualDuration: 0.35 }}
    >
      <nav className="panel mx-auto flex max-w-7xl items-center justify-between px-3 py-2 md:px-4">
        <a href="#top" className="flex items-center gap-3 rounded-full pr-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent font-mono text-[11px] font-bold text-accent-ink">TF</span>
          <span className="hidden font-display text-sm font-medium sm:block">Cancer TF Atlas</span>
        </a>
        <ul className="hidden items-center md:flex">
          {LINKS.map(([id, label]) => (
            <li key={id} className="relative">
              <a href={`#${id}`} className={`relative z-10 block px-4 py-2 text-sm transition-colors ${active === id ? 'text-fg' : 'text-fg-3 hover:text-fg-2'}`}>{label}</a>
              {active === id && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/[0.07]" />}
            </li>
          ))}
        </ul>
        <button onClick={() => setOpen(true)} className="btn-ghost !py-2 !pl-2.5 !pr-4">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-ink"><Play className="h-3 w-3" fill="currentColor" /></span>
          Film
        </button>
      </nav>
    </motion.header>
  );
}
