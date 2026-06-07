"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoute = chatRoute;
const User_1 = __importDefault(require("../models/User"));
const gemini_1 = require("../config/gemini");
async function chatRoute(req, res) {
    try {
        const { messages } = req.body;
        const userId = req.user?.id;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required.' });
        }
        let userContext = 'Anonymous user. Address them as standard peasant.';
        if (userId) {
            const user = await User_1.default.findById(userId);
            if (user) {
                userContext = `User: "${user.username}". Level: ${user.level}, XP: ${user.xp}, Achievements: [${user.achievements.join(', ')}]. Keep this in mind to tease or appreciate them accordingly.`;
            }
        }
        // Format the messages for Gemini
        const formattedMessages = messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: m.content || ''
        }));
        const aiResponseText = await (0, gemini_1.chatWithAI)(formattedMessages, userContext);
        // Minor XP for chatting
        if (userId) {
            await User_1.default.findByIdAndUpdate(userId, { $inc: { xp: 2 } });
        }
        return res.json({
            message: {
                role: 'assistant',
                content: aiResponseText
            }
        });
    }
    catch (error) {
        console.error('Chat controller error:', error);
        return res.status(500).json({ error: 'Chat session crashed.' });
    }
}
