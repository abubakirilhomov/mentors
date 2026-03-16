import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleReload() {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
          <div className="card bg-base-100 shadow-xl max-w-md w-full">
            <div className="card-body items-center text-center">
              <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mb-2">
                <svg className="w-7 h-7 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="card-title text-lg">Что-то пошло не так</h2>
              <p className="text-sm text-base-content/60">
                Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.
              </p>
              {this.state.error && (
                <div className="bg-base-200 rounded-lg px-3 py-2 w-full text-left mt-2">
                  <p className="text-xs text-base-content/40 break-all">{this.state.error.message}</p>
                </div>
              )}
              <div className="card-actions mt-4">
                <button onClick={this.handleReload} className="btn btn-primary btn-sm">
                  Перезагрузить
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
