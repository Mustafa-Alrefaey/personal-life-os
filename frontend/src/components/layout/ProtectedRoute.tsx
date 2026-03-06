import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { PageLoader } from '../ui/Spinner';

interface ProtectedRouteProps { children: React.ReactNode }

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized   = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <PageLoader />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
