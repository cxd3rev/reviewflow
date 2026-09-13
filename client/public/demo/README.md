# starywrld product demo (recording)

This folder holds optional media for the website player and the live `/demo` walkthrough.

- Drop a captured file here as **`starywrld-demo.mp4`**. The landing player uses it when present.
- Put optional narration takes in **`audio/`** using the filenames in `client/src/demo/narration.js` / `scenes.js` (`hook.mp3`, `problem.mp3`, `how1.mp3`, …). If a file is missing, the orb uses TTS, then `speechSynthesis`, then a fake envelope so it still pulses.
- Do not commit a fake product video. Capture the real `/demo` run.

The interactive master is **`http://localhost:5173/demo`** (about 4:30, deterministic). Recording mode: **`http://localhost:5173/demo?record=1`**.

From the repo root (PowerShell):

```
cd client
npm run dev
```

Then open `http://localhost:5173/demo`.

## Record with OBS

1. Start the Vite client. Open `http://localhost:5173/demo?record=1`.
2. Wait for the 16:9 stage (no Start button). Do not click the page.
3. OBS → Sources → Display Capture or Window Capture (the browser).
4. Canvas **1920×1080**, **30 fps**. Crop to the 16:9 stage if the window is larger.
5. Audio: capture the browser tab / desktop audio so narration is in the file.
6. Start recording, let the walkthrough finish on the Get started CTA (~4:30), stop.
7. Export **MP4 (H.264)** and save as `client/public/demo/starywrld-demo.mp4`.

## Record with Clipchamp

1. Open `http://localhost:5173/demo?record=1` in Edge or Chrome.
2. Clipchamp → Record & create → Screen.
3. Pick the browser window or this tab. Include tab audio.
4. Record the full walkthrough, stop, export MP4.
5. Save as `client/public/demo/starywrld-demo.mp4`.

## Record with Windows Game Bar

1. Open the demo tab (`?record=1`).
2. Press **Win + G**. Start the capture (Win + Alt + R).
3. Let it run to the CTA, stop.
4. Convert the capture to MP4 in Clipchamp or Photos if needed.
5. Save as `client/public/demo/starywrld-demo.mp4`.

## In-app “Record this demo”

On `/demo` (not `?record=1`), use **Record this demo**. The browser asks which tab to share — pick this tab. That uses `getDisplayMedia` + `MediaRecorder` and downloads a **WebM**. Convert to MP4 in Clipchamp and place it at `starywrld-demo.mp4`. No ffmpeg in this repo.

## After the MP4 exists

Reload the landing page. The demo section plays that file (no autoplay sound). If the file is missing, Play opens the live `/demo` walkthrough instead.
