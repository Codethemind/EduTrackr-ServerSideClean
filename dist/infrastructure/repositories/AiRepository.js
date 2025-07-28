"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiRepository = void 0;
const genai_1 = require("@google/genai");
class AiRepository {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('api key ', apiKey);
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured in environment variables');
        }
        // Initialize the Gemini API with your API key
        this.genAI = new genai_1.GoogleGenAI({ apiKey });
    }
    async generateResponse(prompt) {
        try {
            const response = await this.genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
            });
            if (!response.text) {
                throw new Error('No response text received from Gemini API');
            }
            return response.text;
        }
        catch (error) {
            console.error('Error generating AI response:', error);
            // Handle specific error cases
            if (error.status === 403) {
                throw new Error('Invalid or missing Gemini API key. Please check your .env configuration.');
            }
            if (error.status === 404) {
                throw new Error('Gemini model not found. Please check the model name and API version.');
            }
            if (error.status === 429) {
                throw new Error('Rate limit exceeded for Gemini API. Please try again later.');
            }
            throw new Error(`Failed to generate AI response: ${error.message || 'Unknown error'}`);
        }
    }
}
exports.AiRepository = AiRepository;
//# sourceMappingURL=AiRepository.js.map