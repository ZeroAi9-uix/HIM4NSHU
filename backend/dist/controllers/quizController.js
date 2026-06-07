"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizQuestion = getQuizQuestion;
exports.verifyQuizAnswer = verifyQuizAnswer;
exports.getLeaderboard = getLeaderboard;
const Joke_1 = __importDefault(require("../models/Joke"));
const User_1 = __importDefault(require("../models/User"));
const gemini_1 = require("../config/gemini");
async function getQuizQuestion(req, res) {
    try {
        const { setup, punchline } = await (0, gemini_1.generateQuizQuestion)();
        // Store the joke setup/punchline in the DB so we can evaluate it securely in another call
        // This keeps the punchline secret from client-side inspect tools!
        const quizJoke = new Joke_1.default({
            setup,
            punchline,
            category: 'general',
            isQuiz: true,
            creator: 'AI'
        });
        await quizJoke.save();
        return res.json({
            questionId: quizJoke._id,
            setup: quizJoke.setup
        });
    }
    catch (error) {
        console.error('Quiz question generation error:', error);
        return res.status(500).json({ error: 'Failed to generate quiz question.' });
    }
}
async function verifyQuizAnswer(req, res) {
    try {
        const { questionId, userGuess } = req.body;
        const userId = req.user?.id;
        if (!questionId || userGuess === undefined) {
            return res.status(400).json({ error: 'questionId and userGuess are required.' });
        }
        const quizJoke = await Joke_1.default.findById(questionId);
        if (!quizJoke || !quizJoke.setup || !quizJoke.punchline) {
            return res.status(404).json({ error: 'Quiz question not found.' });
        }
        // Call Gemini to semantically check user guess against the actual punchline
        const evaluation = await (0, gemini_1.evaluateQuizAnswer)(quizJoke.setup, quizJoke.punchline, userGuess);
        let xpEarned = evaluation.score; // XP earned matches score (0-100)
        let newLevel = 1;
        let oldLevel = 1;
        let newXp = 0;
        let leveledUp = false;
        let unlockedBadges = [];
        if (userId) {
            const user = await User_1.default.findById(userId);
            if (user) {
                oldLevel = user.level;
                user.xp += xpEarned;
                // Level up algorithm: level = floor(sqrt(xp / 100)) + 1
                newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
                if (newLevel > oldLevel) {
                    user.level = newLevel;
                    leveledUp = true;
                }
                // Check achievements
                const hasBadge = (b) => user.achievements.includes(b);
                const addBadge = (b) => {
                    if (!hasBadge(b)) {
                        user.achievements.push(b);
                        unlockedBadges.push(b);
                    }
                };
                if (evaluation.correct) {
                    addBadge('Punchline Prophet');
                }
                if (evaluation.funnyRating >= 9) {
                    addBadge('Comedic Genius');
                }
                if (user.xp >= 100) {
                    addBadge('Giggle Intern');
                }
                await user.save();
                newXp = user.xp;
                newLevel = user.level;
            }
        }
        return res.json({
            correct: evaluation.correct,
            actualPunchline: quizJoke.punchline,
            score: evaluation.score,
            funnyRating: evaluation.funnyRating,
            explanation: evaluation.explanation,
            xpEarned,
            xp: newXp,
            level: newLevel,
            leveledUp,
            unlockedBadges
        });
    }
    catch (error) {
        console.error('Quiz answer verification error:', error);
        return res.status(500).json({ error: 'Failed to verify quiz answer.' });
    }
}
async function getLeaderboard(req, res) {
    try {
        const leaderboard = await User_1.default.find({})
            .select('username xp level achievements')
            .sort({ xp: -1 })
            .limit(10);
        return res.json({ leaderboard });
    }
    catch (error) {
        console.error('Leaderboard fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch leaderboard.' });
    }
}
