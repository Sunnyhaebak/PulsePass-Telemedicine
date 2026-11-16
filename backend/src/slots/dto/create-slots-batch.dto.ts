import { IsArray, IsDateString, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateSlotsBatchDto {
  @IsDateString()
  date: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  startTime: string; // e.g. "17:00"

  @IsString()
  @IsNotEmpty()
  endTime: string; // e.g. "19:00"

  @IsInt()
  @Min(5)
  @Max(60)
  slotDurationMinutes: number; // e.g. 15
}
