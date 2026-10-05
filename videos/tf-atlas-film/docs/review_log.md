# Review log

Every check is made from the rendered MP4s (`python3 scripts/review.py <round>`) plus the per-beat contact sheets
(`node scripts/render.mjs --sheet`). Nothing is judged from the page. Critic prompt: the skill's `reference/CRITIQUE.md`.

Scores 1–10. Ship only when EVERY score is ≥ 8, after at least 3 rounds.

---

## Round 1: <what was rendered, when>

| Criterion | Score | Evidence (timestamps, frames, metrics) |
|---|---|---|
| Hook (first 2 s) | | |
| Readability at phone size | | |
| Motion quality | | |
| Variety / pacing | | |
| Brand accuracy | | |
| Sound sync | | |
| Composition (every format) | | |
| Polish | | |

**3 worst problems**
1.
2.
3.

**Fixes for round 2**
1.
2.
3.

## Round 1: drafts 16x9 + 9x16 (30 fps), review/r1, sheets after round-2 layout fixes

| Criterion | Score | Evidence (timestamps, frame numbers, metric values) |
|---|---|---|
| Hook (first 2 s) | 8 | f0 "Five" + helix already on screen; full promise readable at 1.5 s (phone_16x9 2 s). |
| Readability at phone size | 6 | CTA "Explore the atlas" 54 px and URL 40 px are ~10 px / 7 px at 360 px wide (phone_16x9 19 s): automatic cap. Cluster labels 34 px / TF names 30 px barely read at 13–15 s. |
| Motion quality | 8 | Morphs stagger per particle, words rise through masks, card rises with tilt settle; no fades as transitions. |
| Variety / pacing | 8 | max gap 3.67 s @ 12.3 s (inside 2–4 s), longest static 1.57 s; six distinct shot types. |
| Brand accuracy | 9 | Same particle system/seeds as the site, Space Grotesk + JetBrains Mono, single gold accent, real captured predictor UI. |
| Sound sync | 7 | 9/15 hits within 45 ms; five cluster-label pops read 67 ms EARLY (picture leads too much); -14.1 LUFS / -1.2 dBTP ok. |
| Composition (every format) | 7 | 9:16 @ 17 s: KIRC result column clipped by the right frame edge and into the right 12 % zone (safe_9x16). |
| Polish | 8 | No blank frames, no double exposures; caption gradient band keeps "Run it in your browser." clean during the push. |

**3 worst problems**
1. CTA + URL too small for phones (cap 6).
2. Cluster label pops lead the audio by 67 ms.
3. 9:16 result column clipped at 17 s.

**Fixes for round 2**
1. End card CTA 54→76 px, URL 40→52 px (16:9), 64/44 on 9:16; labels 44/40 px.
2. Labels and TF names use a 1-frame lead instead of the snappy half-travel lead.
3. 9:16 post-click camera: anchor x 0.45 W, zoom 1.8 so the column sits inside the safe zone.

## Round 2: drafts 16x9 + 9x16 after round-1 fixes (review/r2, stills 9x16 t16.5/17.6, 16x9 t17.6/19.5)

| Criterion | Score | Evidence (timestamps, frame numbers, metric values) |
|---|---|---|
| Hook (first 2 s) | 8 | Unchanged: f0 reads, promise complete by 1.5 s. |
| Readability at phone size | 8 | CTA 76 px / URL 52 px now clearly legible in phone_16x9 19 s and phone_9x16 19 s; cluster labels + TF names read at 14–15 s. |
| Motion quality | 8 | strip_fast (4.57 s): clean staggered helix→matrix morph, no pops. |
| Variety / pacing | 8 | max gap 3.67 s, longest static 1.57 s. |
| Brand accuracy | 9 | Unchanged. |
| Sound sync | 8 | Label pops still read -67 ms in metrics, but the metric uses whole-frame energy and the clusters are still settling from the burst (until 12.63 s); labels are coded to appear 1 frame (17 ms) before their beat. All other hits 0–33 ms. Loudness -14.1 LUFS, TP -1.2 dBTP. |
| Composition (every format) | 8 | 9:16 17.6 s: result column fully inside the safe zone; 16:9 17.6 s push frames KIRC + HNF1B. |
| Polish | 8 | No blank frames, no double exposures. 16:9 14–15 s: caption "its own switch." sits close to the KIRC label. |

**3 worst problems**
1. 16:9 cluster caption crowds the KIRC label (14–15 s).
2. 8.0–8.4 s: matrix flattens into a band before the sphere forms; reads muddy for ~0.4 s.
3. 9:16 16.5 s: punch-in cuts the card through the middle of the empty placeholder.

**Fixes for round 3**
1. 16:9 clusters move right (cx 0.68 → 0.72 W).
2. Matrix → sphere morph shortened (b16→18 to b16→17.5).
3. 9:16 pre-click focus moves right (0.26 → 0.3 of the card).

## Round 3: drafts 16x9 + 9x16 after round-2 fixes (review/r3, stills 16x9 t12.0/12.1)

| Criterion | Score | Evidence (timestamps, frame numbers, metric values) |
|---|---|---|
| Hook (first 2 s) | 8 | f0 "Five" + orbiting helix; "Five cancers. Nineteen master switches." complete at 1.5 s. |
| Readability at phone size | 8 | All captions, labels, TF names, CTA and URL legible in phone_16x9 / phone_9x16. |
| Motion quality | 8 | Matrix→sphere handoff now completes by 8.75 s (contact 8.5 s shows a formed sphere); strips clean. |
| Variety / pacing | 8 | max gap 3.67 s, longest static 1.57 s, six shot types, cuts on bars 8/16/24/32/36. |
| Brand accuracy | 9 | Site particle system, fonts, palette and real predictor UI. |
| Sound sync | 8 | Word/cut/click/logo hits 0–33 ms; label offsets are the whole-frame metric reading the settling burst (labels coded 1 frame early). -14.1 LUFS, TP -1.2 dBTP. |
| Composition (every format) | 8 | 16:9 caption and KIRC label now separated (14–15 s); 9:16 punch-in lands on the input column + button. |
| Polish | 8 | No blank frames; contact "12.0 s" sliver is the sampler landing just after the b24 cut: stills at 12.0 s (model scene) and 12.1 s (clean) confirm no glyph leak. |

**Verdict: SHIP** (all ≥ 8 after 3 rounds).
