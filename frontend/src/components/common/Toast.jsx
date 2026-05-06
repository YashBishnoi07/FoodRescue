import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react'

const config = {
  success: {
    icon: <CheckCircle className="w-5 h-5 text-brand-olive shrink-0" />,
    border: 'border-l-4 border-brand-olive',
    bg: 'bg-white',
  },
  info: {
    icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    border: 'border-l-4 border-blue-500',
    bg: 'bg-white',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-brand-amber shrink-0" />,
    border: 'border-l-4 border-brand-amber',
    bg: 'bg-white',
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-red-500 shrink-0" />,
    border: 'border-l-4 border-red-500',
    bg: 'bg-white',
  },
}

export default function Toast({ toast, onClose }) {
  const c = config[toast.type] || config.info
  return (
    <div className={`flex items-start gap-3 ${c.bg} ${c.border} rounded-xl p-4 min-w-72 max-w-sm shadow-xl border-[#F0EBE1] border border-l-[4px] animate-slide-up`}>
      {c.icon}
      <p className="flex-1 text-sm font-semibold text-brand-textPrimary leading-snug">{toast.message}</p>
      <button onClick={onClose} className="text-brand-textSecondary hover:text-brand-textPrimary transition-colors shrink-0 p-0.5 hover:bg-[#F5F0E8] rounded-full">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
