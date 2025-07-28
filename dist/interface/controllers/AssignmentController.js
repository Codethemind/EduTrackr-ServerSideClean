"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentController = exports.submissionUpload = exports.assignmentUpload = void 0;
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../../infrastructure/services/cloudinary"));
const http_status_enum_1 = require("../../common/enums/http-status.enum");
const assignmentStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: {
        folder: 'assignments',
        allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'],
        resource_type: 'auto'
    }
});
const submissionStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: {
        folder: 'submissions',
        allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'],
        resource_type: 'auto'
    }
});
exports.assignmentUpload = (0, multer_1.default)({ storage: assignmentStorage });
exports.submissionUpload = (0, multer_1.default)({ storage: submissionStorage });
class AssignmentController {
    constructor(assignmentUseCase) {
        this.assignmentUseCase = assignmentUseCase;
    }
    async createAssignment(req, res, next) {
        try {
            const files = req.files;
            const fileUrls = files ? files.map(file => file.path) : [];
            const assignmentData = {
                ...req.body,
                attachments: fileUrls,
                courseId: req.body.courseId,
                departmentId: req.body.departmentId,
                teacherId: req.body.teacherId,
                maxMarks: Number(req.body.maxMarks),
                allowLateSubmission: req.body.allowLateSubmission === 'true',
                isGroupAssignment: req.body.isGroupAssignment === 'true',
                lateSubmissionPenalty: Number(req.body.lateSubmissionPenalty) || 0,
                maxGroupSize: Number(req.body.maxGroupSize) || 1,
                dueDate: new Date(req.body.dueDate)
            };
            const assignment = await this.assignmentUseCase.createAssignment(assignmentData);
            res.status(http_status_enum_1.HttpStatus.CREATED).json({
                success: true,
                message: 'Assignment created successfully',
                data: assignment
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAssignments(req, res, next) {
        try {
            const filters = {
                courseId: req.query.courseId,
                departmentId: req.query.departmentId,
                teacherId: req.query.teacherId,
                status: req.query.status,
                sortBy: req.query.sortBy
            };
            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined) {
                    delete filters[key];
                }
            });
            const assignments = await this.assignmentUseCase.getAssignments(filters);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: assignments });
        }
        catch (error) {
            next(error);
        }
    }
    async getAssignmentsByDepartment(req, res, next) {
        try {
            const assignments = await this.assignmentUseCase.getAssignmentsByDepartment(req.params.departmentId);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: assignments });
        }
        catch (error) {
            next(error);
        }
    }
    async getAssignmentsByTeacher(req, res, next) {
        console.log('Controller - Get Assignments by Teacher ID:', req.params.teacherId);
        try {
            const assignments = await this.assignmentUseCase.getAssignmentsByTeacher(req.params.teacherId);
            console.log('Controller - Assignments:', assignments);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: assignments });
        }
        catch (error) {
            next(error);
        }
    }
    async getAssignmentById(req, res, next) {
        try {
            const assignment = await this.assignmentUseCase.getAssignmentById(req.params.id);
            if (!assignment) {
                res.status(http_status_enum_1.HttpStatus.NOT_FOUND).json({ success: false, message: 'Assignment not found' });
                return;
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: assignment });
        }
        catch (error) {
            next(error);
        }
    }
    async updateAssignment(req, res, next) {
        try {
            const assignment = await this.assignmentUseCase.updateAssignment(req.params.id, req.body);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, message: 'Assignment updated successfully', data: assignment });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteAssignment(req, res, next) {
        try {
            await this.assignmentUseCase.deleteAssignment(req.params.id);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, message: 'Assignment deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    async submitAssignment(req, res, next) {
        try {
            const { id } = req.params;
            const { studentId, studentName, submissionContent } = req.body;
            const files = req.files;
            const fileUrls = files ? files.map(file => file.path) : [];
            let parsedContent = submissionContent;
            if (typeof submissionContent === 'string') {
                try {
                    parsedContent = JSON.parse(submissionContent);
                }
                catch {
                    parsedContent = { text: submissionContent, files: [] };
                }
            }
            const submission = {
                assignmentId: id,
                studentId,
                studentName,
                submissionContent: {
                    text: parsedContent.text || '',
                    files: [...(parsedContent.files || []), ...fileUrls]
                },
                submittedAt: new Date()
            };
            const result = await this.assignmentUseCase.submitAssignment(id, submission);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, message: 'Assignment submitted successfully', data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async gradeSubmission(req, res, next) {
        console.log('Controller - Grade Submission for Submission ID:', req.params.submissionId);
        try {
            const { submissionId } = req.params;
            const { grade, feedback } = req.body;
            const result = await this.assignmentUseCase.gradeSubmission(submissionId, grade, feedback);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, message: 'Grade submitted successfully', data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async getSubmissions(req, res, next) {
        console.log('Controller - Get Submissions for Assignment ID:', req.params.id);
        try {
            const submissions = await this.assignmentUseCase.getSubmissions(req.params.id);
            console.log('Controller - Submissions:', submissions);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: submissions });
        }
        catch (error) {
            next(error);
        }
    }
    async gradeMultipleSubmissions(req, res, next) {
        try {
            const { id } = req.params;
            const { grades } = req.body;
            if (!Array.isArray(grades) || grades.length === 0) {
                throw new Error('Grades must be a non-empty array');
            }
            for (const gradeEntry of grades) {
                if (!gradeEntry.studentId || typeof gradeEntry.grade !== 'number') {
                    throw new Error('Each grade entry must have a studentId and a numeric grade');
                }
                if (gradeEntry.grade < 0 || gradeEntry.grade > 100) {
                    throw new Error('Grades must be between 0 and 100');
                }
            }
            const result = await this.assignmentUseCase.gradeMultipleSubmissions(id, grades);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, message: 'Grades submitted successfully', data: result });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AssignmentController = AssignmentController;
//# sourceMappingURL=AssignmentController.js.map