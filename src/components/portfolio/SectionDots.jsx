import React, { useEffect, useState } from "react";
import { subscribe } from "@/lib/motion";
import { scrollToAnchor } from "@/lib/smoothScroll";

const SECTIONS = [
    { id: "top", label: "Top" },
    { id: "work", label: "Work so far" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
];

export default function SectionDots() {
    const [present, setPresent] = useState([]);
    const [active, setActive] = useState("top");

    useEffect(() => {
        const found = SECTIONS.filter((s) => document.getElementById(s.id));
        setPresent(found);
        let last = "";
        return subscribe(() => {
            const mid = window.scrollY + window.innerHeight * 0.5;
            let current = found[0] ? found[0].id : "top";
            found.forEach((s) => {
                const el = document.getElementById(s.id);
                if (el && el.getBoundingClientRect().top + window.scrollY <= mid) current = s.id;
            });
            if (current !== last) {
                last = current;
                setActive(current);
            }
        });
    }, []);

    if (!present.length) return null;

    return (
        <ul className="fixed right-[14px] top-1/2 z-[70] hidden -translate-y-1/2 flex-col items-end gap-3 sm:flex">
            {present.map((s) => (
                <li key={s.id}>
                    <button
                        type="button"
                        onClick={() => scrollToAnchor(`#${s.id}`)}
                        aria-label={`Go to ${s.label}`}
                        aria-current={active === s.id ? "true" : undefined}
                        className="group flex items-center gap-2 py-1"
                    >
                        <span className="pointer-events-none whitespace-nowrap bg-[rgba(9,10,11,0.78)] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                            {s.label}
                        </span>
                        <span
                            className={`h-[6px] w-[6px] rounded-full transition-all duration-200 ${active === s.id
                                    ? "scale-125 bg-[var(--pf-accent)]"
                                    : "bg-[var(--pf-map-dot)] group-hover:bg-white"
                                }`}
                        />
                    </button>
                </li>
            ))}
        </ul>
    );
}