"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcernController = void 0;
const http_status_enum_1 = require("../../common/enums/http-status.enum");
const ConcernModel_1 = __importDefault(require("../../infrastructure/models/ConcernModel"));
const Concern_1 = require("../../domain/entities/Concern"); // Import from Concern.ts
class ConcernController {
    constructor(concernUseCase) {
        this.concernUseCase = concernUseCase;
    }
    async raiseConcern(req, res, next) {
        console.log('Controller - Raise Concern:', req.body);
        try {
            // Check if user exists (should always exist due to middleware)
            if (!req.user) {
                return res.status(http_status_enum_1.HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const { title, description, raisedBy, createdBy } = req.body;
            const userId = raisedBy || createdBy || req.user.id;
            // Map string role to enum
            const roleMapping = {
                'student': 'Student',
                'teacher': 'Teacher',
                'admin': 'Admin'
            };
            const userRole = roleMapping[req.user.role.toLowerCase()] || 'Student';
            const concern = await this.concernUseCase.raiseConcern({
                title,
                description,
                createdBy: userId,
                createdByRole: userRole,
                status: Concern_1.ConcernStatus.PENDING, // This should now work correctly
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            res.status(http_status_enum_1.HttpStatus.CREATED).json({ success: true, data: concern });
        }
        catch (err) {
            next(err);
        }
    }
    async getMyConcerns(req, res, next) {
        try {
            if (!req.user) {
                return res.status(http_status_enum_1.HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const userId = req.user.id;
            const concerns = await this.concernUseCase.getConcernsByUser(userId);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: concerns });
        }
        catch (err) {
            next(err);
        }
    }
    async getAllConcerns(req, res, next) {
        try {
            if (!req.user) {
                return res.status(http_status_enum_1.HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const concerns = await this.concernUseCase.getAllConcerns();
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: concerns });
        }
        catch (err) {
            next(err);
        }
    }
    async updateConcernStatus(req, res, next) {
        try {
            if (!req.user) {
                return res.status(http_status_enum_1.HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const { id } = req.params;
            const { status, feedback } = req.body;
            const updated = await this.concernUseCase.updateConcernStatus(id, status, feedback);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: updated });
        }
        catch (err) {
            next(err);
        }
    }
    async updateConcern(req, res, next) {
        try {
            if (!req.user) {
                return res.status(http_status_enum_1.HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const { id } = req.params;
            const { title, description, status, feedback } = req.body;
            // Fetch existing concern
            const concern = await this.concernUseCase.getConcernById(id);
            if (!concern) {
                return res.status(http_status_enum_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: 'Concern not found'
                });
            }
            // Update fields
            if (title !== undefined)
                concern.title = title;
            if (description !== undefined)
                concern.description = description;
            if (status !== undefined)
                concern.status = status;
            if (feedback !== undefined)
                concern.feedback = feedback;
            concern.updatedAt = new Date();
            // Save update
            const updated = await this.concernUseCase.raiseConcern(concern); // reuse create for upsert
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: updated });
        }
        catch (err) {
            next(err);
        }
    }
    async deleteConcern(req, res, next) {
        try {
            if (!req.user) {
                return res.status(http_status_enum_1.HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const { id } = req.params;
            const concern = await this.concernUseCase.getConcernById(id);
            if (!concern) {
                return res.status(http_status_enum_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: 'Concern not found'
                });
            }
            await ConcernModel_1.default.findByIdAndDelete(id); // direct model access for delete
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, message: 'Concern deleted' });
        }
        catch (err) {
            next(err);
        }
    }
    async getConcernsByUserId(req, res, next) {
        try {
            if (!req.user) {
                return res.status(http_status_enum_1.HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const { userId } = req.params;
            const concerns = await this.concernUseCase.getConcernsByUser(userId);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: concerns });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ConcernController = ConcernController;
//# sourceMappingURL=ConcernController.js.map