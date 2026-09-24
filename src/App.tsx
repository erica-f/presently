import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthContext from './contexts/AuthContext'
import Login from './pages/Login'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import LandingPage from './pages/LandingPage'
import Gifts from './pages/Gifts'
import GiftDetails from './pages/GiftDetails'
import Profile from './pages/Profile'

function App() {
  const [user, setUser] = useState('');

  return (
    <div className="min-h-screen flex flex-col">
        <SiteHeader />
        
        <AuthContext value={{ user, setUser }} >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/gifts" element={<Gifts />} />
              <Route path="/gifts/:id" element={<GiftDetails />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </BrowserRouter>
        </AuthContext>
        <SiteFooter />
    </div>
  )

}
export default App
