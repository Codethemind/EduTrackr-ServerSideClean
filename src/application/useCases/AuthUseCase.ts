import bcrypt from "bcrypt";
import crypto from 'crypto'
import dotenv from "dotenv";
import nodemailer from 'nodemailer'
import { IAuthRepository } from "../Interfaces/IAuthRepository";
dotenv.config();

export class AuthUseCase {
    constructor(private authRepository:IAuthRepository){}

    async loginStudent(email:string,password:string){
        if(!email){
            throw new Error('email is empty')
        }
        const student = await this.authRepository.findStudentByEmail(email)
        if(!student){
            throw new Error('User not exist')
        }
        console.log('student.password', student.password);
         console.log('incoming password', password);
        const isPasswordValid = await bcrypt.compare(password,student.password)
        if(!isPasswordValid){
            throw new Error('Incorrect Password')
        }
        return student
    }

    async loginAdmin(email:string,password:string){
        if(!email){
            throw new Error('email is empty')
        }
        const student = await this.authRepository.findAdminByEmail(email)
        if(!student){
            throw new Error('User not exist')
        }
        // const isPasswordValid = await bcrypt.compare(password,student.password)
        // if(!isPasswordValid){
        //     throw new Error('Incorrect Password')
        // }
        return student
    }

    async loginTeacher(email:string,password:string){
        if(!email){
            throw new Error('email is empty')
        }
        const student = await this.authRepository.findTeacherByEmail(email)
        if(!student){
            throw new Error('User not exist')
        }
        
        const isPasswordValid = await bcrypt.compare(password,student.password)
        
        if(!isPasswordValid){
            throw new Error('Incorrect Password')
        }
        return student
    }

    async forgotPassword(email: string) {
        if (!email) throw new Error('Email is required');
    
        const user = await this.findUserAcrossAll(email);
        if (!user) throw new Error('No account found with this email');
    
        const token     = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
        await this.authRepository.saveResetTokenByEmail(email, token, expiresAt);

        
        const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;

        // 2. configure transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });
          
      
        // 3. compose message
        const mailOptions = {
          from:    process.env.EMAIL_USER,
          to:      email,
          subject: 'Your Password Reset Link',
          html: `
            <p>Hello,</p>
            <p>You requested to reset your password. Click the link below to set a new one (valid for 1 hour):</p>
            <p><a href="${resetLink}">Reset your password</a></p>
            <p>If you didn’t request this, you can safely ignore this email.</p>
            <p>Thanks,<br/>Your App Team</p>
          `,
        };
      
        // 4. send it
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
    console.log('it is valid')
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
      
}