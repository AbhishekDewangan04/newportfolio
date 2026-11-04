import React, { useEffect, useState } from "react";
import SplitText, { useParallax } from "./SplitText";
import TiltPlate from "./TiltPlate";

const ARROW = "\u2197";

function TechChips({ items = [] }) {
    if (!items.length) return null;
    return (
        <ul className="flex flex-wrap gap-2">
            {items.map((tech) => (
                <li
                    key={tech}
                    className="border border-[rgb(255_255_255_/_0.18)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--pf-on-dark-muted)]"
                >
                    {tech}
                </li>
            ))}
        </ul>
    );
}

export default function ProjectRow({ project, index, dimmed }) {
    const plateRef = useParallax(40);
    const copyRef = useParallax(90);
    const [settled, setSettled] = useState(false);

    useEffect(() => {
        const id = window.setTimeout(() => setSettled(true), 2200);
        return () => window.clearTimeout(id);
    }, []);

    const live = project.liveUrl && project.liveUrl.startsWith("https://") ? project.liveUrl : null;
    const repo =
        project.githubUrl && project.githubUrl.startsWith("https://") ? project.githubUrl : null;
    const number = String(index + 1).padStart(2, "0");

    return (
        <div
            id={`project-${project.id}`}
            className={`relative grid scroll-mt-[calc(var(--header-h)+24px)] grid-cols-1 border-t border-[rgb(255_255_255_/_0.07)] transition-opacity duration-500 lg:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] lg:items-center ${dimmed ? "opacity-30" : "opacity-100"
                }`}
        >
            <div ref={plateRef} className="relative" style={{ top: 0 }}>
                <TiltPlate className="group/plate pf-stepped pf-plate block overflow-hidden">
                    <div className="relative aspect-[710/462]">
                        {project.imageUrl ? (
                            <img
                                src={project.imageUrl}
                                alt={project.imageAlt || `${project.title} screenshot`}
                                width={710}
                                height={462}
                                loading="lazy"
                                decoding="async"
                                className="pf-plate-img absolute inset-0 block h-full w-full scale-[1.06] object-cover object-top transition-transform dur-900 ease-out group-hover/plate:scale-[1.02]"
                            />
                        ) : (
                            <div className="pf-chequer absolute inset-0" />
                        )}
                        <span className="pointer-events-none absolute inset-0 border border-transparent bg-[var(--pf-accent)]/0 transition-[inset,background-color] dur-700 ease-out group-hover/plate:inset-[5%] group-hover/plate:border-[var(--pf-accent)]/40 group-hover/plate:bg-[var(--pf-accent)]/10" />
                        <span className="pointer-events-none absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-[rgb(3_4_6_/_0.8)] via-[rgb(3_4_6_/_0.3)] to-transparent" />
                        <span
                            className="pointer-events-none absolute left-3 top-2 pf-display text-[clamp(38px,5vw,76px)] leading-none text-[var(--pf-accent)] drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] transition-opacity dur-900"
                            style={{ opacity: settled ? 0.4 : 1 }}
                        >
                            <SplitText text={number} by="letter" stagger={60} delay={140} />
                        </span>
                    </div>
                </TiltPlate>
            </div>

            <div aria-hidden="true" className="hidden lg:block" />

            <div
                ref={copyRef}
                className="relative flex max-w-[420px] flex-col gap-4 px-5 py-8 lg:px-0 lg:py-12"
                style={{ top: 0 }}
            >
                <p className="pf-label text-[rgb(255_255_255_/_0.35)]">
                    {index === 0 ? "Featured" : "Build"}
                </p>
                <h3 className="pf-display text-[clamp(24px,2.4vw,34px)] text-[var(--pf-on-dark)]">
                    {project.title}
                </h3>
                {project.description ? (
                    <p className="pf-body line-clamp-3 text-[var(--pf-on-dark-muted)]">{project.description}</p>
                ) : null}
                <TechChips items={project.techStack} />
                <div className="mt-1 flex flex-wrap items-center gap-5">
                    {repo ? (
                        <a
                            href={repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pf-underline pf-label text-[var(--pf-on-dark)]"
                        >
                            GitHub <span aria-hidden="true">{ARROW}</span>
                        </a>
                    ) : null}
                    {live ? (
                        <a
                            href={live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pf-underline pf-label text-[var(--pf-accent)]"
                        >
                            Live demo <span aria-hidden="true">{ARROW}</span>
                        </a>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
