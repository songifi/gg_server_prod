import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { RegionConfig } from './region-config.entity';
import { ReplicationLog } from './replication-log.entity';

export enum ConflictResolutionStrategy {
  LAST_WRITE_WINS = 'last_write_wins',
  MANUAL = 'manual',
  CUSTOM = 'custom',
}

export enum ConflictStatus {
  DETECTED = 'detected',
  RESOLVED = 'resolved',
  MANUAL_INTERVENTION_REQUIRED = 'manual_intervention_required',
}

@Entity('conflict_log')
@Index(['tableName', 'recordId'])
export class ConflictLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tableName: string;

  @Column()
  recordId: string;

  @ManyToOne(() => ReplicationLog)
  @JoinColumn({ name: 'sourceLogId' })
  sourceLog: ReplicationLog;

  @Column()
  sourceLogId: string;

  @ManyToOne(() => ReplicationLog)
  @JoinColumn({ name: 'conflictingLogId' })
  conflictingLog: ReplicationLog;

  @Column()
  conflictingLogId: string;

  @Column({ type: 'jsonb' })
  sourceData: Record<string, any>;

  @Column({ type: 'jsonb' })
  conflictingData: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ConflictResolutionStrategy,
  })
  resolutionStrategy: ConflictResolutionStrategy;

  @Column({
    type: 'enum',
    enum: ConflictStatus,
    default: ConflictStatus.DETECTED,
  })
  status: ConflictStatus;

  @Column({ type: 'jsonb', nullable: true })
  resolvedData: Record<string, any>;

  @Column({ nullable: true })
  resolvedBy: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'timestamp with time zone' })
  conflictDetectedAt: Date;

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string;
}
