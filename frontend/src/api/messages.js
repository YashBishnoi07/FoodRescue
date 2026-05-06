import api from './axiosInstance'

export const getMessages = (claimId) => api.get(`/api/messages/${claimId}`)
export const sendMessage = (claimId, data) => api.post(`/api/messages/${claimId}`, data)
