'use client';
import { useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import SectionHead from '@/components/SectionHead';
import { CANCER_COLORS, CANCER_TYPES, TFS } from '@/lib/data';

const MAX = TFS[0].importance;
const FILTERS = ['ALL', ...CANCER_TYPES.map((c) => c.code)];

export default function TFRanking() {
  const [filter, setFilter] = useState('ALL');
  const [focus, setFocus] = useState(null);
  const rows = filter === 'ALL' ? TFS : TFS.filter((t) => t.cancer === filter);

  return (
    <section id="tfs" className="relative z-10 px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-7xl">
        <SectionHead
          eyebrow="03 — Discovery"
          title={<>It found the lineage drivers <span className="text-accent">on its own.</span></>}
          lead="Gini importance of the 19 transcription factors inside the model's top-500 genes. One linear axis; hover a bar for its role."
        />
        <LayoutGroup>
          <div className="mb-8 flex flex-wrap gap-1.5" role="group" aria-label="Filter by cancer subtype">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}
                className={`relative rounded-full px-4 py-2 font-mono text-xs transition-colors ${filter === f ? 'text-accent-ink' : 'text-fg-2 hover:text-fg'}`}>
                {filter === f && <motion.span layoutId="tf-chip" className="absolute inset-0 rounded-full bg-accent" />}
                <span className="relative flex items-center gap-2">
                  {f !== 'ALL' && <span className="h-1.5 w-1.5 rounded-full" style={{ background: CANCER_COLORS[f] }} />}{f}
                </span>
              </button>
            ))}
          </div>
          <motion.ol layout className="panel divide-y divide-line px-2 md:px-4">
            <AnimatePresence initial={false} mode="popLayout">
              {rows.map((tf) => (
                <motion.li
                  layout key={tf.name}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onPointerEnter={() => setFocus(tf.name)} onPointerLeave={() => setFocus(null)}
                  onFocus={() => setFocus(tf.name)} onBlur={() => setFocus(null)} tabIndex={0}
                  className="relative grid grid-cols-[2.5rem_5.5rem_1fr_4.5rem] items-center gap-3 py-3 outline-none md:grid-cols-[3rem_7rem_1fr_6rem_4rem] md:gap-5"
                >
                  <span className="font-mono text-xs text-fg-3">#{tf.rank}</span>
                  <span className="flex items-center gap-2 font-mono text-sm text-fg">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: CANCER_COLORS[tf.cancer] }} />{tf.name}
                  </span>
                  <span className="relative h-2.5 rounded-full bg-white/[0.04]">
                    <motion.span
                      className="absolute inset-y-0 left-0 w-full origin-left rounded-full"
                      style={{ background: CANCER_COLORS[tf.cancer] }}
                      initial={{ transform: 'scaleX(0)' }} whileInView={{ transform: `scaleX(${Math.max(tf.importance / MAX, 0.006)})` }}
                      viewport={{ once: true }} transition={{ type: 'spring', bounce: 0, visualDuration: 0.9 }}
                    />
                  </span>
                  <span className="text-right font-mono text-xs tabular-nums text-fg-2">{tf.importance.toFixed(4)}</span>
                  <span className="hidden font-mono text-xs text-fg-3 md:block">{tf.cancer}</span>
                  <AnimatePresence>
                    {focus === tf.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4 }}
                        transition={{ type: 'spring', bounce: 0, visualDuration: 0.2 }}
                        className="pointer-events-none absolute left-24 top-full z-20 -mt-1 rounded-xl border border-line-2 bg-ink-3 px-4 py-3 text-xs shadow-2xl md:left-40"
                      >
                        <p className="font-mono text-sm text-fg">{tf.name} <span className="text-fg-3">· {tf.family} family</span></p>
                        <p className="mt-1 text-fg-2">{tf.role}</p>
                        <p className="mt-2 font-mono text-fg-3">Gini {tf.importance.toFixed(5)} · rank {tf.rank} / 500 · {tf.cancer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ol>
        </LayoutGroup>
      </div>
    </section>
  );
}
