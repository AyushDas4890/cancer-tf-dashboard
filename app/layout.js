import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import Providers from '@/components/Providers';
import './globals.css';

const ui = Inter({ subsets: ['latin'], variable: '--font-ui', display: 'swap' });
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata = {
  title: 'Cancer TF Discovery Atlas | TCGA Pan-Cancer RNA-Seq',
  description:
    'Interactive 3D visualization of transcription factor discovery from TCGA Pan-Cancer RNA-Seq data. 98.76% accurate Random Forest classifier identifies 19 cancer-lineage TFs across BRCA, KIRC, COAD, LUAD, PRAD.',
  keywords: ['cancer', 'transcription factors', 'RNA-Seq', 'TCGA', 'machine learning', 'bioinformatics'],
  openGraph: {
    title: 'Cancer TF Discovery Atlas',
    description: '98.76% accuracy | 19 TFs identified | 5 cancer types | 801 samples',
    type: 'website',
  },
};

export const viewport = { themeColor: '#06080B' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${ui.variable} ${display.variable} ${mono.variable}`}>
      <body className="bg-ink font-sans text-fg antialiased">
        {/* Split-text headlines start hidden to avoid a flash before GSAP splits them */}
        <noscript><style>{'.reveal{visibility:visible!important}'}</style></noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
