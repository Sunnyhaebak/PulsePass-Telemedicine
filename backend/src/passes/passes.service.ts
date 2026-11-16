import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { CreatePassOrderDto } from './dto/create-pass.dto';
import { PassStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class PassesService {
  private readonly logger = new Logger(PassesService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  /**
   * Create Razorpay Order for a 7-day consultation pass
   */
  async createPassOrder(patientId: string, dto: CreatePassOrderDto) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { id: dto.doctorId },
      include: { user: true },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    const amountInPaise = (dto.amount || doctor.consultationFee) * 100;

    return {
      orderId,
      amount: amountInPaise,
      currency: dto.currency || 'INR',
      doctor: {
        id: doctor.id,
        name: doctor.user.fullName,
        specialization: doctor.specialization,
        passFee: doctor.consultationFee,
        passDurationDays: doctor.passDurationDays,
      },
      keyId: this.configService.get<string>('RAZORPAY_KEY_ID', 'rzp_test_placeholder_key'),
    };
  }

  /**
   * Handle idempotent Razorpay Webhook to activate 7-day pass
   */
  async handleRazorpayWebhook(payload: any, signature: string) {
    const webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET', 'test_webhook_secret');
    
    // Validate HMAC SHA256 signature if in production
    if (signature && process.env.NODE_ENV === 'production') {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    const paymentEntity = payload.payload?.payment?.entity;
    if (!paymentEntity) return { status: 'IGNORED' };

    const orderId = paymentEntity.order_id;
    const patientId = paymentEntity.notes?.patientId;
    const doctorId = paymentEntity.notes?.doctorId;
    const amountPaid = Math.floor(paymentEntity.amount / 100);

    if (!patientId || !doctorId) {
      this.logger.warn(`Webhook received for order ${orderId} without patientId/doctorId notes`);
      return { status: 'MISSING_METADATA' };
    }

    // Idempotency: Check if pass already activated for this order
    const existingPass = await this.prisma.consultationPass.findUnique({
      where: { paymentOrderId: orderId },
    });

    if (existingPass) {
      this.logger.log(`Pass already activated for order ${orderId} (Idempotent success)`);
      return { status: 'ALREADY_ACTIVATED', passId: existingPass.id };
    }

    // Calculate 7-day window
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const pass = await this.prisma.consultationPass.create({
      data: {
        patientId,
        doctorId,
        paymentOrderId: orderId,
        amountPaid,
        currency: 'INR',
        startsAt: now,
        expiresAt,
        status: PassStatus.ACTIVE,
      },
    });

    // Cache active pass TTL in Redis (7 days = 604,800 seconds)
    const redisKey = `pass:active:${pass.id}`;
    await this.redisService.setWithExpiry(redisKey, '1', 7 * 24 * 60 * 60);

    this.logger.log(`Activated 7-Day Pass ${pass.id} for Patient ${patientId} with Doctor ${doctorId}`);

    return { status: 'ACTIVATED', passId: pass.id, expiresAt };
  }

  /**
   * Validate whether patient has an active consultation pass for this doctor
   */
  async getActivePassForDoctor(patientId: string, doctorId: string) {
    const now = new Date();
    const pass = await this.prisma.consultationPass.findFirst({
      where: {
        patientId,
        doctorId,
        status: PassStatus.ACTIVE,
        expiresAt: { gt: now },
      },
      include: {
        doctor: { include: { user: true } },
      },
      orderBy: { expiresAt: 'desc' },
    });

    return pass;
  }

  /**
   * Fetch all patient passes
   */
  async getPatientPasses(patientId: string) {
    return this.prisma.consultationPass.findMany({
      where: { patientId },
      include: {
        doctor: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
