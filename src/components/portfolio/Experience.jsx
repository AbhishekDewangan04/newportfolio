import React from "react";
import SeamCanvas from "./SeamCanvas";

const ARROW = "\u2197";

export default function Experience({ experiences = [] }) {
    if (!experiences.length) return null;

    return (
        <section
            id="experience"
            data-seam-host
            data-nav-tone="dark"
            className="relative z-20 overflow-hidden bg-[var(--surface-black)] text-[var(--pf-on-dark)]"
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[34svh]">
                <SeamCanvas tone="light" className="h-full w-full" />
            </div>

            <div className="relative mx-auto max-w-[1440px] px-5 pb-24 pt-[16svh] md:px-9">
                <div className="flex items-end justify-between gap-6">
                    <h2 className="pf-display pf-masthead text-[var(--pf-accent)]">
                        EXPERIENCE<span className="text-[var(--pf-on-dark)]">.</span>
                    </h2>
                    <p className="pf-label hidden text-[rgb(255_255_255_/_0.4)] sm:block">
                        {String(experiences.length).padStart(2, "0")} roles
                    </p>
                </div>

                <div className="relative mt-12">
                    <div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-[var(--pf-rail)] lg:block" />
                    <ol>
                        {experiences.map((item) => {
                            const live =
                                item.liveUrl && item.liveUrl.startsWith("https://") ? item.liveUrl : null;
                            const cert =
                                item.certUrl && item.certUrl.startsWith("https://") ? item.certUrl : null;
                            return (
                                <li
                                    key={item.id}
                                    className="relative border-t border-[rgb(255_255_255_/_0.07)] py-8"
                                >
                                    <div className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:gap-14">
                                        <div>
                                            <p className="pf-label text-[rgb(255_255_255_/_0.4)]">
                                                {[item.start, item.end].filter(Boolean).join(" — ")}
                                            </p>
                                            <h3 className="pf-display mt-2 text-[clamp(22px,2.2vw,30px)]">
                                                {item.role}
                                            </h3>
                                            <p className="pf-body mt-1 text-[var(--pf-accent)]">{item.org}</p>
                                        </div>
                                        <div className="space-y-4">
                                            {item.bullets?.length ? (
                                                <ul className="space-y-2">
                                                    {item.bullets.map((bullet) => (
                                                        <li
                                                            key={bullet}
                                                            className="pf-body flex gap-3 text-[var(--pf-on-dark-muted)]"
                                                        >
                                                            <span aria-hidden="true" className="mt-[7px] h-px w-3 shrink-0 bg-[var(--pf-accent)]" />
                                                            <span>{bullet}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : null}
                                            {item.techStack?.length ? (
                                                <ul className="flex flex-wrap gap-2">
                                                    {item.techStack.map((tech) => (
                                                        <li
                                                            key={tech}
                                                            className="border border-[rgb(255_255_255_/_0.18)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--pf-on-dark-muted)]"
                                                        >
                                                            {tech}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : null}
                                            {live || cert ? (
                                                <div className="flex flex-wrap items-center gap-5 pt-1">
                                                    {live ? (
                                                        <a
                                                            href={live}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="pf-underline pf-label text-[var(--pf-accent)]"
                                                        >
                                                            Live link <span aria-hidden="true">{ARROW}</span>
                                                        </a>
                                                    ) : null}
                                                    {cert ? (
                                                        <a
                                                            href={cert}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="pf-underline pf-label text-[var(--pf-on-dark)]"
                                                        >
                                                            Certificate <span aria-hidden="true">{ARROW}</span>
                                                        </a>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </div>
        </section>
    );
}