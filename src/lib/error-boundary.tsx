'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent) {
        return (
          <FallbackComponent 
            error={this.state.error!} 
            reset={() => this.setState({ hasError: false, error: undefined })}
          />
        );
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-ocean-900 via-ocean-800 to-ocean-700 flex items-center justify-center p-4">
          <div className="text-center text-white max-w-md">
            <div className="mb-8">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h1 className="text-3xl font-bold mb-4">Une erreur s'est produite</h1>
              <p className="text-ocean-200 mb-2">
                Quelque chose s'est mal passé. Veuillez réessayer.
              </p>
              {this.state.error?.message && (
                <p className="text-sm text-red-300 bg-red-900/20 p-3 rounded-lg mt-4">
                  {this.state.error.message}
                </p>
              )}
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={() => this.setState({ hasError: false, error: undefined })}
                variant="secondary"
                className="w-full"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Réessayer
              </Button>
              
              <a 
                href="/"
                className="inline-flex items-center space-x-2 text-ocean-200 hover:text-white transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Retour à l'accueil</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}