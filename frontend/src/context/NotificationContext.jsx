import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markAllRead } from '../api/claims'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [toasts, setToasts] = useState([])

  const qc = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await getNotifications()
      return res.data
    },
    enabled: !!user,
    refetchInterval: 15_000,
  })

  const notifications = data || []
  const unreadCount = notifications.filter((n) => !n.read).length

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  useEffect(() => {
    if (!user) return

    // Request native push notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const token = localStorage.getItem('access_token')
    if (!token) return

    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//localhost:8000/api/notifications/ws?token=${token}`
    const ws = new WebSocket(wsUrl)

    ws.onmessage = (event) => {
      try {
        const notif = JSON.parse(event.data)
        // Show in-app toast
        addToast(notif.message, notif.type)
        // Show native push notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notif.title || 'FoodRescue', { body: notif.message, icon: '/vite.svg' })
        }
        // Invalidate queries to refresh data
        qc.invalidateQueries(['notifications'])
      } catch (e) {
        console.error('WS Error:', e)
      }
    }

    return () => ws.close()
  }, [user, addToast, qc])

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, toasts, addToast, removeToast, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
