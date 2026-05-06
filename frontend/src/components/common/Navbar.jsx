import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { Bell, LogOut, Leaf, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import Toast from './Toast'

const navLinks = {
  donor:    [{ to: '/dashboard', label: 'Dashboard' }, { to: '/my-listings', label: 'My Listings' }, { to: '/add-listing', label: 'Post Food' }, { to: '/browse', label: 'Browse Food' }],
  receiver: [{ to: '/dashboard', label: 'Dashboard' }, { to: '/browse', label: 'Find Food' }, { to: '/my-claims', label: 'My Claims' }],
  admin:    [{ to: '/dashboard', label: 'Dashboard' }, { to: '/browse', label: 'Browse' }, { to: '/admin', label: 'Admin Panel' }],
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { unreadCount, toasts, removeToast, notifications, markAllRead } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = user ? (navLinks[user.role] || []) : []
  const handleLogout = () => { logout(); navigate('/') }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-soft py-2' : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-brand-olive font-serif font-bold text-2xl tracking-tight">
              <Leaf className="w-7 h-7" />
              <span>FoodRescue</span>
            </Link>

            {/* Desktop nav */}
            {user && (
              <div className="hidden md:flex items-center gap-8">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`nav-link text-[15px] ${
                      location.pathname === l.to ? 'text-brand-textPrimary font-bold after:scale-x-100' : ''
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="relative">
                    <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-brand-textSecondary hover:text-brand-olive transition-colors">
                      <Bell className="w-6 h-6" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-[#E8A838] rounded-full text-[10px] flex items-center justify-center text-white font-bold border-2 border-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    {notifOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white border border-[#F0EBE1] rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
                        <div className="p-3 border-b border-[#F0EBE1] flex justify-between items-center bg-[#FAFAF8]">
                          <h3 className="text-sm font-bold text-brand-textPrimary">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-brand-olive hover:underline font-medium">Mark all read</button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="p-6 text-sm text-brand-textSecondary text-center">No notifications yet.</p>
                          ) : (
                            notifications.map(n => (
                              <div key={n.id} className={`p-4 border-b border-[#F0EBE1] last:border-0 ${!n.read ? 'bg-[#FDFBF7]' : ''}`}>
                                <p className="text-sm text-brand-textPrimary">{n.message}</p>
                                <p className="text-[10px] text-brand-textSecondary mt-1 uppercase tracking-wide">{new Date(n.created_at).toLocaleString()}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="hidden md:block text-sm text-brand-textPrimary font-medium">
                    {user.name} <span className="badge-green ml-1">{user.role}</span>
                  </span>
                  <button onClick={handleLogout} className="btn-secondary py-1.5 px-4 text-sm hidden sm:flex">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-brand-textPrimary hover:text-brand-olive font-medium transition-colors mr-2">Login</Link>
                  <Link to="/register" className="btn-primary py-2 px-6 shadow-none">Sign Up</Link>
                </>
              )}
              <button className="md:hidden p-2 text-brand-textPrimary" onClick={() => setOpen(!open)}>
                {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {open && user && (
          <div className="md:hidden bg-white border-t border-[#F0EBE1] px-4 py-4 space-y-3 shadow-lg absolute w-full left-0 top-full">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className="block text-base font-medium text-brand-textSecondary hover:text-brand-olive py-2">
                {l.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="w-full flex justify-center py-3 mt-4 btn-secondary">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </nav>

      {/* Toast container */}
      <div className="fixed top-24 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </>
  )
}
