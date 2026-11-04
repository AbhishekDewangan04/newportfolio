import React, { useCallback, useRef } from "react";
import useCanvasLoop from "@/lib/useCanvasLoop";
import { subscribe, clamp, hash2, prefersReduced } from "@/lib/motion";

const CELL = 24;

/**
 * Chequered-flag dissolve seam sitting at the top of a stacking block:
 * solid rows break into a chequerboard and burn off as the block slides in.
 */
export default function SeamCanvas({ tone = "light", className = "" }) {
    const canvasRef = useRef(null);
    const hostRef = useRef(null);

    const draw = useCallback(
        (ctx, { w, h }) => {
            const host = hostRef.current;
            const section = host ? host.closest("[data-seam-host]") : null;
            let progress = 1;
            if (section) {
                const rect = section.getBoundingClientRect();
                const vh = window.innerHeight || 1;
                progress = clamp((vh * 0.72 - rect.top) / (vh * 0.72), 0, 1);
            }
            if (prefersReduced()) progress = 1;

            const cols = Math.ceil(w / CELL);
            const rows = Math.ceil(h / CELL);
            const solid = tone === "light" ? "#f7fafb" : "#0e0f14";
            const accent = "#02d2e3";
            const front = progress * rows;

            ctx.clearRect(0, 0, w, h);
            for (let j = 0; j < rows; j += 1) {
                const rowDepth = (j + 1) / rows;
                if (rowDepth <= front) continue;

                const fromFront = rowDepth - front;
                const chequer = fromFront < 0.34;

                for (let i = 0; i < cols; i += 1) {
                    const x = i * CELL;
                    const y = j * CELL;
                    if (chequer) {
                        const checker = (i + j) % 2 === 0;
                        const r = hash2(i, j);
                        const dropAt = fromFront * 2.6;
                        if (r < dropAt) continue;
                        if (r > 0.94) {
                            ctx.fillStyle = accent;
                            ctx.globalAlpha = 1 - fromFront;
                        } else {
                            ctx.fillStyle = solid;
                            ctx.globalAlpha = checker ? 1 - fromFront * 0.8 : 0.18 * (1 - fromFront);
                        }
                        ctx.fillRect(x, y, CELL - 1, CELL - 1);
                    } else {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = solid;
                        ctx.fillRect(x, y, CELL, CELL);
                    }
                }
            }
            ctx.globalAlpha = 1;
        },
        [tone],
    );

    useCanvasLoop(canvasRef, draw);

    // repaint on scroll for the dissolve front
    React.useEffect(() => {
        let last = -1;
        return subscribe(() => {
            const host = hostRef.current;
            if (!host) return;
            const rect = host.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) return;
            const section = host.closest("[data-seam-host]");
            if (!section) return;
            const sRect = section.getBoundingClientRect();
            const vh = window.innerHeight || 1;
            const progress = clamp((vh * 0.72 - sRect.top) / (vh * 0.72), 0, 1);
            if (Math.abs(progress - last) < 0.006) return;
            last = progress;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const d = Math.min(window.devicePixelRatio || 1, 2);
            ctx.setTransform(d, 0, 0, d, 0, 0);
            draw(ctx, { w: canvas.width / d, h: canvas.height / d });
        });
    }, [draw]);

    return (
        <div ref={hostRef} aria-hidden="true" className={`pointer-events-none ${className}`}>
            <canvas ref={canvasRef} className="h-full w-full" />
        </div>
    );
}