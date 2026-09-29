import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import LandingPage from './pages/LandingPage'
import Gifts from './pages/Gifts'
import GiftDetails from './pages/GiftDetails'
import Profile from './pages/Profile'
import ProtectedRoute from './utils/ProtectedRoute'
import Logout from './components/Logout'
import Checkout from './pages/Checkout'
import CheckoutSuccess from './pages/CheckoutSuccess'
import Cart from './pages/Cart'
import CheckoutGifts from './pages/CheckoutGifts'
import CartDelivery from './pages/CartDelivery'
import OrderSuccess from './pages/OrderSuccess'

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
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/cart/delivery" element={<ProtectedRoute><CartDelivery /></ProtectedRoute>} />
          <Route path="/cart/checkout" element={<ProtectedRoute><CheckoutGifts /></ProtectedRoute>} />
          <Route path="/cart/checkout/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/gifts/:id" element={<ProtectedRoute><GiftDetails /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:section" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
        <SiteFooter />
      </BrowserRouter>
    </div>
  )

}
export default App
