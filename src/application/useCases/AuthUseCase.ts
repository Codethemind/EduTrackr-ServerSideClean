import bcrypt from "bcrypt";
import crypto from 'crypto'
import dotenv from "dotenv";
import nodemailer from 'nodemailer'
import { TokenService } from '../../infrastructure/services/TokenService'; // adjust path
import { IAuthRepository } from "../Interfaces/IAuthRepository";
dotenv.config();

export class AuthUseCase {
    constructor(private authRepository:IAuthRepository){}

    async loginStudent(email: string, password: string) {
    if (!email) {
      throw new Error('Email is empty');
    }

    const student = await this.authRepository.findStudentByEmail(email);
    if (!student) {
      throw new Error('User does not exist');
    }

    let isPasswordValid = false;
    if (student.password.startsWith('$2')) {
     
      isPasswordValid = await bcrypt.compare(password, student.password);
    } else {

      isPasswordValid = password === student.password;
    }

    if (!isPasswordValid) {
      throw new Error('Incorrect Password');
    }


    const payload = {
      id: student._id,
      email: student.email,
      role: student.role,
    };

    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);

   
    const safeStudent = {
      id: student._id,
      username: student.username,
      firstname: student.firstname,
      lastname: student.lastname,
      email: student.email,
      isBlock: student.isBlock,
      profileImage: student.profileImage || null,
      departmentId: student.departmentId,
      departmentName: student.departmentName || '',
      class: student.class,
      courses: student.courses,
      role: student.role,
    };
    

    return {
      student: safeStudent,
      accessToken,
      refreshToken,
    };
  }


  async loginAdmin(email: string, password: string) {
    if (!email) {
      throw new Error('Email is empty');
    }
    const admin = await this.authRepository.findAdminByEmail(email);
    if (!admin) {
      throw new Error('User does not exist');
    }
   
    let isPasswordValid = false;
    if (admin.password.startsWith('$2')) {
      isPasswordValid = await bcrypt.compare(password, admin.password);
    } else {
      isPasswordValid = password === admin.password;
    }
    
    if (!isPasswordValid) {
      throw new Error('Incorrect Password');
    }
  
    const payload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };
  
    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);
   
    const safeAdmin = {
      id: admin.id,
      username: admin.username,
      firstname: admin.firstname,
      lastname: admin.lastname,
      email: admin.email,
      profileImage: admin.profileImage,
      role: admin.role,
    };
  
    return {
      admin: safeAdmin,
      accessToken,
      refreshToken,
    };
  }
  

  async loginTeacher(email: string, password: string) {
    if (!email) {
      throw new Error('Email is empty');
    }
  
    const teacher = await this.authRepository.findTeacherByEmail(email);
    
    if (!teacher) {
      throw new Error('User does not exist');
    }
    
   
    let isPasswordValid = false;
    if (teacher.password.startsWith('$2')) {
     
      isPasswordValid = await bcrypt.compare(password, teacher.password);
    } else {
     
      isPasswordValid = password === teacher.password;
    }
    
    if (!isPasswordValid) {
      throw new Error('Incorrect Password');
    }
  
    const payload = {
      id: teacher.id,
      email: teacher.email,
      role: teacher.role,
    };
  
    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);
  
    const safeTeacher = {
      id: teacher.id,
      username: teacher.username,
      firstname: teacher.firstname,
      lastname: teacher.lastname,
      email: teacher.email,
      departmentId: teacher.department,
      departmentName: teacher.departmentName || '',
      profileImage: teacher.profileImage,
      role: teacher.role,
    };
  
   
  
    return {
      teacher: safeTeacher,
      accessToken,
      refreshToken,
    };
  }
  

    async forgotPassword(email: string) {
        if (!email) throw new Error('Email is required');
    
        const user = await this.findUserAcrossAll(email);
        if (!user) throw new Error('No account found with this email');
    
        const token     = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
        await this.authRepository.saveResetTokenByEmail(email, token, expiresAt);

        
        const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;

        //  configure transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });
          
      
        // compose message
        const mailOptions = {
          from:    process.env.EMAIL_USER,
          to:      email,
          subject: 'Your Password Reset Link',
          html: `
            <p>Hello,</p>
            <p>You requested to reset your password. Click the link below to set a new one (valid for 1 hour):</p>
            <p><a href="${resetLink}">Reset your password</a></p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>Thanks,<br/>Your App Team</p>
          `,
        };
      
        //  send it
        await transporter.sendMail(mailOptions);
        console.log(`Reset URL → http://localhost:5173/auth/reset-password/${token}`);
    
        return { success: true, token, message: 'Reset instructions sent' };
      }
    
    async resetPassword(email: string, token: string, newPassword: string) {
        if (!email || !token || !newPassword) {
          throw new Error('Email, token and new password are required');
        }
        console.log('reset password',email,token)
        const valid = await this.authRepository.validateResetToken(email, token);
        if (!valid) throw new Error('Invalid or expired reset token');
        const hashed = await bcrypt.hash(newPassword, 10);
        const updated = await this.authRepository.updatePasswordByEmail(email, hashed);
        if (!updated) throw new Error('Password reset failed');
        await this.authRepository.clearResetToken(email);
        return { success: true, message: 'Password has been reset' };
      }



  
      
      private async findUserAcrossAll(email: string) {
        const student = await this.authRepository.findStudentByEmail(email);
        if (student) return student;
        const teacher = await this.authRepository.findTeacherByEmail(email);
        if (teacher) return teacher;
        const admin = await this.authRepository.findAdminByEmail(email);
        if (admin) return admin;
        return null;
      }


      async refreshAccessToken(refreshToken: string) {
        const payload = TokenService.verifyRefreshToken(refreshToken);
        if (!payload) {
          throw new Error('Invalid or expired refresh token');
        }
      
        
        const newAccessToken = TokenService.generateAccessToken({
          id: payload.id,
          email: payload.email,
          role: payload.role,
        });
      
        return { accessToken: newAccessToken };
      }
      
      
}