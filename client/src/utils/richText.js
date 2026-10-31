// Helpers for rich-text (HTML) fields such as a service description.
//
// Old descriptions are plain text; new ones are HTML written in the WYSIWYG editor.
// Every helper accepts both, so nothing needs a data migration.

const HTML_TAG = /<\/?[a-z][\s\S]*?>/i;

const ALLOWED_TAGS = new Set([
    'P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'STRIKE', 'UL', 'OL', 'LI',
    'H2', 'H3', 'H4', 'BLOCKQUOTE', 'HR', 'A',
]);
// Removed together with their content (never unwrapped).
const DROP_WITH_CONTENT = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'NOSCRIPT', 'TEMPLATE', 'LINK', 'META']);
const SAFE_HREF = /^(https?:|mailto:|tel:)/i;

const escapeHtml = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const isHtml = (value) => HTML_TAG.test(String(value || ''));

/** Plain text / legacy description -> HTML the editor can load. HTML passes through. */
export const descriptionToHtml = (value) => {
    const text = String(value || '');
    if (!text.trim()) return '';
    if (isHtml(text)) return text;
    return text
        .split(/\n{2,}/)
        .map((para) => `<p>${escapeHtml(para.trim()).replace(/\n/g, '<br>')}</p>`)
        .join('');
};

const cleanNode = (node, doc) => {
    [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) return; // text
        if (child.nodeType !== 1) { child.remove(); return; } // comments etc.

        if (DROP_WITH_CONTENT.has(child.tagName)) { child.remove(); return; }

        cleanNode(child, doc);

        if (!ALLOWED_TAGS.has(child.tagName)) {
            // keep the text/children, drop the unknown wrapper (div, span, font, ...)
            child.replaceWith(...child.childNodes);
            return;
        }

        const href = child.tagName === 'A' ? child.getAttribute('href') : null;
        [...child.attributes].forEach((a) => child.removeAttribute(a.name));
        if (child.tagName === 'A') {
            if (href && SAFE_HREF.test(href.trim())) {
                child.setAttribute('href', href.trim());
                child.setAttribute('target', '_blank');
                child.setAttribute('rel', 'noopener noreferrer');
            } else {
                child.replaceWith(...child.childNodes);
            }
        }
    });
};

/** Allow-list sanitizer: only simple formatting survives, no attributes except safe links. */
export const sanitizeHtml = (value) => {
    const html = String(value || '');
    if (!html.trim()) return '';
    if (typeof DOMParser === 'undefined') return escapeHtml(html);
    const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
    cleanNode(doc.body, doc);
    return doc.body.innerHTML;
};

/** HTML (or plain text) -> readable plain text, for lists, search and one-line previews. */
export const htmlToText = (value) => {
    const raw = String(value || '');
    if (!raw) return '';
    if (!isHtml(raw)) return raw.trim();
    if (typeof DOMParser === 'undefined') return raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const withBreaks = raw
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, '\n')
        .replace(/<li[^>]*>/gi, '• ');
    const doc = new DOMParser().parseFromString(withBreaks, 'text/html');
    return (doc.body.textContent || '').replace(/ /g, ' ').replace(/\n{3,}/g, '\n\n').trim();
};

/** Same as htmlToText but on one line - for table cells and dropdown hints. */
export const htmlToLine = (value) => htmlToText(value).replace(/\s*\n\s*/g, ' · ');

/** What is actually saved: '' when the editor only holds an empty paragraph. */
export const normalizeDescription = (html) => {
    const clean = sanitizeHtml(html);
    return htmlToText(clean) ? clean : '';
};
