'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Fallback UI to show when error occurs */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree and displays
 * a fallback UI instead of crashing the whole app.
 * 
 * @example
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught error:', error, errorInfo);
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry, LogRocket, etc.
      // Example: Sentry.captureException(error);
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      
      // Default fallback UI
      return <ErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback UI
 */
interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  const isDev = process.env.NODE_ENV === 'development';
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      {/* Icon */}
      <div className="mb-4 p-4 rounded-full bg-red-100 dark:bg-red-900/20">
        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
      </div>
      
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Oops! Something went wrong
      </h2>
      
      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        We encountered an unexpected error. Please try again or contact support if the problem persists.
      </p>
      
      {/* Error details (dev only) */}
      {isDev && (
        <details className="mb-6 w-full max-w-2xl">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Error details (dev only)
          </summary>
          <div className="text-left p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto">
            <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
              {error.name}: {error.message}
            </p>
            {error.stack && (
              <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {error.stack}
              </pre>
            )}
          </div>
        </details>
      )}
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={reset} className="min-w-[140px]">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/'}
          className="min-w-[140px]"
        >
          Go to Homepage
        </Button>
      </div>
      
      {/* Report button (production) */}
      {!isDev && (
        <button
          onClick={() => {
            // TODO: Open report dialog
            alert('Error reported. Thank you!');
          }}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline"
        >
          Report this error
        </button>
      )}
    </div>
  );
}

/**
 * Async Error Boundary for Suspense errors
 * (Next.js 13+ with app router)
 */
export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="p-6 text-center">
          <p className="text-red-600 mb-4">Failed to load content</p>
          <Button onClick={reset}>Retry</Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
