'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, UploadCloud, ChevronRight, Activity, Dna } from 'lucide-react';

export default function PatientPredictor() {
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleLoadExample = () => {
    setData('Loading Patient Sample #87 from TCGA cohort...\n\nGENE_0: 4.52\nGENE_1: -1.20\n...\n\nData loaded successfully. Ready for inference.');
  };

  const handlePredict = () => {
    if (!data) return;
    setLoading(true);
    // Mock inference
    setTimeout(() => {
      setResult({
        cancerType: 'KIRC',
        cancerName: 'Kidney Renal Clear Cell Carcinoma',
        confidence: 98.76,
        topTFs: [
          { name: 'HNF1B', role: 'Kidney master regulator', level: '+4.2x' },
          { name: 'PAX8', role: 'Kidney lineage TF', level: '+2.8x' },
          { name: 'TCF20', role: 'Co-activator', level: '+1.5x' }
        ]
      });
      setLoading(false);
    }, 1500);
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
              <p className="text-xs text-gray-400">Input raw expression profile for inference</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col relative">
            <textarea 
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Paste raw RNA-Seq data or upload a file..."
              className="flex-1 min-h-[200px] bg-[#020813]/60 border border-[#3b82f6]/20 rounded-xl p-4 text-xs font-mono text-gray-300 focus:outline-none focus:border-[#FFD700]/50 transition-colors resize-none"
            />
            
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button 
                onClick={handleLoadExample}
                className="px-4 py-2 bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 border border-[#3b82f6]/30 rounded-lg text-xs font-mono text-[#60a5fa] transition-colors flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                Sample #87
              </button>
            </div>
          </div>

          <button 
            onClick={handlePredict}
            disabled={!data || loading}
            className={`mt-4 w-full py-4 rounded-xl font-bold font-mono text-sm transition-all flex items-center justify-center gap-2 ${
              !data || loading 
              ? 'bg-[#0a1526] text-gray-500 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:to-[#1d4ed8] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
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
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{result.cancerType}</span>
                  </div>
                  <p className="text-sm text-gray-400">{result.cancerName}</p>
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
                
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
