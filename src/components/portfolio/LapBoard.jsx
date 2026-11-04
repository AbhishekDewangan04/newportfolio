import React from "react";
import { scrollToAnchor } from "@/lib/smoothScroll";

/** Left-hand lap board: one row per saved project, lit by the spark pass or by hover. */
export default function LapBoard({ projects = [], lit = -1, onHover, className = "" }) {
    if (!projects.length) return null;

    return (
        <div
            className={`pf-chamfer bg-[var(--surface-black)] p-4 ring-1 ring-inset ring-[rgb(255_255_255_/_0.14)] ${className}`}
        >
            <div className="flex items-baseline justify-between gap-3">
                <p className="pf-label text-[rgb(255_255_255_/_0.42)]">Lap board</p>
                <p className="pf-label text-[rgb(255_255_255_/_0.28)]">
                    {String(projects.length).padStart(2, "0")}
                </p>
            </div>

            <ul className="mt-3 space-y-0.5">
                {projects.map((project, i) => {
                    const on = lit === i;
                    const live = project.liveUrl && project.liveUrl.startsWith("https://");
                    return (
                        <li key={project.id}>
                            <a
                                href={`#project-${project.id}`}
                                onClick={(event) => {
                                    event.preventDefault();
                                    scrollToAnchor(`#project-${project.id}`);
                                }}
                                onPointerEnter={() => onHover && onHover(i)}
                                onPointerLeave={() => onHover && onHover(-1)}
                                className={`flex items-start gap-3 border-l-2 px-3 py-2 transition-colors dur-250 ${on
                                        ? "border-[var(--pf-accent)] bg-[rgb(2,210,227_/_0.07)]"
                                        : "border-[rgb(255_255_255_/_0.12)] hover:border-[rgb(255_255_255_/_0.35)]"
                                    }`}
                            >
                                <span
                                    className={`pf-label pt-[2px] ${on ? "text-[var(--pf-accent)]" : "text-[rgb(255_255_255_/_0.4)]"
                                        }`}
                                >
                                    P{i + 1}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span
                                        className={`block truncate text-[13px] ${on ? "text-white" : "text-[rgb(255_255_255_/_0.6)]"
                                            }`}
                                    >
                                        {project.title}
                                    </span>
                                    <span className="mt-1 flex items-center gap-2">
                                        {project.techStack && project.techStack[0] ? (
                                            <span className="pf-label text-[rgb(255_255_255_/_0.38)]">
                                                {project.techStack[0]}
                                            </span>
                                        ) : null}
                                        {live ? <span className="pf-label text-[var(--pf-accent)]">LIVE</span> : null}
                                    </span>
                                </span>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}