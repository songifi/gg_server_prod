import { Injectable, ConflictException, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto, TokenResponseDto } from './dto/refresh-token.dto';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/entities/user.entity';
import { UserResponse } from '../shared/types/user.types';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  sub: string;
  email: string;
  isEmailVerified: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserResponse> {
    // Check if username or email already exists
    const existingUser = await this.usersService.findByEmailOrUsername(
      registerDto.email,
      registerDto.username,
    );

    if (existingUser) {
      const field = existingUser.email === registerDto.email ? 'email' : 'username';
      throw new ConflictException(`User with this ${field} already exists`);
    }

    // Generate verification token
    const verificationToken = uuidv4();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token expires in 24 hours

    // Create user with verification token
    const user = await this.usersService.create({
      ...registerDto,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: tokenExpiry,
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.username,
    );

    // Remove sensitive data before returning
    const { password, emailVerificationToken, emailVerificationTokenExpires, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.validatePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    const { refreshToken } = refreshTokenDto;
    
    // Find user by refresh token
    const user = await this.usersService.findByRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Validate refresh token
    const isValid = await user.validateRefreshToken(refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Generate new tokens
    return this.generateTokens(user);
  }

  private async generateTokens(user: User): Promise<TokenResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    };

    // Generate access token
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    });

    // Generate refresh token
    const refreshToken = uuidv4();
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 days

    // Save refresh token to user
    user.refreshToken = refreshToken;
    user.refreshTokenExpires = refreshTokenExpires;
    await this.usersService.save(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyEmail(token: string): Promise<UserResponse> {
    const users = await this.usersService.findAllUsers();
    const user = users.find(
      (u) =>
        u.emailVerificationToken === token &&
        u.emailVerificationTokenExpires > new Date() &&
        !u.isEmailVerified
    );

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Update user verification status
    Object.assign(user, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
    });

    const updatedUser = await this.usersService.create(user);

    // Remove sensitive data before returning
    const { password, emailVerificationToken, emailVerificationTokenExpires, ...result } = updatedUser;
    return result;
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = uuidv4();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);

    // Update user with new token
    Object.assign(user, {
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: tokenExpiry,
    });

    await this.usersService.create(user);

    // Send new verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.username,
    );
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await user.validatePassword(currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash the new password and update the user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.create({
      ...user,
      password: hashedPassword,
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token expires in 1 hour

    // Update user with reset token
    Object.assign(user, {
      passwordResetToken: resetToken,
      passwordResetTokenExpires: tokenExpiry,
    });

    await this.usersService.create(user);

    // Send reset email
    await this.emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.username,
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findByPasswordResetToken(token);
    
    if (!user || user.passwordResetTokenExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password and clear reset token
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    Object.assign(user, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
    });

    await this.usersService.create(user);
  }
}
