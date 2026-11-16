import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async saveMessage(senderId: string, dto: SendMessageDto) {
    return this.prisma.chatMessage.create({
      data: {
        passId: dto.passId,
        senderId,
        content: dto.content,
        messageType: dto.messageType || 'TEXT',
        reportId: dto.reportId,
      },
      include: {
        sender: {
          select: { id: true, fullName: true, role: true },
        },
      },
    });
  }

  async getRoomMessages(passId: string) {
    return this.prisma.chatMessage.findMany({
      where: { passId },
      include: {
        sender: {
          select: { id: true, fullName: true, role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
