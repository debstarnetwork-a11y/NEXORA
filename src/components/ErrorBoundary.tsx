import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[400px] text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 m-4 shadow-xl">
          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {this.props.fallbackTitle || 'Something interrupted the studio view'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6">
            The studio encountered a temporary render issue. You can safely restore the canvas and return to a clean working state.
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Studio View</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
