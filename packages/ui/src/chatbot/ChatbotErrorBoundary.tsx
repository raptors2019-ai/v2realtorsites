"use client";

import React from "react";

interface ChatbotErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
  phoneNumber?: string;
}

interface ChatbotErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for the chatbot widget.
 * Catches React errors and displays a fallback UI with recovery options.
 */
export class ChatbotErrorBoundary extends React.Component<
  ChatbotErrorBoundaryProps,
  ChatbotErrorBoundaryState
> {
  constructor(props: ChatbotErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ChatbotErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[chatbot.error]", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Track error if analytics available
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "exception", {
        description: `Chatbot Error: ${error.message}`,
        fatal: false,
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    const { phoneNumber = "(416) 786-0431" } = this.props;

    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-white">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-stone-800 mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-stone-600 mb-4">
            We encountered an error. You can try again or contact us directly.
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-[#0a1628] text-white rounded-lg text-sm font-medium hover:bg-[#1a2d4d] transition"
            >
              Try Again
            </button>
            <a
              href={`tel:${phoneNumber.replace(/\D/g, "")}`}
              className="px-4 py-2 border border-stone-200 rounded-lg text-sm font-medium hover:bg-stone-50 transition"
            >
              Call Us: {phoneNumber}
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
