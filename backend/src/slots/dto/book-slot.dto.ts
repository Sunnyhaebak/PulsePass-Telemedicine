import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class BookSlotDto {
  @IsString()
  @IsNotEmpty()
  slotId: string;

  @IsString()
  @IsNotEmpty()
  passId: string;
}
