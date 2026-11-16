import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { BookSlotDto } from './dto/book-slot.dto';
import { CreateSlotsBatchDto } from './dto/create-slots-batch.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Post('book')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  async bookSlot(
    @CurrentUser('id') patientId: string,
    @Body() dto: BookSlotDto,
  ) {
    return this.slotsService.bookSlot(patientId, dto);
  }

  @Post('doctor/generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  async generateSlots(
    @CurrentUser('doctorProfile') profile: any,
    @Body() dto: CreateSlotsBatchDto,
  ) {
    return this.slotsService.generateDoctorSlots(profile.id, dto);
  }

  @Get('doctor/:doctorId')
  async getDoctorSlots(
    @Param('doctorId') doctorId: string,
    @Query('date') date?: string,
  ) {
    return this.slotsService.getDoctorSlots(doctorId, date);
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  async getMyBookings(@CurrentUser('id') patientId: string) {
    return this.slotsService.getPatientSlots(patientId);
  }
}
