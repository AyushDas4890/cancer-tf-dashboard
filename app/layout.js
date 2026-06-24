import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
