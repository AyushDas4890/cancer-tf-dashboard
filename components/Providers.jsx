'use client';
import { createContext, useContext, useState } from 'react';
import { MotionConfig } from 'motion/react';
import FilmPlayer from '@/components/FilmPlayer';

const FilmContext = createContext({ open: false, setOpen: () => {} });
export const useFilm = () => useContext(FilmContext);

export default function Providers({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', bounce: 0, visualDuration: 0.45 }}>
      <FilmContext.Provider value={{ open, setOpen }}>
        {children}
        <FilmPlayer open={open} onClose={() => setOpen(false)} />
      </FilmContext.Provider>
    </MotionConfig>
  );
}
