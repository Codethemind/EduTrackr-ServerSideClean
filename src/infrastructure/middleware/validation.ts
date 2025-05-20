import { Request, Response, NextFunction } from 'express';
import { StudentRepository } from '../repositories/studentRepository';
import { TeacherRepository } from '../repositories/TeacherRepository';
import { AdminRepository } from '../repositories/AdminRepository';
import { isValidObjectId } from 'mongoose';


export const validateUser = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { email, username, password, role } = req.body;
        const errors: string[] = [];
        if (!email) errors.push('Email is required');
        if (!username) errors.push('Username is required');
        if (!password) errors.push('Password is required');
        if (!role) errors.push('Role is required');
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Invalid email format12345');
        }
        if (password && password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
        if (role && !['Student', 'Teacher', 'Admin'].includes(role)) {
            errors.push('Invalid role specified');
        }
       
        const studentRepo = new StudentRepository();
        const teacherRepo = new TeacherRepository();
        const adminRepo = new AdminRepository();
    
        const existingStudent = await studentRepo.findStudentByEmail(email);
        const existingTeacher = await teacherRepo.findTeacherByEmail(email);
        const existingAdmin = await adminRepo.findAdminByEmail(email);
        
        if (existingStudent || existingTeacher || existingAdmin ) {
            errors.push('Email already exists');
        }
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: errors[0], 
                errors
            });
        }
        next();
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
};



export const validateUserUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const errors: string[] = [];

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Invalid email format');
        }

        if (email) {
            const studentRepo = new StudentRepository();
            const teacherRepo = new TeacherRepository();
            const adminRepo = new AdminRepository();

            const [existingStudent, existingTeacher, existingAdmin] = await Promise.all([
                studentRepo.findStudentByEmail(email),
                teacherRepo.findTeacherByEmail(email),
                adminRepo.findAdminByEmail(email)
            ]);

            const isEmailUsedByAnotherUser =
                (existingStudent && String(existingStudent._id) !== id) ||
                (existingTeacher && String(existingTeacher.id) !== id) ||
                (existingAdmin && String(existingAdmin.id) !== id);

            if (isEmailUsedByAnotherUser) {
                errors.push('Email already exists');
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: errors[0],
                errors
            });
        }
        next();
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
};

export const validateLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const errors: string[] = [];

        if (!email) errors.push('Email is required');
        if (!password) errors.push('Password is required');

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Invalid email format');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: errors[0],
                errors
            });
        }

        next();
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
};





export const validateProfileImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const errors: string[] = [];


        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

  
        if (!req.file) {
            errors.push('No image file uploaded');
        } else {
         
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(req.file.mimetype)) {
                errors.push('Invalid file type. Only JPEG, JPG, and PNG are allowed');
            }


            const maxSize = 5 * 1024 * 1024; // 5MB
            if (req.file.size > maxSize) {
                errors.push('File size exceeds 5MB limit');
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: errors[0],
                errors
            });
        }

        next();
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
}; 