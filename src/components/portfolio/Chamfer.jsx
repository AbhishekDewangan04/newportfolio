import React from "react";

/**
 * Chamfered plate: 1px accent stroke via a clipped outer shell, with the
 * accent flooding in from the left on hover (250ms).
 */
export default function Chamfer({
    children,
    href,
    onClick,
    type = "button",
    variant = "solid",
    className = "",
    innerClassName = "",
    disabled = false,
    ...rest
}) {
    const shell =
        variant === "hollow"
            ? "bg-[var(--pf-accent)]/70"
            : variant === "light"
                ? "bg-[#090a0b]/70"
                : "bg-[var(--pf-accent)]";

    const inner =
        variant === "hollow"
            ? "bg-transparent text-[var(--pf-on-dark)] group-hover:text-[#090a0b]"
            : variant === "light"
                ? "bg-[#f7fafb] text-[#090a0b] group-hover:text-[#090a0b]"
                : "bg-[#0e0f14] text-[var(--pf-on-dark)]";

    const content = (
        <>
            <span className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-[var(--pf-accent)] transition-transform dur-250 ease-out group-hover:scale-x-100" />
            <span className="relative z-10 flex items-center gap-2 transition-colors duration-200">
                {children}
            </span>
        </>
    );

    const classes = `pf-chamfer group relative block p-px transition-opacity duration-200 ${shell} ${disabled ? "opacity-40" : ""
        } ${className}`;

    const innerClasses = `pf-chamfer relative flex w-full items-center justify-center gap-2 overflow-hidden px-5 py-3 pf-label ${inner} ${innerClassName}`;

    if (href) {
        return (
            <a href={href} className={classes} {...rest}>
                <span className={innerClasses}>{content}</span>
            </a>
        );
    }

    return (
        <button type={type} onClick={onClick} disabled={disabled} className={classes} {...rest}>
            <span className={innerClasses}>{content}</span>
        </button>
    );
}