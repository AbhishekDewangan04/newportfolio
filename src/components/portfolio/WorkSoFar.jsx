import React, { useCallback, useRef, useState } from "react";
import SeamCanvas from "./SeamCanvas";
import HalftoneCanvas from "./HalftoneCanvas";
import TrackLap from "./TrackLap";
import LapBoard from "./LapBoard";
import Globe from "./Globe";
import ScrambleText from "./ScrambleText";
import { useInView } from "./SplitText";

const LAP_MS = 6000;

export default function WorkSoFar({ stats, projects = [] }) {
    const [lapDone, setLapDone] = useState(false);
    const [lapMs, setLapMs] = useState(0);
    const [passed, setPassed] = useState(-1);
    const [hovered, setHovered] = useState(-1);
    const handleComplete = useCallback(() => setLapDone(true), []);
    const handleMarker = useCallback((index) => setPassed(index), []);
    const headRef = useRef(null);
    const ruleRef = useRef(null);
    const inView = useInView(headRef, { threshold: 0.3 });

    const board = projects.slice(0, 4);
    const lit = hovered >= 0 ? hovered : passed;
    const timer = lapDone ? "LAP 6.000" : (Math.min(LAP_MS, lapMs) / 1000).toFixed(3);

    const rows = [
        stats.projects > 0 ? { label: "Projects shipped", value: String(stats.projects).padStart(2, "0") } : null,
        stats.technologies > 0
            ? { label: "Technologies", value: String(stats.technologies).padStart(2, "0") }
            : null,
        stats.years > 0 ? { label: "Years coding", value: String(stats.years) } : null,
    ].filter(Boolean);

    return (
        <section
            id="work"
            data-seam-host
            data-nav-tone="dark"
            className="relative z-[15] min-h-[100svh] overflow-hidden bg-[#0e0f14] text-[var(--pf-on-dark)]"
        >
            <div className="pointer-events-none absolute inset-0 opacity-60">
                <div className="pf-grid-lines absolute inset-0" />
            </div>

            <HalftoneCanvas enabled={lapDone} className="opacity-70" />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-[62%] top-[46%] hidden h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 md:block">
                    {[320, 210, 118].map((size) => (
                        <div
                            key={size}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgb(255_255_255_/_0.09)]"
                            style={{ width: size, height: size }}
                        />
                    ))}
                    <div className="pf-ping absolute left-1/2 top-1/2 h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--pf-accent)]" />
                </div>
            </div>

            <TrackLap
                onComplete={handleComplete}
                onProgress={setLapMs}
                onMarker={handleMarker}
                highlight={hovered}
                className="absolute hidden lg:bottom-[14svh] lg:right-[2%] lg:top-[29svh] lg:block lg:w-[60%]"
            />

            <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[34svh]">
                <SeamCanvas tone="light" className="h-full w-full" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-between px-5 pb-10 pt-24 md:px-9 md:pb-20 md:pt-24">
                <div ref={headRef} className="max-w-[560px]">
                    <h2 className="pf-display pf-masthead text-[var(--pf-accent)]">
                        <ScrambleText text="THE WORK SO FAR" />
                        <span className="text-[var(--pf-on-dark)]">.</span>
                    </h2>
                    <div
                        ref={ruleRef}
                        className="pf-rule mt-6 h-px w-[190px] origin-left bg-[var(--pf-accent)] transition-transform dur-900 ease-out"
                        style={{ transform: inView ? "scaleX(1)" : "scaleX(0)" }}
                    />

                    {board.length ? (
                        <div className="mt-10 w-full max-w-[420px] lg:max-w-[320px]">
                            <LapBoard projects={board} lit={lit} onHover={setHovered} className="w-full" />
                        </div>
                    ) : null}
                </div>

                {rows.length ? (
                    <div className="pointer-events-auto mt-8 self-start md:absolute md:bottom-16 md:right-9 md:mt-0">
                        <div
                            data-chat-avoid
                            className="pf-chamfer w-[268px] bg-[var(--surface-black)] p-5 ring-1 ring-inset ring-[rgb(255_255_255_/_0.14)]"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <p className="pf-label text-[rgb(255_255_255_/_0.42)]">Standings</p>
                                        <p
                                            className="pf-label shrink-0 whitespace-nowrap tabular-nums text-[var(--pf-accent)]"
                                            aria-live="off"
                                        >
                                            {timer}
                                        </p>
                                    </div>
                                    {rows.map((row) => (
                                        <div
                                            key={row.label}
                                            className="flex items-baseline justify-between gap-4 border-b border-[rgb(255_255_255_/_0.08)] pb-2 last:border-0 last:pb-0"
                                        >
                                            <span className="pf-label text-[rgb(255_255_255_/_0.55)]">{row.label}</span>
                                            <span className="pf-figure text-[var(--pf-on-dark)]">{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <Globe size={58} className="mt-1 shrink-0 opacity-90" />
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}