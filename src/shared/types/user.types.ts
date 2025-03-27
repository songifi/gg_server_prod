import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/enums/user-role.enum';

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  isEmailVerified: boolean;
  role: UserRole;
  displayName?: string;
  bio?: string;
  avatar?: string;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  passwordResetToken?: string;
  passwordResetTokenExpires?: Date;
  refreshToken?: string;
  refreshTokenExpires?: Date;
  validateRefreshToken?(token: string): Promise<boolean>;
}
