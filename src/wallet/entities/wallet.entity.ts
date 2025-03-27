import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WalletActivity } from './wallet-activity.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  address: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, user => user.wallets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => WalletActivity, activity => activity.wallet)
  activities: WalletActivity[];

  @CreateDateColumn({ name: 'connected_at' })
  connectedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
