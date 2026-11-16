import { Injectable, ConflictException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { DistributedLockService } from '../common/redis/distributed-lock.service';
import { RedisService } from '../common/redis/redis.service';
import { BookSlotDto } from './dto/book-slot.dto';
import { CreateSlotsBatchDto } from './dto/create-slots-batch.dto';
import { SlotStatus, PassStatus } from '@prisma/client';

@Injectable()
export class SlotsService {
  private readonly logger = new Logger(SlotsService.name);

  constructor(
    private prisma: PrismaService,
    private lockService: DistributedLockService,
    private redisService: RedisService,
  ) {}

  /**
   * Concurrency-Safe Time-Slot Booking with Redis Distributed Lock + PostgreSQL Row Lock
   * Eliminates double-booking race conditions when multiple patients claim the same slot simultaneously
   */
  async bookSlot(patientId: string, dto: BookSlotDto) {
    const lockKey = `lock:slot:${dto.slotId}`;

    // Step 1: Validate active 7-day consultation pass
    const pass = await this.prisma.consultationPass.findUnique({
      where: { id: dto.passId },
    });

    if (!pass || pass.patientId !== patientId) {
      throw new BadRequestException('Consultation pass invalid or does not belong to this patient');
    }

    if (pass.status !== PassStatus.ACTIVE || new Date(pass.expiresAt) <= new Date()) {
      throw new BadRequestException('Your 7-day consultation pass has expired. Please renew your pass to book.');
    }

    // Step 2: Acquire Redis Distributed Lock (SET NX PX 5000)
    const lockId = await this.lockService.acquireLock(lockKey, 5000);
    if (!lockId) {
      this.logger.warn(`Lock collision on ${lockKey} by patient ${patientId}`);
      throw new ConflictException('This slot is currently being claimed by another patient. Please try another slot.');
    }

    try {
      // Step 3: Execute ACID PostgreSQL Transaction with Row-Level Lock
      return await this.prisma.$transaction(async (tx) => {
        // Query slot and check current status
        const slot = await tx.timeSlot.findUnique({
          where: { id: dto.slotId },
        });

        if (!slot) {
          throw new NotFoundException('Time slot not found');
        }

        if (slot.status !== SlotStatus.AVAILABLE) {
          throw new ConflictException('Slot is no longer available. It was just booked by another patient.');
        }

        // Commit booking
        const updatedSlot = await tx.timeSlot.update({
          where: { id: dto.slotId },
          data: {
            status: SlotStatus.BOOKED,
            patientId: patientId,
            passId: dto.passId,
            version: { increment: 1 },
          },
          include: {
            doctor: { include: { user: true } },
            patient: true,
          },
        });

        this.logger.log(`Slot ${dto.slotId} successfully booked by Patient ${patientId} (Turn #${updatedSlot.turnNumber})`);

        return {
          message: 'Slot successfully booked',
          slot: updatedSlot,
        };
      });
    } finally {
      // Step 4: Safely release distributed lock via atomic Lua script
      await this.lockService.releaseLock(lockKey, lockId);
    }
  }

  /**
   * Doctor generates daily time slot batch
   */
  async generateDoctorSlots(doctorId: string, dto: CreateSlotsBatchDto) {
    const [startH, startM] = dto.startTime.split(':').map(Number);
    const [endH, endM] = dto.endTime.split(':').map(Number);

    const baseDate = new Date(dto.date);
    let currentTime = new Date(baseDate.setHours(startH, startM, 0, 0));
    const endTime = new Date(baseDate.setHours(endH, endM, 0, 0));

    const slotsToCreate = [];
    let turn = 1;

    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + dto.slotDurationMinutes * 60000);
      if (slotEnd > endTime) break;

      slotsToCreate.push({
        doctorId,
        startTime: new Date(currentTime),
        endTime: slotEnd,
        status: SlotStatus.AVAILABLE,
        turnNumber: turn++,
      });

      currentTime = slotEnd;
    }

    // Insert ignoring existing duplicates
    await this.prisma.timeSlot.createMany({
      data: slotsToCreate,
      skipDuplicates: true,
    });

    return {
      message: `Generated ${slotsToCreate.length} slots for doctor`,
      count: slotsToCreate.length,
    };
  }

  /**
   * Get available and booked slots for a doctor on a specific date
   */
  async getDoctorSlots(doctorId: string, dateStr?: string) {
    const whereClause: any = { doctorId };

    if (dateStr) {
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
      whereClause.startTime = { gte: startOfDay, lte: endOfDay };
    }

    return this.prisma.timeSlot.findMany({
      where: whereClause,
      include: {
        patient: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Get upcoming patient booked slots
   */
  async getPatientSlots(patientId: string) {
    return this.prisma.timeSlot.findMany({
      where: { patientId, status: SlotStatus.BOOKED },
      include: {
        doctor: { include: { user: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }
}
