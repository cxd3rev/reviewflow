const root = `${import.meta.env.BASE_URL || "/"}`.replace(/\/?$/, "/");

export const DEMO_PUBLIC = `${root}demo/`;
export const DEMO_VIDEO = `${DEMO_PUBLIC}starywrld-demo.mp4`;
export const DEMO_POSTER = `${DEMO_PUBLIC}poster.svg`;

export function demoAudioUrl(file) {
  if (!file) return "";
  return `${DEMO_PUBLIC}audio/${file}`;
}

export function isMediaResponse(response) {
  const type = response.headers.get("content-type") || "";
  return /^(audio|video)\//i.test(type) || type.includes("mpeg") || type.includes("mp4") || type.includes("webm");
}

export function mediaExists(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    const probe = new Audio();
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
