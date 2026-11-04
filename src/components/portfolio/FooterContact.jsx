import React, { useEffect, useRef, useState } from "react";
import ContourCanvas from "./ContourCanvas";
import PortraitSlot from "./PortraitSlot";
import SplitText, { useInView } from "./SplitText";
import Chamfer from "./Chamfer";
import { subscribe, clamp, prefersReduced } from "@/lib/motion";

const ARROW = "\u2197";

export default function FooterContact({ profile, hasExperience }) {
    const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
    const [state, setState] = useState("idle");
    const [error, setError] = useState("");
    const startedAt = useRef(Date.now());
    const figureRef = useRef(null);
    const navRef = useRef(null);
    const seen = useInView(navRef, { threshold: 0.2 });

    useEffect(() => {
        if (prefersReduced()) return undefined;
        let last = -1;
        return subscribe(() => {
            const el = figureRef.current;
            if (!el) return;
            const remaining = clamp(
                document.documentElement.scrollHeight - (window.scrollY + window.innerHeight),
                0,
                60,
            );
            if (Math.abs(remaining - last) < 0.3) return;
            last = remaining;
            el.style.transform = `translate3d(0, ${remaining.toFixed(1)}px, 0)`;
        });
    }, []);

    const navItems = [
        { label: "Projects", href: "#projects" },
        ...(hasExperience ? [{ label: "Experience", href: "#experience" }] : []),
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
        { label: "Legal", href: "/legal" },
    ];

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        if (state === "sending") return;

        const name = form.name.trim();
        const email = form.email.trim();
        const message = form.message.trim();

        if (name.length < 1 || name.length > 80) {
            setError("Please enter your name (80 characters or fewer).");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (message.length < 10 || message.length > 2000) {
            setError("Message must be between 10 and 2000 characters.");
            return;
        }

        setState("sending");
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    message,
                    website: form.website,
                    startedAt: startedAt.current,
                }),
            });
            const data = await response.json().catch(() => ({}));

            if (response.ok && data?.ok) {
                setState("sent");
                setForm({ name: "", email: "", message: "", website: "" });
            } else {
                setState("idle");
                setError(data?.error || "Something went wrong. Please try again later.");
            }
        } catch {
            setState("idle");
            setError("Something went wrong. Please try again later.");
        }
    };

    return (
        <footer
            id="contact"
            data-seam-host
            data-nav-tone="dark"
            className="relative z-20 overflow-hidden bg-[var(--pf-accent)] p-4"
            style={{ "--fig-w": "clamp(112px,16vw,232px)" }}
        >
            <div className="relative rounded-[16px] bg-[#07080a]">
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[16px]">
                    <ContourCanvas
                        className="h-full w-full opacity-60"
                        color="rgba(255,255,255,0.1)"
                        cells={40}
                    />
                </div>

                <div
                    ref={figureRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-[-16px] right-4 z-[11] hidden aspect-[3/4] w-[var(--fig-w)] sm:block lg:right-10"
                    style={{
                        transform: "translate3d(0,60px,0)",
                        maskImage:
                            "radial-gradient(72% 68% at 50% 56%, rgba(0,0,0,1) 44%, rgba(0,0,0,0) 100%)",
                        WebkitMaskImage:
                            "radial-gradient(72% 68% at 50% 56%, rgba(0,0,0,1) 44%, rgba(0,0,0,0) 100%)",
                    }}
                >
                    <PortraitSlot
                        url={profile?.footerFigureUrl}
                        alt=""
                        fileName="portrait.png"
                        width={1200}
                        height={1543}
                        className="h-full w-full opacity-85"
                        figureClassName="h-full w-full opacity-16"
                    />
                </div>

                <div className="relative z-10 px-5 pb-4 pt-14 text-[var(--pf-on-dark)] md:px-10 md:pt-20">
                    <div className="flex flex-wrap items-start justify-between gap-6">
                        <p className="pf-label text-[var(--pf-accent)]">Contact</p>
                        <h2 className="pf-display pf-masthead max-w-[720px] text-left md:text-right">
                            LET&apos;S BUILD{" "}
                            <span className="text-[var(--pf-accent)]">
                                TOGETHER<span className="text-[var(--pf-on-dark)]">.</span>
                            </span>
                        </h2>
                    </div>

                    <div className="mt-12 border-t border-[rgb(255_255_255_/_0.1)] pt-8 lg:grid lg:grid-cols-[minmax(0,220px)_minmax(0,460px)_minmax(0,1fr)] lg:items-start lg:gap-14">
                        <div ref={navRef}>
                            <nav aria-label="Footer">
                                <ul className="flex flex-col items-start gap-1">
                                    {navItems.map((item, i) => (
                                        <li key={item.href}>
                                            <a
                                                href={item.href}
                                                className="pf-display inline-block text-[36px] leading-[1.06] text-[var(--pf-on-dark)] transition-colors duration-200 hover:text-[var(--pf-accent)]"
                                            >
                                                <SplitText
                                                    text={item.label}
                                                    by="letter"
                                                    stagger={22}
                                                    delay={i * 80}
                                                    start={seen}
                                                />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                            <div className="mt-7 flex flex-wrap items-center gap-2.5">
                                {profile?.linkedinUrl?.startsWith("https://") ? (
                                    <Chamfer
                                        href={profile.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Abhishek on LinkedIn"
                                        variant="hollow"
                                        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pf-accent)]"
                                        innerClassName="px-3 py-2"
                                    >
                                        <span className="pf-label">
                                            LinkedIn <span aria-hidden="true">{ARROW}</span>
                                        </span>
                                    </Chamfer>
                                ) : null}
                                {profile?.githubUrl?.startsWith("https://") ? (
                                    <Chamfer
                                        href={profile.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Abhishek on GitHub"
                                        variant="hollow"
                                        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pf-accent)]"
                                        innerClassName="px-3 py-2"
                                    >
                                        <span className="pf-label">
                                            GitHub <span aria-hidden="true">{ARROW}</span>
                                        </span>
                                    </Chamfer>
                                ) : null}
                            </div>
                        </div>

                        <div className="mt-10 lg:mt-0">
                            <p className="pf-label text-[rgb(255_255_255_/_0.4)]">Message</p>
                            <div className="mt-4 border border-[rgb(255_255_255_/_0.12)] bg-[rgb(255_255_255_/_0.03)] p-6 backdrop-blur-sm sm:p-8">
                                <form onSubmit={submit} className="space-y-4">
                                    {/* Honeypot field - visually hidden */}
                                    <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
                                        <label htmlFor="website-field">Leave this empty</label>
                                        <input
                                            id="website-field"
                                            type="text"
                                            name="website"
                                            tabIndex={-1}
                                            autoComplete="off"
                                            value={form.website}
                                            onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="pf-name" className="pf-label block text-[rgb(255_255_255_/_0.45)]">
                                            Your name
                                        </label>
                                        <input
                                            id="pf-name"
                                            type="text"
                                            required
                                            maxLength={80}
                                            value={form.name}
                                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                            placeholder="Jane Doe"
                                            className="pf-body mt-2 w-full border-b border-[rgb(255_255_255_/_0.2)] bg-transparent py-2 text-[var(--pf-on-dark)] placeholder:text-[rgb(255_255_255_/_0.25)] focus:border-[var(--pf-accent)] focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="pf-email" className="pf-label block text-[rgb(255_255_255_/_0.45)]">
                                            Your email
                                        </label>
                                        <input
                                            id="pf-email"
                                            type="email"
                                            required
                                            maxLength={160}
                                            value={form.email}
                                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                            placeholder="jane@example.com"
                                            className="pf-body mt-2 w-full border-b border-[rgb(255_255_255_/_0.2)] bg-transparent py-2 text-[var(--pf-on-dark)] placeholder:text-[rgb(255_255_255_/_0.25)] focus:border-[var(--pf-accent)] focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="pf-msg" className="pf-label block text-[rgb(255_255_255_/_0.45)]">
                                            Message
                                        </label>
                                        <textarea
                                            id="pf-msg"
                                            rows={4}
                                            required
                                            minLength={10}
                                            maxLength={2000}
                                            value={form.message}
                                            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                                            placeholder="A project, an opportunity, or a hello."
                                            className="pf-body mt-2 w-full resize-y border-b border-[rgb(255_255_255_/_0.2)] bg-transparent py-2 text-[var(--pf-on-dark)] placeholder:text-[rgb(255_255_255_/_0.25)] focus:border-[var(--pf-accent)] focus:outline-none"
                                        />
                                    </div>

                                    {error ? (
                                        <p role="alert" className="pf-label text-[11px] text-[#ff7080]">
                                            {error}
                                        </p>
                                    ) : null}

                                    {state === "sent" ? (
                                        <p role="status" className="pf-label text-[11px] text-[var(--pf-accent)]">
                                            Message received. Thanks — I&apos;ll reply if a response is needed.
                                        </p>
                                    ) : null}

                                    <Chamfer type="submit" disabled={state === "sending"} className="w-full sm:w-auto">
                                        <span className="pf-label">
                                            {state === "sending" ? "Sending…" : "Send message"}
                                        </span>
                                        <span aria-hidden="true">{ARROW}</span>
                                    </Chamfer>

                                    <p className="text-[11px] leading-relaxed text-[rgb(255_255_255_/_0.38)]">
                                        Your name, email and message are processed only to reply to this enquiry,
                                        kept only as long as needed to reply, and deleted on request.
                                    </p>
                                </form>
                            </div>

                            <div className="mx-auto mt-12 w-full max-w-[460px]">
                                <p className="mt-6 text-center text-[11px] leading-relaxed text-[rgb(255_255_255_/_0.38)]">
                                    No newsletters. No third parties. Email and phone are never published — the form
                                    is the only way in.
                                </p>
                            </div>
                        </div>
                        <div aria-hidden="true" className="hidden lg:block" />
                    </div>

                    <div
                        data-chat-clear
                        className="mt-16 flex flex-wrap items-center justify-between gap-5 border-t border-[rgb(255_255_255_/_0.1)] pb-[88px] pr-[68px] pt-6 sm:pr-[calc(var(--fig-w)+24px)]"
                    >
                        <p className="pf-label text-[rgb(255_255_255_/_0.5)]">
                            © 2026 ABHISHEK DEWANGAN
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            <Chamfer href="/legal" variant="hollow" innerClassName="px-4 py-2.5">
                                <span className="pf-label">Legal documents</span>
                            </Chamfer>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
