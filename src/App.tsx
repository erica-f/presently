import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import LandingPage from './pages/LandingPage'
import Gifts from './pages/Gifts'
import Profile from './pages/Profile'
import ProtectedRoute from './utils/ProtectedRoute'
import Logout from './components/Logout'
import Checkout from './pages/Checkout'
import CheckoutSuccess from './pages/CheckoutSuccess'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <BrowserRouter>
        <SiteHeader />
        <Logout />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout/success/:paymentId" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
          <Route path="/checkout/:plan" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/gifts" element={<ProtectedRoute><Gifts /></ProtectedRoute>} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <SiteFooter />
      </BrowserRouter>
    </div>
  )

}
export default App
