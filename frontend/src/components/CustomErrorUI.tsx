import React from 'react';
import { XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface CustomErrorUIProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  onReset?: () => void;
}

export const CustomErrorUI: React.FC<CustomErrorUIProps> = ({ 
  error, 
  errorInfo, 
  onReset 
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const isDevelopment = true; //import.meta.env.MODE === 'development';
  console.log('isDevelopment', isDevelopment);
  console.log('error', error);
  console.log('errorInfo', errorInfo);
  const toggleDetails = () => setShowDetails(prev => !prev);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center p-6 bg-white rounded-lg shadow-lg">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">
          We're sorry, but there was an error loading this content.
        </p>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 mb-4 font-mono text-sm">
            {error.message}
          </p>
        )}

        {/* Debug Information (only in development) */}
        {isDevelopment && (error || errorInfo) && (
          <div className="mt-4 text-left">
            <button
              onClick={toggleDetails}
              className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              <span>Technical Details</span>
              {showDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showDetails && (
              <div className="mt-2 p-4 bg-gray-100 rounded-md">
                {/* Error Stack */}
                {error?.stack && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2">Stack Trace:</h3>
                    <pre className="text-xs overflow-x-auto p-2 bg-gray-800 text-gray-200 rounded">
                      {error.stack}
                    </pre>
                  </div>
                )}

                {/* Component Stack */}
                {errorInfo?.componentStack && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2">Component Stack:</h3>
                    <pre className="text-xs overflow-x-auto p-2 bg-gray-800 text-gray-200 rounded">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}

                {/* Additional Debug Info */}
                <div className="text-xs mt-4">
                  <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
                  <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
                  <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reset Button */}
        {onReset && (
          <button
            onClick={onReset}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};
