import React, { useState } from 'react';
import Footer from '../../components/landing/Footer';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import axiosClient from '../../service/axiosClient';

export default function AccountDeletion() {
    const [email, setEmail] = useState('');
    const [user, setUser] = useState(null);
    const [password, setPassword] = useState('');
    const [action, setAction] = useState('deactivate');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('error');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const findAccount = async () => {
        setMessage('');
        if (!email) { setMessage('Please enter your email'); setMessageType('error'); return; }
        setLoading(true);
        try {
            const res = await axiosClient.post('/api/user/account/find', { email });
            setUser(res.data.user);
            setAction(res.data.user?.status === 'suspended' ? 'reactivate' : 'deactivate');
        } catch (err) {
            console.log(err);
            setMessage(err.response?.data?.message || err.message || 'Unable to find account');
            setMessageType('error');
        } finally { setLoading(false); }
    };

    const submitAction = async () => {
        setMessage('');
        if (!password) { setMessage('Please enter your password'); setMessageType('error'); return; }
        if (!user) { setMessage('No user selected'); setMessageType('error'); return; }

        if (action === 'delete') {
            setShowModal(true);
            return;
        }

        await performAction();
    };

    const performAction = async () => {
        setMessage('');
        setLoading(true);
        try {
            const res = await axiosClient.post('/api/user/account/action', {
                userId: user._id,
                email: user.email,
                password,
                action
            });
            setMessage(res.data.message);
            setMessageType('success');
            if (action === 'delete') { setUser(null); setEmail(''); setPassword(''); }
        } catch (err) {
            setMessage(err.response?.data?.message || err.message || 'Action failed');
            setMessageType('error');
        } finally { setLoading(false); }
    };

    const initials = user ? (user.firstName?.[0] || '?').toUpperCase() : '';

    const statusStyles = {
        active: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
        suspended: { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
    };
    const st = statusStyles[user?.status] || { pill: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30', dot: 'bg-zinc-400' };

    const actionConfig = {
        deactivate: {
            card: 'border-amber-500/40 bg-amber-500/5',
            radio: 'border-amber-400 bg-amber-400/10',
            inner: 'bg-amber-400',
            title: 'text-amber-300',
            desc: 'Temporarily suspend — restore access anytime',
            btn: 'bg-[#e2a731] hover:bg-amber-400 text-zinc-900',
            shadow: 'hover:shadow-amber-500/20',
        },
        reactivate: {
            card: 'border-emerald-500/40 bg-emerald-500/5',
            radio: 'border-emerald-400 bg-emerald-400/10',
            inner: 'bg-emerald-400',
            title: 'text-emerald-300',
            desc: 'Restore full access to your account',
            btn: 'bg-emerald-500 hover:bg-emerald-400 text-white',
            shadow: 'hover:shadow-emerald-500/20',
        },
        delete: {
            card: 'border-red-500/40 bg-red-500/5',
            radio: 'border-red-400 bg-red-400/10',
            inner: 'bg-red-400',
            title: 'text-red-300',
            desc: 'Erase all data — this cannot be undone',
            btn: 'bg-red-500 hover:bg-red-400 text-white',
            shadow: 'hover:shadow-red-500/20',
        },
    };
    const cfg = actionConfig[action];

    const ActionOption = ({ value, label, description }) => {
        const selected = action === value;
        const c = actionConfig[value];
        return (
            <button
                type="button"
                onClick={() => setAction(value)}
                className={[
                    'w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all duration-200',
                    selected ? c.card : 'border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/15',
                ].join(' ')}
            >
                {/* radio dot */}
                <span className={[
                    'flex-shrink-0 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all duration-200',
                    selected ? c.radio : 'border-zinc-600',
                ].join(' ')}>
                    <span className={[
                        'w-2 h-2 rounded-full transition-all duration-200',
                        selected ? `${c.inner} scale-100 opacity-100` : 'scale-0 opacity-0',
                    ].join(' ')} />
                </span>
                <span className="flex-1 min-w-0">
                    <span className={['block text-sm font-semibold tracking-wide mb-0.5 transition-colors', selected ? c.title : 'text-zinc-200'].join(' ')}>
                        {label}
                    </span>
                    <span className="block text-xs text-zinc-500 font-light">{description}</span>
                </span>
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-[#111111] text-zinc-100 font-sans">
            {/* Google Fonts */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block; width: 13px; height: 13px;
          border: 2px solid rgba(0,0,0,0.2); border-top-color: rgba(0,0,0,0.7);
          border-radius: 50%; animation: spin 0.7s linear infinite; vertical-align: middle; margin-right: 7px;
        }
        .spinner-light {
          border-color: rgba(255,255,255,0.2); border-top-color: rgba(255,255,255,0.85);
        }
      `}</style>

            {/* Ambient glow */}
            <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#e2a731]/5 blur-[120px]" />

            <div className="relative z-10 max-w-[520px] mx-auto px-5 py-20 font-dm">

                {/* ── Header ── */}
                <div className="mb-12">
                    <p className="flex items-center gap-2.5 text-[11px] font-syne font-semibold tracking-[0.18em] uppercase text-[#e2a731] mb-4">
                        <span className="block w-6 h-px bg-[#e2a731]" />
                        Account Settings
                    </p>
                    <h1 className="font-syne text-[clamp(28px,6vw,36px)] font-extrabold leading-[1.08] tracking-[-0.02em] text-zinc-50 mb-3">
                        Manage Your Account
                    </h1>
                    <p className="text-[15px] text-zinc-500 leading-relaxed font-light">
                        Deactivate to temporarily suspend access, or permanently delete your account and all associated data.
                    </p>
                </div>

                {/* ── Card ── */}
                <div className="relative bg-zinc-900/70 border border-white/8 rounded-2xl p-8 backdrop-blur-sm overflow-hidden">
                    {/* top shimmer */}
                    <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#e2a731]/40 to-transparent" />

                    {/* ── Step 1: Find account ── */}
                    {!user && (
                        <div className="space-y-5">
                            <div>
                                <label className="block font-syne text-[11px] font-semibold tracking-[0.12em] uppercase text-zinc-500 mb-2.5">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && findAccount()}
                                    className="w-full bg-zinc-800/60 border border-white/8 rounded-[13px] px-4 py-3.5 text-[15px] text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-200 focus:border-[#e2a731]/50 focus:ring-2 focus:ring-[#e2a731]/10"
                                />
                            </div>

                            <button
                                onClick={findAccount}
                                disabled={loading}
                                className="w-full bg-[#e2a731] hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 font-syne font-bold text-[14px] tracking-wide rounded-[13px] px-5 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/20"
                            >
                                {loading ? <><span className="spinner" />Looking up…</> : 'Find My Account'}
                            </button>

                            {message && (
                                <div className="flex items-start gap-2.5 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-[13.5px] text-red-300">
                                    <span className="mt-px flex-shrink-0">✕</span>
                                    {message}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Step 2: Choose action ── */}
                    {user && (
                        <div className="space-y-6">
                            {/* User badge */}
                            <div className="flex items-center gap-3.5 bg-zinc-800/50 border border-white/7 rounded-xl px-4 py-3.5">
                                <div className="w-11 h-11 rounded-full bg-[#e2a731]/12 border border-[#e2a731]/30 flex items-center justify-center font-syne font-bold text-[15px] text-[#e2a731] flex-shrink-0">
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-syne font-semibold text-[14px] text-zinc-100 truncate">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-[12.5px] text-zinc-500 truncate">{user.email}</p>
                                </div>
                                <span className={`flex-shrink-0 inline-flex items-center gap-1.5 border text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full ${st.pill}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                    {user.status}
                                </span>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block font-syne text-[11px] font-semibold tracking-[0.12em] uppercase text-zinc-500 mb-2.5">
                                    Confirm password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-zinc-800/60 border border-white/8 rounded-[13px] px-4 py-3.5 text-[15px] text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-200 focus:border-[#e2a731]/50 focus:ring-2 focus:ring-[#e2a731]/10"
                                />
                            </div>

                            {/* Action options */}
                            <div>
                                <span className="block font-syne text-[11px] font-semibold tracking-[0.12em] uppercase text-zinc-500 mb-3">
                                    Choose action
                                </span>
                                <div className="space-y-2.5">
                                    {user.status === 'suspended'
                                        ? <ActionOption value="reactivate" label="Reactivate Account" description="Restore full access to your account" />
                                        : <ActionOption value="deactivate" label="Deactivate Account" description="Temporarily suspend — restore access anytime" />
                                    }
                                    <ActionOption value="delete" label="Delete Permanently" description="Erase all data — this cannot be undone" />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={submitAction}
                                    disabled={loading}
                                    className={`flex-1 font-syne font-bold text-[14px] tracking-wide rounded-[13px] px-5 py-3.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg ${cfg.btn} ${cfg.shadow}`}
                                >
                                    {loading ? (
                                        <><span className={`spinner ${action !== 'deactivate' ? 'spinner-light' : ''}`} />Processing…</>
                                    ) : action === 'delete' ? 'Delete Account'
                                        : action === 'reactivate' ? 'Reactivate Account'
                                            : 'Deactivate Account'}
                                </button>
                                <button
                                    onClick={() => { setUser(null); setPassword(''); setMessage(''); }}
                                    className="flex-shrink-0 px-5 py-3.5 rounded-[13px] border border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20 text-[14px] font-medium transition-all duration-200"
                                >
                                    Cancel
                                </button>
                            </div>

                            {message && (
                                <div className={[
                                    'flex items-start gap-2.5 rounded-xl px-4 py-3 text-[13.5px]',
                                    messageType === 'success'
                                        ? 'bg-emerald-500/8 border border-emerald-500/20 text-emerald-300'
                                        : 'bg-red-500/8 border border-red-500/20 text-red-300',
                                ].join(' ')}>
                                    <span className="mt-px flex-shrink-0">{messageType === 'success' ? '✓' : '✕'}</span>
                                    {message}
                                </div>
                            )}
                        </div>
                    )}
                </div>


            </div>
            <div className="mt-16">
                <Footer />
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showModal}
                title="Delete Account?"
                message="Warning: Your account will be permanently deleted immediately along with all associated data. This action cannot be undone."
                confirmText="Yes, Delete"
                cancelText="Cancel"
                isDangerous={true}
                onConfirm={() => { setShowModal(false); performAction(); }}
                onCancel={() => setShowModal(false)}
            />
        </div>
    );
}