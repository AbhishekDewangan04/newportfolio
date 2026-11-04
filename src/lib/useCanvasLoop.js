import { useEffect, useRef } from "react";
import { subscribe, prefersReduced } from "./motion";

/**
 * Draws on the shared ticker, only while the canvas is in view and the tab is
 * visible. DPR capped at 2 (1 on touch). When reduced motion is requested the
 * canvas draws a single static frame.
 */
export function useCanvasLoop(ref, draw) {
    const drawRef = useRef(draw);
    drawRef.current = draw;

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const reduce = prefersReduced();
        const coarse =
            typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
        const dpr = () => Math.min(window.devicePixelRatio || 1, coarse ? 1 : 2);

        let width = 0;
        let height = 0;
        let visible = false;
        let time = 0;
        let last = performance.now();

        const paint = (dt, still) => {
            if (!width || !height) return;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const d = dpr();
            ctx.setTransform(d, 0, 0, d, 0, 0);
            drawRef.current(ctx, { w: width, h: height, t: time, dt, still });
        };

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const d = dpr();
            width = rect.width;
            height = rect.height;
            canvas.width = Math.round(width * d);
            canvas.height = Math.round(height * d);
            paint(0, true);
        };

        resize();
        paint(0, true);

        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) last = performance.now();
        });
        io.observe(canvas);

        const unsubscribe = subscribe(() => {
            if (!visible || document.hidden) return;
            if (reduce) return;
            const now = performance.now();
            const dt = Math.min(48, now - last);
            last = now;
            time += dt;
            paint(dt, false);
        });

        return () => {
            unsubscribe();
            ro.disconnect();
            io.disconnect();
        };
    }, [ref]);
}

export default useCanvasLoop;