import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import LandingPage from './pages/LandingPage'
import Gifts from './pages/Gifts'
import GiftDetails from './pages/GiftDetails'
import Profile from './pages/Profile'
import ProtectedRoute from './utils/ProtectedRoute'
import AdminRoute from './utils/AdminRoute'
import Admin from './pages/Admin'
import AdminUsers from './pages/AdminUsers'
import AdminProducts from './pages/AdminProducts'
import AdminOrders from './pages/AdminOrders'
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
                    <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                    <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                    <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                    <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
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
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/profile/:section" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                </Routes>
                <SiteFooter />
            </div>
        </BrowserRouter>
    )
}

export default App
