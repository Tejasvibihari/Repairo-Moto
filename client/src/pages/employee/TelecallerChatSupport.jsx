import React, { useEffect, useRef, useState } from 'react';
import { LoaderCircle, MessageCircle, Pencil, RefreshCw, Send, Sparkles } from 'lucide-react';
import { chatApi } from '../../service/chatApi';

const errMsg = (err, fallback) => err.response?.data?.message || fallback;

export default function TelecallerChatSupport() {
    const [orders, setOrders] = useState([]);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messagesOrderId, setMessagesOrderId] = useState(null); // which chat `messages` belongs to
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    // AI quick replies
    const [suggestions, setSuggestions] = useState([]);
    const [suggesting, setSuggesting] = useState(false);
    const [suggestError, setSuggestError] = useState('');
    const [suggestLang, setSuggestLang] = useState(''); // English | Hindi | Hinglish

    const endRef = useRef(null);
    const inputRef = useRef(null);
    const suggestReq = useRef(0); // ignores stale responses when the chat/message changes

    const lastMessage = messages[messages.length - 1];
    // Only suggest when the customer spoke last — nothing to answer otherwise.
    const needsReply = !!selected && messagesOrderId === selected.orderId && lastMessage?.senderType === 'user';

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await chatApi.orders();
            setOrders(data || []);
            if (!selected && data?.[0]) setSelected(data[0]);
            setError('');
        } catch (err) {
            setError(errMsg(err, 'Could not load conversations.'));
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (order) => {
        try {
            const data = await chatApi.messages(order.orderId);
            setMessages(data.messages || []);
            setMessagesOrderId(order.orderId);
        } catch (err) {
            setError(errMsg(err, 'Could not load messages.'));
        }
    };

    const loadSuggestions = async (orderId) => {
        const reqId = ++suggestReq.current;
        setSuggesting(true);
        setSuggestError('');
        setSuggestions([]);
        setSuggestLang('');
        try {
            const data = await chatApi.suggestions(orderId);
            if (reqId !== suggestReq.current) return;
            setSuggestions(data.suggestions || []);
            setSuggestLang(data.language || '');
        } catch (err) {
            if (reqId !== suggestReq.current) return;
            setSuggestError(errMsg(err, 'Could not load suggestions.'));
        } finally {
            if (reqId === suggestReq.current) setSuggesting(false);
        }
    };

    useEffect(() => { loadOrders(); }, []);

    useEffect(() => {
        setMessages([]);
        setMessagesOrderId(null);
        setText('');
        if (selected) loadMessages(selected);
    }, [selected?.orderId]);

    useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages, selected?.orderId]);

    // New customer message (or switched chat) -> ask Gemini for 3 replies.
    useEffect(() => {
        suggestReq.current++; // invalidate anything in flight
        setSuggestions([]);
        setSuggestError('');
        setSuggestLang('');
        setSuggesting(false);
        if (needsReply) loadSuggestions(selected.orderId);
    }, [selected?.orderId, needsReply, lastMessage?._id]);

    const sendMessage = async (body) => {
        const value = body.trim();
        if (!value || !selected || sending) return;
        setSending(true);
        try {
            const message = await chatApi.send(selected.orderId, value);
            setMessages((current) => [...current, message]);
            setText('');
            setError('');
        } catch (err) {
            setError(errMsg(err, 'Could not send message.'));
        } finally {
            setSending(false);
        }
    };

    const send = (event) => { event.preventDefault(); sendMessage(text); };

    // Pencil: drop the suggestion into the input so it can be edited before sending.
    const editSuggestion = (value) => {
        setText(value);
        requestAnimationFrame(() => {
            const el = inputRef.current;
            if (!el) return;
            el.focus();
            el.setSelectionRange(value.length, value.length);
        });
    };

    const showSuggestionBar = needsReply && (suggesting || suggestions.length > 0 || suggestError);

    return (
        <div className="space-y-5">
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Communication</p>
                    <h1 className="mt-1 text-3xl font-extrabold text-secondary">Chat support</h1>
                    <p className="mt-1 text-sm text-gray-500">Reply to customers about their service orders.</p>
                </div>
                <button onClick={loadOrders} className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600"><RefreshCw size={17} /></button>
            </div>

            {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <div className="grid h-[calc(100dvh-17rem)] min-h-[480px] grid-rows-[minmax(0,auto)_minmax(0,1fr)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-[300px_1fr] lg:grid-rows-[minmax(0,1fr)]">
                <aside className="max-h-48 overflow-y-auto border-b border-gray-100 lg:max-h-none lg:border-b-0 lg:border-r">
                    <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-4 font-bold text-secondary">Conversations</div>
                    {loading ? (
                        <div className="flex justify-center p-8"><LoaderCircle className="animate-spin text-primary" /></div>
                    ) : orders.map((order) => (
                        <button
                            key={order.orderId}
                            onClick={() => setSelected(order)}
                            className={`w-full border-b border-gray-100 px-4 py-4 text-left ${selected?.orderId === order.orderId ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                        >
                            <p className="font-bold text-secondary">{order.customerName || 'Customer'}</p>
                            <p className="mt-1 text-xs text-gray-500">Order #{order.orderNumber || order.orderId.slice(-6)}</p>
                            <p className="mt-1 text-xs text-gray-400">{order.status}</p>
                        </button>
                    ))}
                    {!loading && !orders.length && <p className="p-6 text-sm text-gray-500">No conversations yet.</p>}
                </aside>

                <section className="flex min-h-0 flex-col">
                    {selected ? (
                        <>
                            <div className="shrink-0 border-b border-gray-100 px-5 py-4">
                                <p className="font-bold text-secondary">{selected.customerName}</p>
                                <p className="text-xs text-gray-500">Order #{selected.orderNumber || selected.orderId.slice(-6)}</p>
                            </div>

                            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gray-50 p-5">
                                {messages.map((message) => (
                                    <div key={message._id} className={`flex ${message.senderType === 'user' ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${message.senderType === 'user' ? 'bg-white text-gray-700 shadow-sm' : 'bg-secondary text-white'}`}>
                                            {message.message}
                                            <p className="mt-1 text-[10px] opacity-60">{new Date(message.createdAt).toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                ))}
                                {!messages.length && <p className="py-10 text-center text-sm text-gray-500">No messages in this conversation.</p>}
                                <div ref={endRef} />
                            </div>

                            {showSuggestionBar && (
                                <div className="shrink-0 border-t border-gray-100 bg-white px-4 pt-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                                            <Sparkles size={13} className="text-primary" /> Suggested replies
                                            {suggestLang && !suggesting && (
                                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-secondary">{suggestLang}</span>
                                            )}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => loadSuggestions(selected.orderId)}
                                            disabled={suggesting}
                                            title="Regenerate suggestions"
                                            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40"
                                        >
                                            <RefreshCw size={13} className={suggesting ? 'animate-spin' : ''} />
                                        </button>
                                    </div>

                                    {suggesting && (
                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            {[0, 1, 2].map((i) => <div key={i} className="h-10 flex-1 animate-pulse rounded-xl bg-gray-100" />)}
                                        </div>
                                    )}

                                    {!suggesting && suggestError && <p className="pb-1 text-xs text-gray-400">{suggestError}</p>}

                                    {!suggesting && suggestions.length > 0 && (
                                        <div className="flex max-h-40 flex-col gap-2 overflow-y-auto pb-1 sm:flex-row sm:items-stretch">
                                            {suggestions.map((suggestion, i) => (
                                                <div key={i} className="flex flex-1 items-stretch overflow-hidden rounded-xl border border-amber-200 bg-amber-50 text-xs text-secondary">
                                                    <button
                                                        type="button"
                                                        onClick={() => sendMessage(suggestion)}
                                                        disabled={sending}
                                                        title="Send this reply"
                                                        className="flex-1 px-3 py-2 text-left leading-snug hover:bg-amber-100 disabled:opacity-50"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => editSuggestion(suggestion)}
                                                        title="Edit before sending"
                                                        className="flex shrink-0 items-center border-l border-amber-200 px-2 text-gray-500 hover:bg-amber-100 hover:text-secondary"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <form onSubmit={send} className={`flex shrink-0 gap-2 bg-white p-4 ${showSuggestionBar ? '' : 'border-t border-gray-100'}`}>
                                <input
                                    ref={inputRef}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
                                />
                                <button disabled={sending || !text.trim()} className="rounded-xl bg-primary px-4 text-secondary disabled:opacity-50"><Send size={17} /></button>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
                            <MessageCircle size={42} />
                            <p className="mt-3 text-sm">Select a conversation to start.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
