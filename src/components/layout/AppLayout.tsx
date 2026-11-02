import { Component, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Error en la aplicación
            </h2>
            <p className="text-sm text-red-600 mb-4">{this.state.error}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: '' });
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AppLayout() {
  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-64">
          <Outlet />
        </main>
      </div>
    </AppErrorBoundary>
  );
}
