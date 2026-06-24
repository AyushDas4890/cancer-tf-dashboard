'use client';
import { useEffect, useRef, useState } from 'react';

const CANCER_CLUSTERS = {
  BRCA: { lat: 45,  lon: 30   },
  KIRC: { lat: -20, lon: 150  },
  COAD: { lat: 60,  lon: -90  },
  LUAD: { lat: -50, lon: 60   },
  PRAD: { lat: 15,  lon: -150 },
};

const COLORS_HEX = {
  BRCA: '#FF6B9D',
  KIRC: '#00D9FF',
  COAD: '#FFB830',
  LUAD: '#7EFF82',
  PRAD: '#A78BFA',
};

function latLonToXYZ(lat, lon, r) {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return {
    x: -r * Math.sin(phi) * Math.cos(theta),
    y:  r * Math.cos(phi),
    z:  r * Math.sin(phi) * Math.sin(theta),
  };
}

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

const SAMPLES = [
  { type: 'BRCA', count: 300 },
  { type: 'KIRC', count: 146 },
  { type: 'LUAD', count: 141 },
  { type: 'PRAD', count: 136 },
  { type: 'COAD', count: 78  },
];

const TF_HOTSPOTS = [
  { lat: -20, lon: 150, color: 0x00D9FF, label: 'HNF1B' },
  { lat:  45, lon:  30, color: 0xFF6B9D, label: 'GATA3' },
  { lat:  47, lon:  28, color: 0xFF6B9D, label: 'TCF20' },
  { lat: -50, lon:  60, color: 0x7EFF82, label: 'NKX2-1' },
  { lat: -22, lon: 152, color: 0x00D9FF, label: 'PAX8' },
];

export default function Globe3D() {
  const mountRef  = useRef(null);
  const cleanupFn = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let animId;

    import('three').then((THREE) => {
      const W = mount.clientWidth;
      const H = mount.clientHeight;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
      camera.position.z = 4.5;

      // Stars
      const sPos = [];
      for (let i = 0; i < 3000; i++) {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const r  = 30 + Math.random() * 70;
        sPos.push(r*Math.sin(ph)*Math.cos(th), r*Math.sin(ph)*Math.sin(th), r*Math.cos(ph));
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sPos, 3));
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.07, transparent: true, opacity: 0.5 })));

      // Group holding globe + points
      const group = new THREE.Group();
      scene.add(group);

      // Globe wireframe
      const globeGeo = new THREE.SphereGeometry(1.5, 40, 40);
      const globeMat = new THREE.MeshBasicMaterial({ color: 0x0a4a7a, wireframe: true, transparent: true, opacity: 0.12 });
      const globe = new THREE.Mesh(globeGeo, globeMat);
      group.add(globe);

      // Inner solid
      group.add(new THREE.Mesh(
        new THREE.SphereGeometry(1.48, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x000d1a, transparent: true, opacity: 0.85 })
      ));

      // Sample points
      const pPos = [], pCol = [];
      SAMPLES.forEach(({ type, count }) => {
        const c  = CANCER_CLUSTERS[type];
        const rgb = hexToRgb(COLORS_HEX[type]);
        for (let i = 0; i < count; i++) {
          const lat = c.lat + (Math.random() - 0.5) * 38;
          const lon = c.lon + (Math.random() - 0.5) * 55;
          const r   = 1.52 + Math.random() * 0.05;
          const p   = latLonToXYZ(lat, lon, r);
          pPos.push(p.x, p.y, p.z);
          pCol.push(...rgb);
        }
      });
      const ptsGeo = new THREE.BufferGeometry();
      ptsGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
      ptsGeo.setAttribute('color',    new THREE.Float32BufferAttribute(pCol, 3));
      group.add(new THREE.Points(ptsGeo, new THREE.PointsMaterial({
        size: 0.046, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true,
      })));

      // TF hotspot rings
      const rings = [];
      TF_HOTSPOTS.forEach(({ lat, lon, color }) => {
        const p = latLonToXYZ(lat, lon, 1.56);
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.05, 0.1, 20),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
        );
        ring.position.set(p.x, p.y, p.z);
        ring.lookAt(0, 0, 0);
        group.add(ring);
        rings.push(ring);

        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.035, 8, 8),
          new THREE.MeshBasicMaterial({ color })
        );
        dot.position.set(p.x, p.y, p.z);
        group.add(dot);
      });

      // Mouse / touch drag
      let drag = false, prev = { x: 0, y: 0 }, vel = { x: 0, y: 0 };
      const onDown  = (e) => { drag = true; prev = { x: e.clientX, y: e.clientY }; vel = { x: 0, y: 0 }; };
      const onMove  = (e) => { if (!drag) return; vel = { x: (e.clientY-prev.y)*0.006, y: (e.clientX-prev.x)*0.006 }; prev = { x: e.clientX, y: e.clientY }; };
      const onUp    = ()  => { drag = false; };
      const onTDown = (e) => { drag = true; prev = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
      const onTMove = (e) => { if (!drag) return; vel = { x: (e.touches[0].clientY-prev.y)*0.006, y: (e.touches[0].clientX-prev.x)*0.006 }; prev = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
      mount.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      mount.addEventListener('touchstart', onTDown, { passive: true });
      mount.addEventListener('touchmove',  onTMove,  { passive: true });
      mount.addEventListener('touchend',   onUp);

      let t = 0;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        t += 0.016;
        if (!drag) { vel.y = 0.003; vel.x *= 0.95; } else { vel.x *= 0.9; vel.y *= 0.9; }
        group.rotation.y += vel.y;
        group.rotation.x  = Math.max(-1, Math.min(1, group.rotation.x + vel.x));
        rings.forEach((r, i) => { r.material.opacity = 0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i * 1.2)); });
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        const w = mount.clientWidth, h = mount.clientHeight;
        camera.aspect = w / h; camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      cleanupFn.current = () => {
        cancelAnimationFrame(animId);
        mount.removeEventListener('mousedown', onDown);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        mount.removeEventListener('touchstart', onTDown);
        mount.removeEventListener('touchmove', onTMove);
        mount.removeEventListener('touchend', onUp);
        window.removeEventListener('resize', onResize);
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        renderer.dispose();
      };
      setLoaded(true);
    });

    return () => { if (cleanupFn.current) cleanupFn.current(); };
  }, []);

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <span className="text-cyan-400 text-xs font-mono tracking-[0.3em] uppercase">Initializing Genome Atlas</span>
          </div>
        </div>
      )}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
