"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGrade = exports.validateSubmission = exports.validateAssignment = exports.validateProfileImage = exports.validateLogin = exports.validateUserUpdate = exports.validateUser = exports.validateObjectId = void 0;
const studentRepository_1 = require("../../infrastructure/repositories/studentRepository");
const TeacherRepository_1 = require("../../infrastructure/repositories/TeacherRepository");
const AdminRepository_1 = require("../../infrastructure/repositories/AdminRepository");
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const validateObjectId = (req, res, next) => {
    // Get the ID from either teacherId or id parameter
    const id = req.params.teacherId ||
        req.params.departmentId ||
        req.params.studentId ||
        req.params.courseId ||
        req.params.id;
    console.log('Validating ID:', id);
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'No ID provided'
        });
    }
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }
    next();
};
exports.validateObjectId = validateObjectId;
const validateUser = async (req, res, next) => {
    try {
        const { email, username, password, role } = req.body;
        const errors = [];
        if (!email)
            errors.push('Email is required');
        if (!username)
            errors.push('Username is required');
        if (!password)
            errors.push('Password is required');
        if (!role)
            errors.push('Role is required');
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Invalid email format12345');
        }
        if (password && password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
        if (role && !['Student', 'Teacher', 'Admin'].includes(role)) {
            errors.push('Invalid role specified');
        }
        const studentRepo = new studentRepository_1.StudentRepository();
        const teacherRepo = new TeacherRepository_1.TeacherRepository();
        const adminRepo = new AdminRepository_1.AdminRepository();
        const existingStudent = await studentRepo.findStudentByEmail(email);
        const existingTeacher = await teacherRepo.findTeacherByEmail(email);
        const existingAdmin = await adminRepo.findAdminByEmail(email);
        if (existingStudent || existingTeacher || existingAdmin) {
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
};
exports.validateUser = validateUser;
const validateUserUpdate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const errors = [];
        if (!(0, mongoose_1.isValidObjectId)(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Invalid email format');
        }
        if (email) {
            const studentRepo = new studentRepository_1.StudentRepository();
            const teacherRepo = new TeacherRepository_1.TeacherRepository();
            const adminRepo = new AdminRepository_1.AdminRepository();
            const [existingStudent, existingTeacher, existingAdmin] = await Promise.all([
                studentRepo.findStudentByEmail(email),
                teacherRepo.findTeacherByEmail(email),
                adminRepo.findAdminByEmail(email)
            ]);
            const isEmailUsedByAnotherUser = (existingStudent && String(existingStudent._id) !== id) ||
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
};
exports.validateUserUpdate = validateUserUpdate;
const validateLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const errors = [];
        if (!email)
            errors.push('Email is required');
        if (!password)
            errors.push('Password is required');
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
};
exports.validateLogin = validateLogin;
const validateProfileImage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const errors = [];
        if (!(0, mongoose_1.isValidObjectId)(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }
        if (!req.file) {
            errors.push('No image file uploaded');
        }
        else {
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
};
exports.validateProfileImage = validateProfileImage;
const validateAssignment = (req, res, next) => {
    const { title, description, dueDate, maxMarks, courseId, departmentId } = req.body;
    const errors = [];
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Title is required and must be a non-empty string');
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
        errors.push('Description is required and must be a non-empty string');
    }
    if (!dueDate || isNaN(Date.parse(dueDate))) {
        errors.push('Valid due date is required');
    }
    else if (new Date(dueDate) < new Date()) {
        errors.push('Due date cannot be in the past');
    }
    if (!maxMarks || typeof maxMarks !== 'number' || maxMarks < 1) {
        errors.push('Maximum marks must be a positive number');
    }
    if (!courseId || !mongoose_2.Types.ObjectId.isValid(courseId)) {
        errors.push('Valid course ID is required');
    }
    if (!departmentId || !mongoose_2.Types.ObjectId.isValid(departmentId)) {
        errors.push('Valid department ID is required');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    next();
};
exports.validateAssignment = validateAssignment;
const validateSubmission = (req, res, next) => {
    const { studentId, hasSubmissionText, fileCount, fileNames, studentName, submissionText } = req.body;
    const files = req.files;
    console.log('Submission validation - Request body:', req.body);
    console.log('Submission validation - Files:', files);
    const errors = [];
    if (!studentId || !mongoose_2.Types.ObjectId.isValid(studentId)) {
        errors.push('Valid student ID is required');
    }
    if (!studentName || typeof studentName !== 'string' || studentName.trim().length === 0) {
        errors.push('Student name is required');
    }
    // Check if there's either text submission or files
    const hasTextSubmission = hasSubmissionText && submissionText && submissionText.trim().length > 0;
    const hasFileSubmission = files && files.length > 0;
    if (!hasTextSubmission && !hasFileSubmission) {
        errors.push('Either submission text or files are required');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    // Transform the request body to match the expected format
    req.body.submissionContent = {
        text: hasTextSubmission ? submissionText.trim() : '',
        files: files ? files.map(file => file.filename) : []
    };
    // Ensure studentName is properly set
    req.body.studentName = studentName.trim();
    next();
};
exports.validateSubmission = validateSubmission;
const validateGrade = (req, res, next) => {
    const { studentId, grade } = req.body;
    const errors = [];
    if (!studentId || !mongoose_2.Types.ObjectId.isValid(studentId)) {
        errors.push('Valid student ID is required');
    }
    if (typeof grade !== 'number' || grade < 0) {
        errors.push('Grade must be a non-negative number');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    next();
};
exports.validateGrade = validateGrade;
//# sourceMappingURL=validation.js.map