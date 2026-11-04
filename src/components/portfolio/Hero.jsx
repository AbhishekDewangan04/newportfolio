import React, { useEffect, useRef, useState } from "react";
import ContourCanvas from "./ContourCanvas";
import LiquidReveal from "./LiquidReveal";
import Loader from "./Loader";
import PortraitSlot from "./PortraitSlot";
import SplitText from "./SplitText";
import useSpringTransform from "@/lib/useSpringTransform";
import useMagnetic from "@/lib/useMagnetic";
import ScrollCue from "./ScrollCue";
import { prefersReduced } from "@/lib/motion";

const ARROW = "\u2192";

export default function Hero({ profile, projectCount = 0, techCount = 0, onOpenChat, chatAvailable = true }) {
    const introSeen = useRef(
        typeof window !== "undefined" && sessionStorage.getItem("pf-intro") === "1",
    );
    const [loaded, setLoaded] = useState(introSeen.current);
    const portraitRef = useRef(null);
    const viewRef = useRef(null);
    const askRef = useRef(null);
    const resumeRef = useRef(null);

    useEffect(() => {
        if (introSeen.current) return undefined;
        if (prefersReduced()) {
            sessionStorage.setItem("pf-intro", "1");
            setLoaded(true);
            return undefined;
        }
        return undefined;
    }, []);

    useEffect(() => {
        if (prefersReduced()) return undefined;
        const host = portraitRef.current;
        if (!host) return undefined;
        const onMove = (e) => {
            const rect = host.getBoundingClientRect();
            const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
            const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
            host.style.setProperty("--lx", `${((dx + 0.5) * 100).toFixed(1)}%`);
            host.style.setProperty("--ly", `${((dy + 0.5) * 100).toFixed(1)}%`);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, []);

    useMagnetic(viewRef);
    useMagnetic(askRef);
    useMagnetic(resumeRef);

    useSpringTransform(portraitRef, () => {
        const vh = window.innerHeight || 1;
        const p = Math.min(1, Math.max(0, window.scrollY / vh));
        return (0.5 - p) * 48;
    });

    const handleLoaded = () => {
        sessionStorage.setItem("pf-intro", "1");
        setLoaded(true);
    };

    const socials = [
        { label: "GitHub", url: profile?.githubUrl },
        { label: "LinkedIn", url: profile?.linkedinUrl },
        { label: "X", url: profile?.xUrl },
    ].filter((s) => s.url && s.url.startsWith("https://"));

    const hasBuilding = Boolean(profile?.buildingProject);
    const hasStats = projectCount > 0 || techCount > 0 || Boolean(profile?.yearsCoding);
    const name = profile?.fullName || "Abhishek Dewangan";
    const hasPortrait = Boolean(profile?.portraitUrl || profile?.neonPortraitUrl);
    const parts = name.split(" ");
    const first = parts[0] || "Abhishek";
    const rest = parts.slice(1).join(" ") || "Dewangan";

    return (
        <>
            {!introSeen.current ? <Loader onDone={handleLoaded} /> : null}

            <section
                id="top"
                data-nav-tone="light"
                className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-[#f7fafb]"
            >
                <ContourCanvas
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    color="rgba(9, 10, 11, 0.08)"
                    cells={60}
                />

                <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
                    <div className="absolute bottom-0 left-1/2 h-[78%] -translate-x-1/2 sm:h-[82%] lg:left-[57%]">
                        <div
                            ref={portraitRef}
                            className="relative h-full w-[min(82vw,520px)]"
                            style={{
                                "--px": "0px",
                                "--py": "0px",
                                "--lx": "50%",
                                "--ly": "40%",
                                maskImage:
                                    "linear-gradient(to right, rgba(0,0,0,0) 0%, #000 9%, #000 91%, rgba(0,0,0,0) 100%), linear-gradient(to top, rgba(0,0,0,0) 0%, #000 30%)",
                                WebkitMaskImage:
                                    "linear-gradient(to right, rgba(0,0,0,0) 0%, #000 9%, #000 91%, rgba(0,0,0,0) 100%), linear-gradient(to top, rgba(0,0,0,0) 0%, #000 30%)",
                                maskComposite: "intersect",
                                WebkitMaskComposite: "source-in",
                            }}
                        >
                            <div className="relative h-full w-full will-change-transform">
                                {hasPortrait ? (
                                    <LiquidReveal
                                        baseUrl={profile?.portraitUrl}
                                        imageUrl={profile?.neonPortraitUrl}
                                        active={loaded}
                                        label="Abhishek Dewangan"
                                        className="pointer-events-none h-full w-full"
                                    />
                                ) : (
                                    <PortraitSlot
                                        url={null}
                                        fileName="portrait.png"
                                        className="h-full w-full"
                                    />
                                )}
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-70 mix-blend-soft-light"
                                    style={{
                                        background:
                                            "radial-gradient(38% 30% at var(--lx) var(--ly), rgba(255,255,255,0.95), rgba(255,255,255,0) 70%)",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <ScrollCue visible={loaded} />

                <div className="relative z-20 mx-auto flex h-full max-w-[1440px] flex-col px-5 pb-0 pt-[calc(var(--header-h)+16px)] md:px-9">
                    <div className="flex flex-1 flex-col justify-center gap-10 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full max-w-[640px]">
                            <div className="pointer-events-none absolute -inset-x-6 -inset-y-8 bg-gradient-to-r from-[#f7fafb] via-[#f7fafb]/92 to-transparent lg:-inset-x-10" />
                            <div className="relative">
                                <SplitText
                                    as="p"
                                    text={profile?.eyebrow || "dev_abhishek"}
                                    className="pf-eyebrow mb-4 block text-[rgb(9_10_11_/_0.45)]"
                                    by="letter"
                                    stagger={18}
                                    delay={60}
                                    start={loaded}
                                />

                                <h1 className="pf-display pf-name text-[var(--pf-fg)]">
                                    <span className="block">
                                        <SplitText text={first} by="word" stagger={110} delay={180} start={loaded} />
                                    </span>
                                    <span className="block text-[rgb(9_10_11_/_0.82)]">
                                        <SplitText text={rest} by="word" stagger={110} delay={300} start={loaded} />
                                    </span>
                                </h1>

                                <div className="mt-7 flex flex-col gap-2 border-l border-[rgb(9_10_11_/_0.14)] pl-4">
                                    {[
                                        "NIT Raipur · CSE",
                                        profile?.role || "Full Stack Web Developer",
                                        "C++ · JavaScript · Java",
                                    ].map((row, i) => (
                                        <p key={row} className="pf-body text-[rgb(9_10_11_/_0.66)]">
                                            <SplitText
                                                text={row}
                                                by="word"
                                                stagger={34}
                                                delay={520 + i * 90}
                                                start={loaded}
                                            />
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="hidden w-[300px] shrink-0 flex-col gap-4 lg:flex">
                            {hasBuilding ? (
                                <div className="pf-bracket bg-white/55 p-5 backdrop-blur-sm">
                                    <p className="pf-label text-[rgb(9_10_11_/_0.42)]">Currently building</p>
                                    <p className="pf-figure mt-3 text-[var(--pf-fg)]">{profile.buildingProject}</p>
                                    <p className="pf-label mt-2 text-[rgb(9_10_11_/_0.5)]">
                                        {[profile.buildingStatus, profile.buildingMonth].filter(Boolean).join(" · ")}
                                    </p>
                                </div>
                            ) : null}

                            {hasStats ? (
                                <div className="pf-bracket bg-white/55 p-5 backdrop-blur-sm">
                                    <p className="pf-label text-[rgb(9_10_11_/_0.42)]">In numbers</p>
                                    <dl className="mt-3 space-y-3">
                                        {projectCount > 0 ? (
                                            <div className="flex items-end justify-between gap-4 border-b border-[rgb(9_10_11_/_0.08)] pb-2">
                                                <dt className="pf-label text-[rgb(9_10_11_/_0.5)]">Projects</dt>
                                                <dd className="pf-figure text-[var(--pf-fg)]">
                                                    <SplitText
                                                        text={String(projectCount).padStart(2, "0")}
                                                        by="letter"
                                                        stagger={26}
                                                        delay={900}
                                                        start={loaded}
                                                    />
                                                </dd>
                                            </div>
                                        ) : null}
                                        {techCount > 0 ? (
                                            <div className="flex items-end justify-between gap-4 border-b border-[rgb(9_10_11_/_0.08)] pb-2">
                                                <dt className="pf-label text-[rgb(9_10_11_/_0.5)]">Technologies</dt>
                                                <dd className="pf-figure text-[var(--pf-fg)]">
                                                    <SplitText
                                                        text={String(techCount).padStart(2, "0")}
                                                        by="letter"
                                                        stagger={26}
                                                        delay={1000}
                                                        start={loaded}
                                                    />
                                                </dd>
                                            </div>
                                        ) : null}
                                        {profile?.yearsCoding ? (
                                            <div className="flex items-end justify-between gap-4">
                                                <dt className="pf-label text-[rgb(9_10_11_/_0.5)]">Years coding</dt>
                                                <dd className="pf-figure text-[var(--pf-fg)]">
                                                    <SplitText
                                                        text={String(profile.yearsCoding)}
                                                        by="letter"
                                                        stagger={26}
                                                        delay={1100}
                                                        start={loaded}
                                                    />
                                                </dd>
                                            </div>
                                        ) : null}
                                    </dl>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div
                        className="mt-6 flex flex-wrap items-end justify-between gap-5 border-t border-[rgb(9_10_11_/_0.12)] pb-[88px] pr-[88px] pt-4 transition-[opacity,transform] duration-700 ease-out"
                        style={{
                            opacity: loaded ? 1 : 0,
                            transform: loaded ? "translateY(0)" : "translateY(14px)",
                            transitionDelay: "1500ms",
                        }}
                    >
                        <a
                            ref={viewRef}
                            href="#projects"
                            className="pf-underline pf-label flex items-center gap-2 text-[var(--pf-fg)]"
                        >
                            <span aria-hidden="true">↓</span> View projects
                        </a>

                        <div className="flex flex-wrap items-center gap-5">
                            {onOpenChat && chatAvailable ? (
                                <button
                                    ref={askRef}
                                    type="button"
                                    onClick={onOpenChat}
                                    className="pf-underline pf-label hidden text-[rgb(9_10_11_/_0.6)] transition-colors hover:text-[var(--pf-fg)] sm:inline-flex"
                                >
                                    Ask my AI assistant
                                </button>
                            ) : null}
                            {profile?.resumeUrl && profile.resumeUrl.startsWith("https://") ? (
                                <a
                                    ref={resumeRef}
                                    href={profile.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="pf-label border-b border-[var(--pf-accent)] pb-1 text-[var(--pf-fg)]"
                                >
                                    Download resume
                                </a>
                            ) : null}
                            {socials.length ? (
                                <ul className="flex items-center gap-4">
                                    {socials.map((s) => (
                                        <li key={s.label}>
                                            <a
                                                href={s.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="pf-label text-[rgb(9_10_11_/_0.6)] transition-colors hover:text-[var(--pf-fg)]"
                                            >
                                                {s.label} <span aria-hidden="true">{ARROW}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
