# starywrld product demo (recording)

This folder is for **small** demo assets only (poster, README, audio placeholders).

**Do not put the product MP4 here.** GitHub rejects large files. Keep the email/video file **outside this repo**:

`C:\Users\Aron\Documents\starywrld-explained.mp4`

`*.mp4`, `*.webm`, and `*.mov` are gitignored at the repo root so `git add` will not stage them.

The landing player looks for `starywrld-demo.mp4` in this folder. If that file is missing (the normal case), Play opens the live `/demo` walkthrough instead.

The live orb does **not** speak. Narration is text balloons only.

The interactive master is **`http://localhost:5173/demo`** (~4:30). Recording mode: **`http://localhost:5173/demo?record=1`**.

## Record a copy for email (outside Git)

1. Start the Vite client. Open `http://localhost:5173/demo?record=1`.
2. Record the 16:9 stage with OBS, Clipchamp, or Windows Game Bar.
3. Save the MP4 under **Documents**, e.g. `C:\Users\Aron\Documents\starywrld-explained.mp4`.
4. Never copy it into `client/` or commit it.
