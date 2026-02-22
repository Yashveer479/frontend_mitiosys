import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-rose-100 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mb-2">Something went wrong</h2>
                        <p className="text-slate-500 mb-6 text-sm">The application encountered an unexpected error. We've logged this issue.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                        >
                            Reload Application
                        </button>
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-8 p-4 bg-slate-100 rounded-lg text-left overflow-auto max-h-48">
                                <p className="text-xs font-mono text-rose-600">{this.state.error?.toString()}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
