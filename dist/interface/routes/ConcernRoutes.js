"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/concernRoutes.ts (Updated for consistency)
const express_1 = require("express");
const ConcernController_1 = require("../controllers/ConcernController");
const ConcernUseCase_1 = require("../../application/useCases/ConcernUseCase");
const ConcernRepository_1 = require("../../infrastructure/repositories/ConcernRepository");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const concernRepository = new ConcernRepository_1.ConcernRepository();
const concernUseCase = new ConcernUseCase_1.ConcernUseCase(concernRepository);
const concernController = new ConcernController_1.ConcernController(concernUseCase);
// Raise concern - Students, teachers, and admins can raise concerns
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), concernController.raiseConcern.bind(concernController));
// Get my concerns - Students and teachers can view their own concerns
router.get('/my', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher']), concernController.getMyConcerns.bind(concernController));
// Get all concerns - Only admins can view all concerns
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), concernController.getAllConcerns.bind(concernController));
// Update concern status - Only admins can update concern status
router.patch('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), concernController.updateConcernStatus.bind(concernController));
// Update concern - Only admins can update concerns
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), concernController.updateConcern.bind(concernController));
// Delete concern - Only admins can delete concerns
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), concernController.deleteConcern.bind(concernController));
// Get concerns by user ID - All authenticated users can view concerns by user ID
router.get('/user/:userId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), concernController.getConcernsByUserId.bind(concernController));
exports.default = router;
//# sourceMappingURL=ConcernRoutes.js.map