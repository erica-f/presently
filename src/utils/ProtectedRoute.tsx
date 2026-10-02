import { useAuth } from '../contexts/useAuth';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (auth.loading) return <div className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 py-16 sm:w-[calc(100%-3rem)]">Laddar...</div>;
  if (!auth.isLoggedIn) return <Navigate to="/login" />;

  return children;
}