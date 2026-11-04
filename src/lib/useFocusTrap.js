import { useEffect } from "react";

/** Focus trap + Esc close + scroll lock for dialogs. */
export function useFocusTrap(active, containerRef, onClose) {
    useEffect(() => {
        if (!active) return undefined;
        const container = containerRef.current;
        if (!container) return undefined;
        const previouslyFocused = document.activeElement;
        const selector =
            'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
        const focusables = () =>
            Array.from(container.querySelectorAll(selector)).filter(
                (el) => el.offsetParent !== null || el === document.activeElement,
            );

        const first = focusables()[0];
        if (first) first.focus();

        const onKey = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
                return;
            }
            if (event.key !== "Tab") return;
            const list = focusables();
            if (!list.length) return;
            const firstEl = list[0];
            const lastEl = list[list.length - 1];
            if (event.shiftKey && document.activeElement === firstEl) {
                event.preventDefault();
                lastEl.focus();
            } else if (!event.shiftKey && document.activeElement === lastEl) {
                event.preventDefault();
                firstEl.focus();
            }
        };

        document.addEventListener("keydown", onKey);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
            if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
        };
    }, [active, containerRef, onClose]);
}

export default useFocusTrap;