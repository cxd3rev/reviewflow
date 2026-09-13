import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DEMO_POSTER, DEMO_VIDEO, videoExists } from "../../demo/assets.js";
import { useI18n } from "../../i18n/LanguageContext.jsx";
import "../../demo/demo.css";

export function Demo() {
  const { t } = useI18n();
  const videoRef = useRef(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    let alive = true;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          videoExists(DEMO_VIDEO).then((ok) => {
            if (alive) {
              setHasVideo(ok);
              setReady(true);
            }
          });
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    const node = document.getElementById("demo");
    if (node) io.observe(node);
    else {
      videoExists(DEMO_VIDEO).then((ok) => {
        if (alive) {
          setHasVideo(ok);
          setReady(true);
        }
      });
    }
    return () => {
      alive = false;
      io.disconnect();
    };
  }, []);

  function play() {
    const video = videoRef.current;
    if (!hasVideo || !video) return;
    video.play();
    setPlaying(true);
    setEnded(false);
  }

  function pause() {
    videoRef.current?.pause();
    setPlaying(false);
  }

  function replay() {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    play();
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    const next = video.volume > 0 ? 0 : 1;
    video.volume = next;
    video.muted = next === 0;
    setVolume(next);
  }

  async function fullscreen() {
    const node = document.getElementById("landing-demo-player");
    if (!node) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await node.requestFullscreen?.();
  }

  return (
    <section id="demo" className="border-t border-white/5 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-zinc-500">{t("landingDemo.eyebrow")}</p>
        <h2 className="display mx-auto mt-3 max-w-3xl text-center text-3xl font-semibold tracking-tight text-white md:text-5xl">
          {t("landingDemo.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">{t("landingDemo.subtitle")}</p>

        <div className="mx-auto mt-12 max-w-4xl">
          <div id="landing-demo-player" className="landing-demo-player">
            {ready && hasVideo ? (
              <video
                ref={videoRef}
                src={DEMO_VIDEO}
                playsInline
                preload="metadata"
                onTimeUpdate={(event) => {
                  const el = event.currentTarget;
                  if (el.duration) setProgress(el.currentTime / el.duration);
                }}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => {
                  setPlaying(false);
                  setEnded(true);
                }}
              />
            ) : (
              <Link to="/demo" className="landing-demo-poster">
                <img src={DEMO_POSTER} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
                <p className="relative display text-2xl font-semibold text-white">starywrld</p>
                <p className="relative max-w-sm px-6 text-center text-sm text-zinc-400">
                  {ready ? t("landingDemo.missing") : t("common.loading")}
                </p>
                {ready ? <span className="relative btn-cta">{t("landingDemo.play")}</span> : null}
              </Link>
            )}
            {hasVideo && !playing && !ended ? (
              <button
                type="button"
                className="landing-demo-poster"
                onClick={play}
                aria-label={t("landingDemo.play")}
              >
                <span className="btn-cta">{t("landingDemo.play")}</span>
              </button>
            ) : null}
          </div>

          {hasVideo ? (
            <div className="landing-demo-controls">
              <button type="button" className="btn-secondary px-3 py-2 text-sm" onClick={playing ? pause : play}>
                {playing ? t("landingDemo.pause") : t("landingDemo.play")}
              </button>
              <button type="button" className="btn-ghost px-3 py-2 text-sm" onClick={replay}>
                {t("landingDemo.replay")}
              </button>
              <input
                className="landing-demo-range"
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={progress}
                aria-label={t("landingDemo.play")}
                onChange={(event) => {
                  const video = videoRef.current;
                  const next = Number(event.target.value);
                  setProgress(next);
                  if (video?.duration) video.currentTime = next * video.duration;
                }}
              />
              <button type="button" className="btn-ghost px-3 py-2 text-sm" onClick={toggleMute}>
                {volume === 0 ? t("landingDemo.unmute") : t("landingDemo.mute")}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                aria-label={t("landingDemo.mute")}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setVolume(next);
                  if (videoRef.current) {
                    videoRef.current.volume = next;
                    videoRef.current.muted = next === 0;
                  }
                }}
              />
              <button type="button" className="btn-ghost px-3 py-2 text-sm" onClick={fullscreen}>
                {t("landingDemo.fullscreen")}
              </button>
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link to="/demo" className="btn-cta">
                {t("landingDemo.interactive")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
