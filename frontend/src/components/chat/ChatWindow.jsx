import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMessages, sendMessage } from '../../api/messages'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { Send, X } from 'lucide-react'

export default function ChatWindow({ claimId, onClose }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const messagesEndRef = useRef(null)
  const qc = useQueryClient()

  const { addToast } = useNotifications()

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', claimId],
    queryFn: () => getMessages(claimId).then(res => res.data),
    refetchInterval: 5000 // Poll every 5s for new messages
  })

  const sendMutation = useMutation({
    mutationFn: (msg) => sendMessage(claimId, { content: msg }),
    onSuccess: () => {
      setContent('')
      qc.invalidateQueries(['messages', claimId])
    },
    onError: (e) => {
      addToast(e.response?.data?.detail || 'Failed to send message', 'error')
    }
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return
    sendMutation.mutate(content)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col h-[600px] max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50 rounded-t-2xl">
          <h3 className="font-bold text-white">Direct Message</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-gray-500">Loading chat...</div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500 text-sm">No messages yet. Say hi!</div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === user.id
              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                    isMine ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 mx-1">
                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800 bg-gray-900/50 rounded-b-2xl flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-500"
            disabled={sendMutation.isPending}
          />
          <button 
            type="submit" 
            disabled={!content.trim() || sendMutation.isPending}
            className="bg-brand-600 text-white p-2 px-3 rounded-xl hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
