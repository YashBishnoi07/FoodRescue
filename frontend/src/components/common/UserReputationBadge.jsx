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
  if (data.total_ratings === 0) return <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 rounded">New User</span>

  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
      <Star className="w-3 h-3 fill-amber-400" />
      {data.average_rating} ({data.total_ratings})
    </span>
  )
}
