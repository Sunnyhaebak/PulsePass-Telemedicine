import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { WsPassGuard } from './guards/ws-pass.guard';
import { MessageType } from '@prisma/client';

describe('ChatGateway (Unit Test)', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;

  const mockChatService = {
    saveMessage: jest.fn(),
    getRoomMessages: jest.fn(),
  };

  const mockWsPassGuard = {
    canActivate: jest.fn().mockResolvedValue(true),
  };

  const mockSocket = {
    id: 'socket-test-1',
    join: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
    handshake: {
      auth: { userId: 'patient-uuid-1' },
      query: { passId: 'pass-uuid-1' },
    },
  };

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: ChatService, useValue: mockChatService },
      ],
    })
      .overrideGuard(WsPassGuard)
      .useValue(mockWsPassGuard)
      .compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);
    gateway.server = mockServer as any;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleJoinRoom', () => {
    it('should join the scoped pass room and emit message history', async () => {
      mockChatService.getRoomMessages.mockResolvedValue([
        { id: 'msg-1', content: 'Hello Doctor', createdAt: new Date() },
      ]);

      await gateway.handleJoinRoom(mockSocket as any, { passId: 'pass-999' });

      expect(mockSocket.join).toHaveBeenCalledWith('pass_pass-999');
      expect(mockSocket.emit).toHaveBeenCalledWith('roomHistory', expect.any(Array));
    });
  });

  describe('handleSendMessage', () => {
    it('should persist message and broadcast to pass room members', async () => {
      const mockSavedMsg = {
        id: 'msg-new-1',
        passId: 'pass-999',
        content: 'Report uploaded',
        messageType: MessageType.TEXT,
      };
      mockChatService.saveMessage.mockResolvedValue(mockSavedMsg);

      await gateway.handleSendMessage(mockSocket as any, {
        passId: 'pass-999',
        content: 'Report uploaded',
        messageType: MessageType.TEXT,
      });

      expect(mockChatService.saveMessage).toHaveBeenCalledWith(
        'patient-uuid-1',
        expect.objectContaining({ content: 'Report uploaded' }),
      );
      expect(mockServer.to).toHaveBeenCalledWith('pass_pass-999');
      expect(mockServer.emit).toHaveBeenCalledWith('newMessage', mockSavedMsg);
    });
  });
});
