'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Dna, Beaker, AlertTriangle } from 'lucide-react';
import { predictFromSelected, getExampleSample, getAvailableExamples } from '@/lib/predict';
import { CANCER_COLORS } from '@/lib/data';

export default function PatientPredictor() {
  const [selectedFeatures, setSelectedFeatures] = useState(null);
  const [displayText, setDisplayText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadedSample, setLoadedSample] = useState(null);
  const [warning, setWarning] = useState(null);

  const availableExamples = useMemo(() => getAvailableExamples(), []);

  const handleLoadExample = (sampleName) => {
    setResult(null);
    setError(null);
    setWarning(null);
    const example = getExampleSample(sampleName);
    if (!example) {
      setError(`Sample ${sampleName} not found`);
      return;
    }
    setSelectedFeatures(example.values);
    setLoadedSample(sampleName);

    // Show a summary in the textarea rather than 500 raw numbers
    const preview = example.values.slice(0, 8).map(v => v.toFixed(4)).join(', ');
    setDisplayText(
      `✓ Loaded ${sampleName.replace('_', ' ').toUpperCase()} from TCGA cohort\n` +
      `  Ground Truth Label: ${example.label}\n` +
      `  Features: 500 pre-selected genes\n\n` +
      `  Values (first 8): ${preview}, ...\n\n` +
      `  Ready for inference. Click "Run ML Inference" below.`
    );
  };

  const handlePredict = () => {
    if (!selectedFeatures) return;
    setLoading(true);
    setError(null);

    // Small delay so the UI spinner renders
    setTimeout(() => {
      try {
        const prediction = predictFromSelected(selectedFeatures);
        setResult(prediction);
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    }, 400);
  };

  const handlePasteRaw = async (e) => {
    const text = e.target.value;
    setDisplayText(text);
    setResult(null);
    setError(null);
    setWarning(null);
    setLoadedSample(null);

    // Try parsing as comma/tab/newline separated numbers
    const nums = text
      .split(/[\t,\n\r\s]+/)
      .map(v => v.trim())
      .filter(v => v.length > 0 && !isNaN(Number(v)))
      .map(Number);

    if (nums.length === 500) {
      setSelectedFeatures(nums);
    } else if (nums.length >= 20531 || nums.length === 16383 || nums.length === 16384) {
      // Extract the 500 selected features from full raw
      try {
        const { MODEL_DATA } = await import('@/lib/modelData');
        const extracted = MODEL_DATA.selected_gene_raw_indices.map(idx => nums[idx]);
        setSelectedFeatures(extracted);
        if (nums.length < 20531) {
          setWarning(`Excel truncation detected! You pasted ${nums.length} values. Excel maxes out at 16,384 columns, so ~4,000 genes were dropped. The model will automatically impute the missing 76 required features with median values.`);
        }
      } catch (err) {
        console.error("Failed to load model data for extraction", err);
        setError("Failed to process the raw dataset row.");
        setSelectedFeatures(null);
      }
    } else if (nums.length > 0) {
      setError(`Invalid data format. Expected 500 pre-selected features or full 20531 features, but got ${nums.length} values.`);
      setSelectedFeatures(null); // invalid count
    } else {
      setSelectedFeatures(null);
    }
  };

  const truth = loadedSample && getExampleSample(loadedSample)?.label;
  const alert = 'mt-3 flex items-start gap-2 rounded-xl border p-3 font-mono text-xs leading-relaxed';

  return (
    <div className="panel grid gap-10 p-5 md:p-8 lg:grid-cols-2">
      {/* Input */}
      <div className="flex flex-col">
        <p className="eyebrow mb-2">Patient RNA-Seq input</p>
        <p className="mb-5 text-sm text-fg-3">Load a TCGA sample, or paste 500 selected / 20,531 raw expression values.</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {availableExamples.map((sampleName) => {
            const label = getExampleSample(sampleName)?.label;
            const isActive = loadedSample === sampleName;
            return (
              <button key={sampleName} onClick={() => handleLoadExample(sampleName)} aria-pressed={isActive}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors ${isActive ? 'border-accent bg-accent/10 text-accent' : 'border-line-2 text-fg-2 hover:border-fg-3 hover:text-fg'}`}>
                <Beaker className="h-3 w-3" />{sampleName.replace('sample_', '#')}<span className="text-fg-3">{label}</span>
              </button>
            );
          })}
        </div>
        <textarea
          value={displayText} onChange={handlePasteRaw} aria-label="Gene expression values"
          placeholder={'Paste 500 pre-selected gene expression values (comma or newline separated)\n\nOr load a sample above…'}
          className="min-h-[220px] flex-1 resize-none rounded-xl border border-line-2 bg-ink/70 p-4 font-mono text-xs leading-relaxed text-fg-2 transition-colors placeholder:text-fg-3 focus:border-accent/60 focus:outline-none"
        />
        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className={`${alert} border-red-500/30 bg-red-500/10 text-red-300`}>
            <AlertTriangle className="h-4 w-4 shrink-0" />{error}
          </motion.div>
        )}
        {warning && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="status" className={`${alert} border-accent/30 bg-accent/10 text-accent`}>
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{warning}
          </motion.div>
        )}
        <motion.button
          onClick={handlePredict} disabled={!selectedFeatures || loading}
          whileHover={selectedFeatures && !loading ? { scale: 1.015 } : undefined} whileTap={{ scale: 0.98 }}
          className="btn-accent mt-4 w-full justify-center py-4 font-mono disabled:cursor-not-allowed disabled:bg-ink-3 disabled:text-fg-3"
        >
          {loading
            ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Running 100 decision trees…</>
            : <><Play className="h-4 w-4" fill="currentColor" />Run ML inference</>}
        </motion.button>
      </div>

      {/* Results */}
      <div className="flex flex-col justify-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-line-2 p-10 text-center">
              <Dna className="mb-4 h-10 w-10 text-fg-3" />
              <p className="text-sm text-fg-2">Awaiting a patient profile.</p>
              <p className="mt-2 font-mono text-[11px] text-fg-3">100 trees · 500 genes · 5 subtypes · runs in your browser</p>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="rounded-2xl border border-line-2 bg-ink-3/60 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow mb-2">Predicted subtype</p>
                    <p className="flex items-center gap-3 font-display text-5xl font-medium text-fg">
                      <span className="h-4 w-4 rounded-full" style={{ background: CANCER_COLORS[result.cancerType] }} />{result.cancerType}
                    </p>
                    <p className="mt-2 text-sm text-fg-3">{result.cancerName}</p>
                  </div>
                  <span className="rounded-full border border-accent/40 px-3 py-1 font-mono text-xs text-accent">{result.confidence}%</span>
                </div>
                <div className="mt-6 space-y-2">
                  {Object.entries(result.probabilities).sort((a, b) => b[1] - a[1]).map(([cls, prob]) => (
                    <div key={cls} className="grid grid-cols-[3rem_1fr_3.5rem] items-center gap-3">
                      <span className="font-mono text-[11px] text-fg-2">{cls}</span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <motion.span className="block h-full w-full origin-left rounded-full" style={{ background: CANCER_COLORS[cls] }}
                          initial={{ transform: 'scaleX(0)' }} animate={{ transform: `scaleX(${prob / 100})` }} transition={{ type: 'spring', bounce: 0, visualDuration: 0.8 }} />
                      </span>
                      <span className="text-right font-mono text-[11px] tabular-nums text-fg-3">{prob}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow mb-3">Hyperactive driver TFs</p>
                <div className="space-y-2">
                  {result.topTFs.map((tf, i) => (
                    <motion.div key={tf.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, visualDuration: 0.4, delay: 0.1 + i * 0.07 }}
                      className="flex items-center justify-between rounded-xl border border-line p-3 transition-colors hover:border-line-2 hover:bg-white/[0.03]">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-3 font-mono text-xs text-accent">{i + 1}</span>
                        <div>
                          <p className="font-mono text-sm text-fg">{tf.name}</p>
                          <p className="text-xs text-fg-3">{tf.role}</p>
                        </div>
                      </div>
                      <span className="font-mono text-sm text-fg-2">{tf.level}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {truth && (
                <p className="text-center font-mono text-[11px] text-fg-3">
                  Ground truth <span className="text-fg">{truth}</span> · predicted <span className="text-fg">{result.cancerType}</span> ·{' '}
                  <span className={result.cancerType === truth ? 'text-green-400' : 'text-red-400'}>{result.cancerType === truth ? '✓ correct' : '✗ mismatch'}</span>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
