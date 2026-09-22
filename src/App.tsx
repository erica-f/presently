import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UserContext from './contexts/AuthContext'
import Login from './pages/Login'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import LandingPage from './pages/LandingPage'
import Profile from './pages/Profile'

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen flex flex-col">
        <SiteHeader />
        
        <UserContext value={{ user, setUser }} >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </BrowserRouter>
        </UserContext>
        <SiteFooter />
    </div>
  )

}
export default App
