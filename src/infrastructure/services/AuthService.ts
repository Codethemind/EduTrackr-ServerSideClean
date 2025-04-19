// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import crypto from 'crypto';
// import { IAuthService, AuthenticationResult, RegisterUserDTO } from '../../core/application/ports/IAuthService';
// import { IUserRepository } from '../../core/domain/repositories/IUserRepository';
// import { User, UserRole } from '../../core/domain/entities/User';
// import { UserModel } from '../models/';

// export class AuthService implements IAuthService {
//   constructor(
//     private readonly userRepository: IUserRepository,
//     private readonly jwtSecret: string,
//     private readonly accessTokenExpiration: string = '15m',
//     private readonly refreshTokenExpiration: string = '7d'
//   ) {
//     if (!jwtSecret) {
//       throw new Error('JWT_SECRET is required');
//     }
//   }

//   private generateTokens(user: User) {
//     const accessToken = jwt.sign(
//       { id: user.id, role: user.role },
//       this.jwtSecret,
//       { expiresIn: this.accessTokenExpiration }
//     );

//     const refreshToken = jwt.sign(
//       { id: user.id },
//       process.env.JWT_REFRESH_SECRET!,
//       { expiresIn: this.refreshTokenExpiration }
//     );

//     return { accessToken, refreshToken };
//   }

//   async register(data: RegisterUserDTO): Promise<User> {
//     const existingUser = await this.userRepository.findByEmail(data.email);

//     if (existingUser) {
//       throw new Error('User with this email already exists');
//     }

//     const hashedPassword = await bcrypt.hash(data.password, 10);

//     const user = await this.userRepository.create({
//       ...data,
//       password: hashedPassword,
//       isActive: true,
//       isEmailVerified: false
//     });

//     return user;
//   }

//   async login(email: string, password: string, role: UserRole): Promise<AuthenticationResult> {
//     const user = await this.userRepository.findByEmail(email);
//     if (!user || user.role !== role) {
//       throw new Error('Invalid credentials');
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       throw new Error('Invalid credentials');
//     }

//     const tokens = this.generateTokens(user);

//     // Store refresh token
//     await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);

//     return {
//       ...tokens,
//       user: {
//         id: user.id,
//         email: user.email,
//         username: user.username,
//         role: user.role,
//         firstName: user.firstName,
//         lastName: user.lastName
//       }
//     };
//   }

//   async refreshToken(token: string): Promise<string> {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string };
//       const user = await this.userRepository.findById(decoded.id);

//       if (!user) {
//         throw new Error('User not found');
//       }

//       return jwt.sign(
//         { id: user.id, role: user.role },
//         this.jwtSecret,
//         { expiresIn: this.accessTokenExpiration }
//       );
//     } catch (error) {
//       throw new Error('Invalid refresh token');
//     }
//   }

//   async forgotPassword(email: string): Promise<string | null> {
//     const user = await this.userRepository.findByEmail(email);
//     if (!user) {
//       return null;
//     }

//     const resetToken = jwt.sign(
//       { id: user.id },
//       process.env.JWT_RESET_SECRET!,
//       { expiresIn: '1h' }
//     );

//     await this.userRepository.update(user.id, {
//       resetPasswordToken: resetToken,
//       resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
//     });

//     return resetToken;
//   }

//   async resetPassword(token: string, newPassword: string): Promise<void> {
//     const user = await this.userRepository.findByPasswordResetToken(token);
//     if (!user) {
//       throw new Error('Invalid or expired reset token');
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     await this.userRepository.update(user.id, {
//       password: hashedPassword,
//       resetPasswordToken: undefined,
//       resetPasswordExpires: undefined
//     });
//   }

//   async logout(userId: string): Promise<void> {
//     const user = await this.userRepository.findById(userId);
//     if (!user) {
//       throw new Error('User not found');
//     }

//     await this.userRepository.updateRefreshToken(userId, undefined);
//   }
// } 