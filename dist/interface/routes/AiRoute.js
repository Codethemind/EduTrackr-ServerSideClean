"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AiController_1 = require("../controllers/AiController");
const AiUseCase_1 = require("../../application/useCases/AiUseCase");
const AiRepository_1 = require("../../infrastructure/repositories/AiRepository");
const router = (0, express_1.Router)();
const aiRepository = new AiRepository_1.AiRepository();
const aiUseCase = new AiUseCase_1.AiUseCase(aiRepository);
const aiController = new AiController_1.AiController(aiUseCase);
router.post('/student/chat', aiController.handleStudentChat.bind(aiController));
router.post('/teacher/chat', aiController.handleTeacherChat.bind(aiController));
exports.default = router;
//# sourceMappingURL=AiRoute.js.map