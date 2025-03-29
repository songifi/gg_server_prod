import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('search_favorites')
export class SearchFavorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  query: string;

  @Column({ type: 'jsonb', nullable: true })
  filters: Record<string, any>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
