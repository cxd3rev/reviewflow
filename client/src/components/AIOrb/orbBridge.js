let current = null;
const listeners = new Set();

export function setOrbBridge(api) {
  current = api;
  listeners.forEach((fn) => fn(api));
}

export function getOrbBridge() {
  return current;
}

export function onOrbBridge(fn) {
  listeners.add(fn);
  if (current) fn(current);
  return () => listeners.delete(fn);
}

export function whenOrbReady() {
  if (current) return Promise.resolve(current);
  return new Promise((resolve) => {
    const off = onOrbBridge((api) => {
      if (!api) return;
      off();
      resolve(api);
    });
  });
}
