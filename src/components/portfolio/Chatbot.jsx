import React, { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useFocusTrap } from "@/lib/useFocusTrap";

const CHIPS = [
    "What are his projects?",
    "Tell me about his education",
    "What tech does he use?",
    "How can I contact him?",
];

const NOTICE = "Messages are processed by an AI service. Don't share sensitive info.";
const MAX_TURNS = 10;

export default function Chatbot({ open, onOpenChange }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const panelRef = useRef(null);
    const listRef = useRef(null);
    const close = useCallback(() => onOpenChange(false), [onOpenChange]);

    useFocusTrap(open, panelRef, close);

    useEffect(() => {
        if (!open) return;
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [open, messages, busy]);

    const turns = messages.filter((m) => m.role === "user").length;
    const limitReached = turns >= MAX_TURNS;

    const send = async (raw) => {
        const text = raw.trim();
        if (!text || busy || limitReached) return;
        if (text.length > 500) {
            setError("Please keep messages under 500 characters.");
            return;
        }
        setError("");
        setInput("");
        setMessages((prev) => [...prev, { role: "user", text }]);
        setBusy(true);
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: text }),
            });
            const data = await response.json().catch(() => ({}));
            const reply = data?.reply;
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text:
                        reply ||
                        "I don't have that information. You can use the contact form.",
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: "I couldn't answer that right now. You can use the contact form.",
                },
            ]);
        } finally {
            setBusy(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[130]">
            <div
                className="absolute inset-0 bg-[#090a0b]/60 backdrop-blur-[2px]"
                onClick={close}
                aria-hidden="true"
            />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="AI assistant"
                className="absolute inset-0 flex flex-col bg-[#0e0f14] text-[var(--pf-on-dark)] sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[85vh] sm:w-[420px] sm:rounded-[4px]"
            >
                <div className="pf-bracket relative m-2 flex flex-1 flex-col overflow-hidden p-4" style={{ "--bk": "var(--pf-accent)" }}>
                    <div className="flex items-start justify-between gap-4 border-b border-[rgb(255_255_255_/_0.1)] pb-3">
                        <div>
                            <p className="pf-label text-[var(--pf-accent)]">AI assistant</p>
                            <p className="pf-body mt-1 text-[13px] text-[var(--pf-on-dark-muted)]">
                                Answers only from Abhishek&apos;s profile.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={close}
                            aria-label="Close assistant"
                            className="pf-display flex h-8 w-8 shrink-0 items-center justify-center border border-[rgb(255_255_255_/_0.2)] text-[16px] leading-none transition-colors hover:border-[var(--pf-accent)] hover:text-[var(--pf-accent)]"
                        >
                            ×
                        </button>
                    </div>

                    <div ref={listRef} className="pf-scrollbar-none mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
                        {messages.length === 0 ? (
                            <p className="pf-body text-[13px] text-[var(--pf-on-dark-muted)]">
                                Ask about projects, education, tech stack, or how to get in touch.
                            </p>
                        ) : null}

                        {messages.map((message, i) => (
                            <div
                                key={`${message.role}-${i}`}
                                className={`max-w-[88%] px-3 py-2 text-[13px] leading-relaxed ${message.role === "user"
                                        ? "ml-auto border border-[var(--pf-accent)] bg-transparent text-white"
                                        : "bg-[rgb(255_255_255_/_0.06)] text-[var(--pf-on-dark-muted)]"
                                    }`}
                            >
                                <span className="whitespace-pre-wrap">{message.text}</span>
                            </div>
                        ))}

                        {busy ? (
                            <div className="flex w-[62px] items-center justify-center gap-1 bg-[rgb(255_255_255_/_0.05)] px-3 py-3">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--pf-accent)]" />
                                <span
                                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--pf-accent)]"
                                    style={{ animationDelay: "150ms" }}
                                />
                                <span
                                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--pf-accent)]"
                                    style={{ animationDelay: "300ms" }}
                                />
                                <span className="sr-only">Assistant is typing</span>
                            </div>
                        ) : null}
                    </div>

                    {messages.length === 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {CHIPS.map((chip) => (
                                <button
                                    key={chip}
                                    type="button"
                                    onClick={() => send(chip)}
                                    className="border border-[rgb(255_255_255_/_0.18)] px-2.5 py-1.5 text-left text-[11px] text-[var(--pf-on-dark-muted)] transition-colors hover:border-[var(--pf-accent)] hover:text-white"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    ) : null}

                    {error ? <p role="alert" className="pf-label mt-2 text-[11px] text-[#ff7080]">{error}</p> : null}

                    {limitReached ? (
                        <p className="pf-body mt-2 text-[11px] text-[var(--pf-on-dark-muted)]">
                            Turn limit reached for this session. Please use the contact form.
                        </p>
                    ) : (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                send(input);
                            }}
                            className="mt-3 flex items-center gap-2 border-t border-[rgb(255_255_255_/_0.1)] pt-3"
                        >
                            <input
                                type="text"
                                value={input}
                                maxLength={500}
                                disabled={busy}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question…"
                                aria-label="Question for assistant"
                                className="pf-body flex-1 bg-transparent text-[13px] text-white placeholder:text-[rgb(255_255_255_/_0.3)] focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={busy || !input.trim()}
                                className="pf-display border border-[var(--pf-accent)] bg-[var(--pf-accent)] px-3 py-1.5 text-[12px] font-medium tracking-[0.06em] text-[#090a0b] transition-opacity disabled:opacity-40"
                            >
                                Send
                            </button>
                        </form>
                    )}

                    <p className="mt-2 text-[10px] text-[rgb(255_255_255_/_0.35)]">{NOTICE}</p>
                </div>
            </div>
        </div>
    );
}

export function ChatLauncher({ onClick, available = true }) {
    const btnRef = useRef(null);
    const [past, setPast] = useState(false);
    const [scrolling, setScrolling] = useState(false);
    const [avoid, setAvoid] = useState(false);
    const [clear, setClear] = useState(false);

    useEffect(() => {
        if (!available) return undefined;
        let frame = 0;
        let stopTimer = 0;
        const measure = () => {
            frame = 0;
            const btn = btnRef.current;
            if (!btn) return;
            setPast(window.scrollY > window.innerHeight * 0.5);
            const box = btn.getBoundingClientRect();
            let hit = false;
            document.querySelectorAll("[data-chat-avoid]").forEach((el) => {
                const r = el.getBoundingClientRect();
                if (
                    r.bottom > box.top - 10 &&
                    r.top < box.bottom + 10 &&
                    r.right > box.left - 10 &&
                    r.left < box.right + 10
                ) {
                    hit = true;
                }
            });
            setAvoid(hit);
        };
        const onScroll = () => {
            setScrolling(true);
            window.clearTimeout(stopTimer);
            stopTimer = window.setTimeout(() => setScrolling(false), 260);
            if (!frame) frame = requestAnimationFrame(measure);
        };
        measure();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            window.clearTimeout(stopTimer);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [available]);

    if (!available) return null;

    const hidden = !past || clear || avoid;

    return (
        <button
            ref={btnRef}
            type="button"
            onClick={onClick}
            aria-label="Open AI assistant"
            aria-hidden={hidden}
            tabIndex={hidden ? -1 : 0}
            className={`pf-chamfer group fixed bottom-4 right-4 z-[80] flex items-center bg-[var(--pf-accent)] p-3 text-[#090a0b] shadow-[0_10px_30px_rgba(2,210,227,0.25)] transition-[opacity,transform] duration-200 hover:-translate-y-0.5 ${hidden
                    ? "pointer-events-none opacity-0"
                    : scrolling
                        ? "opacity-35 hover:opacity-100 focus-visible:opacity-100"
                        : "opacity-100"
                }`}
        >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            <span className="pf-label max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity,margin] duration-200 group-hover:ml-2 group-hover:max-w-[60px] group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-[60px] group-focus-visible:opacity-100">
                Ask AI
            </span>
        </button>
    );
}
