"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeOwnerOrRoles = exports.authorizeRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Authenticating token:', token ? 'Token present' : 'No token');
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined');
        return res.status(500).json({
            success: false,
            message: 'Server configuration error'
        });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('JWT verification error:', err.message);
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired'
                });
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid token'
                });
            }
            return res.status(403).json({
                success: false,
                message: 'Token verification failed'
            });
        }
        req.user = decoded;
        console.log('User authenticated:', req.user.email, 'Role:', req.user.role);
        next();
    });
};
exports.authenticateToken = authenticateToken;
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const userRole = req.user.role;
        if (!userRole) {
            return res.status(403).json({
                success: false,
                message: 'No role found for user'
            });
        }
        // Case-insensitive comparison
        const hasRole = roles.some(role => role.toLowerCase() === userRole.toLowerCase());
        if (!hasRole) {
            console.log(`Access denied for user ${req.user.email} with role ${userRole}. Required roles: ${roles.join(', ')}`);
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(', ')}. Your role: ${userRole}`
            });
        }
        console.log(`Access granted for user ${req.user.email} with role ${userRole}`);
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
// Optional: Middleware to check if user can access their own resources
const authorizeOwnerOrRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const userRole = req.user.role;
        const userId = req.user.id;
        const targetUserId = req.params.id;
        // Check if user is trying to access their own resource
        if (userId === targetUserId) {
            return next();
        }
        // Check if user has required role
        const hasRole = roles.some(role => role.toLowerCase() === userRole.toLowerCase());
        if (!hasRole) {
            return res.status(403).json({
                success: false,
                message: `Access denied. You can only access your own resources or need role: ${roles.join(', ')}`
            });
        }
        next();
    };
};
exports.authorizeOwnerOrRoles = authorizeOwnerOrRoles;
//# sourceMappingURL=auth.js.map