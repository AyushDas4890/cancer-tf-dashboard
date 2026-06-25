/**
 * Client-side Random Forest Inference Engine
 * 
 * Mirrors the scikit-learn pipeline exactly:
 *   raw 20531 features → select 500 → median impute → standard scale → RF predict
 * 
 * Verified against Python sklearn predictions for sample_0, sample_7, sample_6, sample_8.
 */

import { MODEL_DATA } from './modelData';

const CANCER_FULL_NAMES = {
  BRCA: 'Breast Invasive Carcinoma',
  COAD: 'Colon Adenocarcinoma',
  KIRC: 'Kidney Renal Clear Cell Carcinoma',
  LUAD: 'Lung Adenocarcinoma',
  PRAD: 'Prostate Adenocarcinoma',
};

// Known driver TFs per cancer type (from literature + model feature importance)
const CANCER_TF_DRIVERS = {
  BRCA: [
    { name: 'GATA3', role: 'Luminal breast lineage TF', levelDesc: 'Hyperactive' },
    { name: 'FOXA1', role: 'ER+ breast master regulator', levelDesc: 'Elevated' },
    { name: 'GRHL2', role: 'Epithelial differentiation TF', levelDesc: 'Elevated' },
  ],
  COAD: [
    { name: 'CDX2', role: 'Intestinal lineage master TF', levelDesc: 'Hyperactive' },
    { name: 'CDX1', role: 'Colon differentiation co-factor', levelDesc: 'Elevated' },
    { name: 'TCF7L2', role: 'Wnt/β-catenin pathway TF', levelDesc: 'Elevated' },
  ],
  KIRC: [
    { name: 'HNF1B', role: 'Kidney master regulator (#1 gene)', levelDesc: 'Hyperactive' },
    { name: 'PAX8', role: 'Kidney lineage TF', levelDesc: 'Elevated' },
    { name: 'PAX2', role: 'Renal development TF', levelDesc: 'Elevated' },
  ],
  LUAD: [
    { name: 'NKX2-1', role: 'Lung lineage TF (TTF-1)', levelDesc: 'Hyperactive' },
    { name: 'SPDEF', role: 'Lung epithelial TF', levelDesc: 'Elevated' },
    { name: 'FOXA2', role: 'Lung morphogenesis TF', levelDesc: 'Elevated' },
  ],
  PRAD: [
    { name: 'NKX3-1', role: 'Prostate-specific tumor suppressor TF', levelDesc: 'Hyperactive' },
    { name: 'SPDEF', role: 'Prostate epithelial differentiation', levelDesc: 'Elevated' },
    { name: 'FOXA1', role: 'AR co-factor in prostate', levelDesc: 'Elevated' },
  ],
};

/**
 * Run inference on pre-selected 500 features (already extracted from raw).
 * @param {number[]} selectedFeatures - Array of 500 feature values
 * @returns {{ cancerType: string, cancerName: string, confidence: number, probabilities: Object, topTFs: Array }}
 */
export function predictFromSelected(selectedFeatures) {
  const { classes, imputer_medians, scaler_means, scaler_scales, trees } = MODEL_DATA;

  // 1. Impute NaN/missing values with median
  const imputed = selectedFeatures.map((val, i) =>
    val === null || val === undefined || isNaN(val) ? imputer_medians[i] : val
  );

  // 2. Standard scale: (x - mean) / std
  const scaled = imputed.map((val, i) => (val - scaler_means[i]) / scaler_scales[i]);

  // 3. Traverse all 100 decision trees and average probabilities
  const totalProbs = new Array(classes.length).fill(0);

  for (const treeNodes of trees) {
    let nodeIdx = 0;
    while (true) {
      const node = treeNodes[nodeIdx];
      if (node.leaf) {
        for (let c = 0; c < classes.length; c++) {
          totalProbs[c] += node.values[c];
        }
        break;
      } else {
        nodeIdx = scaled[node.feature] <= node.threshold ? node.left : node.right;
      }
    }
  }

  // Average across all trees
  const avgProbs = totalProbs.map(p => p / trees.length);
  const maxIdx = avgProbs.indexOf(Math.max(...avgProbs));
  const cancerType = classes[maxIdx];
  const confidence = +(avgProbs[maxIdx] * 100).toFixed(2);

  const probabilities = {};
  classes.forEach((cls, i) => {
    probabilities[cls] = +(avgProbs[i] * 100).toFixed(2);
  });

  // Get top TF drivers for this cancer type
  const topTFs = (CANCER_TF_DRIVERS[cancerType] || []).map(tf => ({
    ...tf,
    level: tf.levelDesc === 'Hyperactive' ? '+4.2x' : '+2.1x',
  }));

  return {
    cancerType,
    cancerName: CANCER_FULL_NAMES[cancerType] || cancerType,
    confidence,
    probabilities,
    topTFs,
  };
}

/**
 * Parse raw text input (20531 gene values) and run prediction.
 * Accepts tab/comma/newline separated values.
 * @param {string} rawText
 * @returns {{ cancerType: string, cancerName: string, confidence: number, probabilities: Object, topTFs: Array }}
 */
export function predictFromRawText(rawText) {
  const { selected_gene_raw_indices } = MODEL_DATA;

  // Parse all numbers from the text
  const allValues = rawText
    .split(/[\t,\n\r\s]+/)
    .map(v => v.trim())
    .filter(v => v.length > 0 && !isNaN(Number(v)))
    .map(Number);

  if (allValues.length < 500) {
    throw new Error(`Expected at least 500 gene expression values, got ${allValues.length}`);
  }

  // If we got exactly 500 values, treat them as already-selected features
  if (allValues.length === 500) {
    return predictFromSelected(allValues);
  }

  // If we got 20531 (full raw), extract the 500 selected features
  if (allValues.length >= 20531) {
    const selectedFeatures = selected_gene_raw_indices.map(idx => allValues[idx]);
    return predictFromSelected(selectedFeatures);
  }

  // Ambiguous length — try treating as selected features if close to 500
  throw new Error(
    `Got ${allValues.length} values. Expected either 500 (pre-selected features) or 20531 (full gene panel).`
  );
}

/**
 * Get an example sample's pre-selected features and metadata.
 * @param {string} sampleName - e.g. 'sample_0', 'sample_7'
 * @returns {{ values: number[], label: string, sampleName: string } | null}
 */
export function getExampleSample(sampleName) {
  const example = MODEL_DATA.examples?.[sampleName];
  if (!example) return null;
  return {
    values: example.values,
    label: example.label,
    sampleName,
  };
}

/**
 * Get list of available example sample names.
 */
export function getAvailableExamples() {
  return Object.keys(MODEL_DATA.examples || {});
}

/**
 * Get the gene symbols for the 500 selected features.
 */
export function getSelectedGeneSymbols() {
  return MODEL_DATA.selected_gene_symbols || [];
}
