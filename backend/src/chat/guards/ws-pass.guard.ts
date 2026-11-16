import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { RedisService } from '../../common/redis/redis.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class WsPassGuard implements CanActivate {
  private readonly logger = new Logger(WsPassGuard.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    const passId = data?.passId || client.handshake?.query?.passId;

    if (!passId) {
      throw new WsException('Missing passId in WebSocket payload');
    }

    // Step 1: Check Redis fast-cache TTL (sub-millisecond gateway guard)
    const isCachedActive = await this.redisService.get(`pass:active:${passId}`);
    if (isCachedActive === '1') {
      return true;
    }

    // Step 2: Fallback to PostgreSQL check if Redis key missed
    const pass = await this.prisma.consultationPass.findUnique({
      where: { id: passId },
    });

    if (!pass || pass.status !== 'ACTIVE' || new Date(pass.expiresAt) <= new Date()) {
      this.logger.warn(`WS message rejected: 7-day pass ${passId} has expired`);
      throw new WsException('Consultation pass expired. Messaging is locked.');
    }

    // Re-prime Redis cache with remaining seconds
    const remainingSeconds = Math.max(1, Math.floor((new Date(pass.expiresAt).getTime() - Date.now()) / 1000));
    await this.redisService.setWithExpiry(`pass:active:${passId}`, '1', remainingSeconds);

    return true;
  }
}
