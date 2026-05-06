import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogIn } from 'lucide-react'
import AnimatedSection from '../components/common/AnimatedSection'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-brand-cream">
      {/* Left split screen image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-brand-olive overflow-hidden items-center justify-center">
        {/* Placeholder for real image */}
        <div className="absolute inset-0 bg-[#2E5034] opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <AnimatedSection className="relative z-10 p-12 max-w-xl text-center">
          <p className="text-4xl font-serif font-bold text-[#F5F0E8] italic leading-relaxed">
            "We have the power to turn excess into impact."
          </p>
          <p className="text-[#D4C5A9] mt-6 font-medium uppercase tracking-widest text-sm">— The HyperLocal Community</p>
        </AnimatedSection>
      </div>

      {/* Right split screen form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 py-12">
        <AnimatedSection className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-serif font-bold text-brand-textPrimary">Welcome back</h2>
            <p className="mt-3 text-brand-textSecondary font-medium">Log in to continue rescuing food.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-brand-amber/10 border border-brand-amber text-brand-amber text-sm p-4 rounded-[12px] font-medium text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="label">Email Address</label>
              <input type="email" required className="input" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="label">Password</label>
              <input type="password" required className="input" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-lg shadow-xl">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-brand-textSecondary font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-olive hover:text-[#2E5034] font-bold border-b border-transparent hover:border-[#2E5034] transition-colors pb-0.5">
              Sign up for free
            </Link>
          </p>
        </AnimatedSection>
      </div>
    </div>
  )
}
