# Videos

`tf-atlas-film/` is the site's hero film (20 s, 120 BPM, 16:9 + 9:16), made with the Motion Reel Kit pipeline
(motion-graphics-video skill): the film is a pure function of time (`film/film.js`, `window.seek(t)`), rendered by
headless Chromium and encoded with ffmpeg. Picture and sound share `timeline.json` (marks in beats).

The particle field in the film is a deterministic 2D-canvas port of `components/ParticleField.jsx` (same seeds, same
helix → matrix → sphere → clusters shapes), so the film and the site share one visual system.

Re-render (needs Node 20+, ffmpeg, Python 3 with numpy scipy soundfile librosa pillow, and Playwright + Chromium):

```bash
cd videos/tf-atlas-film
python3 scripts/music.py && python3 scripts/beats.py audio/music.wav --stem audio/drums.wav
node scripts/sync.mjs && node scripts/sfx.mjs && python3 scripts/mix.py
node scripts/render.mjs --all          # 60 fps finals → renders/16x9.mp4, renders/9x16.mp4
```

The site plays web encodes of both finals from `public/film/` (H.264 MP4 + VP9 WebM, 16:9 and 9:16, plus posters); the 9:16 file doubles as the social cut.
Docs: `docs/shotlist.md` (approved), `docs/style_guide.md`, `docs/review_log.md` (critique rounds).
