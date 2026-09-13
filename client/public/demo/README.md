# starywrld product demo (recording)

This folder holds optional media for the website player and the live `/demo` walkthrough.

- Drop a captured file here as **`starywrld-demo.mp4`**. The landing player uses it when present.
- The live orb does **not** speak. Narration is text balloons only. Do not record orb voice, TTS, or `speechSynthesis`.
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
5. Video only is enough. The orb has no voice; add a soundtrack later in the editor if you want one.
6. Start recording, let the walkthrough finish on the Get started CTA (~4:30), stop.
7. Export **MP4 (H.264)** and save as `client/public/demo/starywrld-demo.mp4`.

## Record with Clipchamp

1. Open `http://localhost:5173/demo?record=1` in Edge or Chrome.
2. Clipchamp → Record & create → Screen.
3. Pick the browser window or this tab. Tab audio is optional (the orb is silent).
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

Reload the landing page. The demo section plays that file (no autoplay sound). Volume on that player is for the recorded video, not the live orb. If the file is missing, Play opens the live `/demo` walkthrough instead.
