import React, { useEffect, useRef, useState } from "react";
import { subscribe, clamp, prefersReduced } from "@/lib/motion";

const DURATION = 6000;
const COOL = 800;
const MARKER_AT = [0.17, 0.4, 0.62, 0.84];

/** Closed track: a cyan lap fills it once, slows through corners, lights the markers. */
export default function TrackLap({
    onComplete,
    onProgress,
    onMarker,
    highlight = -1,
    className = "absolute inset-0",
}) {
    const pathRef = useRef(null);
    const labelRefs = useRef([]);
    const cb = useRef({ onProgress, onMarker, highlight });
    cb.current = { onProgress, onMarker, highlight };
    const lapRef = useRef(null);
    const glowRef = useRef(null);
    const filRef = useRef(null);
    const sparkRef = useRef(null);
    const markerRefs = useRef([]);
    const flareRefs = useRef([]);
    const wrapRef = useRef(null);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (highlight < 0) return;
        const marker = markerRefs.current[highlight];
        if (marker) marker.setAttribute("opacity", "1");
        const flare = flareRefs.current[highlight];
        if (flare) flare.style.opacity = "0.85";
    }, [highlight]);

    useEffect(() => {
        const path = pathRef.current;
        const wrap = wrapRef.current;
        if (!path || !wrap) return undefined;

        const L = path.getTotalLength();
        const N = 200;
        const pts = [];
        for (let i = 0; i < N; i += 1) pts.push(path.getPointAtLength((L * i) / N));

        const weights = pts.map((p, i) => {
            const a = pts[(i - 1 + N) % N];
            const b = pts[(i + 1) % N];
            const v1x = p.x - a.x;
            const v1y = p.y - a.y;
            const v2x = b.x - p.x;
            const v2y = b.y - p.y;
            const cross = v1x * v2y - v1y * v2x;
            const dot = v1x * v2x + v1y * v2y;
            const angle = Math.abs(Math.atan2(cross, dot));
            return 1 / (1 + angle * 3.4);
        });

        const cum = [0];
        for (let i = 1; i <= N; i += 1) cum.push(cum[i - 1] + weights[i - 1]);
        const total = cum[N] || 1;

        const lengthAt = (p) => {
            const target = p * total;
            let i = 0;
            while (i < N - 1 && cum[i + 1] < target) i += 1;
            const seg = cum[i + 1] - cum[i] || 1;
            return ((i + (target - cum[i]) / seg) / N) * L;
        };

        // markers sit on the path, labels sit outward from it and stay horizontal
        const center = pts.reduce(
            (acc, p) => ({ x: acc.x + p.x / N, y: acc.y + p.y / N }),
            { x: 0, y: 0 },
        );
        const markerLengths = MARKER_AT.map((f) => f * L);

        const placeMarkers = () => {
            const width = wrap.getBoundingClientRect().width;
            if (!width) return; // hidden below lg — placed again on resize
            const unit = 1200 / width; // svg units per rendered css pixel
            markerLengths.forEach((len, i) => {
                const point = path.getPointAtLength(len);
                const behind = path.getPointAtLength(Math.max(0, len - 8));
                const ahead = path.getPointAtLength(Math.min(L, len + 8));
                let nx = ahead.y - behind.y;
                let ny = -(ahead.x - behind.x);
                const mag = Math.hypot(nx, ny) || 1;
                nx /= mag;
                ny /= mag;
                const outwards =
                    Math.hypot(point.x + nx * 12 - center.x, point.y + ny * 12 - center.y) >=
                    Math.hypot(point.x - nx * 12 - center.x, point.y - ny * 12 - center.y);
                if (!outwards) {
                    nx = -nx;
                    ny = -ny;
                }
                const angle = (Math.atan2(ny, nx) * 180) / Math.PI;
                const el = markerRefs.current[i];
                if (el) el.setAttribute("transform", `translate(${point.x},${point.y}) rotate(${angle + 90})`);
                const label = labelRefs.current[i];
                if (label) {
                    const offset = 22 * unit;
                    label.setAttribute(
                        "transform",
                        `translate(${point.x + nx * offset},${point.y + ny * offset})`,
                    );
                    const text = label.firstChild;
                    if (text) text.setAttribute("font-size", String((11 * unit).toFixed(2)));
                }
            });
        };

        placeMarkers();
        window.addEventListener("resize", placeMarkers);

        if (prefersReduced()) {
            if (lapRef.current) lapRef.current.style.opacity = "0";
            if (glowRef.current) glowRef.current.style.opacity = "0";
            if (filRef.current) filRef.current.style.opacity = "0";
            if (sparkRef.current) sparkRef.current.style.opacity = "0";
            markerRefs.current.forEach((m) => m && m.setAttribute("opacity", "1"));
            setDone(true);
            if (onComplete) onComplete();
            return () => window.removeEventListener("resize", placeMarkers);
        }

        let started = false;
        let startTime = 0;
        let finishedAt = 0;
        let complete = false;
        let lastLit = -1;
        let lastTick = 0;
        let unsubscribe = () => { };

        const apply = (head, coolT) => {
            if (lapRef.current) lapRef.current.style.strokeDasharray = `${head} ${L + 2}`;
            if (glowRef.current) glowRef.current.style.strokeDasharray = `${head} ${L + 2}`;
            if (filRef.current) {
                filRef.current.style.strokeDasharray = `26 ${L + 2}`;
                filRef.current.style.strokeDashoffset = String(Math.min(0, -(head - 26)));
            }
            const point = path.getPointAtLength(head);
            if (sparkRef.current) {
                sparkRef.current.setAttribute("cx", point.x);
                sparkRef.current.setAttribute("cy", point.y);
                sparkRef.current.style.opacity = "1";
            }
            let litUpTo = -1;
            markerLengths.forEach((len, i) => {
                const forced = i === cb.current.highlight;
                const lit = head >= len - 1 || forced;
                if (head >= len - 1) litUpTo = i;
                const marker = markerRefs.current[i];
                const flare = flareRefs.current[i];
                if (marker) marker.setAttribute("opacity", lit ? "1" : "0.18");
                if (flare) {
                    flare.style.opacity = lit ? String(1 - coolT) : "0";
                    flare.style.transform = `scale(${1 + coolT * 1.6})`;
                }
            });
            if (litUpTo > lastLit) {
                lastLit = litUpTo;
                if (cb.current.onMarker) cb.current.onMarker(litUpTo);
            }
            if (coolT > 0) {
                if (lapRef.current) lapRef.current.style.opacity = String(1 - coolT);
                if (glowRef.current) glowRef.current.style.opacity = String(0.55 * (1 - coolT));
                if (filRef.current) filRef.current.style.opacity = String(1 - coolT);
                if (sparkRef.current) sparkRef.current.style.opacity = String(1 - coolT);
            }
        };

        unsubscribe = subscribe(() => {
            const rect = wrap.getBoundingClientRect();
            const vh = window.innerHeight || 1;
            const progress = clamp((vh - rect.top) / (vh + rect.height * 0.4), 0, 1);

            if (!started) {
                if (progress < 0.35) return;
                started = true;
                startTime = performance.now();
                return;
            }
            if (complete) return;

            const elapsed = performance.now() - startTime;
            if (cb.current.onProgress && elapsed - lastTick > 60) {
                lastTick = elapsed;
                cb.current.onProgress(Math.min(DURATION, elapsed));
            }
            if (elapsed <= DURATION) {
                const p = clamp(elapsed / DURATION, 0, 1);
                // ease in/out overall, corners handled by the curvature weights
                const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
                apply(lengthAt(eased), 0);
            } else {
                if (!finishedAt) finishedAt = performance.now();
                const coolT = clamp((performance.now() - finishedAt) / COOL, 0, 1);
                apply(L, coolT);
                if (coolT >= 1) {
                    complete = true;
                    setDone(true);
                    if (cb.current.onProgress) cb.current.onProgress(DURATION);
                    if (onComplete) onComplete();
                    unsubscribe();
                }
            }
        });

        return () => {
            window.removeEventListener("resize", placeMarkers);
            unsubscribe();
        };
    }, [onComplete]);

    return (
        <div ref={wrapRef} className={`pointer-events-none ${className}`}>
            <svg
                viewBox="0 0 1200 700"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
                className="h-full w-full"
            >
                <defs>
                    <filter id="pf-lap-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="7" />
                    </filter>
                </defs>

                <path
                    ref={pathRef}
                    d="M232 168 C420 96 742 104 946 190 C1092 252 1112 386 986 448 C862 508 668 400 508 434 C352 466 206 512 178 418 C152 330 168 218 232 168 Z"
                    fill="none"
                    stroke="rgba(255,255,255,0.24)"
                    strokeWidth="1.4"
                    style={{ transition: done ? "stroke 600ms ease" : undefined, stroke: done ? "rgba(255,255,255,0.55)" : undefined }}
                />
                <path
                    ref={glowRef}
                    d="M232 168 C420 96 742 104 946 190 C1092 252 1112 386 986 448 C862 508 668 400 508 434 C352 466 206 512 178 418 C152 330 168 218 232 168 Z"
                    fill="none"
                    stroke="rgba(2,210,227,0.75)"
                    strokeWidth="8"
                    filter="url(#pf-lap-glow)"
                    opacity="0.55"
                    style={{ strokeDasharray: "0 9999" }}
                />
                <path
                    ref={lapRef}
                    d="M232 168 C420 96 742 104 946 190 C1092 252 1112 386 986 448 C862 508 668 400 508 434 C352 466 206 512 178 418 C152 330 168 218 232 168 Z"
                    fill="none"
                    stroke="#02d2e3"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ strokeDasharray: "0 9999" }}
                />
                <path
                    ref={filRef}
                    d="M232 168 C420 96 742 104 946 190 C1092 252 1112 386 986 448 C862 508 668 400 508 434 C352 466 206 512 178 418 C152 330 168 218 232 168 Z"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    style={{ strokeDasharray: "0 9999" }}
                />

                {MARKER_AT.map((f, i) => (
                    <g key={f} ref={(el) => (markerRefs.current[i] = el)} opacity="0.18">
                        <circle
                            ref={(el) => (flareRefs.current[i] = el)}
                            r="13"
                            fill="none"
                            stroke="#02d2e3"
                            strokeWidth="1"
                            style={{ opacity: 0, transformOrigin: "center" }}
                        />
                        <polygon points="0,-7 7,6 -7,6" fill="#02d2e3" />
                        <polygon points="0,-2.4 2.6,2 -2.6,2" fill="#0e0f14" />
                    </g>
                ))}

                {MARKER_AT.map((f, i) => (
                    <g key={`label-${f}`} ref={(el) => (labelRefs.current[i] = el)}>
                        <text
                            x="0"
                            y="0"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="11"
                            letterSpacing="1.4"
                            fill="rgba(255,255,255,0.8)"
                        >
                            {String(i + 1).padStart(2, "0")}
                        </text>
                    </g>
                ))}

                <circle ref={sparkRef} r="4" fill="#ffffff" opacity="0" />
            </svg>
        </div>
    );
}