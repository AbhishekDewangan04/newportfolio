import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#f7fafb] text-[var(--pf-fg)]">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="space-y-2">
                    <h1 className="text-7xl font-light text-slate-300">404</h1>
                    <div className="h-0.5 w-16 bg-[var(--pf-accent)] mx-auto"></div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-2xl font-medium">Page Not Found</h2>
                    <p className="text-slate-600 leading-relaxed text-sm">
                        The page <span className="font-medium text-slate-800">&quot;{pageName}&quot;</span> could not be found.
                    </p>
                </div>

                <div className="pt-4">
                    <Link
                        to="/"
                        className="inline-flex items-center px-5 py-2.5 text-xs uppercase tracking-wider font-medium text-[#090a0b] bg-[var(--pf-accent)] hover:bg-[var(--pf-accent)]/80 transition-colors duration-200"
                    >
                        Back to Portfolio
                    </Link>
                </div>
            </div>
        </div>
    );
}
