import React from "react";
import useCanvasLoop from "@/lib/useCanvasLoop";

/** Small spinning wireframe globe (decorative). */
export default function Globe({ size = 64, className = "" }) {
    const ref = React.useRef(null);

    const draw = React.useCallback(
        (ctx, { w, h, t, still }) => {
            const R = Math.min(w, h) / 2 - 3;
            const cx = w / 2;
            const cy = h / 2;
            const time = still ? 0 : t;

            ctx.strokeStyle = "rgba(2,210,227,0.75)";
            ctx.lineWidth = 0.8;

            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.stroke();

            for (let i = 1; i < 4; i += 1) {
                const y = -R + (2 * R * i) / 4;
                const rw = Math.sqrt(Math.max(0, R * R - y * y));
                ctx.beginPath();
                ctx.ellipse(cx, cy + y, rw, rw * 0.22, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            for (let k = 0; k < 4; k += 1) {
                const phase = time * 0.0004 + (k * Math.PI) / 4;
                const rw = Math.abs(Math.cos(phase)) * R;
                ctx.globalAlpha = 0.35 + 0.5 * Math.abs(Math.cos(phase));
                ctx.beginPath();
                ctx.ellipse(cx, cy, Math.max(0.4, rw), R, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        },
        [],
    );

    useCanvasLoop(ref, draw);

    return (
        <canvas
            ref={ref}
            aria-hidden="true"
            width={size}
            height={size}
            style={{ width: size, height: size }}
            className={className}
        />
    );
}