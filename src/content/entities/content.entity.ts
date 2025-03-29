import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('content')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  body: string;

  @Column({ nullable: true })
  author: string;

  @Column({ default: 'dynamic' })
  type: string; // 'static', 'dynamic', 'user-specific'

  @Column({ default: 0 })
  views: number;

  @Column({ type: 'timestamp', nullable: true })
  last_accessed: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
