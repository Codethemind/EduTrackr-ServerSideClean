"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentUseCase = void 0;
const createHttpError_1 = require("../../common/utils/createHttpError");
const http_status_enum_1 = require("../../common/enums/http-status.enum");
const http_message_enum_1 = require("../../common/enums/http-message.enum");
class AssignmentUseCase {
    constructor(assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }
    async createAssignment(assignmentData) {
        if (!assignmentData.title || !assignmentData.description || !assignmentData.dueDate) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.MISSING_ASSIGNMENT_FIELDS, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        const assignment = {
            ...assignmentData,
            status: assignmentData.status || 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            submissions: [],
            maxGroupSize: assignmentData.isGroupAssignment ? assignmentData.maxGroupSize : 1,
            attachments: assignmentData.attachments || []
        };
        return this.assignmentRepository.create(assignment);
    }
    async getAssignments(filters) {
        return this.assignmentRepository.findAll(filters);
    }
    async getAssignmentsByDepartment(departmentId) {
        return this.assignmentRepository.findByDepartmentId(departmentId);
    }
    async getAssignmentsByTeacher(teacherId) {
        return this.assignmentRepository.findByTeacherId(teacherId);
    }
    async getAssignmentById(id) {
        return this.assignmentRepository.findById(id);
    }
    async updateAssignment(id, assignmentData) {
        if (assignmentData.dueDate && new Date(assignmentData.dueDate) < new Date()) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.INVALID_DUE_DATE, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        const updateData = {
            ...assignmentData,
            updatedAt: new Date()
        };
        return this.assignmentRepository.update(id, updateData);
    }
    async deleteAssignment(id) {
        return this.assignmentRepository.delete(id);
    }
    async submitAssignment(assignmentId, submission) {
        const assignment = await this.assignmentRepository.findById(assignmentId);
        if (!assignment) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.ASSIGNMENT_NOT_FOUND, http_status_enum_1.HttpStatus.NOT_FOUND);
        }
        const alreadysubmitted = assignment.submissions.find(sub => sub.studentId.toString() === submission.studentId.toString());
        if (alreadysubmitted) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.ASSIGNMENT_ALREADY_SUBMITTED, http_status_enum_1.HttpStatus.CONFLICT);
        }
        const submittedAt = submission.submittedAt || new Date();
        const isLate = submittedAt > new Date(assignment.dueDate);
        if (isLate && !assignment.allowLateSubmission) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.LATE_SUBMISSION_NOT_ALLOWED, http_status_enum_1.HttpStatus.FORBIDDEN);
        }
        if (!submission.studentId || !submission.studentName) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.MISSING_STUDENT_INFO, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (!submission.submissionContent || (!submission.submissionContent.text && (!submission.submissionContent.files || submission.submissionContent.files.length === 0))) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.SUBMISSION_CONTENT_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        const submissionData = {
            ...submission,
            assignmentId,
            submittedAt,
            isLate
        };
        return await this.assignmentRepository.addSubmission(submissionData);
    }
    async gradeSubmission(submissionId, grade, feedback) {
        const assignment = await this.assignmentRepository.findById(submissionId.split('_')[0]);
        if (!assignment) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.ASSIGNMENT_NOT_FOUND, http_status_enum_1.HttpStatus.NOT_FOUND);
        }
        if (grade > assignment.maxMarks) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.GRADE_EXCEEDS_MAX, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        return this.assignmentRepository.updateSubmissionGrade(submissionId, grade, feedback);
    }
    async getSubmissions(assignmentId) {
        return this.assignmentRepository.getSubmissions(assignmentId);
    }
    async gradeMultipleSubmissions(assignmentId, grades) {
        const assignment = await this.assignmentRepository.findById(assignmentId);
        if (!assignment) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.ASSIGNMENT_NOT_FOUND, http_status_enum_1.HttpStatus.NOT_FOUND);
        }
        const submissionMap = new Map(assignment.submissions.map(sub => [sub.studentId.toString(), sub]));
        for (const gradeEntry of grades) {
            if (!submissionMap.has(gradeEntry.studentId)) {
                (0, createHttpError_1.createHttpError)(`${http_message_enum_1.HttpMessage.SUBMISSION_NOT_FOUND_FOR_STUDENT} ${gradeEntry.studentId}`, http_status_enum_1.HttpStatus.NOT_FOUND);
            }
        }
        const updatedSubmissions = [];
        for (const gradeEntry of grades) {
            const submission = submissionMap.get(gradeEntry.studentId);
            if (!submission)
                continue;
            const submissionToUpdate = assignment.submissions.find(sub => sub.studentId.toString() === gradeEntry.studentId);
            if (!submissionToUpdate)
                continue;
            const updatedSubmission = await this.assignmentRepository.updateSubmissionGrade(submissionToUpdate.id.toString(), gradeEntry.grade);
            updatedSubmissions.push(updatedSubmission);
        }
        return updatedSubmissions;
    }
}
exports.AssignmentUseCase = AssignmentUseCase;
//# sourceMappingURL=AssignmentUseCase.js.map