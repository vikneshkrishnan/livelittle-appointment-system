import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnavailableHoursDto {
  @ApiProperty({
    description:
      'The date for which the unavailable hours are set in ISO format (e.g., YYYY-MM-DD)',
    example: '2024-04-01',
  })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'The start time for the unavailable hours in HH:mm format',
    example: '12:00',
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'The end time for the unavailable hours in HH:mm format',
    example: '13:00',
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;
}
