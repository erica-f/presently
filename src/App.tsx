import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import Register from './pages/Register'
import MembershipOnboarding from './pages/MembershipOnboarding'
import Cart from './pages/Cart'
import CheckoutGifts from './pages/CheckoutGifts'
import CartDelivery from './pages/CartDelivery'
import OrderSuccess from './pages/OrderSuccess'
import { ScrollToHash } from './utils/scroll'
import MembershipProtectedRoute from './utils/membershipRoute'

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen flex flex-col">
                <ScrollToHash />
                <SiteHeader />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/register/membership" element={<ProtectedRoute><MembershipOnboarding /></ProtectedRoute>} />
                    <Route path="/checkout/success/:paymentId" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
                    <Route path="/checkout/:plan" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                    <Route path="/gifts" element={<ProtectedRoute><MembershipProtectedRoute><Gifts /></MembershipProtectedRoute></ProtectedRoute>} />
                    <Route path="/gifts/:id" element={<ProtectedRoute><MembershipProtectedRoute><GiftDetails /></MembershipProtectedRoute></ProtectedRoute>} />
                    <Route path="/cart" element={<ProtectedRoute><MembershipProtectedRoute><Cart /></MembershipProtectedRoute></ProtectedRoute>} />
                    <Route path="/cart/delivery" element={<ProtectedRoute><MembershipProtectedRoute><CartDelivery /></MembershipProtectedRoute></ProtectedRoute>} />
                    <Route path="/cart/checkout" element={<ProtectedRoute><MembershipProtectedRoute><CheckoutGifts /></MembershipProtectedRoute></ProtectedRoute>} />
                    <Route path="/cart/checkout/success" element={<ProtectedRoute><MembershipProtectedRoute><OrderSuccess /></MembershipProtectedRoute></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><MembershipProtectedRoute><Profile /></MembershipProtectedRoute></ProtectedRoute>} />
                    <Route path="/profile/:section" element={<ProtectedRoute><MembershipProtectedRoute><Profile /></MembershipProtectedRoute></ProtectedRoute>} />
                </Routes>
                <SiteFooter />
            </div>
        </BrowserRouter>
    )
}

export default App
