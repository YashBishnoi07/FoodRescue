import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import BrowseFood from './pages/BrowseFood'
import AddListing from './pages/AddListing'
import MyListings from './pages/MyListings'
import MyClaims from './pages/MyClaims'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Donor routes */}
            <Route element={<ProtectedRoute allowedRoles={['donor', 'admin']} />}>
              <Route path="/my-listings" element={<MyListings />} />
              <Route path="/add-listing" element={<AddListing />} />
            </Route>

            {/* Receiver routes */}
            <Route element={<ProtectedRoute allowedRoles={['receiver', 'admin', 'donor']} />}>
              <Route path="/browse" element={<BrowseFood />} />
              <Route path="/my-claims" element={<MyClaims />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
