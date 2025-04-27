// src/controllers/TeacherController.ts
import { Request, Response } from "express"
import { TeacherUseCase } from "../../application/useCases/TeacherUseCase";
import { ensureFullImageUrl } from "../../infrastructure/middleware/multer";

export class TeacherController {
    constructor(private teacherUseCase: TeacherUseCase) {}

    async createTeacher(req: Request, res: Response): Promise<void> {
      
        try {
            console.log(req.body)
            const teacher = await this.teacherUseCase.createTeacher(req.body);
            res.status(201).json({ success: true, data: teacher });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to create teacher", error: err.message });
        }
    }

    async createTeacherWithImage(req: Request, res: Response): Promise<void> {
        try {
            console.log("Creating teacher with image, received data:", req.body);
            
            // Get teacher data from request body
            const teacherData: any = {
                ...req.body,
                // Convert firstName/lastName to firstname/lastname if they exist
                firstname: req.body.firstName || req.body.firstname,
                lastname: req.body.lastName || req.body.lastname,
                department: req.body.department,
                role: 'Teacher'
            };

            // Remove fields that aren't in our model
            delete teacherData.firstName;
            delete teacherData.lastName;
            delete teacherData.isActive;

            // Add profile image URL if image was uploaded
            if (req.file) {
                console.log("Profile image uploaded:", req.file.path);
                teacherData.profileImage = ensureFullImageUrl(req.file.path);
            }
            
            console.log("Processed teacher data:", teacherData);
            
            const teacher = await this.teacherUseCase.createTeacher(teacherData);
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
            
            // Ensure full URL using our helper function
            const profileImageUrl = ensureFullImageUrl(req.file.path);
            
            // Update only the profile image
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
            
            // Validate teacher ID
            if (!teacherId || teacherId === 'null') {
                res.status(400).json({ 
                    success: false, 
                    message: "Invalid teacher ID" 
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
            
            // Handle profileImage if it's being updated but not through the dedicated endpoint
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
