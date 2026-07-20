
import React, { useState } from 'react';
import { X, Download, Shield, FileJson, FileText, Table, Check, AlertTriangle } from 'lucide-react';
import { dataExportService, ExportOptions } from '../../services/dataExportService';
import { StorageManager } from '../../.claude/lib/storageManager';

interface ExportDataWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ExportDataWizard({ isOpen, onClose }: ExportDataWizardProps) {
    const [step, setStep] = useState(1);
    const [options, setOptions] = useState<ExportOptions>({
        format: 'json',
        sections: {
            sessions: true,
            practices: true,
            insights: true,
            preferences: true,
        },
        includeTimestamps: true,
    });
    const [isExporting, setIsExporting] = useState(false);
    const [exportResult, setExportResult] = useState<{ filename: string; size: number } | null>(null);

    if (!isOpen) return null;

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            try {
                const result = dataExportService.exportData(options);

                // Trigger download
                const url = URL.createObjectURL(result.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = result.filename;
                a.click();
                URL.revokeObjectURL(url);

                setExportResult({
                    filename: result.filename,
                    size: result.size
                });
                setStep(3);
            } catch (err) {
                console.error('Export failed:', err);
                alert('Export failed. Please try again.');
            } finally {
                setIsExporting(false);
            }
        }, 800);
    };

    const handleReset = () => {
        if (window.confirm('CRITICAL: This will delete ALL your data from this device. Are you absolutely sure? Make sure you have exported a backup first!')) {
            StorageManager.clearAll();
            window.location.reload();
        }
    };

    const toggleSection = (section: keyof ExportOptions['sections']) => {
        setOptions(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                [section]: !prev.sections[section]
            }
        }));
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <Download size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-100">Data Management</h2>
                            <p className="text-xs text-slate-400 font-mono">Backup • Export • Privacy</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">1. Choose Format</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'json', label: 'JSON', icon: FileJson, desc: 'Full Backup' },
                                        { id: 'csv', label: 'CSV', icon: Table, desc: 'Spreadsheet' },
                                        { id: 'txt', label: 'TXT', icon: FileText, desc: 'Readable' }
                                    ].map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => setOptions(prev => ({ ...prev, format: f.id as any }))}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${options.format === f.id
                                                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-200'
                                                    : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600'
                                                }`}
                                        >
                                            <f.icon size={24} className={options.format === f.id ? 'text-purple-400' : ''} />
                                            <span className="text-sm font-bold">{f.label}</span>
                                            <span className="text-[10px] opacity-60 font-mono">{f.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">2. Select Data to Include</h3>
                                <div className="space-y-3">
                                    {[
                                        { id: 'sessions', label: 'Wizard Sessions', desc: 'IFS, Shadow, etc.' },
                                        { id: 'practices', label: 'Practice Data', desc: 'My Stack, Tracker, Notes' },
                                        { id: 'insights', label: 'Integrated Insights', desc: 'AI Analysis, Patterns' },
                                        { id: 'preferences', label: 'App Preferences', desc: 'UI Settings, Profile' }
                                    ].map(sec => (
                                        <button
                                            key={sec.id}
                                            onClick={() => toggleSection(sec.id as any)}
                                            className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/20 border border-slate-700/30 hover:bg-slate-800/40 transition-all text-left group"
                                        >
                                            <div>
                                                <div className="text-sm font-medium text-slate-200">{sec.label}</div>
                                                <div className="text-[10px] text-slate-500">{sec.desc}</div>
                                            </div>
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${options.sections[sec.id as keyof ExportOptions['sections']]
                                                    ? 'bg-purple-600 border-purple-400'
                                                    : 'border-slate-600 group-hover:border-slate-500'
                                                }`}>
                                                {options.sections[sec.id as keyof ExportOptions['sections']] && <Check size={14} className="text-white" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-2 text-slate-400">
                                <Shield size={16} className="text-emerald-500" />
                                <span className="text-xs italic">Your data remains locally on your device during this process.</span>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 text-center py-4 animate-in fade-in scale-in-95 duration-500">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center animate-pulse">
                                    <Download size={32} className="text-purple-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-100">Preparing Your Export</h3>
                                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                    We are gathering all your {options.sections.sessions ? 'sessions, ' : ''} {options.sections.practices ? 'practices, ' : ''} and insights into a {options.format.toUpperCase()} file.
                                </p>
                            </div>

                            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 text-left">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-slate-300">Format</span>
                                    <span className="text-xs font-mono text-purple-400 px-2 py-0.5 bg-purple-500/10 rounded">{options.format.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-300">Timestamps</span>
                                    <span className="text-xs font-mono text-slate-400">Included</span>
                                </div>
                            </div>

                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isExporting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Download size={20} />}
                                {isExporting ? 'Processing...' : 'Download My Data'}
                            </button>
                        </div>
                    )}

                    {step === 3 && exportResult && (
                        <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in duration-500">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                    <Check size={32} className="text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-100">Export Complete!</h3>
                                <p className="text-slate-400 text-sm">
                                    Your backup has been saved successfully.
                                </p>
                            </div>

                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-left font-mono">
                                <div className="text-[10px] text-emerald-500 uppercase tracking-tighter mb-1 font-bold">File Details</div>
                                <div className="text-xs text-slate-300 truncate">{exportResult.filename}</div>
                                <div className="text-xs text-slate-500 mt-1">Size: {formatSize(exportResult.size)}</div>
                            </div>

                            <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-6 text-center">
                                <AlertTriangle size={24} className="mx-auto text-amber-500 mb-3" />
                                <h4 className="text-sm font-bold text-slate-200 mb-2">Delete Local Data?</h4>
                                <p className="text-[10px] text-slate-400 mb-4">
                                    If you are on a shared device, you may want to clear your local storage now that you have a backup.
                                </p>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/10 transition-colors"
                                >
                                    Clear All Data From This Device
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center">
                    {step < 3 ? (
                        <>
                            {step === 1 ? (
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200"
                                >
                                    Cancel
                                </button>
                            ) : (
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200"
                                >
                                    Back
                                </button>
                            )}

                            {step === 1 && (
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-lg transition-all"
                                >
                                    Confirm Selection
                                </button>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-lg transition-all"
                        >
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
