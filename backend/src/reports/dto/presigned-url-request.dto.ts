import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReportCategory } from '@prisma/client';

export class RequestUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  passId: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string; // e.g. "application/pdf" or "image/jpeg"

  @IsOptional()
  @IsEnum(ReportCategory)
  category?: ReportCategory = ReportCategory.LAB_REPORT;

  @IsOptional()
  @IsString()
  summary?: string;
}
