// Mutable state shared between GSAP ScrollTriggers (writers) and the R3F frame loop (reader).
// morph: 0 helix → 1 expression matrix → 2 decision space → 3 subtype clusters
// dock: 0 while the hero is on screen, 1 once the pipeline takes over (repositions the field on phones)
export const sceneState = { morph: 0, spin: 0, fade: 1, dock: 0 };
