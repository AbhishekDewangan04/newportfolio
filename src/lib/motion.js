// One shared rAF ticker, ref-counted. No animation library.
const subscribers = new Set();
let frameId = null;

function loop() {
    frameId = null;
    subscribers.forEach((fn) => {
        try {
            fn();
        } catch {
            /* a broken subscriber must not stop the ticker */
        }
    });
    if (subscribers.size > 0 && frameId === null) {
        frameId = requestAnimationFrame(loop);
    }
}

export function subscribe(fn) {
    subscribers.add(fn);
    if (frameId === null) frameId = requestAnimationFrame(loop);
    return () => {
        subscribers.delete(fn);
    };
}

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

let reducedCache = null;
export function prefersReduced() {
    if (reducedCache === null && typeof window !== "undefined") {
        reducedCache = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return !!reducedCache;
}

export const isTouch = () =>
    typeof window !== "undefined" &&
    (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 640);

export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// deterministic hash -> 0..1
export function hash2(x, y) {
    let h = x * 374761393 + y * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    h = h ^ (h >> 16);
    return ((h < 0 ? -h : h) % 1000) / 1000;
}