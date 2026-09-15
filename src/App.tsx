import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import UserContext from './contexts/UserContext'
import Login from './pages/Login'

function App() {
  const [user, setUser] = useState<string>(null);

  return (
    <>
      <UserContext value={{ user, setUser }} >
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>

      </UserContext>
    </>
  )
}

export default App
