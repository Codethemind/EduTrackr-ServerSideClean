"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcernUseCase = void 0;
class ConcernUseCase {
    constructor(concernRepository) {
        this.concernRepository = concernRepository;
    }
    async raiseConcern(data) {
        return this.concernRepository.createConcern(data);
    }
    async getConcernById(id) {
        return this.concernRepository.getConcernById(id);
    }
    async getConcernsByUser(userId) {
        return this.concernRepository.getConcernsByUser(userId);
    }
    async getAllConcerns() {
        return this.concernRepository.getAllConcerns();
    }
    async updateConcernStatus(id, status, feedback) {
        return this.concernRepository.updateConcernStatus(id, status, feedback);
    }
    async deleteConcern(id) {
        // This can be implemented in the repository for full clean architecture
        // For now, deletion is handled in the controller for simplicity
        return;
    }
}
exports.ConcernUseCase = ConcernUseCase;
//# sourceMappingURL=ConcernUseCase.js.map