import React, { useEffect, useState } from "react";
import { subscribe } from "@/lib/motion";

/** Bottom-centre scroll cue that fades on the first scroll. */
export default function ScrollCue({ visible = true }) {
    const [gone, setGone] = useState(false);

    useEffect(() => {
        return subscribe(() => {
            if (window.scrollY > 24) setGone(true);
        });
    }, []);

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-4 z-10 hidden justify-center transition-opacity dur-700 sm:flex"
            style={{ opacity: visible && !gone ? 0.7 : 0 }}
        >
            <span className="pf-label flex flex-col items-center gap-2 text-[rgb(9_10_11_/_0.5)]">
                scroll
                <span className="block h-6 w-px bg-[rgb(9_10_11_/_0.25)]" />
            </span>
        </div>
    );
}