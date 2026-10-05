'use client';
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

export const FILM = { full: '/film/atlas-film.mp4', loop: '/film/atlas-loop.mp4', poster: '/film/poster.jpg' };

export default function FilmPlayer({ open, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    const root = document.documentElement;
    root.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => { root.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-xl md:p-10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} role="dialog" aria-modal="true" aria-label="Cancer TF Atlas film"
        >
          <motion.div layoutId="film-frame" className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-2xl bg-black" onClick={(e) => e.stopPropagation()}>
            <video src={FILM.full} poster={FILM.poster} className="h-full w-full" controls autoPlay playsInline />
          </motion.div>
          <button ref={closeRef} onClick={onClose} className="btn-ghost absolute right-4 top-4 !p-3 md:right-8 md:top-8" aria-label="Close film">
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
