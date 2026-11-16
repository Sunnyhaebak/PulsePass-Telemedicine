import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { RequestUploadUrlDto } from './dto/presigned-url-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('upload-url')
  @UseGuards(JwtAuthGuard)
  async getUploadUrl(
    @CurrentUser('id') patientId: string,
    @Body() dto: RequestUploadUrlDto,
  ) {
    return this.reportsService.generateUploadUrl(patientId, dto);
  }

  @Get(':reportId/view-url')
  @UseGuards(JwtAuthGuard)
  async getViewUrl(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('reportId') reportId: string,
  ) {
    return this.reportsService.generateDownloadUrl(userId, role, reportId);
  }

  @Get('pass/:passId')
  @UseGuards(JwtAuthGuard)
  async getPassReports(@Param('passId') passId: string) {
    return this.reportsService.getPassReports(passId);
  }
}
