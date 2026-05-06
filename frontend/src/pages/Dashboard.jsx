import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyListings } from '../api/listings'
import { getMyClaims } from '../api/claims'
import { getMyStats } from '../api/auth'
import api from '../api/axiosInstance'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ChatWindow from '../components/chat/ChatWindow'
import ListingDetail from '../components/listings/ListingDetail'
import AnimatedSection from '../components/common/AnimatedSection'
import { PlusCircle, List, ArrowRight, Package, CheckCircle, Clock, MessageCircle, Eye, Leaf } from 'lucide-react'

function StatCard({ icon, label, value, color = 'text-brand-olive' }) {
  return (
    <div className="stat-card flex items-center gap-4">
      <div className={`p-3 rounded-full bg-[#F5F0E8] shadow-sm border border-[#E8DFD0] ${color}`}>
        {icon}
      </div>
      <div>
        <div className={`text-3xl font-serif font-bold tracking-tight ${color}`}>{value}</div>
        <div className="text-[11px] text-brand-textSecondary font-bold uppercase tracking-wider mt-0.5">{label}</div>
      </div>
    </div>
  )
}

function DonorDashboard({ user }) {
  const [selected, setSelected] = useState(null)
  const { data: listings = [], isLoading } = useQuery({ queryKey: ['myListings'], queryFn: () => getMyListings().then(r => r.data) })
  const { data: stats } = useQuery({ queryKey: ['myStats'], queryFn: () => getMyStats().then(r => r.data) })

  return (
    <div className="space-y-8 relative">
      <AnimatedSection delay={100} className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <StatCard icon={<Package />} label="Active" value={stats?.active_engagements || 0} />
        <StatCard icon={<CheckCircle />} label="Claimed" value={stats?.completed_engagements || 0} color="text-brand-olive" />
        <StatCard icon={<List />} label="Donated" value={`${stats?.food_rescued_kg || 0}kg`} color="text-brand-amber" />
        <StatCard icon={<Leaf />} label="CO2 Saved" value={`${stats?.co2_saved_kg || 0}kg`} color="text-brand-olive" />
      </AnimatedSection>
      
      <AnimatedSection delay={200} className="flex gap-4">
        <Link to="/add-listing" className="btn-primary py-3"><PlusCircle className="w-5 h-5" /> Post Food</Link>
        <Link to="/my-listings" className="btn-secondary py-3"><List className="w-5 h-5" /> My Listings</Link>
      </AnimatedSection>
      
      <AnimatedSection delay={300} className="card">
        <h3 className="text-sm font-bold text-brand-textPrimary uppercase tracking-wider mb-4">Recent Listings</h3>
        {isLoading ? <LoadingSpinner /> : listings.slice(0, 5).map(l => (
          <div key={l.id} className="flex items-center justify-between py-4 border-b border-[#F0EBE1] last:border-0 hover:bg-[#FAF7F2] -mx-5 px-5 transition-colors">
            <div>
              <p className="text-base font-serif font-semibold text-brand-textPrimary">{l.food_type}</p>
              <p className="text-xs text-brand-textSecondary font-medium mt-0.5">{l.quantity} {l.quantity_unit} • {l.food_category}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={l.status === 'available' ? 'badge-green' : l.status === 'claimed' ? 'badge-amber' : 'badge-gray'}>
                {l.status}
              </span>
              <button onClick={() => setSelected(l)} className="p-2 text-brand-textSecondary hover:text-brand-olive transition-colors bg-white border border-[#E8DFD0] rounded-full shadow-sm hover:shadow-md">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {!isLoading && listings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="text-5xl mb-4 opacity-50">🥣</div>
            <p className="text-brand-textSecondary text-sm mb-4">Your kitchen is quiet. Time to share a meal!</p>
            <Link to="/add-listing" className="btn-primary py-2 text-sm">Post Food</Link>
          </div>
        )}
      </AnimatedSection>
      {selected && <ListingDetail listing={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function ReceiverDashboard({ user }) {
  const [activeChat, setActiveChat] = useState(null)
  const { data: claims = [] } = useQuery({ queryKey: ['myClaims'], queryFn: () => getMyClaims().then(r => r.data) })
  const { data: stats } = useQuery({ queryKey: ['myStats'], queryFn: () => getMyStats().then(r => r.data) })

  return (
    <div className="space-y-8 relative">
      <AnimatedSection delay={100} className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <StatCard icon={<Clock />} label="Active" value={stats?.active_engagements || 0} />
        <StatCard icon={<CheckCircle />} label="Completed" value={stats?.completed_engagements || 0} color="text-brand-olive" />
        <StatCard icon={<List />} label="Rescued" value={`${stats?.food_rescued_kg || 0}kg`} color="text-brand-amber" />
        <StatCard icon={<Leaf />} label="CO2 Saved" value={`${stats?.co2_saved_kg || 0}kg`} color="text-brand-olive" />
      </AnimatedSection>
      
      <AnimatedSection delay={200} className="flex gap-4">
        <Link to="/browse" className="btn-primary py-3">🍽️ Find Food</Link>
        <Link to="/my-claims" className="btn-secondary py-3"><List className="w-5 h-5" /> My Claims</Link>
      </AnimatedSection>
      
      <AnimatedSection delay={300} className="card">
        <h3 className="text-sm font-bold text-brand-textPrimary uppercase tracking-wider mb-4">Recent Claims</h3>
        {claims.slice(0, 5).map(c => (
          <div key={c.id} className="flex items-center justify-between py-4 border-b border-[#F0EBE1] last:border-0 hover:bg-[#FAF7F2] -mx-5 px-5 transition-colors">
            <p className="text-base font-serif font-medium text-brand-textPrimary">Claim #{c.listing_id.slice(0, 6)}</p>
            <div className="flex items-center gap-3">
              <span className={c.status === 'completed' ? 'badge-green' : c.status === 'pending' ? 'badge-amber' : 'badge-gray'}>
                {c.status}
              </span>
              {['pending', 'confirmed'].includes(c.status) && (
                <button onClick={() => setActiveChat(c.id)} className="btn-secondary py-1 px-3 text-xs flex items-center gap-1 shadow-sm">
                  <MessageCircle className="w-4 h-4" /> Chat
                </button>
              )}
            </div>
          </div>
        ))}
        {claims.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="text-5xl mb-4 opacity-50">🥗</div>
            <p className="text-brand-textSecondary text-sm mb-4">You haven't rescued any food yet.</p>
            <Link to="/browse" className="btn-primary py-2 text-sm">Find Food Nearby</Link>
          </div>
        )}
      </AnimatedSection>
      {activeChat && <ChatWindow claimId={activeChat} onClose={() => setActiveChat(null)} />}
    </div>
  )
}

function AdminDashboard() {
  const { data: stats } = useQuery({ queryKey: ['adminStats'], queryFn: () => api.get('/api/admin/stats').then(r => r.data) })
  if (!stats) return <LoadingSpinner />
  return (
    <AnimatedSection className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Users', value: stats.total_users, icon: '👥', color: 'text-brand-olive' },
          { label: 'Total Listings', value: stats.total_listings, icon: '📋', color: 'text-brand-textPrimary' },
          { label: 'Active Listings', value: stats.active_listings, icon: '✅', color: 'text-brand-amber' },
          { label: 'Food Saved (kg)', value: `${stats.total_kg_saved}`, icon: '🌿', color: 'text-brand-olive' },
        ].map((s, i) => <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />)}
      </div>
      <Link to="/admin" className="btn-primary inline-flex py-3">Go to Admin Panel <ArrowRight className="w-5 h-5" /></Link>
    </AnimatedSection>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  if (!user) return <LoadingSpinner />
  return (
    <div className="max-w-5xl mx-auto px-4 py-28 min-h-screen">
      <AnimatedSection className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-textPrimary mb-2">Welcome back, {user.name} <span className="text-brand-olive italic text-3xl md:text-4xl">🌿</span></h1>
        <p className="text-brand-textSecondary text-lg uppercase tracking-wider font-semibold mt-4">{user.role} Dashboard</p>
      </AnimatedSection>
      {user.role === 'donor'    && <DonorDashboard user={user} />}
      {user.role === 'receiver' && <ReceiverDashboard user={user} />}
      {user.role === 'admin'    && <AdminDashboard />}
    </div>
  )
}
