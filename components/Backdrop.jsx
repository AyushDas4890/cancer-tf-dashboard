'use client';
import dynamic from 'next/dynamic';

const ParticleField = dynamic(() => import('@/components/ParticleField'), { ssr: false });

export default function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <ParticleField />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,transparent_0%,#06080B_75%)] opacity-70" />
    </div>
  );
}
