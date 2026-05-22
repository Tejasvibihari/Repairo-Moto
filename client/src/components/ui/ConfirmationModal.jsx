import React from 'react';

export default function ConfirmationModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, isDangerous = false }) {
    if (!isOpen) return null;

    const btnColor = isDangerous
        ? 'bg-red-500 hover:bg-red-400 text-white'
        : 'bg-[#e2a731] hover:bg-amber-400 text-zinc-900';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

            {/* Modal */}
            <div className="relative bg-zinc-900/90 border border-white/10 rounded-2xl p-8 shadow-2xl max-w-md w-full backdrop-blur-sm">
                {/* top shimmer */}
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#e2a731]/40 to-transparent" />

                {/* Icon */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${isDangerous ? 'bg-red-500/15 border border-red-500/30' : 'bg-amber-500/15 border border-amber-500/30'}`}>
                    <span className={`text-2xl ${isDangerous ? 'text-red-400' : 'text-amber-400'}`}>
                        {isDangerous ? '⚠' : '❓'}
                    </span>
                </div>

                {/* Title */}
                <h2 className="font-syne font-bold text-[18px] text-zinc-100 text-center mb-2">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-[14px] text-zinc-400 text-center mb-8 leading-relaxed font-light">
                    {message}
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 rounded-[13px] border border-white/10 text-zinc-300 hover:text-zinc-100 hover:border-white/20 font-syne font-semibold text-[14px] transition-all duration-200"
                    >
                        {cancelText || 'Cancel'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-3 rounded-[13px] font-syne font-semibold text-[14px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${btnColor} ${isDangerous ? 'hover:shadow-red-500/20' : 'hover:shadow-amber-500/20'}`}
                    >
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}
