import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class UnavailableHours {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;
}
