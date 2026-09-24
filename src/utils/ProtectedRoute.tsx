import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (auth.loading) return <div>Loading...</div>;
  if (!auth.isLoggedIn) return <Navigate to="/login" />;

  return children;
}