import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const SECTIONS = [
    {
        title: "What this site collects",
        body: [
            "Contact form: your name, email address and message. The form sends this to the site owner by email through Resend. Nothing else is requested, and no email address or phone number is published anywhere on this site.",
            "AI assistant: the text you type is sent to Anthropic's API to generate an answer. The site itself does not store those messages or the conversation.",
            "Hosting and serverless functions run on Vercel, which keeps standard server logs. No analytics, ads, tracking pixels, or marketing cookies are used on this site; only a session-storage flag remembers that the intro animation has already played.",
        ],
    },
    {
        title: "Why it is processed",
        body: [
            "Contact form details are used only to read and reply to your enquiry. They are never used for marketing and never sold.",
            "AI assistant messages are used only to answer the question you asked in that session.",
        ],
    },
    {
        title: "How long it is kept",
        body: [
            "Contact messages are kept only as long as needed to reply, and deleted on request.",
            "AI assistant messages are not stored by this site and are not retained as a conversation history.",
        ],
    },
    {
        title: "Who can see it",
        body: [
            "Messages go to the owner's email inbox only; service providers (Vercel, Resend, Anthropic) process data only to run the site.",
            "There is no database and no admin or sign-in on this site.",
        ],
    },
    {
        title: "Deletion requests",
        body: [
            "You can ask for a message you sent to be deleted at any time by sending a new message through the contact form on the home page and mentioning the earlier enquiry. It will be deleted from the owner's email inbox.",
        ],
    },
    {
        title: "No sale of data",
        body: [
            "Your data is never sold, rented, or shared for advertising. Contact messages received by email are used solely to reply to your enquiry, and there are no third-party trackers on this site.",
        ],
    },
];

export default function Legal() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#f7fafb] text-[var(--pf-fg)]">
            <header className="border-b border-[rgb(9_10_11_/_0.12)]">
                <div className="mx-auto flex max-w-[900px] items-center justify-between gap-6 px-5 py-5 md:px-8">
                    <Link to="/" className="pf-display text-[15px] tracking-[0.03em]">
                        A<span className="text-[var(--pf-accent)]">/</span>D
                    </Link>
                    <Link to="/" className="pf-underline pf-label text-[rgb(9_10_11_/_0.6)]">
                        Back to portfolio
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-[900px] px-5 pb-24 pt-14 md:px-8">
                <p className="pf-label text-[var(--pf-accent)]">Legal</p>
                <h1 className="pf-display pf-masthead mt-3">PRIVACY &amp; DATA</h1>
                <p className="pf-body mt-4 max-w-[560px] text-[rgb(9_10_11_/_0.6)]">
                    Plain-language notes on what this site does with the information you choose to send.
                </p>

                <div className="mt-12 space-y-10">
                    {SECTIONS.map((section) => (
                        <section key={section.title}>
                            <h2 className="pf-display text-[20px] uppercase tracking-[0.02em]">{section.title}</h2>
                            <span className="mt-3 block h-px w-16 bg-[var(--pf-accent)]" />
                            <div className="mt-4 space-y-3">
                                {section.body.map((paragraph) => (
                                    <p key={paragraph} className="pf-body text-[rgb(9_10_11_/_0.7)]">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="mt-14 border border-[rgb(9_10_11_/_0.12)] bg-white/70 p-6">
                    <p className="pf-label text-[rgb(9_10_11_/_0.45)]">Contact</p>
                    <p className="pf-body mt-2 text-[rgb(9_10_11_/_0.7)]">
                        All contact happens through the secure form on the{" "}
                        <Link to="/" className="underline">
                            home page
                        </Link>
                        . No email address or phone number is published on this site by design.
                    </p>
                    <p className="pf-label mt-4 text-[rgb(9_10_11_/_0.4)]">Last updated · November 2026</p>
                </div>
            </main>
        </div>
    );
}