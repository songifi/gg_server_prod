import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RegionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEGRADED = 'degraded',
}

@Entity('region_config')
export class RegionConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  host: string;

  @Column()
  port: number;

  @Column()
  priority: number;

  @Column({
    type: 'enum',
    enum: RegionStatus,
    default: RegionStatus.INACTIVE,
  })
  status: RegionStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ type: 'float', default: 0 })
  replicationLag: number;

  @Column({ type: 'float', default: 0 })
  latency: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
