import { useSyncExternalStore } from 'react';

/* ------------------------------------------------------------------
   Shared helpers for chat alerts: unread badge store, "which chat is
   on screen" marker, notification sound and desktop notifications.
------------------------------------------------------------------ */

/* ---------- which chat is on screen right now ----------
   Set by the chat page ONLY while a conversation is open AND the tab is
   visible AND the window has focus. A message for that chat makes no sound
   and shows no popup (same as WhatsApp). */
let viewingOrderId = null;
let unreadByOrder = {};
let unreadTotal = 0;
const listeners = new Set();

const recompute = () => {
    unreadTotal = Object.entries(unreadByOrder).reduce(
        (sum, [orderId, count]) => (orderId === viewingOrderId ? sum : sum + (Number(count) || 0)),
        0
    );
    listeners.forEach((fn) => fn());
};

export const chatPresence = {
    get: () => viewingOrderId,
    set: (orderId) => {
        const next = orderId ? String(orderId) : null;
        if (next === viewingOrderId) return;
        viewingOrderId = next;
        recompute();
    },
};

/* ---------- unread counters (sidebar badge) ---------- */
export const setUnreadCounts = (map) => {
    unreadByOrder = map && typeof map === 'object' ? map : {};
    recompute();
};

const subscribe = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
};

/** Total unread customer messages (the chat that is open right now is not counted). */
export const useChatUnreadTotal = () => useSyncExternalStore(subscribe, () => unreadTotal, () => 0);

/* ---------- notification sound ----------
   Generated with the Web Audio API, so no audio file has to be shipped.
   Browsers only allow sound after the person has clicked / typed once on
   the page, so we "unlock" the audio context on the first interaction. */
let audioCtx = null;
let lastPlayedAt = 0;

const getAudioCtx = () => {
    if (audioCtx) return audioCtx;
    const Ctx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!Ctx) return null;
    try { audioCtx = new Ctx(); } catch { audioCtx = null; }
    return audioCtx;
};

export const unlockChatSound = () => {
    const ctx = getAudioCtx();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
};

/** Call once; returns a cleanup function. */
export const armChatSoundUnlock = () => {
    const unlock = () => unlockChatSound();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
    };
};

// Soft three-note "ding-ding-dong" chime
const CHIME = [
    { freq: 784, at: 0 },
    { freq: 1047, at: 0.14 },
    { freq: 1319, at: 0.28 },
];

export const playChatSound = () => {
    const now = Date.now();
    if (now - lastPlayedAt < 1200) return; // a burst of messages = one chime
    lastPlayedAt = now;

    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const t0 = ctx.currentTime + 0.02;
        CHIME.forEach(({ freq, at }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.0001, t0 + at);
            gain.gain.exponentialRampToValueAtTime(0.28, t0 + at + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + 0.55);
            osc.connect(gain).connect(ctx.destination);
            osc.start(t0 + at);
            osc.stop(t0 + at + 0.6);
        });
    } catch { /* sound is a nice-to-have, never break the page */ }
};

/* ---------- desktop notifications ---------- */
export const notificationPermission = () =>
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';

export const requestNotificationPermission = async () => {
    if (notificationPermission() === 'unsupported') return 'unsupported';
    try {
        return await Notification.requestPermission();
    } catch {
        return Notification.permission;
    }
};

export const showDesktopNotification = ({ title, body, tag, onClick }) => {
    if (notificationPermission() !== 'granted') return;
    try {
        // same tag = newer message from the same chat replaces the older popup (no pile-up)
        const n = new Notification(title, { body, tag, renotify: true, silent: true, icon: '/logo/logo72.png' });
        n.onclick = () => {
            window.focus();
            n.close();
            if (onClick) onClick();
        };
        setTimeout(() => n.close(), 10000);
    } catch { /* some mobile browsers only allow notifications through a service worker */ }
};

/* ---------- one entry point for "a customer message needs attention" ----------
   Always plays the sound. Shows an OS desktop notification when the browser allows it;
   otherwise (permission not given / blocked / not https) falls back to an in-app popup
   so the agent is never left with a silent screen. */
let toastHandler = null;

export const setChatToastHandler = (fn) => {
    toastHandler = fn;
    return () => { if (toastHandler === fn) toastHandler = null; };
};

export const notifyNewMessage = ({ orderId, title, body, onClick }) => {
    playChatSound();
    if (notificationPermission() === 'granted') {
        showDesktopNotification({ title, body, tag: `chat-${orderId}`, onClick });
    } else if (toastHandler) {
        toastHandler({ orderId, title, body });
    }
};

/** Why desktop notifications can't work right now (null = they can). */
export const notificationBlockedReason = () => {
    if (typeof window === 'undefined') return null;
    if (!('Notification' in window)) {
        return window.isSecureContext === false
            ? 'Desktop notifications need https (or localhost). Open the site over https.'
            : 'This browser does not support desktop notifications.';
    }
    if (Notification.permission === 'denied') {
        return 'Notifications are blocked for this site. Click the lock icon in the address bar, set Notifications to Allow, then reload.';
    }
    return null;
};
