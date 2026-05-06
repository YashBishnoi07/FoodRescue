import { useQuery } from '@tanstack/react-query'
import { getUserReputation } from '../../api/auth'
import { Star } from 'lucide-react'

export default function UserReputationBadge({ userId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['reputation', userId],
    queryFn: () => getUserReputation(userId).then(r => r.data),
    staleTime: 60000,
  })

  if (isLoading || !data) return null
  if (data.total_ratings === 0) return <span className="text-[10px] font-bold uppercase tracking-wider text-brand-textSecondary bg-[#F5F0E8] px-2 py-0.5 rounded-full border border-[#E8DFD0]">New User</span>

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-amber bg-[#FDF5E6] px-2 py-0.5 rounded-full border border-[#FBE3B8]">
      <Star className="w-3 h-3 fill-brand-amber text-brand-amber" />
      {data.average_rating} ({data.total_ratings})
    </span>
  )
}
