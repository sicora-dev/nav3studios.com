// /src/components/ErrorBoundary.js
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h1 className="text-2xl text-light-buttons">Algo salió mal</h1>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-light-buttons px-4 py-2"
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
