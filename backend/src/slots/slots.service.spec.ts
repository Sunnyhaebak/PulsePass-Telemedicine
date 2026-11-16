import { Test, TestingModule } from '@nestjs/testing';
import { SlotsService } from './slots.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { DistributedLockService } from '../common/redis/distributed-lock.service';
import { RedisService } from '../common/redis/redis.service';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { PassStatus, SlotStatus } from '@prisma/client';

describe('SlotsService - Concurrency & Distributed Lock (Unit Test)', () => {
  let service: SlotsService;
  let prisma: PrismaService;
  let lockService: DistributedLockService;

  const mockPrisma = {
    consultationPass: {
      findUnique: jest.fn(),
    },
    timeSlot: {
      findUnique: jest.fn(),
      update: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  const mockLockService = {
    acquireLock: jest.fn(),
    releaseLock: jest.fn().mockResolvedValue(true),
  };

  const mockRedisService = {
    get: jest.fn(),
    setWithExpiry: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlotsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: DistributedLockService, useValue: mockLockService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<SlotsService>(SlotsService);
    prisma = module.get<PrismaService>(PrismaService);
    lockService = module.get<DistributedLockService>(DistributedLockService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bookSlot Concurrency Protection', () => {
    const validPass = {
      id: 'pass-active-1',
      patientId: 'patient-101',
      status: PassStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 86400000 * 3), // 3 days remaining
    };

    it('should successfully book an available slot when lock is acquired', async () => {
      mockPrisma.consultationPass.findUnique.mockResolvedValue(validPass);
      mockLockService.acquireLock.mockResolvedValue('unique-lock-token-99');
      mockPrisma.timeSlot.findUnique.mockResolvedValue({
        id: 'slot-1',
        status: SlotStatus.AVAILABLE,
        turnNumber: 1,
      });
      mockPrisma.timeSlot.update.mockResolvedValue({
        id: 'slot-1',
        status: SlotStatus.BOOKED,
        patientId: 'patient-101',
        turnNumber: 1,
      });

      const result = await service.bookSlot('patient-101', {
        slotId: 'slot-1',
        passId: 'pass-active-1',
      });

      expect(result.message).toBe('Slot successfully booked');
      expect(mockLockService.acquireLock).toHaveBeenCalledWith('lock:slot:slot-1', 5000);
      expect(mockLockService.releaseLock).toHaveBeenCalledWith('lock:slot:slot-1', 'unique-lock-token-99');
    });

    it('should reject with ConflictException if Redis lock acquisition fails (concurrent collision)', async () => {
      mockPrisma.consultationPass.findUnique.mockResolvedValue(validPass);
      // Another user already holds the lock
      mockLockService.acquireLock.mockResolvedValue(null);

      await expect(
        service.bookSlot('patient-101', {
          slotId: 'slot-1',
          passId: 'pass-active-1',
        }),
      ).rejects.toThrow(ConflictException);

      // Should not touch the database update
      expect(mockPrisma.timeSlot.update).not.toHaveBeenCalled();
    });

    it('should reject with BadRequestException if pass has expired', async () => {
      mockPrisma.consultationPass.findUnique.mockResolvedValue({
        ...validPass,
        expiresAt: new Date(Date.now() - 10000), // Expired 10s ago
      });

      await expect(
        service.bookSlot('patient-101', {
          slotId: 'slot-1',
          passId: 'pass-active-1',
        }),
      ).rejects.toThrow(BadRequestException);

      // Lock should not even be attempted if pass is expired
      expect(mockLockService.acquireLock).not.toHaveBeenCalled();
    });

    it('should release lock even if database transaction throws an error', async () => {
      mockPrisma.consultationPass.findUnique.mockResolvedValue(validPass);
      mockLockService.acquireLock.mockResolvedValue('lock-token-xyz');
      mockPrisma.timeSlot.findUnique.mockResolvedValue({
        id: 'slot-1',
        status: SlotStatus.BOOKED, // Already booked!
      });

      await expect(
        service.bookSlot('patient-101', {
          slotId: 'slot-1',
          passId: 'pass-active-1',
        }),
      ).rejects.toThrow(ConflictException);

      // CRITICAL: Lock must be released in finally block
      expect(mockLockService.releaseLock).toHaveBeenCalledWith('lock:slot:slot-1', 'lock-token-xyz');
    });
  });
});
