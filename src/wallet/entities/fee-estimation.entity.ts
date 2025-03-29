import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('fee_estimations')
export class FeeEstimation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 20, scale: 0 })
  slow: string;

  @Column({ type: 'decimal', precision: 20, scale: 0 })
  medium: string;

  @Column({ type: 'decimal', precision: 20, scale: 0 })
  fast: string;

  @Column({ type: 'decimal', precision: 20, scale: 0 })
  networkLoad: string;

  @CreateDateColumn()
  timestamp: Date;
}
