import React, { useEffect, useRef, useState } from "react";
import { prefersReduced } from "@/lib/motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+";

/** One-shot scramble on enter, cyan while it settles, final text exposed to AT. */
export default function ScrambleText({ text, duration = 600, className = "" }) {
    const hostRef = useRef(null);
    const [out, setOut] = useState(() => (prefersReduced() ? text : text.replace(/\S/g, "\u00a0")));
    const [flicker, setFlicker] = useState(!prefersReduced());

    useEffect(() => {
        if (prefersReduced()) {
            setOut(text);
            setFlicker(false);
            return undefined;
        }
        const host = hostRef.current;
        if (!host || typeof IntersectionObserver === "undefined") {
            setOut(text);
            setFlicker(false);
            return undefined;
        }

        let raf = 0;
        let done = false;
        const run = () => {
            const t0 = performance.now();
            const tick = (now) => {
                const p = Math.min(1, (now - t0) / duration);
                const settled = Math.floor(p * text.length);
                let next = "";
                for (let i = 0; i < text.length; i += 1) {
                    const ch = text[i];
                    if (ch === " ") next += " ";
                    else next += i < settled ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                }
                setOut(next);
                if (p < 1) raf = requestAnimationFrame(tick);
                else {
                    setOut(text);
                    setFlicker(false);
                }
            };
            raf = requestAnimationFrame(tick);
        };

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting || done) return;
                    done = true;
                    io.disconnect();
                    run();
                });
            },
            { threshold: 0.4 },
        );
        io.observe(host);

        return () => {
            io.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [text, duration]);

    return (
        <span ref={hostRef} aria-label={text} className={className}>
            <span aria-hidden="true" className={flicker ? "text-[var(--pf-accent)]" : undefined}>
                {out}
            </span>
        </span>
    );
}