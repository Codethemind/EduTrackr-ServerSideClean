"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiUseCase = void 0;
class AiUseCase {
    constructor(aiRepository) {
        this.aiRepository = aiRepository;
    }
    async generateStudentResponse(message, context) {
        const prompt = this.createStudentPrompt(message, context);
        return await this.aiRepository.generateResponse(prompt);
    }
    async generateTeacherResponse(message, context) {
        const prompt = this.createTeacherPrompt(message, context);
        return await this.aiRepository.generateResponse(prompt);
    }
    createStudentPrompt(message, context) {
        return `You are an AI study assistant helping a student. 
        Your role is to provide clear, educational, and supportive responses.
        Previous context: ${context || 'No previous context'}
        Student's message: ${message}
        Please provide a helpful response that:
        1. Addresses the student's question or concern
        2. Provides clear explanations
        3. Encourages learning and understanding
        4. Maintains a supportive and friendly tone`;
    }
    createTeacherPrompt(message, context) {
        return `You are an AI teaching assistant helping an educator. 
        Your role is to provide professional, pedagogical, and practical teaching advice.
        Previous context: ${context || 'No previous context'}
        Teacher's message: ${message}
        Please provide a response that:
        1. Addresses the teaching-related question or concern
        2. Offers practical teaching strategies
        3. Includes educational best practices
        4. Maintains a professional and supportive tone`;
    }
}
exports.AiUseCase = AiUseCase;
//# sourceMappingURL=AiUseCase.js.map