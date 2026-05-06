import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserPlus } from 'lucide-react'
import AnimatedSection from '../components/common/AnimatedSection'

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'receiver' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(formData)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-brand-cream">
      {/* Left split screen image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-brand-amber overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[#E8A838] opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#D99A2D] to-transparent"></div>
        <AnimatedSection className="relative z-10 p-12 max-w-xl text-center">
          <p className="text-4xl font-serif font-bold text-[#1C1C1C] italic leading-relaxed">
            "Join the movement to connect surplus food with empty plates."
          </p>
          <p className="text-[#6B6B6B] mt-6 font-medium uppercase tracking-widest text-sm">— HyperLocal Mission</p>
        </AnimatedSection>
      </div>

      {/* Right split screen form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 py-12">
        <AnimatedSection className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-serif font-bold text-brand-textPrimary">Create an account</h2>
            <p className="mt-3 text-brand-textSecondary font-medium">Join us as a food donor or receiver.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-brand-amber/10 border border-brand-amber text-brand-amber text-sm p-4 rounded-[12px] font-medium text-center">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'donor' })}
                className={`py-3 px-4 rounded-[12px] font-bold border transition-all ${
                  formData.role === 'donor' 
                    ? 'bg-brand-olive text-white border-brand-olive shadow-soft' 
                    : 'bg-white text-brand-textSecondary border-[#D4C5A9] hover:border-brand-olive'
                }`}
              >
                I want to Donate
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'receiver' })}
                className={`py-3 px-4 rounded-[12px] font-bold border transition-all ${
                  formData.role === 'receiver' 
                    ? 'bg-brand-olive text-white border-brand-olive shadow-soft' 
                    : 'bg-white text-brand-textSecondary border-[#D4C5A9] hover:border-brand-olive'
                }`}
              >
                I need Food
              </button>
            </div>

            <div>
              <label className="label">Full Name</label>
              <input type="text" required className="input" placeholder="Alex Johnson"
                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div>
              <label className="label">Email Address</label>
              <input type="email" required className="input" placeholder="alex@example.com"
                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>

            <div>
              <label className="label">Password</label>
              <input type="password" required className="input" placeholder="Create a strong password"
                value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2 text-lg shadow-xl">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-brand-textSecondary font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-olive hover:text-[#2E5034] font-bold border-b border-transparent hover:border-[#2E5034] transition-colors pb-0.5">
              Log in here
            </Link>
          </p>
        </AnimatedSection>
      </div>
    </div>
  )
}
