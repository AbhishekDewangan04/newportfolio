import React, { useEffect, useRef, useState } from "react";
import { prefersReduced } from "@/lib/motion";

/** Intro veil: silhouette fills, meter creeps to 70%, snaps to 100%, then lifts. */
export default function Loader({ onDone }) {
    const [progress, setProgress] = useState(0);
    const [lifting, setLifting] = useState(false);
    const [hidden, setHidden] = useState(false);
    const readyRef = useRef(false);
    const doneRef = useRef(false);

    useEffect(() => {
        const start = performance.now();
        const reduce = prefersReduced();
        let raf = null;
        let snapStart = null;

        const finish = () => {
            if (doneRef.current) return;
            doneRef.current = true;
            setLifting(true);
            window.setTimeout(() => {
                setHidden(true);
                if (onDone) onDone();
            }, 300);
        };

        const tick = () => {
            const elapsed = performance.now() - start;
            if (readyRef.current) {
                if (snapStart === null) snapStart = performance.now();
                const p = Math.min(1, (performance.now() - snapStart) / 220);
                setProgress(70 + p * 30);
                if (p >= 1) {
                    window.setTimeout(finish, reduce ? 60 : 430);
                    return;
                }
            } else {
                setProgress(Math.min(70, (elapsed / 1250) * 70));
            }
            raf = requestAnimationFrame(tick);
        };

        const markReady = () => {
            readyRef.current = true;
        };

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => window.setTimeout(markReady, 380));
        }
        window.setTimeout(markReady, 1400);
        raf = requestAnimationFrame(tick);

        const hardStop = window.setTimeout(() => {
            setProgress(100);
            finish();
        }, 3000);

        return () => {
            if (raf) cancelAnimationFrame(raf);
            window.clearTimeout(hardStop);
        };
    }, [onDone]);

    if (hidden) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className={`fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden bg-[#f7fafb] transition-opacity duration-300 ${lifting ? "pointer-events-none opacity-0" : "opacity-100"
                }`}
        >
            <div
                className="absolute inset-x-0 top-0 overflow-hidden"
                style={{ height: `${progress}%`, transition: "height 180ms linear" }}
            >
                <div className="absolute inset-x-0 bottom-0 flex justify-center">
                    <svg
                        viewBox="0 0 400 900"
                        className="h-[60vh] w-auto opacity-[0.14]"
                        aria-hidden="true"
                        preserveAspectRatio="xMidYMax meet"
                    >
                        <path
                            d="M200 80 C144 80 104 124 104 184 C104 226 120 262 146 282 L146 310 C92 324 48 354 24 398 C2 439 -8 490 -8 546 L-8 900 L408 900 L408 546 C408 490 398 439 376 398 C352 354 308 324 254 310 L254 282 C280 262 296 226 296 184 C296 124 256 80 200 80 Z"
                            fill="#090a0b"
                        />
                    </svg>
                </div>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-4">
                <span className="pf-display text-[clamp(30px,4vw,56px)] tracking-[0.02em] text-[#090a0b]">
                    ABHISHEK DEWANGAN
                </span>
                <div className="h-[4px] w-[220px] bg-[#dfe5e9]">
                    <div
                        className="h-full bg-[#02d2e3] transition-[width] duration-150 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="pf-label text-[rgb(9_10_11_/_0.45)]">
                    Loading {Math.round(progress)}%
                </span>
            </div>
        </div>
    );
}