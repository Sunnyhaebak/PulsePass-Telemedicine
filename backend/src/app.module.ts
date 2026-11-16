import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { PassesModule } from './passes/passes.module';
import { SlotsModule } from './slots/slots.module';
import { ChatModule } from './chat/chat.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    PassesModule,
    SlotsModule,
    ChatModule,
    ReportsModule,
  ],
})
export class AppModule {}
