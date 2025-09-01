'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error:', error);
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-700 flex items-center justify-center p-4">
          <div className="text-center text-white max-w-md">
            <div className="mb-8">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h1 className="text-3xl font-bold mb-4">Erreur critique</h1>
              <p className="text-red-200 mb-2">
                Une erreur critique s'est produite. Veuillez recharger la page.
              </p>
              {process.env.NODE_ENV === 'development' && error.message && (
                <p className="text-sm text-red-300 bg-red-900/20 p-3 rounded-lg mt-4">
                  {error.message}
                </p>
              )}
            </div>
            
            <button
              onClick={reset}
              className="inline-flex items-center space-x-2 bg-white text-red-600 px-6 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Recharger l'application</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}