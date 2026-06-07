"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const jokeRoutes_1 = __importDefault(require("./routes/jokeRoutes"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable CORS for frontend local developer server
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Register API routing
app.use('/api/auth', authRoutes_1.default);
app.use('/api/jokes', jokeRoutes_1.default);
app.use('/api/quiz', quizRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'active', platform: 'RAJ AI Core', time: new Date() });
});
// Graceful database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rajai';
console.log(`🔌 Attempting connection to MongoDB at: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
mongoose_1.default.connect(mongoUri)
    .then(() => {
    console.log('✅ Connected to MongoDB successfully.');
    app.listen(PORT, () => {
        console.log(`🚀 RAJ AI Core API active on port: ${PORT}`);
    });
})
    .catch((err) => {
    console.error('❌ MongoDB Connection Failure:', err.message);
    console.log('⚠️ Running Express API in DB-less simulated fallback mode.');
    // In local demo mode, start server anyway so UI remains functional
    app.listen(PORT, () => {
        console.log(`🚀 RAJ AI Core API active (Simulated DB) on port: ${PORT}`);
    });
});
// Catch-all error middleware
app.use((err, req, res, next) => {
    console.error('💥 Unhandled Exception Caught:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});
