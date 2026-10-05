'use client';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-line px-5 pb-10 pt-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <motion.a
          href="https://github.com/AyushDas4890/cancer-tf-dashboard" target="_blank" rel="noopener noreferrer"
          className="group flex items-end justify-between gap-6 border-b border-line pb-10"
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <span className="font-display text-[clamp(2.5rem,7vw,6rem)] font-medium leading-[0.95] tracking-[-0.04em]">
            Read the code,<br /><span className="text-fg-3 transition-colors group-hover:text-accent">rerun the science.</span>
          </span>
          <ArrowUpRight className="h-12 w-12 shrink-0 text-fg-3 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent md:h-20 md:w-20" />
        </motion.a>
        <div className="mt-8 flex flex-col justify-between gap-3 font-mono text-xs text-fg-3 md:flex-row">
          <span>Cancer TF Discovery Atlas</span>
          <span>TCGA Pan-Cancer RNA-Seq · UCI dataset #401 · 801 samples · 20,531 genes</span>
        </div>
      </div>
    </footer>
  );
}
