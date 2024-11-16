import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Delete,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import {
  ApiQuery,
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreateUnavailableHoursDto } from './dto/create-unavailable-hours.dto';
import { CreateDaysOffDto } from './dto/create-days-off.dto';

@Controller('appointments')
@ApiTags('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get('available-slots')
  @ApiQuery({
    name: 'date',
    description: 'The date to check for available slots (format: YYYY-MM-DD)',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of available slots for the given date',
    schema: {
      example: [
        {
          date: '2024-04-01',
          time: '10:00',
          availableSlots: 1,
        },
        {
          date: '2024-04-01',
          time: '11:00',
          availableSlots: 0,
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No slots available for the given date',
  })
  async getAvailableSlots(@Query('date') date: string) {
    try {
      return await this.appointmentService.findAvailableSlots(date);
    } catch (error) {
      throw new HttpException(
        error.message || 'No slots available for the given date',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post('book')
  @ApiBody({
    type: CreateAppointmentDto,
    description: 'Data to book an appointment',
  })
  @ApiResponse({
    status: 201,
    description: 'The appointment has been successfully booked',
    schema: {
      example: {
        id: 'f9b1f5ba-3bb6-4b0f-9e9c-cb1c88f8ddef',
        date: '2024-04-01',
        time: '10:00',
        availableSlots: 0,
        createdAt: '2024-04-01T10:00:00Z',
        updatedAt: '2024-04-01T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'No available slots' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async bookAppointment(@Body() dto: CreateAppointmentDto) {
    try {
      return await this.appointmentService.createAppointment(dto);
    } catch (error) {
      throw new HttpException(
        error.message || 'No available slots',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Delete('cancel/:id')
  @ApiParam({
    name: 'id',
    description: 'The ID of the appointment to be canceled',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The appointment has been successfully canceled',
    schema: {
      example: { message: 'Appointment has been successfully canceled' },
    },
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async cancelAppointment(@Param('id') id: string) {
    try {
      return await this.appointmentService.cancelAppointment(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Appointment not found',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List of all appointments',
    schema: {
      example: [
        {
          id: 'f9b1f5ba-3bb6-4b0f-9e9c-cb1c88f8ddef',
          date: '2024-04-01',
          time: '10:00',
          availableSlots: 0,
          createdAt: '2024-04-01T10:00:00Z',
          updatedAt: '2024-04-01T10:00:00Z',
        },
      ],
    },
  })
  async getAllAppointments() {
    return await this.appointmentService.findAllAppointments();
  }

  @Post('days-off')
  @ApiBody({
    type: CreateDaysOffDto,
    description: 'Add a public holiday (day off)',
  })
  @ApiResponse({
    status: 201,
    description: 'The public holiday has been successfully added',
  })
  @ApiResponse({
    status: 400,
    description: 'Public holiday already exists for the given date',
  })
  async addDaysOff(@Body() dto: CreateDaysOffDto) {
    return await this.appointmentService.addDaysOff(dto);
  }

  @Post('unavailable-hours')
  @ApiBody({
    type: CreateUnavailableHoursDto,
    description: 'Add unavailable hours within a day',
  })
  @ApiResponse({
    status: 201,
    description: 'The unavailable hours have been successfully added',
  })
  @ApiResponse({
    status: 400,
    description: 'Unavailable hours already set for this time range',
  })
  async addUnavailableHours(@Body() dto: CreateUnavailableHoursDto) {
    return await this.appointmentService.addUnavailableHours(dto);
  }

  @Get('days-off')
  @ApiResponse({
    status: 200,
    description: 'List of all public holidays (days off)',
  })
  async getDaysOff() {
    return await this.appointmentService.getDaysOff();
  }

  @Get('unavailable-hours')
  @ApiResponse({
    status: 200,
    description: 'List of all unavailable hours',
  })
  async getUnavailableHours() {
    return await this.appointmentService.getUnavailableHours();
  }

  @Post('add-slot')
  @ApiBody({
    type: CreateAppointmentDto,
    description: 'Add a new slot using date, time, and available slots',
  })
  @ApiResponse({
    status: 201,
    description: 'The slot has been successfully added',
  })
  @ApiResponse({
    status: 400,
    description: 'Slot already exists for the given date and time',
  })
  async addSlot(@Body() dto: CreateAppointmentDto) {
    return await this.appointmentService.createSlot(dto);
  }
}
