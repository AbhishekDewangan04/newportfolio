import React, { useRef } from "react";
import SeamCanvas from "./SeamCanvas";
import ContourCanvas from "./ContourCanvas";
import PortraitSlot from "./PortraitSlot";
import SplitText, { useInView } from "./SplitText";
import Chamfer from "./Chamfer";
import ScrambleText from "./ScrambleText";
import useSpringTransform from "@/lib/useSpringTransform";

function StatRow({ label, value, seen, index }) {
    return (
        <div className="relative py-3">
            <span
                className="absolute inset-x-0 top-0 h-px origin-left bg-[rgb(9_10_11_/_0.14)] transition-transform duration-700 ease-out"
                style={{ transform: seen ? "scaleX(1)" : "scaleX(0)", transitionDelay: `${index * 90}ms` }}
            />
            <div className="flex items-baseline justify-between gap-6">
                <span className="pf-label text-[rgb(9_10_11_/_0.5)]">{label}</span>
                <span className="pf-figure text-[var(--pf-fg)]">{value}</span>
            </div>
        </div>
    );
}

function GlanceRow({ label, value }) {
    return (
        <div className="grid grid-cols-[92px_1fr] gap-3 border-b border-[rgb(9_10_11_/_0.08)] py-2.5 last:border-0">
            <span className="pf-label text-[rgb(9_10_11_/_0.42)]">{label}</span>
            <span className="pf-body text-[var(--pf-fg)]">{value}</span>
        </div>
    );
}

export default function About({ profile, education = [], onOpenChat, chatAvailable = true }) {
    const portraitRef = useRef(null);
    const bodyRef = useRef(null);
    const seen = useInView(bodyRef, { threshold: 0.15 });

    useSpringTransform(portraitRef, (p) => -48 * p);

    const current = education.find((e) => e.isCurrent);
    const class10 = education.find((e) => /10/.test(e.label || ""));
    const class12 = education.find((e) => /12/.test(e.label || ""));
    const batch = current?.yearRange ? (current.yearRange.match(/(\d{4})\s*$/)?.[1] || current.yearRange) : null;

    const glance = [
        current ? { label: "Degree", value: [current.label, current.institution].filter(Boolean).join(", ") } : null,
        current?.yearRange ? { label: "Batch", value: current.yearRange } : null,
        { label: "Languages", value: "C++, JavaScript, Java" },
        { label: "Beyond code", value: "Chess, badminton" },
    ].filter(Boolean);

    const stats = [
        profile?.semestersDone ? { label: "Semesters done", value: String(profile.semestersDone) } : null,
        class10?.score ? { label: "Class 10", value: class10.score } : null,
        class12?.score ? { label: "Class 12", value: class12.score } : null,
        batch ? { label: "Batch", value: batch } : null,
    ].filter(Boolean);

    const bio =
        profile?.bio ||
        "Hi, I'm Abhishek Dewangan, currently pursuing my B.Tech in Computer Science and Engineering at the National Institute of Technology Raipur, where I have completed my 4th semester. I love programming, especially in C++, JavaScript, and Java. Outside of coding, I enjoy playing chess and badminton, which helps me relax and stay active.";

    return (
        <section
            id="about"
            data-seam-host
            data-nav-tone="light"
            className="relative z-20 overflow-hidden bg-[#f7fafb] text-[var(--pf-fg)]"
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[34svh]">
                <SeamCanvas tone="dark" className="h-full w-full" />
            </div>
            <ContourCanvas
                className="pointer-events-none absolute inset-0 h-full w-full"
                color="rgba(9, 10, 11, 0.08)"
                cells={44}
            />

            <div className="relative mx-auto max-w-[1440px] px-5 pb-0 pt-[18svh] md:px-9">
                <h2 className="pf-display pf-masthead-lg text-[var(--pf-fg)]">
                    <ScrambleText text="ABOUT ME" />
                </h2>

                <div
                    ref={bodyRef}
                    className="relative mt-12 grid gap-12 bg-[#f7fafb] lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16"
                >
                    <div className="grid gap-10 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-start">
                        <div className="relative order-2 hidden sm:order-1 sm:block">
                            <div className="relative mx-auto h-[320px] w-[200px] overflow-visible">
                                <div
                                    ref={portraitRef}
                                    className="absolute inset-x-0 bottom-0"
                                    style={{
                                        maskImage: "linear-gradient(to bottom, #000 58%, rgba(0,0,0,0) 100%)",
                                        WebkitMaskImage: "linear-gradient(to bottom, #000 58%, rgba(0,0,0,0) 100%)",
                                    }}
                                >
                                    <PortraitSlot
                                        url={profile?.aboutPortraitUrl}
                                        alt="Abhishek Dewangan"
                                        fileName="portrait.png"
                                        width={1200}
                                        height={1543}
                                        className="h-[320px] w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="order-1 sm:order-2">
                            <p className="pf-body max-w-[560px] text-[rgb(9_10_11_/_0.72)]" style={{ fontSize: "15px", lineHeight: 1.75 }}>
                                <SplitText text={bio} by="word" stagger={16} start={seen} />
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                {chatAvailable && onOpenChat ? (
                                    <Chamfer variant="solid" onClick={onOpenChat} className="w-full sm:w-auto" innerClassName="px-6 py-3.5">
                                        <span className="pf-label">Ask my AI assistant</span>
                                        <span aria-hidden="true">→</span>
                                    </Chamfer>
                                ) : (
                                    <Chamfer variant="solid" href="#contact" className="w-full sm:w-auto" innerClassName="px-6 py-3.5">
                                        <span className="pf-label">Get in touch</span>
                                        <span aria-hidden="true">→</span>
                                    </Chamfer>
                                )}
                                {profile?.linkedinUrl ? (
                                    <Chamfer
                                        variant="ghost"
                                        href={profile.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full sm:w-auto"
                                        innerClassName="px-5 py-3.5 text-[rgb(9_10_11_/_0.7)]"
                                    >
                                        <span className="pf-label">LinkedIn</span>
                                        <span aria-hidden="true">↗</span>
                                    </Chamfer>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="grid gap-8">
                            <div className="border border-[rgb(9_10_11_/_0.12)] bg-white/70 p-6 backdrop-blur-sm">
                                <div className="flex items-center justify-between border-b border-[rgb(9_10_11_/_0.08)] pb-3">
                                    <p className="pf-label text-[rgb(9_10_11_/_0.4)]">At a glance</p>
                                    <p className="pf-mono text-[11px] text-[var(--pf-accent)]">01</p>
                                </div>
                                <div className="mt-4">
                                    {glance.map((item) => (
                                        <GlanceRow key={item.label} label={item.label} value={item.value} />
                                    ))}
                                </div>
                            </div>

                            {stats.length ? (
                                <div className="border border-[rgb(9_10_11_/_0.12)] bg-white/70 p-6 backdrop-blur-sm">
                                    <div className="flex items-center justify-between border-b border-[rgb(9_10_11_/_0.08)] pb-3">
                                        <p className="pf-label text-[rgb(9_10_11_/_0.4)]">Education details</p>
                                        <p className="pf-mono text-[11px] text-[var(--pf-accent)]">02</p>
                                    </div>
                                    <div className="mt-3">
                                        {stats.map((item, i) => (
                                            <StatRow
                                                key={item.label}
                                                label={item.label}
                                                value={item.value}
                                                seen={seen}
                                                index={i}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
