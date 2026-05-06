import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { Bell, LogOut, Leaf, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Toast from './Toast'

const navLinks = {
  donor:    [{ to: '/dashboard', label: 'Dashboard' }, { to: '/my-listings', label: 'My Listings' }, { to: '/add-listing', label: '+ Add Food' }, { to: '/browse', label: 'Browse Food' }],
  receiver: [{ to: '/dashboard', label: 'Dashboard' }, { to: '/browse', label: 'Browse Food' }, { to: '/my-claims', label: 'My Claims' }],
  admin:    [{ to: '/dashboard', label: 'Dashboard' }, { to: '/browse', label: 'Browse' }, { to: '/admin', label: 'Admin Panel' }],
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { unreadCount, toasts, removeToast, notifications, markAllRead } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const links = user ? (navLinks[user.role] || []) : []

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-brand-400 font-bold text-xl">
              <Leaf className="w-6 h-6" />
              <span>FoodRescue</span>
            </Link>

            {/* Desktop nav */}
            {user && (
              <div className="hidden md:flex items-center gap-6">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === l.to ? 'text-brand-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="relative">
                    <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-gray-400 hover:text-white transition-colors">
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    {notifOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in">
                        <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                          <h3 className="text-sm font-bold text-white">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-brand-400 hover:underline">Mark all read</button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="p-4 text-sm text-gray-500 text-center">No notifications yet.</p>
                          ) : (
                            notifications.map(n => (
                              <div key={n.id} className={`p-3 border-b border-gray-800 last:border-0 ${!n.read ? 'bg-gray-800/50' : ''}`}>
                                <p className="text-sm text-gray-200">{n.message}</p>
                                <p className="text-[10px] text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="hidden md:block text-sm text-gray-300">
                    {user.name} <span className="badge-green ml-1">{user.role}</span>
                  </span>
                  <button onClick={handleLogout} className="btn-secondary py-1.5 text-sm">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary py-1.5 text-sm">Login</Link>
                  <Link to="/register" className="btn-primary py-1.5 text-sm">Sign Up</Link>
                </>
              )}
              <button className="md:hidden p-2 text-gray-400" onClick={() => setOpen(!open)}>
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {open && user && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-3 space-y-2 animate-fade-in">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className="block text-sm font-medium text-gray-300 hover:text-brand-400 py-1.5">
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Toast container */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </>
  )
}
