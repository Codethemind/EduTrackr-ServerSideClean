"use strict";
// AssignmentRepository.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentRepository = void 0;
const Assignment_1 = __importDefault(require("../models/Assignment"));
const mongoose_1 = __importDefault(require("mongoose"));
function mapToAssignmentEntity(data) {
    return {
        ...data,
        id: data._id.toString(),
        departmentId: data.departmentId?._id?.toString() || data.departmentId?.toString(),
        teacherId: data.teacherId?._id?.toString() || data.teacherId?.toString(),
        courseId: data.courseId?._id?.toString() || data.courseId?.toString(),
        departmentName: data.departmentId?.name || undefined,
        teacherName: data.teacherId?.username || undefined,
        courseName: data.courseId?.name || undefined,
        submissions: data.submissions?.map((sub) => mapToSubmissionEntity({
            ...sub.toObject ? sub.toObject() : sub,
            assignmentId: data._id.toString()
        })) || []
    };
}
function mapToSubmissionEntity(data) {
    return {
        ...data,
        id: data._id?.toString() || data.id,
        assignmentId: data.assignmentId?.toString(),
        studentId: data.studentId?.toString(),
        studentName: data.studentName,
        submittedAt: data.submittedAt,
        isLate: data.isLate,
        submissionContent: data.submissionContent || { text: '', files: [] },
        grade: data.grade,
        feedback: data.feedback
    };
}
class AssignmentRepository {
    async create(assignment) {
        console.log('Repository - Creating assignment with data:', assignment);
        // Ensure attachments is an array of Cloudinary URLs
        const attachments = Array.isArray(assignment.attachments) ? assignment.attachments : [];
        console.log('Repository - Attachments to save:', attachments);
        const newAssignment = await Assignment_1.default.create({
            title: assignment.title,
            description: assignment.description,
            instructions: assignment.instructions,
            dueDate: assignment.dueDate,
            maxMarks: assignment.maxMarks,
            courseId: new mongoose_1.default.Types.ObjectId(assignment.courseId),
            departmentId: new mongoose_1.default.Types.ObjectId(assignment.departmentId),
            teacherId: new mongoose_1.default.Types.ObjectId(assignment.teacherId),
            attachments: attachments, // Save Cloudinary URLs
            allowLateSubmission: assignment.allowLateSubmission,
            lateSubmissionPenalty: assignment.lateSubmissionPenalty,
            submissionFormat: assignment.submissionFormat,
            isGroupAssignment: assignment.isGroupAssignment,
            maxGroupSize: assignment.maxGroupSize,
            status: assignment.status || 'active'
        });
        console.log('Repository - Created assignment:', newAssignment);
        return mapToAssignmentEntity(newAssignment.toObject());
    }
    async findById(id) {
        const assignment = await Assignment_1.default.findById(id)
            .populate('departmentId', 'name')
            .populate('teacherId', 'username')
            .populate('courseId', 'name');
        return assignment ? mapToAssignmentEntity(assignment.toObject()) : null;
    }
    async findAll(filters) {
        let query = {};
        if (filters) {
            if (filters.courseId)
                query.courseId = new mongoose_1.default.Types.ObjectId(filters.courseId);
            if (filters.departmentId)
                query.departmentId = new mongoose_1.default.Types.ObjectId(filters.departmentId);
            if (filters.teacherId)
                query.teacherId = new mongoose_1.default.Types.ObjectId(filters.teacherId);
            if (filters.status)
                query.status = filters.status;
        }
        let assignmentQuery = Assignment_1.default.find(query)
            .populate('departmentId', 'name')
            .populate('teacherId', 'username')
            .populate('courseId', 'name');
        if (filters?.sortBy) {
            assignmentQuery = assignmentQuery.sort(filters.sortBy);
        }
        const assignments = await assignmentQuery;
        return assignments.map(assignment => mapToAssignmentEntity(assignment.toObject()));
    }
    async findByDepartmentId(departmentId) {
        const assignments = await Assignment_1.default.find({ departmentId: new mongoose_1.default.Types.ObjectId(departmentId) })
            .populate('departmentId', 'name')
            .populate('teacherId', 'username')
            .populate('courseId', 'name');
        return assignments.map(assignment => mapToAssignmentEntity(assignment.toObject()));
    }
    async findByTeacherId(teacherId) {
        const assignments = await Assignment_1.default.find({ teacherId: new mongoose_1.default.Types.ObjectId(teacherId) })
            .populate('departmentId', 'name')
            .populate('teacherId', 'username')
            .populate('courseId', 'name');
        return assignments.map(assignment => mapToAssignmentEntity(assignment.toObject()));
    }
    async update(id, assignment) {
        const updatedAssignment = await Assignment_1.default.findByIdAndUpdate(id, { ...assignment, updatedAt: new Date() }, { new: true })
            .populate('departmentId', 'name')
            .populate('teacherId', 'username')
            .populate('courseId', 'name');
        if (!updatedAssignment) {
            throw new Error('Assignment not found');
        }
        return mapToAssignmentEntity(updatedAssignment.toObject());
    }
    async delete(id) {
        const result = await Assignment_1.default.findByIdAndDelete(id);
        if (!result) {
            throw new Error('Assignment not found');
        }
    }
    async addSubmission(submission) {
        const assignment = await Assignment_1.default.findById(submission.assignmentId);
        if (!assignment) {
            throw new Error('Assignment not found');
        }
        const submittedAt = submission.submittedAt || new Date();
        const isLate = new Date(submittedAt) > new Date(assignment.dueDate);
        // Ensure files is an array of Cloudinary URLs
        const files = Array.isArray(submission.submissionContent?.files)
            ? submission.submissionContent.files
            : [];
        console.log('Repository - Adding submission with files:', files);
        const submissionData = {
            studentId: new mongoose_1.default.Types.ObjectId(submission.studentId),
            studentName: submission.studentName,
            submittedAt,
            isLate,
            submissionContent: {
                text: submission.submissionContent?.text || '',
                files: files // Save Cloudinary URLs
            }
        };
        assignment.submissions.push(submissionData);
        assignment.totalStudents = assignment.submissions.length;
        await assignment.save();
        const newSubmission = assignment.submissions[assignment.submissions.length - 1];
        return mapToSubmissionEntity({
            // Convert mongoose document to plain object
            ...JSON.parse(JSON.stringify(newSubmission)),
            _id: newSubmission._id,
            assignmentId: assignment._id
        });
    }
    async updateSubmissionGrade(submissionId, grade, feedback) {
        const assignment = await Assignment_1.default.findOne({
            'submissions._id': submissionId
        });
        // Fix: Add null check for assignment
        if (!assignment) {
            throw new Error('Assignment not found');
        }
        // Fix: Correct the typo from 'submiited' to 'SUBMITTED'
        if (assignment.status === 'SUBMITTED') {
            throw new Error('Assignment already submitted');
        }
        // Fix: Use find() method instead of id() method
        const submission = assignment.submissions.find(sub => sub._id?.toString() === submissionId);
        if (!submission) {
            throw new Error('Submission not found');
        }
        submission.grade = grade;
        if (feedback) {
            submission.feedback = feedback;
        }
        await assignment.save();
        return mapToSubmissionEntity({
            // Convert mongoose document to plain object
            ...JSON.parse(JSON.stringify(submission)),
            _id: submission._id,
            assignmentId: assignment._id
        });
    }
    async getSubmissions(assignmentId) {
        const assignment = await Assignment_1.default.findById(assignmentId);
        if (!assignment) {
            return [];
        }
        return assignment.submissions.map(submission => mapToSubmissionEntity({
            // Convert mongoose document to plain object
            ...JSON.parse(JSON.stringify(submission)),
            _id: submission._id,
            assignmentId: assignment._id
        }));
    }
}
exports.AssignmentRepository = AssignmentRepository;
//# sourceMappingURL=AssignmentRepository.js.map