import React, { useEffect, useRef } from "react";
import { clamp, prefersReduced } from "@/lib/motion";

const STEP = 7.8;
const DOT = 1.75;

function organic(x, y, w, h) {
    const nx = (x / w) * 2 - 1;
    const ny = (y / h) * 2 - 1;
    const v =
        Math.sin(nx * 3.1 + 0.6) +
        Math.sin(ny * 2.4 - 0.4) +
        Math.sin((nx + ny) * 2.2) +
        Math.sin((nx - ny) * 1.7 + 1.1) +
        1.2;
    const edge = clamp(1 - Math.max(Math.abs(nx), Math.abs(ny)) * 0.9, 0, 1);
    return clamp((v - 0.55) / 1.4, 0, 1) * edge;
}

/** Halftone field with an organic shape, plus a lattice reticle that squares nearby dots. */
export default function HalftoneCanvas({ enabled = true, className = "" }) {
    const rootRef = useRef(null);
    const baseRef = useRef(null);
    const followerRef = useRef(null);
    const hArmRef = useRef(null);
    const vArmRef = useRef(null);
    const pointer = useRef({ x: -999, y: -999, idle: 0, active: false });

    useEffect(() => {
        const root = rootRef.current;
        const base = baseRef.current;
        if (!root || !base) return undefined;

        const paint = () => {
            const rect = root.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            base.width = Math.round(rect.width * dpr);
            base.height = Math.round(rect.height * dpr);
            const ctx = base.getContext("2d");
            if (!ctx) return;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, rect.width, rect.height);
            ctx.fillStyle = "rgba(122,122,122,0.55)";
            for (let y = STEP / 2; y < rect.height; y += STEP) {
                for (let x = STEP / 2; x < rect.width; x += STEP) {
                    const s = organic(x, y, rect.width, rect.height);
                    if (s <= 0.02) continue;
                    ctx.beginPath();
                    ctx.arc(x, y, DOT * (0.5 + s * 0.9), 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        paint();
        const ro = new ResizeObserver(paint);
        ro.observe(root);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const root = rootRef.current;
        if (!root || !enabled) return undefined;
        const follower = followerRef.current;
        const SIZE = 220;

        const onMove = (e) => {
            const rect = root.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            pointer.current.x = x;
            pointer.current.y = y;
            pointer.current.idle = performance.now();
            pointer.current.active = true;

            if (follower) {
                follower.style.transform = `translate3d(${x - SIZE / 2}px, ${y - SIZE / 2}px, 0)`;
                const ctx = follower.getContext("2d");
                if (ctx) {
                    const dpr = Math.min(window.devicePixelRatio || 1, 2);
                    if (follower.width !== SIZE * dpr) {
                        follower.width = SIZE * dpr;
                        follower.height = SIZE * dpr;
                    }
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                    ctx.clearRect(0, 0, SIZE, SIZE);
                    const left = x - SIZE / 2;
                    const top = y - SIZE / 2;
                    const startX = Math.floor(left / STEP) * STEP + STEP / 2;
                    const startY = Math.floor(top / STEP) * STEP + STEP / 2;
                    for (let gy = startY; gy < top + SIZE; gy += STEP) {
                        for (let gx = startX; gx < left + SIZE; gx += STEP) {
                            const d = Math.hypot(gx - x, gy - y);
                            if (d > 96) continue;
                            const a = 1 - d / 96;
                            ctx.fillStyle = `rgba(255,255,255,${(a * 0.75).toFixed(3)})`;
                            ctx.fillRect(gx - left - 1.4, gy - top - 1.4, 2.8, 2.8);
                        }
                    }
                }
            }

            if (hArmRef.current) {
                hArmRef.current.style.transform = `translate3d(${x - 70}px, ${y}px, 0) scaleX(0.18)`;
            }
            if (vArmRef.current) {
                vArmRef.current.style.transform = `translate3d(${x}px, ${y - 70}px, 0) scaleY(0.18)`;
            }

            window.clearTimeout(pointer.current.timer);
            pointer.current.timer = window.setTimeout(() => {
                if (hArmRef.current) {
                    hArmRef.current.style.transform = `translate3d(${x - 70}px, ${y}px, 0) scaleX(1)`;
                }
                if (vArmRef.current) {
                    vArmRef.current.style.transform = `translate3d(${x}px, ${y - 70}px, 0) scaleY(1)`;
                }
            }, 260);
        };

        const onLeave = () => {
            if (follower) follower.style.transform = "translate3d(-999px,-999px,0)";
            if (hArmRef.current) hArmRef.current.style.opacity = "0";
            if (vArmRef.current) vArmRef.current.style.opacity = "0";
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerleave", onLeave);
        return () => {
            window.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerleave", onLeave);
            window.clearTimeout(pointer.current.timer);
        };
    }, [enabled]);

    if (prefersReduced()) {
        return (
            <div ref={rootRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
                <canvas ref={baseRef} className="h-full w-full" />
            </div>
        );
    }

    return (
        <div ref={rootRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
            <canvas ref={baseRef} className="h-full w-full" />
            <div className="absolute inset-0 overflow-hidden">
                <canvas
                    ref={followerRef}
                    className="absolute left-0 top-0 h-[220px] w-[220px]"
                    style={{ transform: "translate3d(-999px,-999px,0)" }}
                />
                <div
                    ref={hArmRef}
                    className="absolute left-0 top-0 h-px w-[140px] bg-[rgb(255_255_255_/_0.55)] opacity-70 transition-transform duration-200 ease-out"
                    style={{ transform: "translate3d(-999px,-999px,0)" }}
                />
                <div
                    ref={vArmRef}
                    className="absolute left-0 top-0 h-[140px] w-px bg-[rgb(255_255_255_/_0.55)] opacity-70 transition-transform duration-200 ease-out"
                    style={{ transform: "translate3d(-999px,-999px,0)" }}
                />
            </div>
        </div>
    );
}