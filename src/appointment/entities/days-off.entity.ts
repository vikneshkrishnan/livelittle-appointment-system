import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class DaysOff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  date: string;

  @Column({ default: 'Public Holiday' })
  reason: string;
}
