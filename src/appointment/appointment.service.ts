import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { DaysOff } from './entities/days-off.entity';
import { UnavailableHours } from './entities/unavailable-hours.entity';
import { CreateDaysOffDto } from './dto/create-days-off.dto';
import { CreateUnavailableHoursDto } from './dto/create-unavailable-hours.dto';
import { isWeekend } from 'date-fns';
import { Slot } from './entities/slot.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(DaysOff)
    private readonly daysOffRepository: Repository<DaysOff>,
    @InjectRepository(UnavailableHours)
    private readonly unavailableHoursRepository: Repository<UnavailableHours>,
    @InjectRepository(Slot)
    private readonly slotRepository: Repository<Slot>,
  ) {}

  async findAvailableSlots(date: string): Promise<Slot[]> {
    const dayOff = await this.daysOffRepository.findOne({ where: { date } });
    if (dayOff) {
      throw new NotFoundException(
        `No slots available on ${date} (Reason: ${dayOff.reason})`,
      );
    }

    const unavailableHours = await this.unavailableHoursRepository.find({
      where: { date },
    });

    const slots = await this.slotRepository.find({ where: { date } });
    return slots.filter((slot) => {
      const slotTime = new Date(`${date}T${slot.time}:00`);
      return !unavailableHours.some((uh) => {
        const start = new Date(`${date}T${uh.startTime}:00`);
        const end = new Date(`${date}T${uh.endTime}:00`);
        return slotTime >= start && slotTime < end;
      });
    });
  }

  async createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
    const [hours, minutes] = dto.time.split(':').map(Number);
    if (minutes % 30 !== 0) {
      throw new BadRequestException(
        'Appointments must be scheduled in 30-minute intervals.',
      );
    }

    if (hours < 9 || hours >= 18) {
      throw new BadRequestException(
        'Appointments are only available between 9 AM and 6 PM.',
      );
    }

    const appointmentDate = new Date(dto.date);
    if (isWeekend(appointmentDate)) {
      throw new BadRequestException(
        'Appointments are only available on weekdays.',
      );
    }

    const dayOff = await this.daysOffRepository.findOne({
      where: { date: dto.date },
    });
    if (dayOff) {
      throw new BadRequestException(
        `Appointments cannot be created on ${dto.date} due to: ${dayOff.reason}`,
      );
    }

    const unavailableHours = await this.unavailableHoursRepository.find({
      where: { date: dto.date },
    });

    const appointmentStartTime = new Date(`${dto.date}T${dto.time}:00`);
    for (const uh of unavailableHours) {
      const start = new Date(`${dto.date}T${uh.startTime}:00`);
      const end = new Date(`${dto.date}T${uh.endTime}:00`);
      if (appointmentStartTime >= start && appointmentStartTime < end) {
        throw new BadRequestException(
          'Appointments cannot be scheduled during unavailable hours.',
        );
      }
    }

    const slot = await this.slotRepository.findOne({
      where: { date: dto.date, time: dto.time },
    });
    if (!slot || slot.availableSlots <= 0) {
      throw new BadRequestException(
        'No available slots for the given date and time.',
      );
    }

    slot.availableSlots -= 1;
    await this.slotRepository.save(slot);

    const appointment = this.appointmentRepository.create({
      appointmentDate: dto.date,
      appointmentTime: dto.time,
    });

    return await this.appointmentRepository.save(appointment);
  }

  async cancelAppointment(id: string): Promise<{ message: string }> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const slot = await this.slotRepository.findOne({
      where: {
        date: appointment.appointmentDate,
        time: appointment.appointmentTime,
      },
    });

    if (slot) {
      slot.availableSlots += 1;
      await this.slotRepository.save(slot);
    }

    await this.appointmentRepository.delete(id);

    return { message: 'Appointment has been successfully canceled' };
  }

  async findAllAppointments(): Promise<Appointment[]> {
    return await this.appointmentRepository.find();
  }

  async addDaysOff(dto: CreateDaysOffDto): Promise<DaysOff> {
    const existing = await this.daysOffRepository.findOne({
      where: { date: dto.date },
    });
    if (existing) {
      throw new BadRequestException(
        `A public holiday already exists on ${dto.date}`,
      );
    }
    const daysOff = this.daysOffRepository.create(dto);
    return await this.daysOffRepository.save(daysOff);
  }

  async addUnavailableHours(
    dto: CreateUnavailableHoursDto,
  ): Promise<UnavailableHours> {
    const existing = await this.unavailableHoursRepository.findOne({
      where: { date: dto.date, startTime: dto.startTime, endTime: dto.endTime },
    });
    if (existing) {
      throw new BadRequestException(
        `Unavailable hours already set for this time range`,
      );
    }
    const unavailableHours = this.unavailableHoursRepository.create(dto);
    return await this.unavailableHoursRepository.save(unavailableHours);
  }

  async getDaysOff(): Promise<DaysOff[]> {
    return await this.daysOffRepository.find();
  }

  async getUnavailableHours(): Promise<UnavailableHours[]> {
    return await this.unavailableHoursRepository.find();
  }

  async createSlot(dto: CreateAppointmentDto): Promise<Slot> {
    const existingSlot = await this.slotRepository.findOne({
      where: { date: dto.date, time: dto.time },
    });
    if (existingSlot) {
      throw new BadRequestException(
        'A slot already exists for the given date and time',
      );
    }

    const slot = this.slotRepository.create({
      date: dto.date,
      time: dto.time,
      availableSlots: dto.slots,
    });
    return await this.slotRepository.save(slot);
  }
}
