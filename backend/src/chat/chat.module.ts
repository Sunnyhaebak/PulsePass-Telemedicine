import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { WsPassGuard } from './guards/ws-pass.guard';

@Module({
  providers: [ChatGateway, ChatService, WsPassGuard],
  exports: [ChatService],
})
export class ChatModule {}
