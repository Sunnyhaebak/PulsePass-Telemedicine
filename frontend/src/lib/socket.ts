import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(passId?: string): Socket {
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000/chat';
  const token = typeof window !== 'undefined' ? localStorage.getItem('pulsepass_token') : null;
  const userId = typeof window !== 'undefined' ? localStorage.getItem('pulsepass_user_id') : 'usr_pat_101';

  if (!socket) {
    socket = io(WS_URL, {
      autoConnect: true,
      transports: ['websocket'],
      auth: { token, userId },
      query: passId ? { passId } : {},
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
