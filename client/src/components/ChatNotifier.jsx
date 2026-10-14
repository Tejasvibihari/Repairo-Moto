import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Bell, X } from 'lucide-react';
import { chatApi } from '../service/chatApi';
import {
    armChatSoundUnlock,
    chatPresence,
    notificationPermission,
    notifyNewMessage,
    playChatSound,
    requestNotificationPermission,
    setChatToastHandler,
    setUnreadCounts,
    unlockChatSound,
} from '../utils/chatAlerts';

const SOCKET_URL = import.meta.env.VITE_API_URL;
const ASK_HIDDEN_KEY = 'chat-desktop-alert-hidden';
const TOAST_MS = 9000;

// Staff who have a Chat Support screen (see EmployeeSidebar menus) and where it lives
const CHAT_PAGE = {
    telecaller: '/employee/chat-support',
    'operational manager': '/employee/manager-chat',
};

/**
 * Mounted once for the whole app (outside <Routes>). While a chat-support employee is
 * signed in it keeps one live connection, so a new customer message gives a sound +
 * desktop notification on ANY page of the dashboard, and feeds the sidebar unread badge.
 * It stays silent for the conversation that is open on screen.
 */
export default function ChatNotifier() {
    const navigate = useNavigate();
    const navigateRef = useRef(navigate);
    navigateRef.current = navigate;

    const isEmployee = useSelector((s) => s.employeeAuth?.isAuthenticated);
    const position = useSelector((s) => s.employeeAuth?.employee?.position);
    const token = useSelector((s) => s.auth.employeeToken);
    const chatPath = isEmployee ? CHAT_PAGE[position] : null;
    const chatPathRef = useRef(chatPath);
    chatPathRef.current = chatPath;

    const [permission, setPermission] = useState(notificationPermission());
    const [toasts, setToasts] = useState([]); // in-app popups (used when desktop notifications are not allowed)
    const [hidden, setHidden] = useState(() => {
        try { return sessionStorage.getItem(ASK_HIDDEN_KEY) === '1'; } catch { return false; }
    });

    useEffect(() => (chatPath ? armChatSoundUnlock() : undefined), [chatPath]);

    // In-app popup fallback. One popup per chat: a newer message replaces the older one.
    useEffect(() => {
        if (!chatPath) return undefined;
        return setChatToastHandler(({ orderId, title, body }) => {
            const id = `${orderId}-${Date.now()}`;
            setToasts((current) => [{ id, orderId, title, body }, ...current.filter((t) => t.orderId !== orderId)].slice(0, 3));
            setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), TOAST_MS);
        });
    }, [chatPath]);

    useEffect(() => {
        if (!chatPath || !token) return undefined;

        const socket = io(`${SOCKET_URL}/chat`, { auth: { token }, transports: ['websocket'], reconnection: true });

        const refreshUnread = async () => {
            try { setUnreadCounts(await chatApi.unreadCounts()); } catch { /* keep the last known counts */ }
        };

        socket.on('connect', () => { console.info('[chat-alerts] live connection ready'); refreshUnread(); });
        socket.on('connect_error', (err) => console.warn('[chat-alerts] connection failed:', err?.message));
        socket.on('admin-list-refresh', refreshUnread); // new message, or somebody read a chat

        socket.on('admin-new-message', (msg) => {
            // This chat is open and in front of the agent: no popup, no sound
            if (chatPresence.get() === String(msg.orderId)) return;

            console.info('[chat-alerts] new customer message', msg.orderId);
            notifyNewMessage({
                orderId: msg.orderId,
                title: `New message from ${msg.customerName || 'Customer'}`,
                body: `Order #${msg.screenOrderId}: ${msg.message}`,
                onClick: () => navigateRef.current(chatPathRef.current, { state: { orderId: msg.orderId } }),
            });
        });

        return () => {
            socket.disconnect();
            setUnreadCounts({});
        };
    }, [chatPath, token]);

    if (!chatPath) return null;

    const openToast = (toast) => {
        setToasts((current) => current.filter((t) => t.id !== toast.id));
        navigate(chatPath, { state: { orderId: toast.orderId } });
    };
    const showAsk = permission === 'default' && !hidden;

    const enable = async () => {
        unlockChatSound();
        const result = await requestNotificationPermission();
        setPermission(result);
        if (result === 'granted') playChatSound(); // quick preview of the new-message sound
    };

    const hide = () => {
        try { sessionStorage.setItem(ASK_HIDDEN_KEY, '1'); } catch { /* ignore */ }
        setHidden(true);
    };

    return (
        <>
            {/* in-app popups */}
            <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-green-200 bg-white p-3 shadow-xl ring-2 ring-green-400/60">
                        <button type="button" onClick={() => openToast(toast)} className="min-w-0 flex-1 text-left">
                            <p className="truncate text-sm font-bold text-secondary">{toast.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{toast.body}</p>
                        </button>
                        <button type="button" onClick={() => setToasts((current) => current.filter((t) => t.id !== toast.id))} aria-label="Dismiss" className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100"><X size={14} /></button>
                    </div>
                ))}
            </div>

            {showAsk && (
        <div className="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-secondary">
                <Bell size={18} />
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-secondary">Get alerts for new chat messages</p>
                <p className="mt-0.5 text-xs text-gray-500">Show a desktop notification and play a sound when a customer messages you.</p>
                <div className="mt-3 flex gap-2">
                    <button type="button" onClick={enable} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-secondary">Enable</button>
                    <button type="button" onClick={hide} className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100">Not now</button>
                </div>
            </div>
            <button type="button" onClick={hide} aria-label="Dismiss" className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100"><X size={14} /></button>
        </div>
            )}
        </>
    );
}
