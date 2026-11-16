import { Test, TestingModule } from '@nestjs/testing';
import { PassesService } from './passes.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { PassStatus } from '@prisma/client';

describe('PassesService (Unit Test)', () => {
  let service: PassesService;
  let prisma: PrismaService;
  let redis: RedisService;

  const mockPrisma = {
    doctorProfile: { findUnique: jest.fn() },
    consultationPass: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockRedis = {
    setWithExpiry: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn().mockImplementation((key, defaultVal) => defaultVal),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PassesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<PassesService>(PassesService);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleRazorpayWebhook', () => {
    const mockWebhookPayload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_123',
            order_id: 'order_test_456',
            amount: 50000, // 500 INR in paise
            notes: {
              patientId: 'patient-uuid-1',
              doctorId: 'doctor-uuid-2',
            },
          },
        },
      },
    };

    it('should activate a 7-day pass and set Redis TTL when payment is verified', async () => {
      mockPrisma.consultationPass.findUnique.mockResolvedValue(null); // not existing yet
      mockPrisma.consultationPass.create.mockImplementation((args) => ({
        id: 'pass-uuid-999',
        ...args.data,
      }));

      const res = await service.handleRazorpayWebhook(mockWebhookPayload, 'mock_sig');

      expect(res.status).toBe('ACTIVATED');
      expect(res.passId).toBe('pass-uuid-999');
      expect(mockPrisma.consultationPass.create).toHaveBeenCalled();

      // Check 7 days TTL (7 * 24 * 60 * 60 = 604800 seconds)
      expect(mockRedis.setWithExpiry).toHaveBeenCalledWith(
        'pass:active:pass-uuid-999',
        '1',
        604800,
      );
    });

    it('should be idempotent and not create duplicate passes if webhook fires twice', async () => {
      mockPrisma.consultationPass.findUnique.mockResolvedValue({
        id: 'pass-already-exists',
        paymentOrderId: 'order_test_456',
      });

      const res = await service.handleRazorpayWebhook(mockWebhookPayload, 'mock_sig');

      expect(res.status).toBe('ALREADY_ACTIVATED');
      expect(res.passId).toBe('pass-already-exists');
      expect(mockPrisma.consultationPass.create).not.toHaveBeenCalled();
    });
  });

  describe('getActivePassForDoctor', () => {
    it('should return active pass if expiration date is in the future', async () => {
      const futureDate = new Date(Date.now() + 86400000 * 5); // 5 days in future
      mockPrisma.consultationPass.findFirst.mockResolvedValue({
        id: 'pass-active',
        patientId: 'p-1',
        doctorId: 'd-1',
        expiresAt: futureDate,
        status: PassStatus.ACTIVE,
      });

      const pass = await service.getActivePassForDoctor('p-1', 'd-1');
      expect(pass).toBeDefined();
      expect(pass.id).toBe('pass-active');
    });
  });
});
