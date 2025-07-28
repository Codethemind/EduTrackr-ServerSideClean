"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const AuthController_1 = require("../controllers/AuthController");
const AuthUseCase_1 = require("../../application/useCases/AuthUseCase");
const AuthRespository_1 = require("../../infrastructure/repositories/AuthRespository");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const authRepository = new AuthRespository_1.AuthRepository();
const authUseCase = new AuthUseCase_1.AuthUseCase(authRepository);
const authController = new AuthController_1.AuthController(authUseCase);
// Rate limiting middleware for auth routes
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many login attempts, please try again later',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Optional: Skip successful requests
    skipSuccessfulRequests: true
});
// Stricter rate limiting for password reset routes
const passwordResetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset requests per hour
    message: {
        error: 'Too many password reset attempts, please try again later',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});
// Public routes - No authentication required
router.post('/loginStudent', authLimiter, authController.loginStudent.bind(authController));
router.post('/loginAdmin', authLimiter, authController.loginAdmin.bind(authController));
router.post('/loginTeacher', authLimiter, authController.loginTeacher.bind(authController));
router.post('/forgotPassword', passwordResetLimiter, authController.forgotPassword.bind(authController));
router.post('/resetPassword/:token', passwordResetLimiter, authController.resetPassword.bind(authController));
router.post('/refresh-token', auth_1.authenticateToken, authController.refreshToken.bind(authController));
exports.default = router;
//# sourceMappingURL=AuthRoute.js.map