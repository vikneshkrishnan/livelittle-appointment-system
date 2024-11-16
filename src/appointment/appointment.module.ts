// src/appointment/appointment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { Appointment } from './entities/appointment.entity';
import { DaysOff } from './entities/days-off.entity';
import { UnavailableHours } from './entities/unavailable-hours.entity';
import { Slot } from './entities/slot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, DaysOff, UnavailableHours, Slot]),
  ],
  providers: [AppointmentService],
  controllers: [AppointmentController],
})
export class AppointmentModule {}
