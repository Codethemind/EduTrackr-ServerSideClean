import { Request, Response } from "express";
import { TeacherUseCase } from "../../application/useCases/TeacherUseCase";
import { ensureFullImageUrl } from "../../infrastructure/middleware/multer";
import nodemailer from 'nodemailer';

export class TeacherController {
    constructor(private teacherUseCase: TeacherUseCase) {}

    async createTeacherWithImage(req: Request, res: Response): Promise<void> {
        try {
            const teacherData: any = {
                ...req.body,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                department: req.body.department,
                role: 'Teacher'
            };

            if (req.file) {   
                const imageUrl = ensureFullImageUrl(req.file.path);
                teacherData.profileImage = imageUrl;
            } else {
                teacherData.profileImage = "https://res.cloudinary.com/djpom2k7h/image/upload/v1/student_profiles/default-profile.png";
            }
            
            const teacher = await this.teacherUseCase.createTeacher(teacherData);

            // Set up nodemailer transporter
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER, // Your email address
                    pass: process.env.EMAIL_PASS  // Your email password or app-specific password
                }
            });

            // Send welcome email
            const subject = `Welcome to Our Platform, ${teacher.firstname}!`;
            const html = `
                <h2>Welcome, ${teacher.firstname} ${teacher.lastname}!</h2>
                <p>Thank you for joining our platform as a ${teacher.role}.</p>
                <p><strong>Your Details:</strong></p>
                <ul>
                    <li>Name: ${teacher.firstname} ${teacher.lastname}</li>
                    <li>Email: ${teacher.email}</li>
                    <li>Role: ${teacher.role}</li>
                    <li>Department: ${teacher.department}</li>
                </ul>
                <p>Please use the following link to log in:</p>
                <a href="https://yourapp.com/teacher/login">Login to your Teacher Dashboard</a>
                <p>If you have any questions, feel free to contact our support team.</p>
                <p>Best regards,<br>YourApp Team</p>
            `;

            await transporter.sendMail({
                from: `"YourApp Team" <${process.env.EMAIL_USER}>`,
                to: teacher.email,
                subject,
                html
            });

            res.status(201).json({ 
                success: true, 
                message: "Teacher created successfully",
                data: teacher 
            });
        } catch (err: any) {
            console.error("Create Teacher With Image Error:", err);
            res.status(500).json({ 
                success: false, 
                message: "Failed to create teacher", 
                error: err.message 
            });
        }
    }

    async updateProfileImage(req: Request, res: Response): Promise<void> {
        try {
            const teacherId = req.params.id;
            
            if (!req.file) {
                res.status(400).json({ success: false, message: "No image uploaded" });
                return;
            }
            
            const profileImageUrl = ensureFullImageUrl(req.file.path);
            
            const updatedTeacher = await this.teacherUseCase.updateTeacher(teacherId, { 
                profileImage: profileImageUrl 
            });
            
            if (!updatedTeacher) {
                res.status(404).json({ success: false, message: "Teacher not found" });
                return;
            }
            
            res.status(200).json({ 
                success: true, 
                message: "Profile image updated successfully",
                data: {
                    profileImage: profileImageUrl,
                    teacher: updatedTeacher
                }
            });
        } catch (err: any) {
            console.error("Update Profile Image Error:", err);
            res.status(500).json({ 
                success: false, 
                message: "Failed to update profile image", 
                error: err.message 
            });
        }
    }

    async findTeacherById(req: Request, res: Response): Promise<void> {
        try {
            const teacher = await this.teacherUseCase.findTeacherById(req.params.id);
            if (!teacher) {
                res.status(404).json({ success: false, message: "Teacher not found" });
                return;
            }
            res.status(200).json({ success: true, data: teacher });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to retrieve teacher", error: err.message });
        }
    }

    async updateTeacher(req: Request, res: Response): Promise<void> {
        try {
            const teacherId = req.params.id;
            
            if (!teacherId || teacherId === 'null') {
                res.status(400).json({ 
                    success: false, 
                    message: "Invalid teacher ID" 
                });
                return;
            }

            const updateData = {...req.body};
            
            if (updateData.password) {
                if (!updateData.password.startsWith('$2')) {
                    const bcrypt = require('bcrypt');
                    updateData.password = await bcrypt.hash(updateData.password, 10);
                }
            }
            
            if (updateData.firstName) {
                updateData.firstname = updateData.firstName;
                delete updateData.firstName;
            }
            
            if (updateData.lastName) {
                updateData.lastname = updateData.lastName;
                delete updateData.lastName;
            }
            
            if (updateData.profileImage) {
                updateData.profileImage = ensureFullImageUrl(updateData.profileImage);
            }
            
            const updatedTeacher = await this.teacherUseCase.updateTeacher(teacherId, updateData);
            if (!updatedTeacher) {
                res.status(404).json({ success: false, message: "Teacher not found" });
                return;
            }
            res.status(200).json({ success: true, data: updatedTeacher });
        } catch (err: any) {
            console.error("Update Teacher Error:", err);
            res.status(500).json({ 
                success: false, 
                message: "Failed to update teacher", 
                error: err.message 
            });
        }
    }

    async deleteTeacher(req: Request, res: Response): Promise<void> {
        try {
            const deleted = await this.teacherUseCase.deleteTeacher(req.params.id);
            if (!deleted) {
                res.status(404).json({ success: false, message: "Teacher not found" });
                return;
            }
            res.status(200).json({ success: true, message: "Teacher deleted successfully" });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to delete teacher", error: err.message });
        }
    }

    async getAllTeachers(req: Request, res: Response): Promise<void> {
        try {
            const teachers = await this.teacherUseCase.getAllTeachers();
            res.status(200).json({ success: true, data: teachers });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to retrieve teachers", error: err.message });
        }
    }
}