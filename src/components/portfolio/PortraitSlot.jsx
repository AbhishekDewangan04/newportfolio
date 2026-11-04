import React, { useState } from "react";
import PortraitFigure from "./PortraitFigure";

/**
 * Shows the cut-out when present; otherwise a placeholder figure.
 */
export default function PortraitSlot({
    url,
    alt = "Abhishek Dewangan",
    fileName = "portrait.png",
    figureClassName = "h-full w-full",
    className = "",
    loading = "lazy",
    width,
    height,
}) {
    const [failed, setFailed] = useState(false);

    return (
        <div className={`relative ${className}`}>
            {url && !failed ? (
                <img
                    src={url}
                    alt={alt}
                    width={width}
                    height={height}
                    loading={loading}
                    decoding="async"
                    className="h-full w-full object-contain object-bottom"
                    onError={() => setFailed(true)}
                />
            ) : (
                <PortraitFigure className={figureClassName} />
            )}
            {failed ? (
                <p className="absolute bottom-2 left-2 border border-[rgb(9_10_11_/_0.15)] bg-[#f7fafb]/90 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[rgb(9_10_11_/_0.6)]">
                    Image failed to load · {fileName}
                </p>
            ) : null}
        </div>
    );
}
