import React, { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PrivacyPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
    const [content, setContent] = useState<string>('Loading...');

    useEffect(() => {
        if (isOpen) {
            fetch('/legal/privacy.md')
                .then(res => res.text())
                .then(text => setContent(text))
                .catch(() => setContent('Failed to load privacy policy. Please contact privacy@auraos.space.'));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-stone-800 bg-stone-900/50 sticky top-0 z-10">
                    <div className="flex items-center gap-3 text-emerald-400">
                        <Shield size={24} />
                        <h2 className="text-xl font-bold font-serif italic text-white">Privacy Policy</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar text-stone-300 markdown-content">
                    <ReactMarkdown
                        components={{
                            h1: ({ ...props }) => <h1 className="hidden" {...props} />,
                            h2: ({ ...props }) => <h2 className="text-lg font-bold text-white mt-6 mb-3" {...props} />,
                            h3: ({ ...props }) => <h3 className="text-md font-semibold text-white mt-4 mb-2" {...props} />,
                            p: ({ ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                            ul: ({ ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                            li: ({ ...props }) => <li className="mb-1" {...props} />,
                            table: ({ ...props }) => (
                                <div className="overflow-x-auto mb-6">
                                    <table className="w-full text-sm text-left border-collapse" {...props} />
                                </div>
                            ),
                            thead: ({ ...props }) => <thead className="bg-stone-800/50" {...props} />,
                            th: ({ ...props }) => <th className="p-2 border border-stone-700 font-bold" {...props} />,
                            td: ({ ...props }) => <td className="p-2 border border-stone-700 text-stone-400" {...props} />,
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-stone-800 bg-stone-900/30 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-medium rounded-xl transition-colors"
                    >
                        Understood
                    </button>
                </div>
            </div>
        </div>
    );
}
