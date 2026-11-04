import { useEffect } from "react";

/** Pulls the element up to `strength` px toward the pointer — desktop, motion-friendly only. */
export default function useMagnetic(ref, strength = 6) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        if (window.matchMedia("(pointer: coarse)").matches) return undefined;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

        let frame = 0;
        const onMove = (event) => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = 0;
                const rect = el.getBoundingClientRect();
                const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width || 1);
                const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height || 1);
                const x = Math.max(-strength, Math.min(strength, dx * strength * 2));
                const y = Math.max(-strength, Math.min(strength, dy * strength * 2));
                el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
            });
        };
        const reset = () => {
            el.style.transform = "translate3d(0, 0, 0)";
        };

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", reset);
        return () => {
            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerleave", reset);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [ref, strength]);
}