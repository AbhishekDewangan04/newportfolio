import React, { useCallback, useRef } from "react";
import useCanvasLoop from "@/lib/useCanvasLoop";

const LEVELS = [-1.45, -0.45, 0.55, 1.55];

function fieldValue(x, y, t) {
    return (
        Math.sin(x * 2.6 + t * 0.22) +
        Math.sin(y * 3.1 - t * 0.17) +
        Math.sin((x + y) * 1.9 + t * 0.13) +
        Math.sin((x - y) * 2.7 - t * 0.11)
    );
}

/** Marching squares over a 4-sine field: 2.5 contour bands, slow roll. */
export default function ContourCanvas({ color = "rgba(9, 10, 11, 0.08)", className = "", cells = 52 }) {
    const canvasRef = useRef(null);
    const acc = useRef(0);

    const draw = useCallback(
        (ctx, { w, h, t, dt, still }) => {
            if (still) acc.current = 0;
            acc.current += dt;
            if (!still && acc.current < 60) {
                // contour lines only need ~16fps
                ctx.strokeStyle = color;
                return;
            }
            acc.current = 0;

            const cols = cells;
            const rows = Math.max(10, Math.round((cols * h) / Math.max(w, 1)));
            const cw = w / cols;
            const ch = h / rows;

            const grid = new Float32Array((cols + 1) * (rows + 1));
            for (let j = 0; j <= rows; j += 1) {
                for (let i = 0; i <= cols; i += 1) {
                    grid[j * (cols + 1) + i] = fieldValue((i / cols) * 6.2, (j / rows) * 5.1, t);
                }
            }

            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.lineCap = "round";

            const at = (i, j) => grid[j * (cols + 1) + i];

            for (let j = 0; j < rows; j += 1) {
                for (let i = 0; i < cols; i += 1) {
                    const v0 = at(i, j);
                    const v1 = at(i + 1, j);
                    const v2 = at(i + 1, j + 1);
                    const v3 = at(i, j + 1);
                    const min = Math.min(v0, v1, v2, v3);
                    const max = Math.max(v0, v1, v2, v3);

                    for (let l = 0; l < LEVELS.length; l += 1) {
                        const level = LEVELS[l];
                        if (level < min || level > max) continue;

                        const pts = [];
                        // top edge
                        if (v0 < level !== v1 < level) {
                            const f = (level - v0) / (v1 - v0 || 1);
                            pts.push([i * cw + f * cw, j * ch]);
                        }
                        // right edge
                        if (v1 < level !== v2 < level) {
                            const f = (level - v1) / (v2 - v1 || 1);
                            pts.push([(i + 1) * cw, j * ch + f * ch]);
                        }
                        // bottom edge
                        if (v2 < level !== v3 < level) {
                            const f = (level - v2) / (v3 - v2 || 1);
                            pts.push([i * cw + (1 - f) * cw, (j + 1) * ch]);
                        }
                        // left edge
                        if (v3 < level !== v0 < level) {
                            const f = (level - v3) / (v0 - v3 || 1);
                            pts.push([i * cw, j * ch + (1 - f) * ch]);
                        }

                        if (pts.length === 2) {
                            ctx.beginPath();
                            ctx.moveTo(pts[0][0], pts[0][1]);
                            ctx.lineTo(pts[1][0], pts[1][1]);
                            ctx.stroke();
                        } else if (pts.length === 4) {
                            ctx.beginPath();
                            ctx.moveTo(pts[0][0], pts[0][1]);
                            ctx.lineTo(pts[1][0], pts[1][1]);
                            ctx.moveTo(pts[2][0], pts[2][1]);
                            ctx.lineTo(pts[3][0], pts[3][1]);
                            ctx.stroke();
                        }
                    }
                }
            }
        },
        [color, cells],
    );

    useCanvasLoop(canvasRef, draw);

    return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
