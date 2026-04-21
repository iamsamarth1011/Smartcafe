import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
})

socket.on('connect', () => console.log('Socket connected:', socket.id))
socket.on('disconnect', () => console.log('Socket disconnected'))
socket.on('connect_error', (err) => console.error('Socket error:', err.message))

export default socket
