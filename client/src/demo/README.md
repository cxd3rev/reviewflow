# Live product demo

Scene config lives here. Narration is **`narration.js`** only (text balloons on the orb — no voice). Timings and targets are **`scenes.js`**.

- Route: `/demo` (recording: `/demo?record=1`)
- Do **not** store the product MP4 under `client/`. Keep it in Documents (`starywrld-explained.mp4`). `*.mp4` is gitignored.
- Small demo assets only: `client/public/demo/` README / poster. See that folder’s README for how to record.
- The floating orb in `client/src/components/AIOrb/` is the only narrator. It talks with speech bubbles, never audio.
