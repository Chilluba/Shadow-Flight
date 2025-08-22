import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to external service if needed
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-black text-white font-mono flex flex-col items-center justify-center p-4">
          <div className="max-w-lg mx-auto bg-black bg-opacity-40 rounded-xl border border-red-500/30 p-8 text-center">
            <div className="text-6xl mb-4">💥</div>
            <h1 className="text-2xl font-bold text-red-400 mb-4">Game Crashed!</h1>
            <p className="text-gray-300 mb-6">
              Something went wrong with the Shadow Flight game. Don't worry, your progress is safe.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-lg transition-colors touch-manipulation"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white font-bold rounded-lg transition-colors touch-manipulation"
              >
                Reload Game
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-red-400 hover:text-red-300">
                  Debug Information
                </summary>
                <div className="mt-2 p-4 bg-gray-900 rounded-lg text-xs text-gray-300 overflow-auto">
                  <p className="font-bold text-red-400">Error:</p>
                  <p className="mb-2">{this.state.error.message}</p>
                  <p className="font-bold text-red-400">Stack:</p>
                  <pre className="whitespace-pre-wrap text-xs">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <>
                      <p className="font-bold text-red-400 mt-4">Component Stack:</p>
                      <pre className="whitespace-pre-wrap text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;