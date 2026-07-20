import React, { useState } from 'react';
import { Settings, Download, Upload, X, LogIn, LogOut, User, Shield, Scale } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PrivacyPolicyModal from '../legal/PrivacyPolicyModal';
import TermsOfServiceModal from '../legal/TermsOfServiceModal';
import LanguageSelector from './LanguageSelector';

interface SettingsFloatingButtonProps {
    onExport: () => void;
    onImport: () => void;
}

export default function SettingsFloatingButton({ onExport, onImport }: SettingsFloatingButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const { user, isAuthenticated, signOut, setShowAuthModal } = useAuth();

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Settings Panel */}
            {isOpen && (
                <div
                    className="fixed top-20 right-4 left-4 sm:bottom-32 sm:top-auto sm:left-4 sm:right-4 z-50 lg:hidden p-4 rounded-2xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.98), rgba(20, 20, 30, 0.98))',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(192, 132, 252, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(192, 132, 252, 0.1)',
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-100">Data Settings</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <LanguageSelector />

                        <button
                            onClick={() => {
                                onExport();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 hover:bg-slate-800/50"
                            style={{
                                background: 'rgba(34, 197, 94, 0.1)',
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                            }}
                        >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <Download size={20} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-100">Export Data</h4>
                                <p className="text-xs text-slate-400">Download backup of all your data</p>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                onImport();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 hover:bg-slate-800/50"
                            style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                            }}
                        >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <Upload size={20} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-100">Import Data</h4>
                                <p className="text-xs text-slate-400">Restore from a backup file</p>
                            </div>
                        </button>

                        {/* Sign In / Sign Out Button */}
                        <button
                            onClick={() => {
                                if (isAuthenticated) {
                                    signOut();
                                } else {
                                    setShowAuthModal(true);
                                }
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 hover:bg-slate-800/50"
                            style={{
                                background: isAuthenticated ? 'rgba(251, 113, 133, 0.1)' : 'rgba(6, 182, 212, 0.1)',
                                border: isAuthenticated ? '1px solid rgba(251, 113, 133, 0.2)' : '1px solid rgba(6, 182, 212, 0.2)',
                            }}
                        >
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                    background: isAuthenticated
                                        ? 'linear-gradient(to bottom right, rgb(244, 63, 94), rgb(225, 29, 72))'
                                        : 'linear-gradient(to bottom right, rgb(6, 182, 212), rgb(8, 145, 178))'
                                }}
                            >
                                {isAuthenticated ? (
                                    <User size={20} className="text-white" />
                                ) : (
                                    <LogIn size={20} className="text-white" />
                                )}
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-100">
                                    {isAuthenticated
                                        ? (user?.displayName || user?.email || 'Account')
                                        : 'Sign In'}
                                </h4>
                                <p className="text-xs text-slate-400">
                                    {isAuthenticated
                                        ? 'Tap to sign out'
                                        : 'Sync your data across devices'}
                                </p>
                            </div>
                        </button>

                        <div className="flex gap-2 pt-2 border-t border-stone-800">
                            <button
                                onClick={() => {
                                    setIsTermsOpen(true);
                                    setIsOpen(false);
                                }}
                                className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl hover:bg-stone-800/50 transition-colors text-stone-400 hover:text-stone-300"
                            >
                                <Scale size={18} className="mb-1" />
                                <span className="text-xs">Terms</span>
                            </button>
                            <button
                                onClick={() => {
                                    setIsPrivacyOpen(true);
                                    setIsOpen(false);
                                }}
                                className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl hover:bg-stone-800/50 transition-colors text-stone-400 hover:text-stone-300"
                            >
                                <Shield size={18} className="mb-1" />
                                <span className="text-xs">Privacy</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 right-4 sm:top-auto sm:bottom-32 sm:right-auto sm:left-4 z-40 lg:hidden w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                    background: isOpen
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(109, 40, 217, 0.9))'
                        : 'linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(20, 20, 30, 0.95))',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(192, 132, 252, 0.3)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 12px rgba(192, 132, 252, 0.15)',
                }}
                aria-label="Settings"
            >
                <Settings
                    size={20}
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-90 text-white' : 'text-purple-300'}`}
                />
            </button>

            <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
            <TermsOfServiceModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
        </>
    );
}
