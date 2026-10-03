// Shared helpers for the lead feature (leadController + lead overview).

// Business timezone used for "today" / "last 7 days" boundaries.
// Default IST (UTC+5:30). Override with LEAD_TZ_OFFSET_MIN in .env.
const TZ_OFFSET_MIN = Number.isFinite(Number(process.env.LEAD_TZ_OFFSET_MIN))
    && process.env.LEAD_TZ_OFFSET_MIN !== undefined
    && process.env.LEAD_TZ_OFFSET_MIN !== ''
    ? Number(process.env.LEAD_TZ_OFFSET_MIN)
    : 330;

const DAY_MS = 24 * 60 * 60 * 1000;

// Start of "today" in the business timezone, as a real UTC Date.
export const startOfToday = (now = new Date()) => {
    const shifted = now.getTime() + TZ_OFFSET_MIN * 60000;
    const dayStartShifted = Math.floor(shifted / DAY_MS) * DAY_MS;
    return new Date(dayStartShifted - TZ_OFFSET_MIN * 60000);
};

export const endOfToday = (now = new Date()) =>
    new Date(startOfToday(now).getTime() + DAY_MS - 1);

export const RANGES = ["today", "7d", "30d", "all"];

// Returns { start, end } (either may be null) for a range keyword.
// "7d" = today + previous 6 days, "30d" = today + previous 29 days.
export const resolveRange = (range) => {
    const today = startOfToday();
    switch (range) {
        case "today":
            return { start: today, end: endOfToday() };
        case "7d":
            return { start: new Date(today.getTime() - 6 * DAY_MS), end: endOfToday() };
        case "30d":
            return { start: new Date(today.getTime() - 29 * DAY_MS), end: endOfToday() };
        default:
            return { start: null, end: null };
    }
};

export const escapeRegex = (str = "") =>
    String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const isAdmin = (user) => user?.role === "Admin";

// Telecallers only ever see / touch the leads they created.
export const isTelecallerUser = (user) =>
    user?.role === "Employee" &&
    String(user?.position || "").trim().toLowerCase() === "telecaller";

// Mongo filter fragment restricting a request to what the caller may see.
// Admin / manager / operational manager → everything. Telecaller → own leads.
export const ownershipFilter = (user) => {
    if (!isTelecallerUser(user)) return {};
    return { leadBy: user.leadBy };
};

// Case-insensitive exact match on the creator's display name.
export const exactNameRegex = (name) =>
    new RegExp(`^${escapeRegex(String(name).trim())}$`, "i");
