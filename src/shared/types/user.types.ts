import { User } from '../../users/entities/user.entity';

export type UserResponse = Omit<
  User,
  'password' | 'emailVerificationToken' | 'emailVerificationTokenExpires' | 'hashPassword' | 'validatePassword'
>;
