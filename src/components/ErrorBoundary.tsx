import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#2D2A26] flex items-center justify-center p-6 text-center" dir="rtl">
          <div className="max-w-md w-full bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-[#C94C71]/20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C94C71]/10 flex items-center justify-center text-[#C94C71] text-2xl font-bold">
              ✦
            </div>
            <h2 className="text-2xl font-bold font-serif text-[#C94C71] mb-2">ماريا ستايل | Maria Style</h2>
            <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
              حدث خطأ مؤقت أثناء تحميل الصفحة. يرجى إعادة المحاولة أو تحديث الصفحة.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#C94C71] to-[#D4AF37] text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
