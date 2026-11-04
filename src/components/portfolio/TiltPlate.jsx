import React, { useEffect, useRef, useState } from "react";
import { prefersReduced } from "@/lib/motion";

const MAX = 6;

/** Pointer tilt up to 6deg with a glare that follows the pointer; springs back on leave. */
export default function TiltPlate({ className = "", children }) {
    const ref = useRef(null);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        if (prefersReduced()) return;
        if (window.matchMedia("(pointer: coarse)").matches) return;
        setEnabled(true);
    }, []);

    const move = (event) => {
        const el = ref.current;
        if (!enabled || !el) return;
        const rect = el.getBoundingClientRect();
        const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2 || 1);
        const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2 || 1);
        el.style.transition = "transform 120ms ease-out";
        el.style.transform = `perspective(900px) rotateX(${(-dy * MAX).toFixed(2)}deg) rotateY(${(
            dx * MAX
        ).toFixed(2)}deg)`;
        el.style.setProperty("--mx", `${((dx + 1) * 50).toFixed(1)}%`);
        el.style.setProperty("--my", `${((dy + 1) * 50).toFixed(1)}%`);
    };

    const reset = () => {
        const el = ref.current;
        if (!el) return;
        el.style.transition = "transform 620ms cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    };

    return (
        <div
            ref={ref}
            onPointerMove={move}
            onPointerLeave={reset}
            className={`relative ${className}`}
            style={{ willChange: "transform" }}
        >
            {children}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity dur-250 group-hover/plate:opacity-100"
                style={{
                    background:
                        "radial-gradient(38% 42% at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.22), rgba(255,255,255,0) 70%)",
                }}
            />
        </div>
    );
}