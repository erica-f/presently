import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import LandingPage from './pages/LandingPage'
import Gifts from './pages/Gifts'
import Profile from './pages/Profile'
import ProtectedRoute from './utils/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'

function App() {
  const auth = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <button onClick={auth.logout}>Log out</button>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/gifts" element={<ProtectedRoute><Gifts /></ProtectedRoute>} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
      <SiteFooter />
    </div>
  )

}
export default App
