// src/controllers/AdminController.ts
import { Request, Response } from "express";
import { AdminUseCase } from "../../application/useCases/AdminUseCase";
import { StudentUseCase } from "../../application/useCases/studentUseCase";
import { TeacherUseCase } from "../../application/useCases/TeacherUseCase";
import { StudentRepository } from "../../infrastructure/repositories/studentRepository";
import { TeacherRepository } from "../../infrastructure/repositories/TeacherRepository";
import { ensureFullImageUrl } from "../../infrastructure/middleware/multer";

export class AdminController {
    private studentUseCase: StudentUseCase;
    private teacherUseCase: TeacherUseCase;

    constructor(private adminUseCase: AdminUseCase) {
        // Initialize other use cases
        const studentRepository = new StudentRepository();
        this.studentUseCase = new StudentUseCase(studentRepository);
        
        const teacherRepository = new TeacherRepository();
        this.teacherUseCase = new TeacherUseCase(teacherRepository);
    }

    async createAdmin(req: Request, res: Response): Promise<void> {
        try {
            const admin = await this.adminUseCase.createAdmin(req.body);
            res.status(201).json({ success: true, data: admin });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to create admin", error: err.message });
        }
    }

    async createAdminWithImage(req: Request, res: Response): Promise<void> {
        try {
            console.log("Creating admin with image, received data:", req.body);
            
            // Get admin data from request body
            const adminData: any = {
                ...req.body,
                // Convert firstName/lastName to firstname/lastname if they exist
                firstname: req.body.firstName || req.body.firstname,
                lastname: req.body.lastName || req.body.lastname,
                role: 'Admin'
            };

            // Remove fields that aren't in our model
            delete adminData.firstName;
            delete adminData.lastName;
            delete adminData.isActive;

            // Add profile image URL if image was uploaded
            if (req.file) {
                console.log("Profile image uploaded:", req.file.path);
                adminData.profileImage = ensureFullImageUrl(req.file.path);
            }
            
            console.log("Processed admin data:", adminData);
            
            const admin = await this.adminUseCase.createAdmin(adminData);
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

    async createStudentWithImage(req: Request, res: Response): Promise<void> {
        try {
            // Get student data from request body
            const studentData = req.body;
            
            // Add profile image URL if image was uploaded
            if (req.file) {
                studentData.profileImage = ensureFullImageUrl(req.file.path);
            }
            
            const student = await this.studentUseCase.createStudent(studentData);
            res.status(201).json({ 
                success: true, 
                message: "Student created with profile image",
                data: student 
            });
        } catch (err: any) {
            console.error("Create Student With Image Error:", err);
            res.status(500).json({ 
                success: false, 
                message: "Failed to create student with image", 
                error: err.message 
            });
        }
    }

    async createTeacherWithImage(req: Request, res: Response): Promise<void> {
        try {
            // Get teacher data from request body
            const teacherData = req.body;
            
            // Add profile image URL if image was uploaded
            if (req.file) {
                teacherData.profileImage = ensureFullImageUrl(req.file.path);
            }
            
            const teacher = await this.teacherUseCase.createTeacher(teacherData);
            res.status(201).json({ 
                success: true, 
                message: "Teacher created with profile image",
                data: teacher 
            });
        } catch (err: any) {
            console.error("Create Teacher With Image Error:", err);
            res.status(500).json({ 
                success: false, 
                message: "Failed to create teacher with image", 
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
            
            // Update only the profile image
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
            
            // Validate admin ID
            if (!adminId || adminId === 'null') {
                res.status(400).json({ 
                    success: false, 
                    message: "Invalid admin ID" 
                });
                return;
            }

            // Create a copy of the request body
            const updateData = {...req.body};
            
            // Check if password is being updated
            if (updateData.password) {
                // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
                if (!updateData.password.startsWith('$2')) {
                    // Hash the password before updating
                    const bcrypt = require('bcrypt');
                    updateData.password = await bcrypt.hash(updateData.password, 10);
                }
            }
            
            // Handle field name inconsistencies
            if (updateData.firstName) {
                updateData.firstname = updateData.firstName;
                delete updateData.firstName;
            }
            
            if (updateData.lastName) {
                updateData.lastname = updateData.lastName;
                delete updateData.lastName;
            }
            
            // Handle profileImage if it's being updated
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
