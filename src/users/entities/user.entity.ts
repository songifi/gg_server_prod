import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../enums/user-role.enum';
import { Wallet } from '../../wallet/entities/wallet.entity';

@Entity('users')
export class User {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User ID (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'john_doe', description: 'Unique username' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Unique email address',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: 'hashed_password',
    description: 'User password (hashed)',
    writeOnly: true,
  })
  @Column()
  password: string;

  @ApiProperty({
    example: false,
    description: 'Whether the email has been verified',
  })
  @Column({ default: false })
  isEmailVerified: boolean;

  @ApiProperty({
    example: 'abc123xyz789',
    description: 'Email verification token',
  })
  @Column({ nullable: true })
  emailVerificationToken: string;

  @ApiProperty({
    example: '2025-03-27T12:00:00.000Z',
    description: 'Email verification token expiry date',
  })
  @Column({ nullable: true })
  emailVerificationTokenExpires: Date;

  @ApiProperty({
    example: 'def456ghi012',
    description: 'Password reset token',
  })
  @Column({ nullable: true })
  passwordResetToken: string;

  @ApiProperty({
    example: '2025-03-27T12:00:00.000Z',
    description: 'Password reset token expiry date',
  })
  @Column({ nullable: true })
  passwordResetTokenExpires: Date;

  @ApiProperty({
    example: '2025-03-27T12:00:00.000Z',
    description: 'Timestamp when user was created',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2025-03-27T12:30:00.000Z',
    description: 'Timestamp when user was last updated',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'User role for access control',
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  // Profile-related fields
  @ApiProperty({
    example: 'John Doe',
    description: 'Display name of the user',
    required: false,
  })
  @Column({ nullable: true })
  displayName: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Profile picture URL',
  })
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty({
    example: 'Full-stack developer and tech enthusiast.',
    description: 'User bio',
  })
  @Column({ nullable: true, type: 'text' })
  bio: string;

  @ApiProperty({
    example: { emailNotifications: true, darkMode: false, language: 'en' },
    description: 'User settings',
  })
  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @ApiProperty({
    example: 'refresh_token',
    description: 'Refresh token',
  })
  @Column({ nullable: true })
  refreshToken: string;

  @ApiProperty({
    example: '2025-03-27T12:00:00.000Z',
    description: 'Refresh token expiry date',
  })
  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpires: Date;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  async validateRefreshToken(token: string): Promise<boolean> {
    return this.refreshToken === token && this.refreshTokenExpires > new Date();
  }
}
