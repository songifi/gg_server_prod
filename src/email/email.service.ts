import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private readonly isDevelopment: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isDevelopment = this.configService.get('NODE_ENV') === 'development';
    
    if (this.isDevelopment) {
      // In development, log emails instead of sending them
      this.logger.log('Running in development mode - emails will be logged instead of sent');
      this.transporter = {
        sendMail: async (options: nodemailer.SendMailOptions) => {
          this.logger.debug('Email would have been sent:', {
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
          });
          return { accepted: [options.to] };
        },
      } as any;
    } else {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT'),
        secure: this.configService.get<boolean>('SMTP_SECURE'),
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
    }
  }

  async sendVerificationEmail(to: string, token: string, username: string): Promise<void> {
    const verificationUrl = `${this.configService.get<string>('APP_URL')}/auth/verify-email?token=${token}`;
    
    await this.sendEmail({
      to,
      subject: 'Verify Your Email',
      text: `Hello ${username},\n\nPlease verify your email by clicking the following link: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you did not create an account, please ignore this email.`,
      html: `
        <h1>Hello ${username}</h1>
        <p>Please verify your email by clicking the following link:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, token: string, username: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('APP_URL')}/auth/reset-password?token=${token}`;
    
    await this.sendEmail({
      to,
      subject: 'Reset Your Password',
      text: `Hello ${username},\n\nYou requested to reset your password. Click the following link to reset it: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request a password reset, please ignore this email.`,
      html: `
        <h1>Hello ${username}</h1>
        <p>You requested to reset your password. Click the following link to reset it:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `,
    });
  }

  private async sendEmail(options: nodemailer.SendMailOptions): Promise<void> {
    try {
      const from = this.configService.get<string>('SMTP_FROM');
      await this.transporter.sendMail({
        ...options,
        from,
      });
      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      if (this.isDevelopment) {
        // In development, don't throw the error
        this.logger.warn('Email sending failed, but continuing in development mode');
      } else {
        throw error;
      }
    }
  }
}
