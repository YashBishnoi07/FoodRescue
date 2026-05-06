import api from './axiosInstance'

export const registerUser = (data) => api.post('/api/auth/register', data)
export const loginUser = (data) => api.post('/api/auth/login', data)
export const refreshToken = (data) => api.post('/api/auth/refresh', data)
export const getMe = () => api.get('/api/auth/me', { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0' } })
export const updateMe = (data) => api.put('/api/auth/me', data)
export const updateFcmToken = (data) => api.post('/api/auth/update-fcm-token', data)
