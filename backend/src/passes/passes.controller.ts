import { Controller, Post, Get, Body, Headers, UseGuards, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PassesService } from './passes.service';
import { CreatePassOrderDto } from './dto/create-pass.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('passes')
export class PassesController {
  constructor(private readonly passesService: PassesService) {}

  @Post('order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  async createOrder(@CurrentUser('id') patientId: string, @Body() dto: CreatePassOrderDto) {
    return this.passesService.createPassOrder(patientId, dto);
  }

  @Post('webhook/razorpay')
  @HttpCode(HttpStatus.OK)
  async razorpayWebhook(
    @Body() payload: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.passesService.handleRazorpayWebhook(payload, signature);
  }

  @Get('my-passes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  async getMyPasses(@CurrentUser('id') patientId: string) {
    return this.passesService.getPatientPasses(patientId);
  }

  @Get('active/:doctorId')
  @UseGuards(JwtAuthGuard)
  async getActivePass(
    @CurrentUser('id') patientId: string,
    @Param('doctorId') doctorId: string,
  ) {
    return this.passesService.getActivePassForDoctor(patientId, doctorId);
  }
}
