<div align="center">
  <img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2070&auto=format&fit=crop" alt="Cancer TF Atlas Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px;"/>
  
  # Cancer TF Discovery Atlas 🧬✨

  **Predicting cancer cell growth type and discovering key Transcription Factors (TFs) from RNA-Seq gene expression.**

  [![Live Dashboard](https://img.shields.io/badge/Live_Dashboard-Explore_Now-FFD700?style=for-the-badge&logo=vercel&logoColor=black)](#)
  [![Dataset](https://img.shields.io/badge/UCI_Dataset-401-0A2540?style=for-the-badge)](https://archive.ics.uci.edu/dataset/401/gene+expression+cancer+rna+seq)
  [![Python](https://img.shields.io/badge/Python-3.10+-blue.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
</div>

---

## 🌟 Project Overview

This project utilizes the **TCGA Pan-Cancer Atlas** dataset to predict 5 different cancer subtypes based on patient RNA-Seq gene expression profiles. Beyond just classification, the machine learning pipeline extracts **Feature Importance** to independently discover critical Transcription Factors (TFs) that drive each cancer type.

The results are visualized in a **Premium Interactive 3D Dashboard** built with Next.js, Framer Motion, and Three.js. 

### Key Highlights
- **98.76% Classification Accuracy** using an optimized Random Forest model.
- **19 Lineage-Specific TFs** discovered among the top 500 predictive genes.
- **3.36× Enrichment**: TFs are found to be 3.36 times more important than non-TF genes on average.
- **Independent Validation**: The model blindly rediscovered known master regulators like **HNF1B** (Kidney), **GATA3** (Breast), and **NKX2-1** (Lung).

---

## 💻 Interactive Dashboard

The accompanying web dashboard allows users to interactively explore the dataset, visualize TF importance in 3D, and even input patient RNA-Seq profiles to predict active driver genes.

### Features
- 🧬 **Interactive 3D Genome Globe:** Visualizes TF hotspots across cancer types.
- 🎨 **Premium Aesthetic:** Designed with a stunning Blue & Gold theme (#87 palette) featuring scroll-triggered animations and hover effects.
- 🔮 **Patient Predictor Tool:** Load an RNA-Seq profile to predict the cancer type and see exactly which genes are hyperactive.

> **To run the dashboard locally:**
> ```bash
> cd cancer-dashboard
> npm install
> npm run dev
> ```
> Then navigate to `http://localhost:3000`.

---

## 📊 Dataset Information

**Name:** Gene Expression Cancer RNA-Seq
**Source:** [UCI Machine Learning Repository (ID: 401)](https://archive.ics.uci.edu/dataset/401/gene+expression+cancer+rna+seq)
**Samples:** 801 patients
**Features:** 20,531 genes (RNA-seq, log2 normalized)
**Labels:** 5 classes (BRCA, KIRC, COAD, LUAD, PRAD)

---

## ⚙️ ML Pipeline Setup

To run the machine learning pipeline from scratch and regenerate the models and charts:

1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the main orchestrator (downloads data, preprocesses, trains, and plots):
   ```bash
   python 05_main.py
   ```

*Note: The script `00_get_gene_names.py` automatically resolves the anonymized UCI gene labels to real HGNC symbols via the UCSC Xena API.*
