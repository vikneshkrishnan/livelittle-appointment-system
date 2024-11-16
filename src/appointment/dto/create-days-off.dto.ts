import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDaysOffDto {
  @ApiProperty({
    description:
      'The date for the public holiday in ISO format (e.g., YYYY-MM-DD)',
    example: '2024-12-25',
  })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'The reason for the public holiday',
    example: 'Christmas Day',
  })
  @IsString()
  reason: string;
}
