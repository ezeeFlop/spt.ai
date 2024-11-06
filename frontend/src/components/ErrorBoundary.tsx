import { Component, ErrorInfo, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorMessage 
          error={this.state.error} 
          errorInfo={this.state.errorInfo}
          onReset={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })} 
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorMessageProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  onReset: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, errorInfo, onReset }) => {
  const intl = useIntl();

  const getErrorLocation = () => {
    if (!error?.stack) return null;
    
    const stackLines = error.stack.split('\n');
    const relevantLine = stackLines.find(line => line.includes('/src/'));
    
    if (!relevantLine) return null;

    const match = relevantLine.match(/\/src\/(.+?):\d+:\d+/);
    return match ? match[1] : null;
  };

  const errorLocation = getErrorLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              {intl.formatMessage({ id: 'error.generic' })}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-sm font-medium text-red-800">
                {error?.message}
              </p>
              {errorLocation && (
                <p className="text-sm text-red-600 mt-1">
                  {intl.formatMessage({ id: 'error.location' })}: {errorLocation}
                </p>
              )}
            </div>

            {errorInfo && (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {intl.formatMessage({ id: 'error.componentStack' })}:
                </p>
                <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}

            <button
              onClick={onReset}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {intl.formatMessage({ id: 'error.tryAgain' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
