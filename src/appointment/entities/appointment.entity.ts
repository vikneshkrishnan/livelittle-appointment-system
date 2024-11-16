import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  appointmentDate: string;

  @Column()
  appointmentTime: string;

  @Column({ default: 1 })
  availableSlots: number;
}
