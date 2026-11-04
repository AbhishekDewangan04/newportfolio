import Lenis from "lenis";
import { subscribe, prefersReduced } from "@/lib/motion";

let lenis = null;

function headerOffset() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
    return parseFloat(raw) || 76;
}

/** In-page anchors land below the fixed bar, through Lenis when it is running. */
export function scrollToAnchor(hash) {
    if (!hash || hash.length < 2) return false;
    const el = document.querySelector(hash);
    if (!el) return false;
    const offset = -headerOffset();
    if (lenis) {
        lenis.scrollTo(el, { offset, duration: 1.1 });
        return true;
    }
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: prefersReduced() ? "auto" : "smooth" });
    return true;
}

/** Lenis on a mouse-driven, motion-friendly viewport; driven by the shared ticker. */
export function initSmoothScroll() {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse || prefersReduced()) return () => { };

    lenis = new Lenis({ lerp: 0.1, autoRaf: false });
    const off = subscribe(() => {
        if (lenis) lenis.raf(performance.now());
    });

    const onClick = (event) => {
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target.closest ? event.target.closest('a[href^="#"]') : null;
        if (!link) return;
        const hash = link.getAttribute("href");
        if (scrollToAnchor(hash)) {
            event.preventDefault();
            if (window.history.replaceState) window.history.replaceState(null, "", hash);
        }
    };
    document.addEventListener("click", onClick);

    return () => {
        document.removeEventListener("click", onClick);
        off();
        lenis.destroy();
        lenis = null;
    };
}