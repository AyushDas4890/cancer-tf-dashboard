'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, UploadCloud, ChevronRight, Activity, Dna, Beaker, AlertTriangle } from 'lucide-react';
import { predictFromSelected, getExampleSample, getAvailableExamples } from '@/lib/predict';

const CANCER_COLORS = {
  BRCA: '#f472b6',
  COAD: '#fb923c',
  KIRC: '#60a5fa',
  LUAD: '#4ade80',
  PRAD: '#FFD700',
};

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

  return (
    <div className="w-full glass rounded-2xl p-8 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#3b82f6] rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-700" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#FFD700] rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Side: Input */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/20 flex items-center justify-center border border-[#3b82f6]/30">
              <Activity className="w-5 h-5 text-[#3b82f6]" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-mono">Patient RNA-Seq Input</h3>
              <p className="text-xs text-gray-400">Load a sample or paste 500 gene expression values</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col relative">
            <textarea 
              value={displayText}
              onChange={handlePasteRaw}
              placeholder="Paste 500 pre-selected gene expression values (comma or newline separated)&#10;&#10;Or load an example sample using the buttons below..."
              className="flex-1 min-h-[200px] bg-[#020813]/60 border border-[#3b82f6]/20 rounded-xl p-4 text-xs font-mono text-gray-300 focus:outline-none focus:border-[#FFD700]/50 transition-colors resize-none"
            />
            
            <div className="absolute bottom-4 right-4 flex gap-2 flex-wrap justify-end">
              {availableExamples.map((sampleName) => {
                const example = getExampleSample(sampleName);
                const sampleNum = sampleName.replace('sample_', '#');
                const isActive = loadedSample === sampleName;
                return (
                  <button 
                    key={sampleName}
                    onClick={() => handleLoadExample(sampleName)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                      isActive 
                        ? 'bg-[#FFD700]/20 border border-[#FFD700]/50 text-[#FFD700]' 
                        : 'bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 border border-[#3b82f6]/30 text-[#60a5fa]'
                    }`}
                    title={`Load ${sampleName} (${example?.label})`}
                  >
                    <Beaker className="w-3 h-3" />
                    {sampleNum}
                    <span className="opacity-60 text-[10px]">({example?.label})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-mono flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {warning && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-xs text-yellow-500 font-mono flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{warning}</div>
            </motion.div>
          )}

          <button 
            onClick={handlePredict}
            disabled={!selectedFeatures || loading}
            className={`mt-4 w-full py-4 rounded-xl font-bold font-mono text-sm transition-all flex items-center justify-center gap-2 ${
              !selectedFeatures || loading 
              ? 'bg-[#0a1526] text-gray-500 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:to-[#1d4ed8] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running 100 Decision Trees...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" fill="currentColor" />
                Run ML Inference
              </>
            )}
          </button>
        </div>

        {/* Right Side: Results */}
        <div className="flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]"
              >
                <Dna className="w-12 h-12 text-gray-600 mb-4" />
                <p className="text-gray-400 font-mono text-sm">
                  Awaiting patient profile.<br />Run inference to discover active TF drivers.
                </p>
                <p className="text-gray-600 font-mono text-[10px] mt-3">
                  100 Decision Trees · 500 Genes · 5 Cancer Types
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0a1526] to-[#020813] border border-[#FFD700]/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <div className="px-3 py-1 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full text-xs font-mono text-[#FFD700]">
                      {result.confidence}% Confidence
                    </div>
                  </div>
                  <h4 className="text-xs font-mono tracking-widest text-[#60a5fa] mb-1 uppercase">Predicted Subtype</h4>
                  <div className="flex items-end gap-3 mb-2">
                    <span 
                      className="text-4xl font-black"
                      style={{ color: CANCER_COLORS[result.cancerType] || '#fff' }}
                    >
                      {result.cancerType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{result.cancerName}</p>

                  {/* Probability bar chart */}
                  <div className="mt-4 space-y-2">
                    {Object.entries(result.probabilities)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cls, prob]) => (
                        <div key={cls} className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-gray-500 w-10">{cls}</span>
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${prob}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: CANCER_COLORS[cls] || '#3b82f6' }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-gray-500 w-12 text-right">{prob}%</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono tracking-widest text-gray-500 mb-4 uppercase flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
                    Hyperactive Driver TFs
                  </h4>
                  <div className="space-y-3">
                    {result.topTFs.map((tf, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={tf.name} 
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#FFD700]/30 hover:bg-[#FFD700]/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#0a1526] border border-white/10 flex items-center justify-center font-mono text-xs text-[#FFD700] font-bold">
                            #{i+1}
                          </div>
                          <div>
                            <div className="font-bold font-mono text-sm">{tf.name}</div>
                            <div className="text-xs text-gray-500">{tf.role}</div>
                          </div>
                        </div>
                        <div className="text-sm font-mono text-[#3b82f6] font-bold">
                          {tf.level}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {loadedSample && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center"
                  >
                    <p className="text-[10px] font-mono text-gray-600">
                      Ground truth: <span className="text-[#FFD700]">{getExampleSample(loadedSample)?.label}</span>
                      {' · '}
                      Predicted: <span className={result.cancerType === getExampleSample(loadedSample)?.label ? 'text-green-400' : 'text-red-400'}>
                        {result.cancerType}
                      </span>
                      {' · '}
                      {result.cancerType === getExampleSample(loadedSample)?.label ? '✓ Correct' : '✗ Mismatch'}
                    </p>
                  </motion.div>
                )}
                
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
