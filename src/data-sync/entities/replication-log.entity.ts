import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { RegionConfig } from './region-config.entity';

export enum OperationType {
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum ReplicationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CONFLICT = 'conflict',
}

@Entity('replication_log')
@Index(['tableName', 'recordId'])
@Index(['sourceRegion', 'targetRegion', 'status'])
export class ReplicationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tableName: string;

  @Column()
  recordId: string;

  @Column({
    type: 'enum',
    enum: OperationType,
  })
  operation: OperationType;

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  oldData: Record<string, any>;

  @ManyToOne(() => RegionConfig)
  @JoinColumn({ name: 'sourceRegionId' })
  sourceRegion: RegionConfig;

  @Column()
  sourceRegionId: string;

  @ManyToOne(() => RegionConfig)
  @JoinColumn({ name: 'targetRegionId' })
  targetRegion: RegionConfig;

  @Column()
  targetRegionId: string;

  @Column({
    type: 'enum',
    enum: ReplicationStatus,
    default: ReplicationStatus.PENDING,
  })
  status: ReplicationStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'bigint' })
  @Index()
  sequence: number;

  @Column({ type: 'timestamp with time zone' })
  @Index()
  timestamp: Date;
}
