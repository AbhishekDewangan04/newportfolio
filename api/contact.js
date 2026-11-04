const WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = 3;
const ipBuckets = new Map();

function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
}

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = ipBuckets.get(ip);
    if (!entry || now - entry.start > WINDOW_MS) {
        ipBuckets.set(ip, { start: now, count: 1 });
        return true;
    }
    entry.count += 1;
    if (ipBuckets.size > 2000) {
        for (const [key, value] of ipBuckets) {
            if (now - value.start > WINDOW_MS) ipBuckets.delete(key);
        }
    }
    return entry.count <= RATE_LIMIT;
}

function clean(value, max) {
    return String(value || "")
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .trim()
        .slice(0, max);
}

function escapeHtml(value) {
    return String(value || "").replace(
        /[&<>"'`]/g,
        (c) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
                "`": "&#96;",
            })[c],
    );
}

export default async function handler(req, res) {
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    try {
        let body = req.body;
        if (typeof body === "string") {
            try {
                body = JSON.parse(body);
            } catch {
                return res.status(400).json({ ok: false, error: "Invalid JSON" });
            }
        }
        body = body || {};

        const { name: rawName, email: rawEmail, message: rawMessage, website, startedAt } = body;

        // Honeypot check - silently drop bot submissions
        if (typeof website === "string" && website.trim()) {
            return res.status(200).json({ ok: true });
        }

        // Timing check
        const elapsed = Date.now() - Number(startedAt || 0);
        if (Number.isFinite(elapsed) && elapsed < 2000) {
            return res.status(400).json({ ok: false, error: "Submission too fast" });
        }

        const name = clean(rawName, 80);
        const email = clean(rawEmail, 160).toLowerCase();
        const message = clean(rawMessage, 2000);

        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
        if (!name || name.length > 80 || !emailValid || message.length < 10 || message.length > 2000) {
            return res.status(400).json({ ok: false, error: "Invalid input fields" });
        }

        const ip = getClientIp(req);
        if (!checkRateLimit(ip)) {
            return res.status(429).json({ ok: false, error: "Rate limit exceeded. Please try again later." });
        }

        const resendApiKey = process.env.RESEND_API_KEY;
        const ownerEmail = process.env.OWNER_EMAIL;

        if (!resendApiKey || !ownerEmail) {
            console.error("[contact] Missing RESEND_API_KEY or OWNER_EMAIL environment variables");
            return res.status(500).json({ ok: false, error: "Email service unconfigured" });
        }

        const received = new Date();
        const stampIst = `${received.toLocaleString("en-GB", {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "short",
        })} IST`;

        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
        const subject = `Portfolio message from ${name}`.slice(0, 180);

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "Portfolio Contact <onboarding@resend.dev>",
                to: [ownerEmail],
                reply_to: email,
                subject,
                text: [
                    "New message from portfolio contact form:",
                    "",
                    `Name: ${name}`,
                    `Visitor Email: ${email}`,
                    `Received: ${received.toISOString()} (${stampIst})`,
                    "",
                    "Message:",
                    message,
                ].join("\n"),
                html: [
                    '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:14px;line-height:1.6;color:#111">',
                    '<p style="margin:0 0 14px">New message from portfolio contact form.</p>',
                    '<table style="border-collapse:collapse;margin:0 0 16px"><tbody>',
                    `<tr><td style="padding:2px 12px 2px 0;color:#666">Name</td><td style="padding:2px 0"><strong>${safeName}</strong></td></tr>`,
                    `<tr><td style="padding:2px 12px 2px 0;color:#666">Visitor email</td><td style="padding:2px 0">${safeEmail}</td></tr>`,
                    `<tr><td style="padding:2px 12px 2px 0;color:#666">Received</td><td style="padding:2px 0">${escapeHtml(received.toISOString())} (${escapeHtml(stampIst)})</td></tr>`,
                    "</tbody></table>",
                    `<div style="border-left:2px solid #02d2e3;padding:0 0 0 12px;white-space:normal">${safeMessage}</div>`,
                    "</div>",
                ].join(""),
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("[contact] Resend API error:", response.status, errText);
            return res.status(502).json({ ok: false, error: "Failed to send email" });
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("[contact] Unexpected error:", err);
        return res.status(500).json({ ok: false, error: "Server error" });
    }
}

