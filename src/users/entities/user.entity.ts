import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';

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
    required: false,
  })
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty({
    example: 'Full-stack developer',
    description: 'Short bio of the user',
    required: false,
  })
  @Column({ nullable: true, type: 'text' })
  bio: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
