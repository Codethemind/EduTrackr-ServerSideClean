"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// models/Assignment.ts
const mongoose_1 = __importStar(require("mongoose"));
const SubmissionContentSchema = new mongoose_1.Schema({
    text: { type: String, default: '' },
    files: [{ type: String }]
}, { _id: false });
const SubmissionSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    isLate: { type: Boolean, default: false },
    submissionContent: { type: SubmissionContentSchema, required: true },
    grade: { type: Number },
    feedback: { type: String }
});
const AssignmentSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructions: { type: String },
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, required: true },
    courseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true },
    departmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Department', required: true },
    teacherId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    attachments: [{ type: String, required: false }],
    allowLateSubmission: { type: Boolean, default: false },
    lateSubmissionPenalty: { type: Number, default: 0 },
    submissionFormat: { type: String },
    isGroupAssignment: { type: Boolean, default: false },
    maxGroupSize: { type: Number, default: 1 },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'CLOSED', 'active'], default: 'active' },
    submissions: [SubmissionSchema],
    totalStudents: { type: Number, default: 0 }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Assignment', AssignmentSchema);
//# sourceMappingURL=Assignment.js.map