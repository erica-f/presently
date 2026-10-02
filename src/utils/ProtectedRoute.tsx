import { useAuth } from '../contexts/useAuth';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (auth.loading) return <div className="grid min-h-[50vh] flex-1 place-items-center text-sm text-muted-foreground">Laddar...</div>;
  if (!auth.isLoggedIn) return <Navigate to="/login" />;

  return children;
}