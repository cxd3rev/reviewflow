# Live product demo

Scene config lives here. Narration is **`narration.js`** only (text balloons on the orb — no voice). Timings and targets are **`scenes.js`**.

- Route: `/demo` (recording: `/demo?record=1`)
- Media slot: `client/public/demo/` — see that folder’s README for OBS / Clipchamp / Game Bar / MediaRecorder
- The floating orb in `client/src/components/AIOrb/` is the only narrator. It talks with speech bubbles, never audio.
