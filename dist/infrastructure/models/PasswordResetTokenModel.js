"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const passwordResetSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
});
exports.default = mongoose_1.default.model('PasswordResetToken', passwordResetSchema);
//# sourceMappingURL=PasswordResetTokenModel.js.map