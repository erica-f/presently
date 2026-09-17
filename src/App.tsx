import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import UserContext from './contexts/AuthContext'
import Login from './pages/Login'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import LandingPage from './pages/LandingPage'

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen flex flex-col">
      <main className='flex-1 flex py-10 w-full max-w-6xl mx-auto px-4'>
          <SiteHeader />
            <LandingPage />
            <SiteFooter />
        <UserContext value={{ user, setUser }} >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<div>Home</div>} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </BrowserRouter>
        </UserContext>
      </main>

    </div>
  )

}
export default App
