import dynamic from 'next/dynamic';
import AnimatedCounter from '@/components/AnimatedCounter';
import TFChart       from '@/components/TFChart';
import CancerDonut   from '@/components/CancerDonut';
import PatientPredictor from '@/components/PatientPredictor';
import CustomCursor  from '@/components/CustomCursor';
import DNABackground from '@/components/DNABackground';
import { METRICS, TFS, CANCER_TYPES, CANCER_COLORS } from '@/lib/data';

const Globe3D = dynamic(() => import('@/components/Globe3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span className="text-blue-500 text-xs font-mono tracking-[0.3em]">LOADING GENOME</span>
      </div>
    </div>
  ),
});

const STAT_CARDS = [
  {
    value: METRICS.accuracy, suffix: '%', decimals: 2,
    label: 'Model Accuracy',
    sub: 'Random Forest Classifier',
    color: '#3b82f6',
    icon: '🎯',
  },
  {
    value: METRICS.tfCount, suffix: '', decimals: 0,
    label: 'TFs Identified',
    sub: 'in top 500 genes',
    color: '#FFD700',
    icon: '🧬',
  },
  {
    value: METRICS.tfRatio, suffix: '×', decimals: 2,
    label: 'TF Enrichment',
    sub: 'vs non-TF genes',
    color: '#60a5fa',
    icon: '📈',
  },
  {
    value: METRICS.samples, suffix: '', decimals: 0,
    label: 'Patient Samples',
    sub: 'TCGA Pan-Cancer',
    color: '#F59E0B',
    icon: '🏥',
  },
];

const CANCER_BY_TYPE = {
  BRCA: TFS.filter(t => t.cancer === 'BRCA').slice(0, 3),
  KIRC: TFS.filter(t => t.cancer === 'KIRC').slice(0, 3),
  LUAD: TFS.filter(t => t.cancer === 'LUAD').slice(0, 2),
  PRAD: TFS.filter(t => t.cancer === 'PRAD').slice(0, 2),
  COAD: TFS.filter(t => t.cancer === 'COAD').slice(0, 2),
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020813] text-white overflow-x-hidden selection:bg-[#FFD700]/30">
      <CustomCursor />
      <div className="scan-line" />
      <DNABackground />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen grid-bg flex flex-col pt-4">
        {/* Nav */}
        <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border border-white/5 mx-6 md:mx-12 rounded-2xl glass mb-8 fade-in-up">
          <div className="flex items-center gap-3 interactive">
            <div className="w-10 h-10 rounded-lg border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] text-sm font-mono font-bold bg-[#FFD700]/5">
              TF
            </div>
            <span className="font-mono text-sm text-gray-300 tracking-wider hidden sm:block">
              CANCER · TF · ATLAS
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
            <span className="hidden md:block">TCGA Pan-Cancer RNA-Seq</span>
            <span className="px-3 py-1.5 rounded-md border border-[#3b82f6]/30 text-[#60a5fa] bg-[#3b82f6]/10">
              v2.0 · Premium
            </span>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center px-6 md:px-12 gap-12 py-4 pb-24">
          {/* Left: Title + stats */}
          <div className="flex-1 max-w-2xl fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse" />
              <span className="text-xs font-mono text-[#FFD700] tracking-widest">LIVE RESEARCH RESULTS</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6" style={{ fontFamily: 'var(--font-space)' }}>
              Cancer TF{' '}
              <span className="text-gradient">Discovery</span>
              <br />Atlas
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl">
              Interactive 3D exploration of transcription factors driving{' '}
              <span className="text-[#60a5fa] font-medium">5 cancer subtypes</span> — discovered from
              TCGA Pan-Cancer RNA-Seq gene expression data using Random Forest feature importance.
            </p>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-4">
              {[
                { v: '98.76%', l: 'Accuracy' },
                { v: '19',     l: 'TFs Found' },
                { v: '801',    l: 'Samples' },
                { v: '3.36×',  l: 'Enrichment' },
              ].map(({ v, l }, i) => (
                <div key={l} className="glass rounded-xl px-5 py-3 hover:-translate-y-1 transition-transform cursor-none border border-white/5 hover:border-[#3b82f6]/30 group">
                  <div className="text-2xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover:from-[#60a5fa] group-hover:to-[#FFD700] transition-all">{v}</div>
                  <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 3D Globe */}
          <div className="relative w-full lg:w-[600px] h-[500px] lg:h-[600px] shrink-0 fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="absolute top-4 right-4 z-20 glass rounded-xl p-4 space-y-3 border border-[#3b82f6]/20">
              {CANCER_TYPES.map((ct) => (
                <div key={ct.code} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: ct.color, boxShadow: `0 0 10px ${ct.color}` }} />
                  <span className="text-xs font-mono text-gray-300 w-10">{ct.code}</span>
                  <span className="text-xs font-mono text-gray-500">({ct.count})</span>
                </div>
              ))}
            </div>
            <Globe3D />
          </div>
        </div>
      </section>

      {/* ── Infinite Carousel ──────────────────────────────────────── */}
      <div className="w-full bg-[#0a1526] py-6 border-y border-white/5 overflow-hidden flex relative z-10">
        <div className="flex gap-12 whitespace-nowrap animate-[marquee_20s_linear_infinite]">
          {[...CANCER_TYPES, ...CANCER_TYPES, ...CANCER_TYPES].map((ct, i) => (
            <div key={i} className="flex items-center gap-4 text-gray-500 font-mono text-sm opacity-50 hover:opacity-100 transition-opacity">
              <span className="text-[#FFD700]">#</span> {ct.name} ({ct.code})
            </div>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-33.33%); } }
        `}} />
      </div>

      {/* ── PATIENT PREDICTOR ──────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 py-24 grid-bg z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-px bg-[#FFD700]" />
                <span className="text-xs font-mono text-[#FFD700] tracking-widest uppercase">Inference Engine</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'var(--font-space)' }}>
                Live Patient <span className="text-gradient">Predictor</span>
              </h2>
              <p className="text-gray-400 text-base mt-4 max-w-xl">
                Input RNA-Seq expression levels to predict cancer subtype and identify which transcription factors are actively driving the disease.
              </p>
            </div>
          </div>
          
          <PatientPredictor />
        </div>
      </section>

      {/* ── STATS CARDS ──────────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 py-24 border-t border-white/5 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STAT_CARDS.map((card, i) => (
              <div
                key={card.label}
                className="glass rounded-2xl p-8 group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
                style={{ borderColor: `${card.color}33` }}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-6xl">
                  {card.icon}
                </div>
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors">
                    <span className="text-2xl">{card.icon}</span>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: card.color, boxShadow: `0 0 10px ${card.color}` }} />
                </div>
                <div
                  className="text-4xl lg:text-5xl font-bold font-mono mb-2 tabular-nums relative z-10"
                  style={{ color: card.color, textShadow: `0 0 20px ${card.color}44` }}
                >
                  <AnimatedCounter value={card.value} decimals={card.decimals} suffix={card.suffix} />
                </div>
                <div className="text-sm font-bold text-white mb-1 relative z-10">{card.label}</div>
                <div className="text-xs text-gray-500 font-mono relative z-10">{card.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CANCER BREAKDOWN ─────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 py-24 border-t border-white/5 grid-bg z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end gap-3 mb-12">
            <div className="w-12 h-px bg-[#3b82f6]" />
            <span className="text-xs font-mono text-[#60a5fa] tracking-widest uppercase">Dataset Composition</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-12" style={{ fontFamily: 'var(--font-space)' }}>
            Cancer Type <span className="text-gradient-blue">Breakdown</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Donut chart */}
            <div className="glass rounded-3xl p-10 hover:border-[#3b82f6]/30 transition-colors">
              <CancerDonut />
            </div>

            {/* Per-cancer TF table */}
            <div className="glass rounded-3xl p-8 space-y-6 hover:border-[#FFD700]/30 transition-colors">
              <h3 className="text-sm font-mono text-gray-400 tracking-widest uppercase mb-6">Top TF per Cancer Type</h3>
              {CANCER_TYPES.map((ct) => {
                const topTFs = CANCER_BY_TYPE[ct.code] || [];
                return (
                  <div key={ct.code} className="rounded-2xl p-5 transition-transform hover:scale-[1.02] cursor-none" style={{ background: `${ct.color}08`, border: `1px solid ${ct.color}22` }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ background: ct.color, boxShadow: `0 0 12px ${ct.color}` }} />
                      <span className="font-bold font-mono text-lg tracking-wider" style={{ color: ct.color }}>{ct.code}</span>
                      <span className="text-xs text-gray-400 font-medium">{ct.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {topTFs.map((tf) => (
                        <div key={tf.name} className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: `${ct.color}15`, border: `1px solid ${ct.color}33` }}>
                          <span className="text-xs font-bold font-mono" style={{ color: ct.color }}>{tf.name}</span>
                          <span className="text-xs font-mono text-gray-500">#{tf.rank}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 md:px-12 py-12 relative z-10 bg-[#020813]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] text-xs font-mono font-bold bg-[#FFD700]/5">TF</div>
              <div className="text-base font-bold text-white">Cancer TF Discovery Atlas</div>
            </div>
            <div className="text-xs text-gray-600 font-mono">
              TCGA Pan-Cancer RNA-Seq · UCI Dataset #401 · 801 samples
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-mono text-gray-400 hover:text-white hover:border-[#FFD700]/40 hover:bg-[#FFD700]/5 transition-all interactive"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
