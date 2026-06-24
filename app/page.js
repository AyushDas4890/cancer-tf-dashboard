import dynamic from 'next/dynamic';
import AnimatedCounter from '@/components/AnimatedCounter';
import TFChart       from '@/components/TFChart';
import CancerDonut   from '@/components/CancerDonut';
import { METRICS, TFS, CANCER_TYPES, CANCER_COLORS } from '@/lib/data';

const Globe3D = dynamic(() => import('@/components/Globe3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <span className="text-cyan-400 text-xs font-mono tracking-[0.3em]">LOADING GENOME</span>
      </div>
    </div>
  ),
});

const STAT_CARDS = [
  {
    value: METRICS.accuracy, suffix: '%', decimals: 2,
    label: 'Model Accuracy',
    sub: 'Random Forest Classifier',
    color: '#00D9FF',
    icon: '🎯',
  },
  {
    value: METRICS.tfCount, suffix: '', decimals: 0,
    label: 'TFs Identified',
    sub: 'in top 500 genes',
    color: '#FF6B9D',
    icon: '🧬',
  },
  {
    value: METRICS.tfRatio, suffix: '×', decimals: 2,
    label: 'TF Enrichment',
    sub: 'vs non-TF genes',
    color: '#A78BFA',
    icon: '📈',
  },
  {
    value: METRICS.samples, suffix: '', decimals: 0,
    label: 'Patient Samples',
    sub: 'TCGA Pan-Cancer',
    color: '#7EFF82',
    icon: '🏥',
  },
];

const CANCER_CANCER_BY_TYPE = {
  BRCA: TFS.filter(t => t.cancer === 'BRCA').slice(0, 3),
  KIRC: TFS.filter(t => t.cancer === 'KIRC').slice(0, 3),
  LUAD: TFS.filter(t => t.cancer === 'LUAD').slice(0, 2),
  PRAD: TFS.filter(t => t.cancer === 'PRAD').slice(0, 2),
  COAD: TFS.filter(t => t.cancer === 'COAD').slice(0, 2),
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050b14] text-white overflow-x-hidden">
      {/* Scan line */}
      <div className="scan-line" />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen grid-bg flex flex-col">
        {/* Radial glow backdrop */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full opacity-[0.06]"
               style={{ background: 'radial-gradient(circle, #00D9FF 0%, transparent 70%)' }} />
        </div>

        {/* Nav */}
        <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-cyan-400/40 flex items-center justify-center text-cyan-400 text-sm font-mono font-bold">
              TF
            </div>
            <span className="font-mono text-sm text-gray-400 tracking-wider hidden sm:block">
              CANCER · TF · ATLAS
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
            <span className="hidden md:block">TCGA Pan-Cancer RNA-Seq</span>
            <span className="px-2 py-1 rounded border border-cyan-400/30 text-cyan-400">
              v1.0 · 2026
            </span>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center px-6 md:px-12 gap-8 py-12">

          {/* Left: Title + stats */}
          <div className="flex-1 max-w-xl fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono text-cyan-400 tracking-widest">LIVE RESEARCH RESULTS</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4" style={{ fontFamily: 'var(--font-space)' }}>
              Cancer TF{' '}
              <span className="text-gradient">Discovery</span>
              <br />Atlas
            </h1>

            <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-8">
              Interactive 3D exploration of transcription factors driving{' '}
              <span className="text-cyan-300 font-medium">5 cancer subtypes</span> — discovered from
              TCGA Pan-Cancer RNA-Seq gene expression data using Random Forest feature importance.
            </p>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-4">
              {[
                { v: '98.76%', l: 'Accuracy' },
                { v: '19',     l: 'TFs Found' },
                { v: '801',    l: 'Samples' },
                { v: '3.36×',  l: 'Enrichment' },
              ].map(({ v, l }) => (
                <div key={l} className="glass rounded-lg px-4 py-2 glow-cyan border-animated">
                  <div className="text-xl font-bold font-mono text-cyan-300">{v}</div>
                  <div className="text-xs text-gray-500 font-mono">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 3D Globe */}
          <div className="relative w-full lg:w-[550px] h-[420px] lg:h-[520px] shrink-0">
            {/* Legend overlay */}
            <div className="absolute top-4 right-4 z-20 glass rounded-xl p-3 space-y-2">
              {CANCER_TYPES.map((ct) => (
                <div key={ct.code} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: ct.color, boxShadow: `0 0 6px ${ct.color}` }} />
                  <span className="text-xs font-mono text-gray-300">{ct.code}</span>
                  <span className="text-xs font-mono text-gray-500">({ct.count})</span>
                </div>
              ))}
            </div>

            <div className="absolute bottom-4 left-4 z-20 glass rounded-lg px-3 py-1.5">
              <span className="text-xs font-mono text-gray-400">
                ⊙ Drag to rotate · Rings = TF hotspots
              </span>
            </div>

            <Globe3D />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8">
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <span className="text-xs font-mono tracking-widest">SCROLL TO EXPLORE</span>
            <div className="w-px h-8 bg-gradient-to-b from-cyan-400/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── STATS CARDS ──────────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 py-16 grid-bg border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STAT_CARDS.map((card) => (
              <div
                key={card.label}
                className="glass rounded-2xl p-6 group hover:scale-[1.02] transition-transform duration-300"
                style={{ borderColor: `${card.color}22` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl">{card.icon}</span>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: card.color }} />
                </div>
                <div
                  className="text-4xl font-bold font-mono mb-1 tabular-nums"
                  style={{ color: card.color, textShadow: `0 0 20px ${card.color}66` }}
                >
                  <AnimatedCounter value={card.value} decimals={card.decimals} suffix={card.suffix} />
                </div>
                <div className="text-sm font-semibold text-white mb-1">{card.label}</div>
                <div className="text-xs text-gray-500 font-mono">{card.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TF RANKINGS ──────────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-px bg-cyan-400" />
                <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">Feature Importance</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-space)' }}>
                Transcription Factor{' '}
                <span className="text-gradient">Rankings</span>
              </h2>
              <p className="text-gray-500 text-sm mt-2 font-mono">
                19 TFs identified in top 500 genes · Gini importance scores
              </p>
            </div>
            <div className="hidden md:flex flex-col items-end gap-1">
              <span className="text-xs font-mono text-gray-600">Mean TF importance</span>
              <span className="text-2xl font-bold font-mono text-pink-400">3.36×</span>
              <span className="text-xs font-mono text-gray-600">vs non-TF genes</span>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 md:p-8">
            {/* Column headers */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
              <span className="w-8 text-right text-xs font-mono text-gray-600 shrink-0">Rank</span>
              <span className="w-20 text-xs font-mono text-gray-600 shrink-0">Gene</span>
              <span className="flex-1 text-xs font-mono text-gray-600">Gini Importance</span>
              <span className="w-20 text-right text-xs font-mono text-gray-600 shrink-0">Score</span>
              <span className="w-12 text-center text-xs font-mono text-gray-600 shrink-0">Type</span>
            </div>
            <TFChart />
          </div>
        </div>
      </section>

      {/* ── CANCER BREAKDOWN ─────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 py-16 border-t border-white/5 grid-bg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end gap-3 mb-10">
            <div className="w-8 h-px bg-pink-400" />
            <span className="text-xs font-mono text-pink-400 tracking-widest uppercase">Dataset Composition</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-10" style={{ fontFamily: 'var(--font-space)' }}>
            Cancer Type <span className="text-gradient">Breakdown</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donut chart */}
            <div className="glass rounded-2xl p-8">
              <CancerDonut />
            </div>

            {/* Per-cancer TF table */}
            <div className="glass rounded-2xl p-6 space-y-5">
              <h3 className="text-sm font-mono text-gray-400 tracking-widest uppercase">Top TF per Cancer Type</h3>
              {CANCER_TYPES.map((ct) => {
                const topTFs = CANCER_CANCER_BY_TYPE[ct.code] || [];
                return (
                  <div key={ct.code} className="rounded-xl p-4" style={{ background: `${ct.color}08`, border: `1px solid ${ct.color}22` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: ct.color, boxShadow: `0 0 8px ${ct.color}` }} />
                      <span className="font-bold font-mono" style={{ color: ct.color }}>{ct.code}</span>
                      <span className="text-xs text-gray-500">{ct.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {topTFs.map((tf) => (
                        <div key={tf.name} className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: `${ct.color}15`, border: `1px solid ${ct.color}33` }}>
                          <span className="text-xs font-bold font-mono" style={{ color: ct.color }}>{tf.name}</span>
                          <span className="text-xs font-mono text-gray-500">#{tf.rank}</span>
                        </div>
                      ))}
                      {topTFs.length === 0 && (
                        <span className="text-xs font-mono text-gray-600">No TFs in top 100</span>
                      )}
                    </div>
                    {topTFs[0] && (
                      <div className="mt-2 text-xs font-mono text-gray-500">
                        Best: <span style={{ color: ct.color }}>{topTFs[0].name}</span> — {topTFs[0].role}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── METHODOLOGY ──────────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end gap-3 mb-3">
            <div className="w-8 h-px bg-purple-400" />
            <span className="text-xs font-mono text-purple-400 tracking-widest uppercase">Pipeline</span>
          </div>
          <h2 className="text-3xl font-bold mb-10" style={{ fontFamily: 'var(--font-space)' }}>
            ML <span className="text-gradient">Methodology</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Data', desc: '801 TCGA samples × 20,531 RNA-seq genes. Real gene symbols via UCSC Xena API.', color: '#00D9FF' },
              { step: '02', title: 'Feature Selection', desc: 'VarianceThreshold → ANOVA-F SelectKBest (K=500). Reduces 20k → 500 discriminating genes.', color: '#7EFF82' },
              { step: '03', title: 'Random Forest', desc: 'GridSearchCV-tuned RF. 5-fold StratifiedKFold. Optimized for F1-macro across 5 classes.', color: '#FFB830' },
              { step: '04', title: 'TF Discovery', desc: 'Gini importances cross-referenced against 130+ known TFs. 19 lineage-specific TFs found.', color: '#A78BFA' },
            ].map(({ step, title, desc, color }) => (
              <div
                key={step}
                className="glass rounded-xl p-5 group hover:scale-[1.02] transition-transform duration-300"
                style={{ borderColor: `${color}22` }}
              >
                <div className="text-5xl font-black font-mono mb-3 opacity-15" style={{ color }}>{step}</div>
                <div className="text-sm font-bold mb-2" style={{ color }}>{title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>

          {/* Key finding callout */}
          <div className="mt-8 glass rounded-2xl p-6 border border-cyan-400/20 glow-cyan">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="text-xs font-mono text-cyan-400 tracking-widest mb-2">KEY FINDING</div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  <span className="text-cyan-300 font-bold">HNF1B</span> (rank #1, importance 0.0336) is the strongest cancer
                  discriminator — a known KIRC master regulator. The model independently rediscovered every
                  known lineage TF: <span className="text-pink-300">GATA3</span> for BRCA,{' '}
                  <span className="text-green-300">NKX2-1</span> for LUAD,{' '}
                  <span className="text-amber-300">CDX2</span> for COAD,{' '}
                  <span className="text-purple-300">NKX3-1</span> for PRAD — all without any prior biological knowledge.
                </p>
              </div>
              <div className="shrink-0 text-center glass rounded-xl p-4">
                <div className="text-4xl font-black font-mono text-cyan-300">3.36×</div>
                <div className="text-xs font-mono text-gray-500 mt-1">TF enrichment</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 md:px-12 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-sm font-bold text-white mb-1">Cancer TF Discovery Atlas</div>
            <div className="text-xs text-gray-600 font-mono">
              TCGA Pan-Cancer RNA-Seq · UCI Dataset #401 · 801 samples × 20,531 genes
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs font-mono text-gray-600">
            <span>RandomForestClassifier</span>
            <span>·</span>
            <span>Gini Importance</span>
            <span>·</span>
            <span>98.76% Accuracy</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-white/10 text-xs font-mono text-gray-400 hover:text-white hover:border-cyan-400/40 transition-colors"
            >
              GitHub →
            </a>
            <a
              href="https://archive.ics.uci.edu/dataset/401"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-white/10 text-xs font-mono text-gray-400 hover:text-white hover:border-cyan-400/40 transition-colors"
            >
              UCI Dataset →
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
