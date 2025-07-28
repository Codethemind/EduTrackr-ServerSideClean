"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureFullImageUrl = ensureFullImageUrl;
function ensureFullImageUrl(path) {
    // Assuming paths are relative and need to be prefixed with a base URL
    const baseUrl = process.env.CLOUDINARY_BASE_URL || 'https://res.cloudinary.com/djpom2k7h/image/upload/v1/';
    return path.startsWith('http') ? path : `${baseUrl}${path}`;
}
//# sourceMappingURL=imageUtils.js.map