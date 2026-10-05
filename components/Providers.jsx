'use client';
import { MotionConfig } from 'motion/react';

export default function Providers({ children }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', bounce: 0, visualDuration: 0.45 }}>
      {children}
    </MotionConfig>
  );
}
