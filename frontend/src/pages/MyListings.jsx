import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyListings, deleteListing } from '../api/listings'
import { useNotifications } from '../context/NotificationContext'
import ListingDetail from '../components/listings/ListingDetail'
import LoadingSpinner from '../components/common/LoadingSpinner'
import AnimatedSection from '../components/common/AnimatedSection'
import { PlusCircle, Trash2, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

export default function MyListings() {
  const { addToast } = useNotifications()
  const qc = useQueryClient()
  const [selected, setSelected] = useState(null)

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['myListings'],
    queryFn: () => getMyListings().then(r => r.data),
    refetchInterval: 30_000,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => { addToast('Listing removed', 'success'); qc.invalidateQueries(['myListings']) },
    onError: () => addToast('Failed to remove listing', 'error'),
  })

  const statusBadge = { available: 'badge-green', claimed: 'badge-amber', expired: 'badge-gray', deleted: 'badge-gray' }

  return (
    <div className="max-w-5xl mx-auto px-4 py-28 min-h-screen">
      <AnimatedSection className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-textPrimary">My Listings</h1>
          <p className="text-brand-textSecondary font-medium mt-2 text-lg">Manage your food donations</p>
        </div>
        <Link to="/add-listing" className="btn-primary py-3 px-6 shadow-lg">
          <PlusCircle className="w-5 h-5" /> Add Food
        </Link>
      </AnimatedSection>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : listings.length === 0 ? (
        <AnimatedSection delay={100} className="card text-center py-20">
          <div className="text-6xl mb-6">🍽️</div>
          <p className="text-brand-textSecondary font-medium text-lg mb-6">You haven't posted any listings yet</p>
          <Link to="/add-listing" className="btn-primary py-3 px-8 shadow-lg">Post Your First Listing</Link>
        </AnimatedSection>
      ) : (
        <AnimatedSection delay={100} className="card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5F0E8] border-b border-[#E8DFD0] text-left">
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-brand-textSecondary">Food</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-brand-textSecondary">Quantity</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-brand-textSecondary">Status</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-brand-textSecondary">Expires</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-brand-textSecondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE1]">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-[#FDFBF7] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-serif font-bold text-brand-textPrimary text-base group-hover:text-brand-olive transition-colors">{l.food_type}</p>
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary mt-0.5">{l.food_category}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-brand-textPrimary">{l.quantity} {l.quantity_unit}</td>
                    <td className="px-6 py-4">
                      <span className={statusBadge[l.status] || 'badge-gray'}>{l.status}</span>
                    </td>
                    <td className="px-6 py-4 text-brand-textSecondary font-medium text-xs">
                      {formatDistanceToNow(new Date(l.expires_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelected(l)}
                          className="p-2 text-brand-textSecondary hover:text-brand-olive hover:bg-[#F5F0E8] rounded-full transition-all"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {l.status === 'available' && (
                          <button
                            onClick={() => deleteMutation.mutate(l.id)}
                            className="p-2 text-brand-textSecondary hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            title="Delete listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedSection>
      )}
      {selected && <ListingDetail listing={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
