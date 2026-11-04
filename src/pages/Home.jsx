import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/portfolio/Header";
import Hero from "@/components/portfolio/Hero";
import WorkSoFar from "@/components/portfolio/WorkSoFar";
import Projects from "@/components/portfolio/Projects";
import Experience from "@/components/portfolio/Experience";
import About from "@/components/portfolio/About";
import FooterContact from "@/components/portfolio/FooterContact";
import Chatbot, { ChatLauncher } from "@/components/portfolio/Chatbot";
import SectionDots from "@/components/portfolio/SectionDots";
import { initSmoothScroll } from "@/lib/smoothScroll";
import { subscribe, clamp } from "@/lib/motion";

import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { education } from "@/data/education";
import { experiences } from "@/data/experience";

export default function Home() {
    const [chatOpen, setChatOpen] = useState(false);
    const [chatAvailable, setChatAvailable] = useState(false);

    const heroWrapRef = useRef(null);
    const heroInnerRef = useRef(null);
    const workWrapRef = useRef(null);
    const workInnerRef = useRef(null);

    useEffect(() => {
        let active = true;
        fetch("/api/chat")
            .then((res) => {
                if (res.ok) return res.json();
                return { available: false };
            })
            .then((data) => {
                if (active && data?.available) {
                    setChatAvailable(true);
                }
            })
            .catch(() => {
                if (active) setChatAvailable(false);
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => initSmoothScroll(), []);

    useEffect(() => {
        const applyCover = (el, p, phone) => {
            if (!el) return;
            if (phone) {
                el.style.transform = "none";
                el.style.filter = `brightness(${(1 - 0.55 * p).toFixed(3)})`;
                el.style.opacity = p > 0.985 ? "0" : "1";
            } else {
                el.style.transform = `scale(${(1 - 0.1 * p).toFixed(4)})`;
                el.style.filter = `brightness(${(1 - 0.55 * p).toFixed(3)})`;
                el.style.opacity = "1";
            }
        };

        let last1 = -1;
        let last2 = -1;
        return subscribe(() => {
            const phone = window.innerWidth < 640;
            const y = window.scrollY;
            const h1 = heroWrapRef.current?.offsetHeight || window.innerHeight;
            const h2 = workWrapRef.current?.offsetHeight || window.innerHeight;
            const p1 = clamp(y / Math.max(1, h1), 0, 1);
            const p2 = clamp((y - h1) / Math.max(1, h2), 0, 1);

            if (Math.abs(p1 - last1) > 0.002) {
                last1 = p1;
                applyCover(heroInnerRef.current, p1, phone);
            }
            if (Math.abs(p2 - last2) > 0.002) {
                last2 = p2;
                applyCover(workInnerRef.current, p2, phone);
            }
        });
    }, []);

    const techCount = useMemo(() => {
        const set = new Set();
        projects.forEach((p) => (p.techStack || []).forEach((t) => set.add(t)));
        experiences.forEach((e) => (e.techStack || []).forEach((t) => set.add(t)));
        return set.size;
    }, []);

    const stats = {
        projects: projects.length,
        technologies: techCount,
        years: profile.yearsCoding || 0,
    };

    const openChat = useCallback(() => {
        if (chatAvailable) setChatOpen(true);
    }, [chatAvailable]);

    return (
        <div className="relative min-h-screen bg-[#f7fafb]">
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-2 z-[60] hidden rounded-[18px] border border-[rgb(9_10_11_/_0.12)] xl:block"
            />

            <Header hasExperience={experiences.length > 0} />

            <main>
                <div ref={heroWrapRef} className="sticky top-0 z-10 h-[100svh] overflow-hidden">
                    <div ref={heroInnerRef} className="h-full w-full origin-center will-change-transform">
                        <Hero
                            profile={profile}
                            projectCount={projects.length}
                            techCount={techCount}
                            onOpenChat={chatAvailable ? openChat : undefined}
                            chatAvailable={chatAvailable}
                        />
                    </div>
                </div>

                <div ref={workWrapRef} className="sticky top-0 z-[15] h-[100svh] overflow-hidden">
                    <div
                        ref={workInnerRef}
                        className="h-full w-full origin-center will-change-transform"
                    >
                        <WorkSoFar stats={stats} projects={projects} />
                    </div>
                </div>

                <Projects projects={projects} />
                {experiences.length > 0 ? <Experience experiences={experiences} /> : null}
                <About
                    profile={profile}
                    education={education}
                    onOpenChat={chatAvailable ? openChat : undefined}
                    chatAvailable={chatAvailable}
                />
                <FooterContact profile={profile} hasExperience={experiences.length > 0} />
            </main>

            <SectionDots />
            {chatAvailable ? <ChatLauncher onClick={openChat} available={chatAvailable} /> : null}
            {chatAvailable ? <Chatbot open={chatOpen} onOpenChange={setChatOpen} /> : null}
        </div>
    );
}
