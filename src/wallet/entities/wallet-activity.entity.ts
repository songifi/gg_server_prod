import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Wallet } from './wallet.entity';

export enum WalletActivityType {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  BALANCE_CHECK = 'balance_check',
  VERIFY = 'verify'
}

@Entity('wallet_activities')
export class WalletActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'wallet_id' })
  walletId: string;

  @ManyToOne(() => Wallet, wallet => wallet.activities)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({
    type: 'enum',
    enum: WalletActivityType
  })
  type: WalletActivityType;

  @Column({ type: 'jsonb' })
  details: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;
}
