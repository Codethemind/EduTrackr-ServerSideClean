import { Request, Response } from "express";
import { AdminUseCase } from "../../application/useCases/AdminUseCase";
import { StudentUseCase } from "../../application/useCases/studentUseCase";
import { TeacherUseCase } from "../../application/useCases/TeacherUseCase";
import { StudentRepository } from "../../infrastructure/repositories/studentRepository";
import { TeacherRepository } from "../../infrastructure/repositories/TeacherRepository";
import { ensureFullImageUrl } from "../../infrastructure/middleware/multer";
import nodemailer from 'nodemailer';

export class AdminController {
    private studentUseCase: StudentUseCase;
    private teacherUseCase: TeacherUseCase;

    constructor(private adminUseCase: AdminUseCase) {
        const studentRepository = new StudentRepository();
        this.studentUseCase = new StudentUseCase(studentRepository);
        const teacherRepository = new TeacherRepository();
        this.teacherUseCase = new TeacherUseCase(teacherRepository);
    }

    async createAdminWithImage(req: Request, res: Response): Promise<void> {
        try {
            const adminData: any = {
                ...req.body,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                role: 'Admin'
            };

            if (req.file) {
                adminData.profileImage = ensureFullImageUrl(req.file.path);
            } else {
                adminData.profileImage = "https://res.cloudinary.com/djpom2k7h/image/upload/v1/admin_profiles/default-profile.png";
            }

            const admin = await this.adminUseCase.createAdmin(adminData);

            // Set up nodemailer transporter
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER, // Your email address
                    pass: process.env.EMAIL_PASS  // Your email password or app-specific password
                }
            });

            // Send welcome email
            const subject = `Welcome to Our Platform, ${admin.firstname}!`;
            const html = `
                <h2>Welcome, ${admin.firstname} ${admin.lastname}!</h2>
                <p>Thank you for joining our platform as an ${admin.role}.</p>
                <p><strong>Your Details:</strong></p>
                <ul>
                    <li>Name: ${admin.firstname} ${admin.lastname}</li>
                    <li>Email: ${admin.email}</li>
                    <li>Role: ${admin.role}</li>
                </ul>
                <p>Please use the following link to log in:</p>
                <a href="https://yourapp.com/admin/login">Login to your Admin Dashboard</a>
                <p>If you have any questions, feel free to contact our support team.</p>
                <p>Best regards,<br>YourApp Team</p>
            `;

            await transporter.sendMail({
                from: `"YourApp Team" <${process.env.EMAIL_USER}>`,
                to: admin.email,
                subject,
                html
            });

            res.status(201).json({ 
                success: true, 
                message: "Admin created successfully",
                data: admin 
            });
        } catch (err: any) {
            console.error("Create Admin With Image Error:", err);
            res.status(500).json({ 
                success: false, 
                message: "Failed to create admin", 
                error: err.message 
            });
        }
    }

    async updateAdminProfileImage(req: Request, res: Response): Promise<void> {
        try {
            const adminId = req.params.id;
            
            if (!req.file) {
                res.status(400).json({ success: false, message: "No image uploaded" });
                return;
            }
            
            const profileImageUrl = ensureFullImageUrl(req.file.path);
           
            const updatedAdmin = await this.adminUseCase.updateAdmin(adminId, { 
                profileImage: profileImageUrl 
            });
            
            if (!updatedAdmin) {
                res.status(404).json({ success: false, message: "Admin not found" });
                return;
            }
            
            res.status(200).json({ 
                success: true, 
                message: "Profile image updated successfully",
                data: {
                    profileImage: profileImageUrl,
                    admin: updatedAdmin
                }
            });
        } catch (err: any) {
            console.error("Update Admin Profile Image Error:", err);
            res.status(500).json({ 
                success: false, 
                message: "Failed to update profile image", 
                error: err.message 
            });
        }
    }

    async findAdminById(req: Request, res: Response): Promise<void> {
        try {
            const admin = await this.adminUseCase.findAdminById(req.params.id);
            if (!admin) {
                res.status(404).json({ success: false, message: "Admin not found" });
                return;
            }
            res.status(200).json({ success: true, data: admin });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to retrieve admin", error: err.message });
        }
    }

    async updateAdmin(req: Request, res: Response): Promise<void> {
        try {
            const adminId = req.params.id;
       
            if (!adminId || adminId === 'null') {
                res.status(400).json({ 
                    success: false, 
                    message: "Invalid admin ID" 
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
            
            const updatedAdmin = await this.adminUseCase.updateAdmin(adminId, updateData);
            if (!updatedAdmin) {
                res.status(404).json({ success: false, message: "Admin not found" });
                return;
            }
            res.status(200).json({ success: true, data: updatedAdmin });
        } catch (err: any) {
            console.error("Update Admin Error:", err);
            res.status(500).json({ 
                success: false, 
                message: "Failed to update admin", 
                error: err.message 
            });
        }
    }

    async deleteAdmin(req: Request, res: Response): Promise<void> {
        try {
            const deleted = await this.adminUseCase.deleteAdmin(req.params.id);
            if (!deleted) {
                res.status(404).json({ success: false, message: "Admin not found" });
                return;
            }
            res.status(200).json({ success: true, message: "Admin deleted successfully" });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to delete admin", error: err.message });
        }
    }

    async getAllAdmins(req: Request, res: Response): Promise<void> {
        try {
            const admins = await this.adminUseCase.getAllAdmins();
            res.status(200).json({ success: true, data: admins });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to retrieve admins", error: err.message });
        }
    }
}