import { Component, ErrorInfo, ReactNode } from 'react';
import { IntlProvider, useIntl } from 'react-intl';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
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
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorMessage error={this.state.error} onReset={() => this.setState({ hasError: false })} />
      );
    }

    return this.props.children;
  }
}

const ErrorMessage: React.FC<{ error?: Error; onReset: () => void }> = ({ error, onReset }) => {
  const intl = useIntl();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {intl.formatMessage({ id: 'error.generic' })}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {error?.message}
          </p>
        </div>
        <button
          onClick={onReset}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {intl.formatMessage({ id: 'error.tryAgain' })}
        </button>
      </div>
    </div>
  );
};

export default ErrorBoundary;
