// Cancer TF Atlas — hero film. Approved shotlist: docs/shotlist.md. Pure function of time:
// no timers, no Math.random, nothing mutated in run(). The particle field is a deterministic 2D-canvas port of the
// site's components/ParticleField.jsx (same seeds, same four shapes), so film and site share one visual system.
(() => {
  const { W, H, pick, put, reg, el, scene, canvas, sp, spHit, trk, seg, clamp, lerp, ease, bt, beatOf, mulberry32 } = C;
  const { line, rise } = TYPE;
  C.fonts = ['500 100px Display', '500 40px UI'];
  const TALL = C.FMT === '9x16';
  const PAD = pick(140, 90, 90);
  const TOP = pick(150, 150, 300);                     // 9:16 keeps type below the top 14 % UI zone
  const ACC = '#F2C14E';
  const DATA = [['BRCA', '#e15084', 300, 'GATA3'], ['KIRC', '#02a3c0', 146, 'HNF1B'], ['LUAD', '#1fb032', 141, 'NKX2-1'], ['PRAD', '#7b5dc7', 136, 'NKX3-1'], ['COAD', '#ad4303', 78, 'CDX2']];

  // ------------------------------------------------------------------ particle field (built once at load, read-only after)
  const COLS = 100, ROWS = 60, N = COLS * ROWS;
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const F = (() => {
    const lcg = ((s) => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296))(42);   // same LCG + seed as the site
    const gauss = () => Math.sqrt(-2 * Math.log(lcg() || 1e-9)) * Math.cos(2 * Math.PI * lcg());
    const pos = new Float32Array(N * 12), col = new Float32Array(N * 9), seed = new Float32Array(N), size = new Float32Array(N), pick5 = new Uint8Array(N), sel = new Uint8Array(N);
    const [fg, gold, mute, cold] = ['#EDEFF2', ACC, '#7C8592', '#334055'].map(rgb);
    const total = DATA.reduce((s, d) => s + d[2], 0);
    const clusters = DATA.map((d, k) => {
      const a = (k / DATA.length) * Math.PI * 2 + Math.PI / 2;
      return { c: rgb(d[1]), w: d[2] / total, at: [Math.cos(a) * 4.4, Math.sin(a) * 3.6, k % 2 ? -0.8 : 0.8], sd: 0.2 + Math.sqrt(d[2] / total) * 0.75 };
    });
    const setP = (i, s, x, y, z) => { pos[i * 12 + s * 3] = x; pos[i * 12 + s * 3 + 1] = y; pos[i * 12 + s * 3 + 2] = z; };
    const setC = (i, s, c, k = 1) => { col[i * 9 + s * 3] = c[0] * k; col[i * 9 + s * 3 + 1] = c[1] * k; col[i * 9 + s * 3 + 2] = c[2] * k; };
    for (let i = 0; i < N; i++) {
      const t = i / N, strand = i % 3, R = 2.3, ang = t * 4.5 * Math.PI * 2;
      if (strand < 2) {
        const a = ang + strand * Math.PI;
        setP(i, 0, Math.cos(a) * R + gauss() * 0.05, (t - 0.5) * 13, Math.sin(a) * R + gauss() * 0.05);
        setC(i, 0, strand ? gold : fg);
      } else {
        const tq = Math.round(t * 64) / 64, aq = tq * 4.5 * Math.PI * 2, f = lcg() * 2 - 1;
        setP(i, 0, Math.cos(aq) * R * f, (tq - 0.5) * 13, Math.sin(aq) * R * f);
        setC(i, 0, mute, 0.55);
      }
      const c = i % COLS, row = Math.floor(i / COLS);
      const v = Math.min(1, Math.max(0, 0.5 + 0.35 * Math.sin(c * 0.31) * Math.cos(row * 0.47) + gauss() * 0.15));
      const gx = (c / (COLS - 1) - 0.5) * 15, gy = (row / (ROWS - 1) - 0.5) * 9, gz = v * 1.2;
      setP(i, 1, gx, gy * 0.82 - gz * 0.57, gy * 0.57 + gz * 0.82);
      setC(i, 1, cold.map((x, j) => x + (gold[j] - x) * v * v));
      sel[i] = c % 17 === 3 ? 1 : 0;                   // ~500 / 20,531 of the matrix: the columns that survive selection
      const phi = Math.acos(1 - (2 * (i + 0.5)) / N), th = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5), rad = 4.6 + gauss() * 0.12;
      setP(i, 2, rad * Math.sin(phi) * Math.cos(th), rad * Math.cos(phi), rad * Math.sin(phi) * Math.sin(th));
      let p = lcg(), k = 0;
      while (k < clusters.length - 1 && (p -= clusters[k].w) > 0) k++;
      const cl = clusters[k];
      setP(i, 3, cl.at[0] + gauss() * cl.sd, cl.at[1] + gauss() * cl.sd, cl.at[2] + gauss() * cl.sd);
      setC(i, 2, cl.c);
      pick5[i] = k;
      seed[i] = lcg();
      size[i] = strand < 2 ? 0.9 + lcg() * 0.8 : 0.5 + lcg() * 0.5;
    }
    return { pos, col, seed, size, sel, clusters };
  })();

  const FOCAL = 1303;                                   // three.js camera: fov 45 at 1080 px, z = 18
  const sstep = (x) => x * x * (3 - 2 * x);
  const st = (M, k, s) => sstep(clamp((M - k - s * 0.35) / 0.65));
  // view = { M, rot, cx, cy, s, alpha, sel, time }
  function project(x, y, z, v) {
    const cr = Math.cos(v.rot), sr = Math.sin(v.rot), cx = Math.cos(0.25), sx = Math.sin(0.25), cz = Math.cos(-0.18), sz = Math.sin(-0.18);
    const x1 = x * cr + z * sr, z1 = -x * sr + z * cr;
    const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
    const x3 = x1 * cz - y2 * sz, y3 = x1 * sz + y2 * cz;
    const d = 18 - z2 * v.s, k = (FOCAL * v.s) / d;
    return [v.cx + x3 * k, v.cy - y3 * k, d];
  }
  function drawField(g, v) {
    g.clearRect(0, 0, W, H);
    if (v.alpha <= 0.003) return;
    g.globalCompositeOperation = 'lighter';
    const { pos, col, seed, size, sel } = F;
    for (let i = 0; i < N; i++) {
      const s = seed[i], s1 = st(v.M, 0, s), s2 = st(v.M, 1, s), s3 = st(v.M, 2, s), o = i * 12;
      const m = (a) => lerp(lerp(lerp(pos[o + a], pos[o + 3 + a], s1), pos[o + 6 + a], s2), pos[o + 9 + a], s3);
      const j = 0.05 * Math.sin(v.time * 0.9 + s * 40);
      const [px, py, d] = project(m(0) + j, m(1) + 0.05 * Math.cos(v.time * 0.7 + s * 31), m(2) + j, v);
      const c = i * 9, cm = (a) => lerp(lerp(lerp(col[c + a], col[c + 3 + a], s1), lerp(col[c + 3 + a], col[c + 6 + a], 0.45), s2), col[c + 6 + a], s3);
      // feature selection: unselected matrix columns sink to 12 %, the survivors read gold
      const mw = s1 * (1 - s2), hl = v.sel * mw;
      let a = v.alpha * 0.8 * (sel[i] ? 1 : 1 - 0.88 * hl);
      const r = sel[i] && hl > 0 ? lerp(cm(0), 242, hl) : cm(0), gg = sel[i] && hl > 0 ? lerp(cm(1), 193, hl) : cm(1), b = sel[i] && hl > 0 ? lerp(cm(2), 78, hl) : cm(2);
      g.fillStyle = `rgba(${r | 0},${gg | 0},${b | 0},${a.toFixed(3)})`;
      g.beginPath(); g.arc(px, py, Math.max(0.6, size[i] * 2.1 * (18 / d) * v.s * (sel[i] ? 1 + 0.6 * hl : 1)), 0, 6.2832); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }
  // ------------------------------------------------------------------ one continuous camera on the field (no hard cuts)
  // The field never cuts: it glides between poses on slow springs while the type swaps over it. The last 1.4 beats
  // blend exactly back to the frame-0 pose (orbit = 2π over 20 s), so the site's looping hero has no seam.
  const GLIDE = { response: 1.4, damping: 1 }, SLOW = { response: 2.2, damping: 1 };
  const POSE = {
    hook: pick({ cx: W * 0.85, cy: H * 0.5, s: 0.82 }, { cx: W * 0.7, cy: H * 0.5, s: 0.8 }, { cx: W * 0.58, cy: H * 0.73, s: 0.68 }),
    data: pick({ cx: W * 0.6, cy: H * 0.6, s: 0.82 }, { cx: W * 0.55, cy: H * 0.6, s: 0.7 }, { cx: W * 0.5, cy: H * 0.62, s: 0.85 }),
    clusters: pick({ cx: W * 0.72, cy: H * 0.56, s: 0.95 }, { cx: W * 0.55, cy: H * 0.58, s: 0.8 }, { cx: W * 0.5, cy: H * 0.6, s: 1.0 }),
    end: pick({ cx: W * 0.8, cy: H * 0.5, s: 0.7 }, { cx: W * 0.78, cy: H * 0.5, s: 0.7 }, { cx: W * 0.62, cy: H * 0.8, s: 0.5 }),
  };
  const LOOP_FROM = 38.6;
  function view(t) {
    const cam = C.trkObj(t, [[0, POSE.hook], ['data', POSE.data, GLIDE], ['clusters', POSE.clusters, GLIDE], [34, POSE.end, 'default']]);
    let M = ease.inOut(seg(t, 8.25, 10.75)) + ease.inOut(seg(t, 'model', 17.5)) + ease.out(seg(t, 23.85, 25.25));
    if (C.beatAt(t) >= 33) M = 0;                                       // swapped while the field is invisible (UI shot)
    // face-on offsets: the matrix and the clusters read flat-on while the orbit keeps turning
    const A = trk(t, [[0, 0], ['data', 1.1, GLIDE], [19, -1.36, SLOW], [33, 0, SLOW]]);
    let alpha = trk(t, [[0, 1], ['model', 0.75, 'default'], [23.5, 1, 'default'], [31.4, 0, { response: 0.6, damping: 1 }], [35.3, 0.35, GLIDE]]);
    let s = cam.s * (1 + 0.8 * ease.expoIn(seg(t, 31.25, 32.25)) * (C.beatAt(t) < 33 ? 1 : 0));   // clusters pushed past camera
    const k = ease.inOut(seg(t, LOOP_FROM, 'done'));                     // close on the frame the film opens on
    return {
      M, time: t, sel: 0,
      rot: (2 * Math.PI * t) / 20 + A * (1 - k),
      cx: lerp(cam.cx, POSE.hook.cx, k), cy: lerp(cam.cy, POSE.hook.cy, k), s: lerp(s, POSE.hook.s, k), alpha: lerp(alpha, 1, k),
    };
  }

  // ------------------------------------------------------------------ shared builders
  const eyebrow = (root, text, x, y, size = pick(26, 26, 30)) => reg(el('div', { class: 'abs eyebrow', style: `left:${x}px;top:${y}px;font-size:${size}px` }, root, text), { o: 0 });
  const lines = (root, rows, size, y0, accent = {}) => rows.map((r, i) => line(root, r, { x: PAD, y: y0 + i * size * 0.98, size, accent: accent[i] }));
  const pushOf = (t, from, to, amt = 0.05) => 1 + amt * ease.inOut(seg(t, from, to));   // every hold keeps moving
  const fadeWin = (t, a0, a1, b0, b1) => ease.out(seg(t, a0, a1)) * (1 - ease.inOut(seg(t, b0, b1)));   // eyebrows only

  // ------------------------------------------------------------------ field: one layer under every shot
  scene({
    name: 'field', from: 'hook', to: 'done',
    build(root, S) { S.ctx = canvas(root); },
    run(t, b, S) { drawField(S.ctx, { ...view(t), sel: sp(t, 'select', 'default') * (1 - seg(t, 'model', 17)) }); },
  });

  // ------------------------------------------------------------------ 1 · hook (b0 → b8)
  scene({
    name: 'hook', from: 'hook', to: 'data',
    build(root, S) {
      S.wrap = reg(el('div', { class: 'abs', style: `width:${W}px;height:${H}px;transform-origin:${PAD}px ${TOP}px` }, root));
      const size = pick(160, 140, 132);
      S.L = TALL
        ? lines(S.wrap, ['Five cancers.', 'Nineteen', 'master', 'switches.'], size, TOP, { 2: [0], 3: [0] })
        : lines(S.wrap, ['Five cancers.', 'Nineteen master', 'switches.'], size, pick(250, 250), { 1: [1], 2: [0] });
      S.eb = eyebrow(S.wrap, 'TCGA Pan-Cancer · RNA-Seq · 801 tumours', PAD + 6, TALL ? TOP - 70 : 170);
    },
    run(t, b, S) {
      put(S.wrap, { s: pushOf(t, 'hook', 'data', 0.04) });
      // word 1 starts rising on frame 0 (not pre-risen) so the loop from the end card into the hook stays smooth
      const at = TALL ? [[0.27, 'hook_w2'], ['hook_w3'], ['hook_w4'], ['hook_w5']] : [[0.27, 'hook_w2'], ['hook_w3', 'hook_w4'], ['hook_w5']];
      S.L.forEach((L, i) => rise(t, L, at[i], 7.55 + i * 0.05));
      put(S.eb, { o: fadeWin(t, 'eyebrow', 5, 7.3, 7.7) });
    },
  });

  // ------------------------------------------------------------------ 2 · data: helix → matrix, 20,531 → 500 (b8 → b16)
  scene({
    name: 'data', from: 'data', to: 'model',
    build(root, S) {
      S.wrap = reg(el('div', { class: 'abs', style: `width:${W}px;height:${H}px;transform-origin:${PAD}px ${TOP}px` }, root));
      const size = pick(130, 120, 120);
      S.a = line(S.wrap, '20,531 genes.', { x: PAD, y: TOP, size });
      Object.assign(S.a.words[0].style, { width: '3.3em', textAlign: 'right', fontVariantNumeric: 'tabular-nums' });
      S.b = line(S.wrap, '500 that matter.', { x: PAD, y: TOP, size, accent: [0] });
      S.eb1 = eyebrow(S.wrap, '801 tumours × 20,531 genes', PAD + 6, TOP + size * 1.25);
      S.eb2 = eyebrow(S.wrap, 'Feature selection · median impute · scale', PAD + 6, TOP + size * 1.25);
    },
    run(t, b, S) {
      put(S.wrap, { s: pushOf(t, 'data', 'model', 0.03) });
      const n = Math.round(20531 * ease.out(seg(t, 8.5, 'count_end')));
      put(S.a.words[0], { text: n.toLocaleString('en-US') });
      rise(t, S.a, 'data', beatOf('select') - 0.3, { stagger: 0.1 });
      rise(t, S.b, 'select', 15.55);
      put(S.eb1, { o: fadeWin(t, 9, 10, 11.5, 11.8) });
      put(S.eb2, { o: fadeWin(t, 'select_lit', 14, 15.3, 15.7) });
    },
  });

  // ------------------------------------------------------------------ 3 · model: the sphere + a forest drawing itself (b16 → b24)
  const TREE = (() => {                                   // depth-4 binary tree in unit coords, leaves get a class
    const nodes = [], edges = [];
    for (let L = 0; L <= 4; L++) for (let i = 0; i < 2 ** L; i++) {
      nodes.push({ L, x: (i + 0.5) / 2 ** L - 0.5, y: L / 4, cls: L === 4 ? [0, 1, 0, 2, 3, 2, 4, 1, 0, 3, 2, 0, 1, 4, 3, 0][i] : -1 });
      if (L) edges.push([nodes.length - 1, 2 ** (L - 1) - 1 + (i >> 1)]);
    }
    return { nodes, edges };
  })();
  scene({
    name: 'model', from: 'model', to: 'clusters',
    build(root, S) {
      S.tree = canvas(root);
      S.wrap = reg(el('div', { class: 'abs', style: `width:${W}px;height:${H}px;transform-origin:${PAD}px ${TOP}px` }, root));
      const size = pick(130, 120, 120);
      S.a = line(S.wrap, '100 trees vote.', { x: PAD, y: TOP, size });
      S.b = line(S.wrap, '98.76% accurate.', { x: PAD, y: TOP, size, accent: [0] });
      S.eb = eyebrow(S.wrap, 'Random Forest · 500 genes · 5 subtypes', PAD + 6, TOP + size * 1.25);
    },
    run(t, b, S) {
      const { cx, cy } = view(t);
      // the forest dissolves into the burst: it collapses toward the centre as the clusters fly out
      const gone = ease.inOut(seg(t, 23.4, 24.2)), shrink = 1 - 0.35 * gone;
      const g = S.tree, tw = pick(760, 720, 780) * shrink, th = pick(470, 470, 560) * shrink, ty = cy - th / 2;
      g.clearRect(0, 0, W, H);
      g.lineCap = 'round';
      for (let ghost = 3; ghost >= 0; ghost--) {
        const ox = cx + ghost * 26, oy = ty - ghost * 22, al = (ghost ? 0.18 : 1) * (1 - gone);
        if (al <= 0.002) continue;
        for (const [c, p] of TREE.edges) {
          const n = TREE.nodes[c], q = TREE.nodes[p];
          const k = ease.out(seg(t, 16.5 + (n.L - 1) * 0.6 + ghost * 0.15, 17.1 + (n.L - 1) * 0.6 + ghost * 0.15));
          if (k <= 0) continue;
          const x0 = ox + q.x * tw, y0 = oy + q.y * th, x1 = ox + n.x * tw, y1 = oy + n.y * th;
          g.strokeStyle = `rgba(163,172,185,${(0.55 * al).toFixed(3)})`; g.lineWidth = 3;
          g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, k), lerp(y0, y1, k)); g.stroke();
        }
        for (const n of TREE.nodes) {
          const k = spHit(t, 16.5 + n.L * 0.6 + ghost * 0.15, 'snappy');
          if (k <= 0.001) continue;
          const leafLit = n.cls >= 0 ? sp(t, 22 + (n.x + 0.5) * 1.2, 'snappy') : 0;
          const c = n.cls >= 0 ? rgb(DATA[n.cls][1]) : rgb(ACC);
          const base = n.cls >= 0 ? [124, 133, 146].map((x, i) => lerp(x, c[i], leafLit)) : c;
          g.fillStyle = `rgba(${base.map((x) => x | 0).join(',')},${al.toFixed(3)})`;
          g.beginPath(); g.arc(ox + n.x * tw, oy + n.y * th, (n.L === 4 ? 9 : 8) * k, 0, 6.2832); g.fill();
        }
      }
      put(S.wrap, { s: pushOf(t, 'model', 'clusters', 0.03) });
      rise(t, S.a, 'model', beatOf('acc') - 0.3, { stagger: 0.1 });
      rise(t, S.b, 'acc', 23.55);
      put(S.eb, { o: fadeWin(t, 17, 18, 23.2, 23.6) });
    },
  });

  // ------------------------------------------------------------------ 4 · discover: burst into five clusters (b24 → b32)
  scene({
    name: 'clusters', from: 'clusters', to: 'ui',
    build(root, S) {
      S.wrap = reg(el('div', { class: 'abs', style: `width:${W}px;height:${H}px;transform-origin:${PAD}px ${TOP}px` }, root));
      const size = pick(120, 110, 112);
      S.L = lines(S.wrap, ['Each lineage,', 'its own switch.'], size, TOP, { 1: [2] });
      S.labels = DATA.map(([code, color, , tf]) => {
        const box = reg(el('div', { class: 'abs', style: 'transform-origin:0 50%' }, root), { o: 0 });
        el('div', { class: 'ui', style: `font-size:${pick(44, 40, 40)}px;color:var(--ink);display:flex;align-items:center;gap:12px` }, box,
          `<span style="width:14px;height:14px;border-radius:50%;background:${color}"></span>${code}`);
        const name = reg(el('div', { class: 'ui', style: `font-size:${pick(40, 36, 36)}px;color:var(--accent);margin:6px 0 0 26px` }, box, tf), { o: 0 });
        return { box, name };
      });
    },
    run(t, b, S) {
      const v = view(t);
      S.L.forEach((L, i) => rise(t, L, i ? 'tf1' : 24.5, 31.3 + i * 0.05));
      const out = sp(t, 31.2, 'snappy');                                 // labels collapse as the field is pushed past camera
      F.clusters.forEach((c, k) => {
        const [px, py] = project(c.at[0], c.at[1] + c.sd * 1.9, c.at[2], v);
        const g = spHit(t, `c${k + 1}`, 'snappy', 1 / 60) * (1 - out), n = spHit(t, `tf${k + 1}`, 'snappy', 1 / 60) * (1 - out);
        put(S.labels[k].box, { x: px - 50, y: py - 90, o: g > 0.02 ? 1 : 0, s: 0.86 + 0.14 * g });
        put(S.labels[k].name, { o: n > 0.02 ? 1 : 0, x: -10 * (1 - n) });
      });
    },
  });

  // ------------------------------------------------------------------ 5 · real UI: the site's predictor, captured (b32 → b36)
  const PRE = { w: 1280, h: 461 }, POST = { w: 1280, h: 650 }, BTN = { x: 33 + 587 / 2, y: 375 + 26 };   // assets/cap/predictor.json
  scene({
    name: 'ui', from: 31.5, to: 'end', cut: false,
    build(root, S) {
      S.cw = pick(1480, 980, 1000); S.u = S.cw / 1280;
      S.cam = reg(el('div', { class: 'abs', style: `width:${W}px;height:${H}px` }, root));
      S.cx = (W - S.cw) / 2; S.cy = pick(300, 330, 720);
      S.card = reg(el('div', { class: 'card', style: `left:${S.cx}px;top:${S.cy}px;width:${S.cw}px;height:${PRE.h * S.u}px;border-radius:${20 * S.u}px` }, S.cam), { o: 0 });
      S.imgPre = reg(el('img', { src: '../assets/cap/predictor_pre.png', style: `position:absolute;left:0;top:0;width:${S.cw}px` }, S.card));
      S.imgPost = reg(el('img', { src: '../assets/cap/predictor_post.png', style: `position:absolute;left:0;top:0;width:${S.cw}px` }, S.card), { o: 0 });
      S.ring = reg(el('div', { class: 'abs', style: 'width:80px;height:80px;margin:-40px 0 0 -40px;border-radius:50%;border:3px solid var(--accent)' }, S.cam), { o: 0 });
      S.cursor = reg(el('div', { class: 'abs', style: 'width:44px;height:44px' }, S.cam,
        '<svg viewBox="0 0 24 24" width="44" height="44"><path d="M4 2l15 10-6.5 1.3L16 21l-3 1.4-3.6-7.6L4 19z" fill="#EDEFF2" stroke="#06080B" stroke-width="1.4" stroke-linejoin="round"/></svg>'), { o: 0 });
      S.L = TALL ? lines(root, ['Run it in', 'your browser.'], 112, TOP, { 1: [1] }) : [line(root, 'Run it in your browser.', { x: PAD, y: 100, size: pick(100, 96), accent: [4] })];
      const card = [S.cx + S.cw / 2, S.cy + (PRE.h * S.u) / 2], left = [S.cx + S.cw * 0.3, S.cy + PRE.h * S.u * 0.62], res = [S.cx + S.cw * 0.74, S.cy + POST.h * S.u * 0.42];
      S.camKeys = TALL
        ? [{ fx: left[0], fy: left[1], ax: W / 2, ay: H * 0.6, z: 1.75 }, { fx: res[0], fy: res[1], ax: W * 0.45, ay: H * 0.6, z: 1.8 }]
        : [{ fx: card[0], fy: card[1], ax: card[0], ay: card[1], z: 1 }, { fx: res[0], fy: res[1], ax: W * 0.56, ay: H * 0.56, z: 1.35 }];
    },
    run(t, b, S) {
      S.L.forEach((L, i) => rise(t, L, 32 + i * 0.5, 35.5, { stagger: 0.06 }));
      // card rises over the dissolving field, lifts away before the lockup lands (no cut either side)
      const up = spHit(t, 'ui', 'default'), away = sp(t, 35.7, 'default');
      const clicked = b >= beatOf('ui_click');
      const hgt = trk(t, [['ui', PRE.h], ['ui_click', POST.h, 'default']]) * S.u;
      put(S.card, { o: up > 0.002 && away < 0.995 ? 1 : 0, y: lerp(H * 0.5, 0, up) - H * 0.9 * away, s: 1 - 0.06 * away, r: -2.5 * (1 - up), css: { height: hgt + 'px' } });
      put(S.imgPre, { o: clicked ? 0 : 1 });
      put(S.imgPost, { o: clicked ? 1 : 0 });
      const bx = S.cx + BTN.x * S.u, by = S.cy + BTN.y * S.u;
      const cx = trk(t, [[32.5, W + 60], [33, bx + 30, 'default']]), cy = trk(t, [[32.5, H + 60], [33, by + 18, 'default']]);
      const press = spHit(t, 'ui_click', 'snappy') - sp(t, beatOf('ui_click') + 0.25, 'snappy');
      put(S.cursor, { o: b > 32.6 && b < 35 ? 1 : 0, x: cx - 6, y: cy - 4, s: 1 - 0.18 * press });
      const rp = clamp((t - bt('ui_click')) / 0.45);
      put(S.ring, { o: rp > 0 && rp < 1 ? 1 - rp : 0, x: bx + 30, y: by + 18, s: 0.4 + 1.2 * ease.out(rp) });
      const c = C.trkObj(t, [['ui', S.camKeys[0]], [34.5, S.camKeys[1], 'heavy']]);
      put(S.cam, { s: c.z, x: c.ax - c.fx * c.z, y: c.ay - c.fy * c.z });
    },
  });

  // ------------------------------------------------------------------ 6 · end card (b36 → b40), lifts out into the loop
  scene({
    name: 'end', from: 'end', to: 'done',
    build(root, S) {
      S.push = reg(el('div', { class: 'abs', style: `width:${W}px;height:${H}px;transform-origin:${PAD}px ${H / 2}px` }, root));
      const y0 = pick(H / 2 - 150, H / 2 - 150, 760), size = pick(150, 120, 122);
      const bs = pick(130, 110, 120);
      S.badge = reg(el('div', { class: 'abs ui', style: `left:${PAD}px;top:${TALL ? y0 - bs - 40 : y0 + 4}px;width:${bs}px;height:${bs}px;border-radius:50%;background:var(--accent);color:#1A1405;display:grid;place-items:center;font-size:${bs * 0.34}px;font-weight:700;transform-origin:50% 50%` }, S.push, 'TF'), { o: 0 });
      const tx = TALL ? PAD : PAD + bs + 40;
      S.logo = line(S.push, 'Cancer TF Atlas', { x: tx, y: y0, size });
      S.rule = reg(el('div', { class: 'abs', style: `left:${tx + 6}px;top:${y0 + size * 1.12}px;height:6px;background:var(--accent);border-radius:3px` }, S.push), { o: 0 });
      S.cta = line(S.push, 'Explore the atlas', { x: tx, y: y0 + size * 1.32, size: pick(76, 64, 64), cls: 'ui' });
      S.url = line(S.push, 'cancer-tf-dashboard.vercel.app', { x: tx, y: y0 + size * 1.32 + pick(104, 90, 90), size: pick(52, 44, 44), cls: 'ui', color: 'var(--ink-2)' });
      S.tw = pick(900, 700, 820);
    },
    run(t, b, S) {
      put(S.push, { s: pushOf(t, 'end', 'done', 0.05) });
      const g = spHit(t, 'end', 'heavy') - sp(t, 38.9, 'snappy');
      put(S.badge, { o: g > 0.02 ? 1 : 0, s: 0.85 + 0.15 * g });
      rise(t, S.logo, 'end', 38.85, { stagger: 0.06 });
      const u = sp(t, 36.75, 'default') - sp(t, 38.8, 'snappy');
      put(S.rule, { o: u > 0.002 ? 1 : 0, css: { width: S.tw * Math.max(0, u) + 'px' } });
      rise(t, S.cta, 'cta', 38.95, { stagger: 0.05, preset: 'snappy' });
      rise(t, S.url, 37.5, 39.0, { stagger: 0.05, preset: 'snappy' });
    },
  });

  // ------------------------------------------------------------------ static grain over everything (seeded, like the site's)
  scene({
    name: 'grain', from: 'hook', to: 'done',
    build(root) {
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const g = c.getContext('2d'), img = g.createImageData(256, 256), r = mulberry32(9);
      for (let i = 0; i < img.data.length; i += 4) { const v = (r() * 255) | 0; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
      g.putImageData(img, 0, 0);
      el('div', { class: 'abs', style: `width:${W}px;height:${H}px;opacity:.04;mix-blend-mode:overlay;background:url(${c.toDataURL()})` }, root);
    },
  });

  C.start();
})();
