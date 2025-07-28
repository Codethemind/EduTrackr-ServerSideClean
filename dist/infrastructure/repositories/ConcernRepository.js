"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcernRepository = void 0;
const Concern_1 = require("../../domain/entities/Concern");
const ConcernModel_1 = __importDefault(require("../models/ConcernModel"));
class ConcernRepository {
    async createConcern(concern) {
        const created = await ConcernModel_1.default.create(concern);
        return new Concern_1.Concern({
            id: created._id.toString(),
            ...created.toObject(),
        });
    }
    async getConcernById(id) {
        const found = await ConcernModel_1.default.findById(id);
        return found ? new Concern_1.Concern({ id: found._id.toString(), ...found.toObject() }) : null;
    }
    async getConcernsByUser(userId) {
        const concerns = await ConcernModel_1.default.find({ createdBy: userId });
        return concerns.map(c => new Concern_1.Concern({ id: c._id.toString(), ...c.toObject() }));
    }
    async getAllConcerns() {
        const concerns = await ConcernModel_1.default.find();
        return concerns.map(c => new Concern_1.Concern({ id: c._id.toString(), ...c.toObject() }));
    }
    async updateConcernStatus(id, status, feedback) {
        const updated = await ConcernModel_1.default.findByIdAndUpdate(id, { status, feedback, updatedAt: new Date() }, { new: true });
        return updated ? new Concern_1.Concern({ id: updated._id.toString(), ...updated.toObject() }) : null;
    }
}
exports.ConcernRepository = ConcernRepository;
//# sourceMappingURL=ConcernRepository.js.map