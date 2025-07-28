"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const http_status_enum_1 = require("../../common/enums/http-status.enum");
const http_message_enum_1 = require("../../common/enums/http-message.enum");
class AiController {
    constructor(aiUseCase) {
        this.aiUseCase = aiUseCase;
    }
    async handleStudentChat(req, res, next) {
        try {
            const { message, context } = req.body;
            if (!message) {
                return next({
                    status: http_status_enum_1.HttpStatus.BAD_REQUEST,
                    message: http_message_enum_1.HttpMessage.BAD_REQUEST,
                    detail: 'Message is required',
                });
            }
            const response = await this.aiUseCase.generateStudentResponse(message, context);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, response });
        }
        catch (error) {
            next(error);
        }
    }
    async handleTeacherChat(req, res, next) {
        try {
            const { message, context } = req.body;
            if (!message) {
                return next({
                    status: http_status_enum_1.HttpStatus.BAD_REQUEST,
                    message: http_message_enum_1.HttpMessage.BAD_REQUEST,
                    detail: 'Message is required',
                });
            }
            const response = await this.aiUseCase.generateTeacherResponse(message, context);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, response });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AiController = AiController;
//# sourceMappingURL=AiController.js.map