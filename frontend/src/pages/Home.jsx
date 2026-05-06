import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/common/Navbar'
import AnimatedSection from '../components/common/AnimatedSection'
import { ArrowRight, Utensils, Users, MapPin, Heart, Recycle } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-brand-cream selection:bg-brand-amber/30 pb-20 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20 min-h-screen">
        <div className="flex-1 text-center lg:text-left z-10">
          <AnimatedSection delay={100}>
            <h1 className="text-5xl sm:text-6xl lg:text-[5rem] font-serif font-extrabold text-brand-textPrimary leading-[1.1] mb-6">
              Rescue food, <br />
              feed your <span className="text-brand-olive italic">community.</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={300}>
            <p className="mt-4 text-lg sm:text-xl text-brand-textSecondary max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Join the hyper-local movement to eliminate food waste. Connect with neighbors, restaurants, and NGOs to share surplus food <span className="italic text-brand-amber font-serif text-2xl px-1">together.</span>
            </p>
          </AnimatedSection>
          <AnimatedSection delay={500} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/register" className="btn-primary py-4 px-8 text-lg w-full sm:w-auto shadow-xl">
              Join the Movement
            </Link>
            <Link to="/login" className="btn-secondary py-4 px-8 text-lg w-full sm:w-auto bg-transparent border-brand-textSecondary hover:border-brand-olive">
              Log In
            </Link>
          </AnimatedSection>
        </div>
        
        {/* Floating Hero Graphic */}
        <AnimatedSection delay={400} className="flex-1 relative hidden md:block">
          <div className="relative w-full max-w-lg mx-auto aspect-square animate-float">
            <div className="absolute inset-0 bg-brand-amber rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute top-10 left-0 bg-white p-5 rounded-2xl shadow-xl border border-[#F0EBE1] rotate-[-5deg]">
              <div className="text-6xl">🥗</div>
              <p className="mt-2 font-serif font-bold text-brand-textPrimary">Fresh Salad</p>
              <p className="text-xs text-brand-textSecondary uppercase tracking-widest font-bold">2 km away</p>
            </div>
            <div className="absolute bottom-10 right-10 bg-white p-5 rounded-2xl shadow-xl border border-[#F0EBE1] rotate-[8deg]">
              <div className="text-6xl">🥖</div>
              <p className="mt-2 font-serif font-bold text-brand-textPrimary">Artisan Bread</p>
              <p className="text-xs text-brand-textSecondary uppercase tracking-widest font-bold">Claimed!</p>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Marquee Strip */}
      <div className="bg-brand-olive py-4 overflow-hidden shadow-lg transform -skew-y-1 my-10 relative z-20">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center text-white font-bold uppercase tracking-widest text-sm mx-4">
              <span className="mx-8 text-brand-amber">✦</span> Zero Waste
              <span className="mx-8 text-brand-amber">✦</span> Hyper-Local
              <span className="mx-8 text-brand-amber">✦</span> Community First
              <span className="mx-8 text-brand-amber">✦</span> Food Rescue
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="text-5xl md:text-6xl font-serif font-bold text-brand-amber mb-2">1,200+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-brand-textSecondary">Meals Rescued</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-5xl md:text-6xl font-serif font-bold text-brand-olive mb-2">300+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-brand-textSecondary">Active Donors</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-5xl md:text-6xl font-serif font-bold text-brand-textPrimary mb-2">50+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-brand-textSecondary">Neighborhoods</div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-[#F0EBE1] relative">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-textPrimary mb-4">How it works</h2>
            <p className="text-brand-textSecondary font-medium max-w-2xl mx-auto text-lg">Three simple steps to make a difference in your local community.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-1/4 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-[#D4C5A9] -z-0"></div>

            {[
              { num: '1', title: 'Register', desc: 'Create a free account as a donor to share food, or a receiver to claim it.', icon: <Users className="w-8 h-8" /> },
              { num: '2', title: 'Post / Claim', desc: 'Upload surplus food details or browse the map for available food nearby.', icon: <MapPin className="w-8 h-8" /> },
              { num: '3', title: 'Collect', desc: 'Chat to coordinate, meet up locally, and mark the exchange as complete.', icon: <Heart className="w-8 h-8" /> },
            ].map((step, i) => (
              <AnimatedSection key={step.num} delay={i * 200} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-brand-olive text-white flex items-center justify-center text-3xl font-serif font-bold mb-6 shadow-xl border-4 border-[#F0EBE1] transform hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold font-serif text-brand-textPrimary mb-3">{step.title}</h3>
                <p className="text-brand-textSecondary font-medium max-w-[250px]">{step.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Parallax Section */}
      <section className="relative py-40 px-4 overflow-hidden flex items-center justify-center min-h-[60vh] bg-brand-olive">
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            transform: `translateY(${scrollY * 0.2}px)`
          }}
        ></div>
        <AnimatedSection className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-3xl md:text-5xl font-serif font-bold text-[#F5F0E8] italic leading-tight">
             "Good food belongs in <span className="text-brand-amber">bellies</span>, not bins. Together we can build a city where no meal goes to waste."
          </p>
          <div className="mt-12">
             <Link to="/register" className="bg-brand-amber text-brand-textPrimary hover:bg-[#D99A2D] px-8 py-4 rounded-full font-bold text-lg shadow-xl inline-block transition-transform hover:scale-105">
               Start Rescuing Today
             </Link>
          </div>
        </AnimatedSection>
      </section>

    </div>
  )
}
