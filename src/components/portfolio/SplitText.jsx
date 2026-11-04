import { useEffect, useRef, useState } from "react";
import { subscribe, prefersReduced, clamp } from "@/lib/motion";

/**
 * Damped-spring text reveal. Renders a visually-hidden plain copy for
 * assistive tech plus aria-hidden animated spans.
 */
export default function SplitText({
    text = "",
    as: Tag = "span",
    className = "",
    by = "word",
    stagger = 34,
    delay = 0,
    start = true,
    style,
    chunkClassName = "",
}) {
    const ref = useRef(null);
    const words = by === "letter" ? Array.from(text) : String(text).split(" ");

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const items = Array.from(el.querySelectorAll("[data-chunk]"));
        if (!items.length) return;

        if (prefersReduced() || !start) {
            items.forEach((item) => {
                item.style.transform = "translateY(0)";
                item.style.opacity = "1";
            });
            return;
        }

        const reduce = prefersReduced();
        if (reduce) return;

        const states = items.map(() => ({ p: 0, v: 0 }));
        const t0 = performance.now();
        let unsubscribe = () => { };

        unsubscribe = subscribe(() => {
            const elapsed = performance.now() - t0;
            let active = false;
            for (let i = 0; i < items.length; i += 1) {
                const s = states[i];
                if (s.p >= 0.999 && s.v === 0) continue;
                const target = elapsed >= delay + i * stagger ? 1 : 0;
                const accel = (target - s.p) * 170 - s.v * 26;
                s.v += accel * 0.016;
                s.p = clamp(s.p + s.v * 0.016, 0, 1.05);
                if (target === 1 && s.p >= 0.999) {
                    s.p = 1;
                    s.v = 0;
                }
                items[i].style.transform = `translateY(${(1 - s.p) * 0.35}em)`;
                items[i].style.opacity = String(clamp(s.p, 0, 1));
                if (!(target === 1 && s.p >= 1)) active = true;
            }
            if (!active) unsubscribe();
        });

        return unsubscribe;
    }, [text, by, stagger, delay, start]);

    return (
        <Tag ref={ref} className={className} style={style}>
            <span className="sr-only">{text}</span>
            <span aria-hidden="true">
                {words.map((word, i) => (
                    <span key={`${word}-${i}`}>
                        <span
                            data-chunk
                            className={`inline-block will-change-transform ${chunkClassName}`}
                            style={{ transform: "translateY(0.35em)", opacity: 0 }}
                        >
                            {word === " " ? "\u00A0" : word}
                        </span>
                        {by === "word" && i < words.length - 1 ? " " : null}
                    </span>
                ))}
            </span>
        </Tag>
    );
}

/** Fires once the element has been seen. */
export function useInView(ref, { threshold = 0.2, once = true } = {}) {
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (typeof IntersectionObserver === "undefined") {
            setInView(true);
            return;
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    if (once) io.disconnect();
                } else if (!once) {
                    setInView(false);
                }
            },
            { threshold },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [ref, threshold, once]);
    return inView;
}

/** Vertical parallax applied to `top` (never transform). Returns a ref. */
export function useParallax(distance = 60, { axis = "y", disabled = false } = {}) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (disabled || prefersReduced()) {
            el.style.top = "0px";
            return;
        }
        let visible = false;
        const io = new IntersectionObserver(([e]) => {
            visible = e.isIntersecting;
        });
        io.observe(el);
        let last = -1;
        const unsubscribe = subscribe(() => {
            if (!visible || document.hidden) return;
            const rect = el.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const progress = clamp((window.innerHeight / 2 - center) / window.innerHeight, -1, 1);
            const next = axis === "x" ? progress * distance : progress * distance;
            if (Math.abs(next - last) < 0.2) return;
            last = next;
            el.style.top = `${next.toFixed(2)}px`;
        });
        return () => {
            unsubscribe();
            io.disconnect();
        };
    }, [distance, axis, disabled]);
    return ref;
}