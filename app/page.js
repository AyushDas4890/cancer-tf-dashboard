import Backdrop from '@/components/Backdrop';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import Pipeline from '@/components/Pipeline';
import Metrics from '@/components/Metrics';
import TFRanking from '@/components/TFRanking';
import Atlas from '@/components/Atlas';
import SectionHead from '@/components/SectionHead';
import PatientPredictor from '@/components/PatientPredictor';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="grain relative">
      <Backdrop />
      <Nav />
      <Hero />
      <Marquee />
      <Pipeline />
      <Metrics />
      <TFRanking />
      <Atlas />
      <section id="predictor" className="relative z-10 px-5 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-7xl">
          <SectionHead
            eyebrow="05 — Try it"
            title={<>Run the model <span className="text-accent">in your browser.</span></>}
            lead="The full 100-tree forest ships to the page. Load a real TCGA tumour or paste your own profile — nothing leaves your machine."
          />
          <PatientPredictor />
        </div>
      </section>
      <Footer />
    </main>
  );
}
