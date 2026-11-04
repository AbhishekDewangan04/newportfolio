import { useCallback, useEffect, useRef } from "react";
import useCanvasLoop from "@/lib/useCanvasLoop";
import { clamp, prefersReduced } from "@/lib/motion";

const MAX_POINTS = 72;

/** One destination rect, bottom-anchored: every layer is drawn through it. */
function containBottom(w, h, aspect) {
    let dw = w;
    let dh = w / aspect;
    if (dh > h) {
        dh = h;
        dw = h * aspect;
    }
    return { x: (w - dw) / 2, y: h - dh, w: dw, h: dh };
}

/**
 * A and B share one destination rect and one transform. B is brushed in through
 * a clip, so the pixel positions of both layers always line up.
 */
export default function LiquidReveal({
    baseUrl,
    imageUrl,
    active,
    className = "",
    label = "Portrait",
}) {
    const canvasRef = useRef(null);
    const layers = useRef({ a: null, b: null });
    const state = useRef({ points: [], speed: 0, lastMove: 0, sweep: 0, ready: false });

    useEffect(() => {
        const load = (url, key) => {
            if (!url) {
                layers.current[key] = null;
                return null;
            }
            const img = new window.Image();
            img.decoding = "async";
            img.onload = () => {
                layers.current[key] = img;
            };
            img.src = url;
            return img;
        };
        const a = load(baseUrl, "a");
        const b = load(imageUrl, "b");
        return () => {
            [a, b].forEach((img) => {
                if (img) img.onload = null;
            });
        };
    }, [baseUrl, imageUrl]);

    useEffect(() => {
        if (!active) return;
        state.current.ready = true;
        state.current.points = [];
        state.current.lastMove = 0;
    }, [active]);

    useEffect(() => {
        if (window.innerWidth < 640) return undefined;
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const onMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            if (e.clientY < rect.top || e.clientY > rect.bottom) return;
            const s = state.current;
            const now = performance.now();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const prev = s.points[s.points.length - 1];
            if (prev) {
                const dist = Math.hypot(x - prev.x, y - prev.y);
                const dt = Math.max(1, now - prev.t);
                s.speed = s.speed * 0.68 + (dist / dt) * 0.32;
            }
            s.points.push({ x, y, t: now });
            if (s.points.length > MAX_POINTS) s.points.shift();
            s.lastMove = now;
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, []);

    const draw = useCallback((ctx, { w, h }) => {
        if (!w || !h || !state.current.ready) return;
        const { a, b } = layers.current;
        const anchor = a || b;
        if (!anchor) return;

        ctx.clearRect(0, 0, w, h);
        const r = containBottom(w, h, anchor.width / anchor.height);
        ctx.drawImage(anchor, r.x, r.y, r.w, r.h);
        if (!b || b === a) return;

        if (prefersReduced()) {
            return;
        }

        const now = performance.now();
        const s = state.current;

        while (s.points.length && now - s.points[0].t > 300) s.points.shift();
        const idle = now - s.lastMove > 300;
        if (!s.points.length || idle) {
            s.points = [];
            return;
        }

        const len = s.points.length;
        const radius = 26 + clamp(s.speed * 150, 0, 74);
        ctx.save();
        ctx.beginPath();
        s.points.forEach((p, i) => {
            const taper = 0.42 + 0.58 * (i / Math.max(1, len - 1));
            const age = clamp(1 - (now - p.t) / 300, 0, 1);
            const rad = Math.max(0.5, radius * taper * age);
            ctx.moveTo(p.x + rad, p.y);
            ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        });
        ctx.clip();
        ctx.globalAlpha = 0.62;
        ctx.drawImage(b, r.x, r.y, r.w, r.h);
        ctx.restore();
    }, []);

    useCanvasLoop(canvasRef, draw);

    return <canvas ref={canvasRef} role="img" aria-label={label} className={className} />;
}
