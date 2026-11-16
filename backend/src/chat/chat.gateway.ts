import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { WsPassGuard } from './guards/ws-pass.guard';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { passId: string },
  ) {
    const roomName = `pass_${data.passId}`;
    client.join(roomName);
    this.logger.log(`Socket ${client.id} joined ${roomName}`);

    // Return message history
    const history = await this.chatService.getRoomMessages(data.passId);
    client.emit('roomHistory', history);
  }

  @UseGuards(WsPassGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const senderId = client.handshake.auth?.userId || 'usr_pat_101';
    const roomName = `pass_${dto.passId}`;

    const savedMessage = await this.chatService.saveMessage(senderId, dto);

    // Broadcast to room members
    this.server.to(roomName).emit('newMessage', savedMessage);
    return savedMessage;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { passId: string; userName: string; isTyping: boolean },
  ) {
    client.to(`pass_${data.passId}`).emit('userTyping', data);
  }
}
