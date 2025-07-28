"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHttpError = createHttpError;
// src/utils/createHttpError.ts
function createHttpError(message, status = 400) {
    const error = new Error(message);
    error.status = status;
    throw error;
}
//# sourceMappingURL=createHttpError.js.map