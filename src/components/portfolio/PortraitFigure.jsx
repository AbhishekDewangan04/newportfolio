import React from "react";

export const FIGURE_VIEW = { w: 400, h: 900 };

export const FIGURE_PATH =
    "M200 80 C144 80 104 124 104 184 C104 226 120 262 146 282 L146 310 C92 324 48 354 24 398 C2 439 -8 490 -8 546 L-8 900 L408 900 L408 546 C408 490 398 439 376 398 C352 354 308 324 254 310 L254 282 C280 262 296 226 296 184 C296 124 256 80 200 80 Z";

/**
 * Placeholder bust used until the real transparent cut-out is uploaded.
 * Purely decorative — the real asset replaces this via Profile.
 */
export default function PortraitFigure({ className = "", alt = "" }) {
    return (
        <svg
            viewBox={`0 0 ${FIGURE_VIEW.w} ${FIGURE_VIEW.h}`}
            preserveAspectRatio="xMidYMax meet"
            aria-hidden="true"
            role="presentation"
            className={className}
        >
            <defs>
                <linearGradient id="pf-fig-a" x1="0" y1="0" x2="0.25" y2="1">
                    <stop offset="0%" stopColor="#eef3f5" />
                    <stop offset="55%" stopColor="#dde5e9" />
                    <stop offset="100%" stopColor="#cfd9de" />
                </linearGradient>
                <radialGradient id="pf-fig-glow" cx="0.42" cy="0.22" r="0.6">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
                <pattern id="pf-fig-lines" width="26" height="14" patternUnits="userSpaceOnUse">
                    <path d="M0 7 Q6.5 1 13 7 T26 7" fill="none" stroke="#a9b8c0" strokeWidth="0.6" opacity="0.5" />
                </pattern>
                <clipPath id="pf-fig-clip">
                    <path d={FIGURE_PATH} />
                </clipPath>
            </defs>
            <path d={FIGURE_PATH} fill="url(#pf-fig-a)" />
            <g clipPath="url(#pf-fig-clip)">
                <rect x="0" y="0" width="400" height="900" fill="url(#pf-fig-lines)" />
                <rect x="0" y="0" width="400" height="900" fill="url(#pf-fig-glow)" />
                <path
                    d="M104 184 C104 264 150 300 200 300 C250 300 296 264 296 184"
                    fill="none"
                    stroke="#b9c6cd"
                    strokeWidth="1"
                />
                <path d="M146 340 C120 430 120 620 140 900" fill="none" stroke="#b9c6cd" strokeWidth="1" />
                <path d="M254 340 C280 430 280 620 260 900" fill="none" stroke="#b9c6cd" strokeWidth="1" />
            </g>
            {alt ? <title>{alt}</title> : null}
        </svg>
    );
}