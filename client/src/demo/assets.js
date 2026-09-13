const root = `${import.meta.env.BASE_URL || "/"}`.replace(/\/?$/, "/");

export const DEMO_PUBLIC = `${root}demo/`;
export const DEMO_VIDEO = `${DEMO_PUBLIC}starywrld-demo.mp4`;
export const DEMO_POSTER = `${DEMO_PUBLIC}poster.svg`;

export function videoExists(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    const probe = document.createElement("video");
    const done = (ok) => {
      probe.onloadedmetadata = null;
      probe.onerror = null;
      resolve(ok);
    };
    probe.preload = "metadata";
    probe.onloadedmetadata = () => done(true);
    probe.onerror = () => done(false);
    probe.src = url;
  });
}
