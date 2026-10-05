'use client';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import SectionHead from '@/components/SectionHead';
import CancerDonut from '@/components/CancerDonut';
import { CANCER_TYPES, TFS } from '@/lib/data';

const GenomeGlobe = dynamic(() => import('@/components/GenomeGlobe'), {
  ssr: false,
  loading: () => <div className="grid h-[420px] place-items-center font-mono text-xs text-fg-3 md:h-[560px]">Loading globe…</div>,
});

const card = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-10% 0px' } };

export default function Atlas() {
  return (
    <section id="atlas" className="relative z-10 px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-7xl">
        <SectionHead
          eyebrow="04 — Atlas"
          title={<>801 tumours, <span className="text-fg-3">one globe.</span></>}
          lead="Each point is a patient, grouped by subtype. Rings mark the strongest transcription factor the model found for that lineage. Drag to rotate."
        />
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <motion.div {...card} className="panel overflow-hidden"><GenomeGlobe /></motion.div>
          <div className="grid gap-4">
            <motion.div {...card} transition={{ delay: 0.08 }} className="panel p-6 md:p-8">
              <p className="eyebrow mb-6">Cohort composition</p>
              <CancerDonut />
            </motion.div>
            <motion.div {...card} transition={{ delay: 0.16 }} className="panel p-6 md:p-8">
              <p className="eyebrow mb-5">Top TFs per subtype</p>
              <ul className="space-y-3">
                {CANCER_TYPES.map((ct) => (
                  <li key={ct.code} className="flex flex-wrap items-center gap-2">
                    <span className="mr-2 flex w-14 items-center gap-2 font-mono text-sm text-fg"><span className="h-2 w-2 rounded-full" style={{ background: ct.color }} />{ct.code}</span>
                    {TFS.filter((t) => t.cancer === ct.code).slice(0, 3).map((tf) => (
                      <span key={tf.name} className="rounded-full border border-line-2 px-2.5 py-1 font-mono text-xs text-fg-2">{tf.name} <span className="text-fg-3">#{tf.rank}</span></span>
                    ))}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
