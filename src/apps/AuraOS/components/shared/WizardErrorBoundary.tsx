/**
 * WizardErrorBoundary
 * Wraps individual wizard components so a crash is contained to that wizard.
 * Without this, any uncaught error in any wizard crashes the entire app.
 *
 * Usage:
 *   <WizardErrorBoundary wizardName="IFS Session" onClose={navigateBack}>
 *     <IFSWizard ... />
 *   </WizardErrorBoundary>
 */

import React, { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface Props {
    children: ReactNode;
    wizardName: string;
    onClose?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class WizardErrorBoundary extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[WizardErrorBoundary] Crash in "${this.props.wizardName}":`, error);
        console.error('[WizardErrorBoundary] Component stack:', errorInfo.componentStack);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 border border-red-500/30 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-5">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="text-red-400" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-100">
                                        {this.props.wizardName} encountered an error
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Your draft has been preserved
                                    </p>
                                </div>
                            </div>
                            {this.props.onClose && (
                                <button
                                    onClick={this.props.onClose}
                                    className="text-slate-500 hover:text-slate-300 transition-colors ml-2 flex-shrink-0"
                                    aria-label="Close wizard"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {/* Body */}
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Something went wrong inside this practice session. Your progress has been saved as a draft
                            and you can resume where you left off.
                        </p>

                        {/* Error details (collapsible) */}
                        {this.state.error && (
                            <details className="text-left">
                                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 transition-colors">
                                    Technical details
                                </summary>
                                <pre className="mt-2 bg-black/40 p-3 rounded-lg text-xs text-red-300 overflow-auto max-h-32 whitespace-pre-wrap break-words">
                                    {this.state.error.message || this.state.error.toString()}
                                </pre>
                            </details>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={this.handleRetry}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
                            >
                                <RefreshCw size={15} />
                                Try Again
                            </button>
                            {this.props.onClose && (
                                <button
                                    onClick={this.props.onClose}
                                    className="flex-1 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-slate-400 rounded-lg text-sm transition-colors"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
