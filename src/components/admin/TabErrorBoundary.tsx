'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShoppingBag } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class TabErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Admin Tab Error Boundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm max-w-xl mx-auto my-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-900">
              {this.props.fallbackTitle || 'Section Display Interrupted'}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              We encountered a minor data rendering issue. Your recent status updates or inputs were safely recorded.
            </p>
          </div>

          {this.state.error?.message && (
            <div className="p-2.5 bg-stone-50 rounded-xl text-stone-600 font-mono text-[11px] text-left break-all max-h-24 overflow-y-auto">
              {this.state.error.message}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Tab</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/admin?tab=orders&status=All';
                }
              }}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-stone-600" />
              <span>Orders Queue</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
