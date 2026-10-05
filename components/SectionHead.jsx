'use client';
import { motion } from 'motion/react';

const rise = {
  hidden: { opacity: 0, y: 32 },
  show: (i) => ({ opacity: 1, y: 0, transition: { type: 'spring', bounce: 0, visualDuration: 0.7, delay: i * 0.08 } }),
};

export default function SectionHead({ eyebrow, title, lead }) {
  return (
    <motion.header initial="hidden" whileInView="show" viewport={{ once: true, margin: '-15% 0px' }} className="mb-12 max-w-3xl md:mb-16">
      <motion.p custom={0} variants={rise} className="eyebrow mb-5">{eyebrow}</motion.p>
      <motion.h2 custom={1} variants={rise} className="h-section">{title}</motion.h2>
      {lead && <motion.p custom={2} variants={rise} className="mt-6 max-w-xl text-lg leading-relaxed text-fg-2">{lead}</motion.p>}
    </motion.header>
  );
}
