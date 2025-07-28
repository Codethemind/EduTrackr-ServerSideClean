"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureFullImageUrl = exports.DEFAULT_PROFILE_IMAGE = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../../infrastructure/services/cloudinary"));
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async () => ({
        folder: 'student_profiles',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
    }),
});
exports.upload = (0, multer_1.default)({ storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
exports.DEFAULT_PROFILE_IMAGE = 'https://res.cloudinary.com/djpom2k7h/image/upload/v1/student_profiles/default-profile.png';
const ensureFullImageUrl = (imagePath) => {
    if (!imagePath || imagePath.trim() === '')
        return exports.DEFAULT_PROFILE_IMAGE;
    if (imagePath.startsWith('http'))
        return imagePath;
    return `${'http://localhost:3000'}/${imagePath.replace(/^\//, '')}`;
};
exports.ensureFullImageUrl = ensureFullImageUrl;
//# sourceMappingURL=multer.js.map