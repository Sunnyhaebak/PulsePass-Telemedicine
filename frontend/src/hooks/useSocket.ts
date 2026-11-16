import { useState, useEffect, useCallback } from 'react';
import { getSocket } from '../lib/socket';
import { ChatMessageDto, MessageType } from '@/types';

export function useChatSocket(passId: string) {
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  useEffect(() => {
    if (!passId) return;

    const socket = getSocket(passId);

    function onConnect() {
      setIsConnected(true);
      socket.emit('joinRoom', { passId });
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onRoomHistory(history: ChatMessageDto[]) {
      setMessages(history);
    }

    function onNewMessage(message: ChatMessageDto) {
      setMessages((prev) => [...prev, message]);
    }

    function onUserTyping(data: { userName: string; isTyping: boolean }) {
      setIsTyping(data.isTyping);
      setTypingUser(data.isTyping ? data.userName : null);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('roomHistory', onRoomHistory);
    socket.on('newMessage', onNewMessage);
    socket.on('userTyping', onUserTyping);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('roomHistory', onRoomHistory);
      socket.off('newMessage', onNewMessage);
      socket.off('userTyping', onUserTyping);
    };
  }, [passId]);

  const sendMessage = useCallback(
    (content: string, messageType: MessageType = MessageType.TEXT, reportId?: string) => {
      const socket = getSocket(passId);
      socket.emit('sendMessage', { passId, content, messageType, reportId });
    },
    [passId],
  );

  const sendTyping = useCallback(
    (userName: string, typingState: boolean) => {
      const socket = getSocket(passId);
      socket.emit('typing', { passId, userName, isTyping: typingState });
    },
    [passId],
  );

  return {
    messages,
    isConnected,
    isTyping,
    typingUser,
    sendMessage,
    sendTyping,
  };
}
