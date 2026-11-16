import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePassOrderDto {
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsNumber()
  @Min(100)
  amount: number; // e.g. 500

  @IsOptional()
  @IsString()
  currency?: string; // 'INR'
}
