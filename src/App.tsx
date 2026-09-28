import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Login from './pages/Login'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import LandingPage from './pages/LandingPage'
import Gifts from './pages/Gifts'
import GiftDetails from './pages/GiftDetails'
import Profile from './pages/Profile'
import ProtectedRoute from './utils/ProtectedRoute'
import Checkout from './pages/Checkout'
import CheckoutSuccess from './pages/CheckoutSuccess'

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen flex flex-col">
                <ScrollToHash />
                <SiteHeader />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/checkout/success/:paymentId" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
                    <Route path="/checkout/:plan" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                    <Route path="/gifts" element={<ProtectedRoute><Gifts /></ProtectedRoute>} />
                    <Route path="/gifts/:id" element={<ProtectedRoute><GiftDetails /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/profile/:section" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                </Routes>
                <SiteFooter />
            </div>
        </BrowserRouter>
    )

}
export default App