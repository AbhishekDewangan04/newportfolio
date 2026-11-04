import React, { useRef, useState } from "react";
import SeamCanvas from "./SeamCanvas";
import ProjectRow from "./ProjectRow";
import ScrambleText from "./ScrambleText";
import { subscribe, clamp } from "@/lib/motion";

function RailProgress() {
    const fillRef = useRef(null);
    const squareRef = useRef(null);
    const hostRef = useRef(null);

    React.useEffect(() => {
        let last = -1;
        return subscribe(() => {
            const host = hostRef.current;
            if (!host) return;
            const rect = host.getBoundingClientRect();
            const vh = window.innerHeight || 1;
            const p = clamp((vh * 0.75 - rect.top) / (rect.height + vh * 0.25), 0, 1);
            if (Math.abs(p - last) < 0.002) return;
            last = p;
            if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
            if (squareRef.current) {
                squareRef.current.style.transform = `translate(-50%, -50%) rotate(${p * 1800}deg)`;
                squareRef.current.style.top = `${p * 100}%`;
            }
        });
    }, []);

    return (
        <div
            ref={hostRef}
            className="pointer-events-none absolute inset-y-0 left-1/2 z-[2] hidden w-px -translate-x-1/2 lg:block"
        >
            <div className="h-full w-px bg-[var(--pf-rail)]" />
            <div
                ref={fillRef}
                className="absolute inset-x-0 top-0 h-full w-px origin-top bg-white/70"
                style={{ transform: "scaleY(0)" }}
            />
            <div
                ref={squareRef}
                className="absolute left-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 bg-[var(--pf-accent)]"
                style={{ top: "0%" }}
            />
        </div>
    );
}

export default function Projects({ projects = [] }) {
    const [hovered, setHovered] = useState(-1);
    const list = projects.slice(0, 7);

    if (!list.length) {
        return null;
    }

    return (
        <section
            id="projects"
            data-seam-host
            data-nav-tone="dark"
            className="relative z-20 overflow-hidden bg-[var(--surface-black)] text-[var(--pf-on-dark)]"
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[34svh]">
                <SeamCanvas tone="light" className="h-full w-full" />
            </div>

            <div className="relative mx-auto max-w-[1440px] px-5 pb-24 pt-[16svh] md:px-9">
                <div className="flex justify-end">
                    <div className="text-right">
                        <h2 className="pf-display pf-masthead text-[var(--pf-accent)]">
                            <ScrambleText text="PROJECTS" />
                            <span className="text-[var(--pf-on-dark)]">.</span>
                        </h2>
                        <p className="pf-label mt-3 text-[rgb(255_255_255_/_0.4)]">
                            {String(list.length).padStart(2, "0")} builds
                        </p>
                    </div>
                </div>

                <div className="relative mt-16">
                    <RailProgress />

                    <div className="space-y-16 lg:space-y-24">
                        {list.map((project, index) => (
                            <div
                                key={project.id}
                                onMouseEnter={() => setHovered(index)}
                                onMouseLeave={() => setHovered(-1)}
                            >
                                <ProjectRow
                                    project={project}
                                    index={index}
                                    dimmed={hovered !== -1 && hovered !== index}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
