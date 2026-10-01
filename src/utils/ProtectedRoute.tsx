import { useAuth } from '../contexts/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { ProfileSkeleton } from '../components/ProfileSkeleton'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { pathname } = useLocation()

  if (auth.loading && pathname.startsWith('/profile')) return <ProfileSkeleton section={pathname.split('/')[2]} />
  if (auth.loading) return <div>Loading...</div>;
  if (!auth.isLoggedIn) return <Navigate to="/login" />;

  return children;
}
