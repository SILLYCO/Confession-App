import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] p-6 sm:p-8 rounded-3xl bg-white border border-rose-200 shadow-xl flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto my-8 animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-serif text-navy-950">
              {this.props.fallbackTitle || 'حدث خطأ غير متوقع أثناء عرض هذه الصفحة'}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm">
              An unexpected display error occurred. You can reload to restore normal operation.
            </p>
          </div>

          {this.state.error?.message && (
            <div className="p-3 bg-stone-100 rounded-xl text-[11px] font-mono text-rose-700 max-w-md break-words text-start w-full border border-stone-200">
              {this.state.error.message}
            </div>
          )}

          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 text-xs font-bold shadow transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة تحميل الصفحة / Reload Page</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
