import React, { useCallback, useEffect, useRef, useState } from "react";
import { subscribe, clamp } from "@/lib/motion";
import { useFocusTrap } from "@/lib/useFocusTrap";

const THEME = {
    shell: "border-[rgb(255_255_255_/_0.1)] bg-[var(--surface-black)]",
    brand: "text-white",
    sub: "text-[rgb(255_255_255_/_0.5)]",
    link: "text-[rgb(255_255_255_/_0.62)] hover:text-white",
    strong: "text-white",
    button: "border-[rgb(255_255_255_/_0.22)]",
    bar: "bg-white",
};

export default function Header({ hasExperience = false }) {
    const [open, setOpen] = useState(false);
    const [enter, setEnter] = useState(false);
    const barRef = useRef(null);
    const sheetRef = useRef(null);

    const close = useCallback(() => setOpen(false), []);
    useFocusTrap(open, sheetRef, close);

    useEffect(() => {
        if (!open) {
            setEnter(false);
            return undefined;
        }
        const id = requestAnimationFrame(() => setEnter(true));
        return () => cancelAnimationFrame(id);
    }, [open]);

    useEffect(() => {
        return subscribe(() => {
            const doc = document.documentElement;
            const max = Math.max(1, doc.scrollHeight - window.innerHeight);
            const p = clamp(window.scrollY / max, 0, 1);
            if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
        });
    }, []);

    const t = THEME;

    const items = [
        { label: "Projects", href: "#projects" },
        ...(hasExperience ? [{ label: "Experience", href: "#experience" }] : []),
        { label: "About", href: "#about" },

    ];

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-[90]">
                <div className="h-[2px] w-full bg-transparent">
                    <div
                        ref={barRef}
                        className="h-full w-full origin-left bg-[var(--pf-accent)]"
                        style={{ transform: "scaleX(0)" }}
                    />
                </div>
                <div
                    className={`border-b transition-colors dur-250 ease-out ${t.shell}`}
                >
                    <div className="mx-auto flex h-[var(--header-h)] max-w-[1440px] items-center justify-between gap-6 px-5 md:px-9">
                        <a href="#top" className="group flex items-baseline gap-2" aria-label="Back to top">
                            <span
                                className={`pf-display text-[15px] tracking-[0.03em] transition-colors dur-250 sm:text-[17px] ${t.brand}`}
                            >
                                A<span className="text-[var(--pf-accent)]">/</span>D
                            </span>
                            <span className={`pf-label hidden transition-colors dur-250 sm:inline ${t.sub}`}>
                                Abhishek Dewangan
                            </span>
                        </a>

                        <nav aria-label="Primary" className="hidden items-center gap-9 xl:flex">
                            {items.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className={`pf-underline pf-label transition-colors dur-250 ${t.link}`}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>

                        <a
                            href="#contact"
                            className={`pf-underline hidden pf-label transition-colors dur-250 xl:block ${t.strong}`}
                        >
                            [ Contact <span aria-hidden="true">→</span> ]
                        </a>

                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            aria-label="Open menu"
                            aria-expanded={open}
                            className={`flex h-10 w-10 items-center justify-center border transition-colors dur-250 hover:border-[var(--pf-accent)] xl:hidden ${t.button}`}
                        >
                            <span className="flex flex-col gap-[5px]">
                                <span className={`block h-[1.5px] w-5 transition-colors dur-250 ${t.bar}`} />
                                <span className={`block h-[1.5px] w-5 transition-colors dur-250 ${t.bar}`} />
                                <span className={`block h-[1.5px] w-3 transition-colors dur-250 ${t.bar}`} />
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {open ? (
                <div className="fixed inset-0 z-[110]">
                    <div
                        className="absolute inset-0 bg-[#090a0b]"
                        onClick={close}
                        aria-hidden="true"
                    />
                    <div
                        ref={sheetRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Site menu"
                        className="relative flex h-full flex-col justify-between px-6 pb-10 pt-6"
                    >
                        <div className="flex items-center justify-between">
                            <span className="pf-label text-[var(--pf-on-dark-muted)]">Menu</span>
                            <button
                                type="button"
                                onClick={close}
                                aria-label="Close menu"
                                className="pf-display flex h-10 w-10 items-center justify-center border border-[rgb(255_255_255_/_0.24)] text-[20px] leading-none text-white transition-colors hover:border-[var(--pf-accent)] hover:text-[var(--pf-accent)]"
                            >
                                ×
                            </button>
                        </div>
                        <nav aria-label="Primary mobile" className="flex flex-col gap-4">
                            {items.map((item, i) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    onClick={close}
                                    className="pf-display text-[clamp(34px,9vw,54px)] text-white transition-[transform,opacity,color] duration-500 ease-out hover:text-[var(--pf-accent)]"
                                    style={{
                                        transform: enter ? "translateY(0)" : "translateY(18px)",
                                        opacity: enter ? 1 : 0,
                                        transitionDelay: `${i * 70}ms`,
                                    }}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                        <p className="pf-label text-[var(--pf-on-dark-muted)]">
                            Raipur · Chhattisgarh · India
                        </p>
                    </div>
                </div>
            ) : null}
        </>
    );
}