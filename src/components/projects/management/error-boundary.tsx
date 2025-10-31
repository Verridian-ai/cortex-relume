'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  showDetails?: boolean;
  type?: 'page' | 'component' | 'data' | 'ui';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: Math.random().toString(36).substr(2, 9)
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    this.setState({
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: any) => {
    // In a real app, you would send this to your error tracking service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      type: this.props.type || 'component'
    };

    // Example: Send to error tracking service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // });
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: ''
      });
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { type = 'component' } = this.props;
      const { error, errorInfo, errorId } = this.state;

      const getErrorTitle = () => {
        switch (type) {
          case 'page':
            return 'Page Error';
          case 'data':
            return 'Data Loading Error';
          case 'ui':
            return 'UI Component Error';
          default:
            return 'Component Error';
        }
      };

      const getErrorDescription = () => {
        switch (type) {
          case 'page':
            return 'Something went wrong while loading this page. Our team has been notified.';
          case 'data':
            return 'We couldn\'t load the project data. Please check your connection and try again.';
          case 'ui':
            return 'A UI component encountered an unexpected error. This has been reported to our team.';
          default:
            return 'An unexpected error occurred. Our team has been notified and is working on a fix.';
        }
      };

      const getErrorIcon = () => {
        switch (type) {
          case 'data':
            return <Bug className="h-8 w-8 text-orange-500" />;
          case 'ui':
            return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
          default:
            return <AlertTriangle className="h-8 w-8 text-red-500" />;
        }
      };

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getErrorIcon()}
              </div>
              <CardTitle className="text-2xl">{getErrorTitle()}</CardTitle>
              <p className="text-muted-foreground mt-2">
                {getErrorDescription()}
              </p>
              {errorId && (
                <Badge variant="outline" className="mt-2 font-mono text-xs">
                  Error ID: {errorId}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {this.retryCount < this.maxRetries && (
                  <Button 
                    onClick={this.handleRetry}
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again ({this.maxRetries - this.retryCount} left)
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="ghost"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {/* Error Details (Development only or when explicitly enabled) */}
              {(process.env.NODE_ENV === 'development' || this.props.showDetails) && error && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Error Details</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm">Message:</h4>
                      <p className="text-sm text-muted-foreground font-mono">
                        {error.message}
                      </p>
                    </div>
                    
                    {error.stack && (
                      <div>
                        <h4 className="font-medium text-sm">Stack Trace:</h4>
                        <pre className="text-xs text-muted-foreground overflow-auto max-h-32 p-2 bg-background rounded border">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {errorInfo?.componentStack && (
                      <div>
                        <h4 className="font-medium text-sm">Component Stack:</h4>
                        <pre className="text-xs text-muted-foreground overflow-auto max-h-32 p-2 bg-background rounded border">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Troubleshooting Tips */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Troubleshooting Tips
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  {type === 'data' && (
                    <>
                      <li>• Check your internet connection</li>
                      <li>• Try refreshing the page</li>
                      <li>• Clear your browser cache</li>
                      <li>• Contact support if the problem persists</li>
                    </>
                  )}
                  {type === 'page' && (
                    <>
                      <li>• Try refreshing the page</li>
                      <li>• Check if the URL is correct</li>
                      <li>• Try accessing from a different browser</li>
                      <li>• Contact support if this page consistently fails to load</li>
                    </>
                  )}
                  {type === 'ui' && (
                    <>
                      <li>• The UI will recover automatically</li>
                      <li>• Try performing the action again</li>
                      <li>• Refresh the page if issues persist</li>
                      <li>• Contact support if you see this error frequently</li>
                    </>
                  )}
                  {type === 'component' && (
                    <>
                      <li>• Try refreshing the page</li>
                      <li>• Go back and try a different action</li>
                      <li>• Clear your browser cache</li>
                      <li>• Contact support if the error persists</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for easier error boundary wrapping
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

// Hook for error handling in functional components
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: any, type: Props['type'] = 'component') => {
    // In a real app, you might want to use a global error handler
    // This could send errors to a logging service
    if (process.env.NODE_ENV === 'development') {
      console.error('Manual error report:', error, errorInfo);
    }

    // Example: Report to error tracking service
    // reportToErrorService(error, errorInfo, type);
  }, []);
}

// Specific error boundary for project management features
export function ProjectErrorBoundary({ 
  children, 
  feature = 'projects' 
}: { 
  children: ReactNode;
  feature?: string;
}) {
  return (
    <ErrorBoundary 
      type="component"
      onError={(error, errorInfo) => {
        // Log project-specific errors
        console.error(`Error in ${feature}:`, error, errorInfo);
        
        // You could send to a project-specific error tracking service
        // analytics.track('project_error', { feature, error: error.message });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Error boundary for data fetching operations
export function DataErrorBoundary({ 
  children, 
  onRetry 
}: { 
  children: ReactNode;
  onRetry?: () => void;
}) {
  const handleRetry = React.useCallback(() => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior
      window.location.reload();
    }
  }, [onRetry]);

  return (
    <ErrorBoundary 
      type="data"
      fallback={
        <Card className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load data</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't load the requested information. Please try again.
          </p>
          <Button onClick={handleRetry} className="flex items-center gap-2 mx-auto">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Hook for graceful error handling with user feedback
export function useErrorFeedback() {
  const [error, setError] = React.useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleError = React.useCallback((error: Error, showToUser = true) => {
    if (showToUser) {
      setError(error);
    }
    
    // Log error for debugging
    console.error('Application error:', error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const retry = React.useCallback(async (operation: () => Promise<any>) => {
    setIsRetrying(true);
    clearError();
    
    try {
      await operation();
    } catch (err) {
      handleError(err as Error);
    } finally {
      setIsRetrying(false);
    }
  }, [clearError, handleError]);

  return {
    error,
    isRetrying,
    handleError,
    clearError,
    retry
  };
}
