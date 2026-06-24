export const CANCER_COLORS = {
  BRCA: '#FF6B9D',
  KIRC: '#00D9FF',
  COAD: '#FFB830',
  LUAD: '#7EFF82',
  PRAD: '#A78BFA',
};

export const CANCER_TYPES = [
  { code: 'BRCA', name: 'Breast Invasive Carcinoma',  count: 300, color: '#FF6B9D' },
  { code: 'KIRC', name: 'Kidney Renal Clear Cell',     count: 146, color: '#00D9FF' },
  { code: 'LUAD', name: 'Lung Adenocarcinoma',         count: 141, color: '#7EFF82' },
  { code: 'PRAD', name: 'Prostate Adenocarcinoma',     count: 136, color: '#A78BFA' },
  { code: 'COAD', name: 'Colon Adenocarcinoma',        count: 78,  color: '#FFB830' },
];

export const TFS = [
  { name: 'HNF1B',  importance: 0.0336,  rank: 1,   cancer: 'KIRC', role: 'Kidney master regulator',    family: 'HNF'   },
  { name: 'GATA3',  importance: 0.0182,  rank: 5,   cancer: 'BRCA', role: 'Luminal breast cancer TF',   family: 'GATA'  },
  { name: 'TCF20',  importance: 0.0176,  rank: 7,   cancer: 'BRCA', role: 'TCF co-activator',           family: 'TCF'   },
  { name: 'PAX8',   importance: 0.0084,  rank: 29,  cancer: 'KIRC', role: 'Kidney-thyroid lineage',     family: 'PAX'   },
  { name: 'NKX2-1', importance: 0.0083,  rank: 31,  cancer: 'LUAD', role: 'Lung lineage (TTF-1)',       family: 'NKX'   },
  { name: 'GRHL2',  importance: 0.0055,  rank: 54,  cancer: 'BRCA', role: 'Epithelial identity',        family: 'GRHL'  },
  { name: 'PAX2',   importance: 0.0046,  rank: 65,  cancer: 'KIRC', role: 'Kidney lineage TF',          family: 'PAX'   },
  { name: 'NKX3-1', importance: 0.0044,  rank: 76,  cancer: 'PRAD', role: 'Prostate lineage TF',       family: 'NKX'   },
  { name: 'CDX1',   importance: 0.0043,  rank: 77,  cancer: 'COAD', role: 'Intestinal TF',             family: 'CDX'   },
  { name: 'CDX2',   importance: 0.0043,  rank: 78,  cancer: 'COAD', role: 'Colon master TF',           family: 'CDX'   },
  { name: 'SPDEF',  importance: 0.0034,  rank: 96,  cancer: 'BRCA', role: 'Epithelial TF',             family: 'ETS'   },
  { name: 'CDH1',   importance: 0.0017,  rank: 130, cancer: 'BRCA', role: 'E-cadherin regulator',      family: 'CDH'   },
  { name: 'HNF1A',  importance: 0.0012,  rank: 165, cancer: 'KIRC', role: 'HNF family member',         family: 'HNF'   },
  { name: 'TFAP2A', importance: 0.0007,  rank: 220, cancer: 'BRCA', role: 'AP-2 TF',                  family: 'TFAP2' },
  { name: 'HNF4A',  importance: 0.0007,  rank: 225, cancer: 'KIRC', role: 'HNF nuclear receptor',      family: 'HNF'   },
  { name: 'FOXA2',  importance: 0.0002,  rank: 237, cancer: 'BRCA', role: 'Pioneer TF',               family: 'FOXA'  },
  { name: 'ETV4',   importance: 0.0001,  rank: 280, cancer: 'PRAD', role: 'ETS family member',        family: 'ETS'   },
  { name: 'FOXA1',  importance: 0.0001,  rank: 300, cancer: 'BRCA', role: 'Pioneer TF',               family: 'FOXA'  },
  { name: 'EHF',    importance: 0.00005, rank: 320, cancer: 'PRAD', role: 'ETS homologous factor',    family: 'ETS'   },
];

export const METRICS = {
  accuracy:      98.76,
  samples:       801,
  genes:         20531,
  selectedGenes: 500,
  tfCount:       19,
  tfRatio:       3.36,
  cancerTypes:   5,
};
