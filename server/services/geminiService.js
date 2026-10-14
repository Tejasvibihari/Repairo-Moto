import axios from "axios";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const MAX_HISTORY = 12; // last N messages sent as context
const MAX_SUGGESTION_LEN = 400;

const SYSTEM_PROMPT = `You are a reply assistant for the customer-support team of Repairo Moto, a doorstep motorcycle repair and service company in India.
You are shown a support chat about one service order. Write 3 different replies that the SUPPORT AGENT could send next to the CUSTOMER.

Rules:
- Reply to what the customer actually asked in their latest message(s).
- Use the order details (status, bike, services) when relevant. Never invent refunds, prices, dates, mechanic names or policies that are not in the order details.
- If the order is "Cancelled", do not behave as if it is active. Acknowledge it and offer to clarify the reason, help rebook, or escalate to a senior team member.
- Make the 3 replies genuinely different in approach (e.g. direct answer, ask a clarifying question, offer next step / escalation).
- Polite, warm, professional, 1-2 short sentences each, plain text, no emojis, no markdown, no placeholders like [name].
- LANGUAGE: reply in the language of the customer's latest message. Exactly one of:
  * English  -> write in English.
  * Hindi    -> write in Hindi using Devanagari script (e.g. "आपकी सहायता के लिए धन्यवाद").
  * Hinglish -> write Hindi in Roman/Latin letters the way people text (e.g. "Aapke order ke baare mein main abhi check karta hoon"). Do NOT use Devanagari.
  A "detector hint" is provided; trust it unless the customer's message clearly shows otherwise, and then set "language" to what you actually used.
- All 3 replies must be in that same single language.`;


// ── Language detection (cheap local hint; Gemini confirms it in its JSON output) ──
export const LANGUAGES = ["English", "Hindi", "Hinglish"];

// Romanised-Hindi words that are not ordinary English words.
const HINGLISH_WORDS = new Set((
    "hai hain nahi nahin nhi mera meri mere mujhe mujh hum humein hamara tum tumhara aap aapka aapki aapke apna apni apne " +
    "kya kyun kyu kyon kaise kaisa kaisi kab kahan kaun kitna kitne kitni kab " +
    "bhai bhaiya sir ji haan han acha accha theek thik " +
    "kar karo karna krna krdo kardo karein kariye kijiye dijiye dijiyega bataiye batao bata btao " +
    "chahiye chahta chahti chahte " +
    "tha thi the raha rahi rahe hua hui hue gaya gayi gaye ho hoga hogi " +
    "abhi jaldi wapas paisa paise lekin magar kyunki isliye toh bhi aur " +
    "ka ki ke ko se mein par pe liye wala wali wale " +
    "madad kripya dhanyavad shukriya samay din kal aaj"
).split(/\s+/));
// words above that are also common English tokens; they never count on their own
const AMBIGUOUS = new Set(["the", "sir", "tha", "par", "pe", "se", "to", "ho", "ka", "ki", "ke", "ko", "han", "mein", "bhi", "aur", "din"]);

export function detectLanguage(text) {
    const t = String(text ?? "");
    const letters = t.match(/\p{L}/gu) || [];
    if (!letters.length) return "English";

    const devanagari = (t.match(/[\u0900-\u097F]/g) || []).length;
    const ratio = devanagari / letters.length;
    if (ratio > 0.5) return "Hindi";
    if (ratio > 0) return "Hinglish"; // Devanagari mixed with Latin text

    const words = t.toLowerCase().match(/[a-z']+/g) || [];
    const strong = words.filter((w) => HINGLISH_WORDS.has(w) && !AMBIGUOUS.has(w)).length;
    const weak = words.filter((w) => AMBIGUOUS.has(w) && HINGLISH_WORDS.has(w)).length;
    if (strong >= 2 || (strong >= 1 && weak >= 1) || (strong >= 1 && words.length <= 4)) return "Hinglish";
    return "English";
}

// Look at the most recent customer messages (stop once we have a few words to judge from).
function customerTextForDetection(messages) {
    const parts = [];
    let words = 0;
    for (let i = messages.length - 1; i >= 0 && parts.length < 3 && words < 6; i--) {
        if (messages[i].senderType !== "user") continue;
        parts.unshift(messages[i].message);
        words += String(messages[i].message).split(/\s+/).length;
    }
    return parts.join(" ");
}

export class GeminiError extends Error {
    constructor(message, status = 502) {
        super(message);
        this.status = status;
    }
}

const clean = (v, max = 200) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

function describeOrder(order) {
    const bike = [order.selectedBrand, order.selectedModel, order.modelName].filter(Boolean).join(" ");
    const services = [...(order.services || []), order.otherService].filter(Boolean).join(", ");
    return [
        `Order number: ${clean(order.orderId)}`,
        `Customer name: ${clean(order.name)}`,
        `Status: ${clean(order.status)}`,
        `Bike: ${clean(bike) || "n/a"}`,
        `Services booked: ${clean(services) || "n/a"}`,
        `Service type: ${clean(order.serviceType)}`,
        order.issues ? `Customer-reported issue: ${clean(order.issues, 300)}` : null,
    ]
        .filter(Boolean)
        .join("\n");
}

function describeChat(messages) {
    return messages
        .slice(-MAX_HISTORY)
        .map((m) => `${m.senderType === "user" ? "CUSTOMER" : "AGENT"}: ${clean(m.message, 600)}`)
        .join("\n");
}

// Pulls the 3 strings out of the model output, tolerating ```json fences / stray text.
export function parseSuggestions(raw) { return parseResult(raw).suggestions; }

export function parseResult(raw) {
    let text = String(raw ?? "").replace(/```json|```/gi, "").trim();
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (match) {
            try { parsed = JSON.parse(match[0]); } catch { /* fall through */ }
        }
    }
    const list = Array.isArray(parsed) ? parsed : parsed?.suggestions;
    const language = LANGUAGES.find((l) => l.toLowerCase() === String(parsed?.language ?? "").toLowerCase()) || null;
    if (!Array.isArray(list)) return { suggestions: [], language };
    const seen = new Set();
    const suggestions = list
        .map((s) => clean(typeof s === "string" ? s : s?.text, MAX_SUGGESTION_LEN))
        .filter((s) => s && !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()))
        .slice(0, 3);
    return { suggestions, language };
}

export async function generateReplySuggestions({ order, messages }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new GeminiError("AI suggestions are not configured (GEMINI_API_KEY missing).", 503);

    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const url = `${GEMINI_BASE}/${model}:generateContent`;

    const hint = detectLanguage(customerTextForDetection(messages));
    const prompt = `ORDER DETAILS\n${describeOrder(order)}\n\nCHAT (oldest to newest)\n${describeChat(messages)}\n\nDETECTOR HINT: customer language looks like ${hint}.\n\nWrite the 3 suggested agent replies.`;

    const body = {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 600,
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    language: { type: "STRING", enum: LANGUAGES },
                    suggestions: { type: "ARRAY", items: { type: "STRING" }, minItems: 3, maxItems: 3 },
                },
                required: ["language", "suggestions"],
                propertyOrdering: ["language", "suggestions"],
            },
        },
    };

    let data;
    try {
        ({ data } = await axios.post(url, body, {
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            timeout: 15000,
        }));
    } catch (err) {
        const status = err.response?.status;
        console.error("[gemini] request failed:", status, err.response?.data?.error?.message || err.message);
        if (status === 429) throw new GeminiError("AI is busy right now. Try again in a moment.", 429);
        throw new GeminiError("Could not generate suggestions.", 502);
    }

    const text = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
    const { suggestions, language } = parseResult(text);
    if (!suggestions.length) {
        console.error("[gemini] empty/invalid output:", text.slice(0, 200), data?.promptFeedback);
        throw new GeminiError("No suggestions were generated.", 502);
    }
    return { suggestions, language: language || hint };
}
