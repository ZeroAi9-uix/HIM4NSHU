"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.googleLogin = googleLogin;
exports.getProfile = getProfile;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const User_1 = __importDefault(require("../models/User"));
const Joke_1 = __importDefault(require("../models/Joke"));
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
async function signup(req, res) {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required.' });
        }
        // Check existing
        const existingEmail = await User_1.default.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }
        const existingUsername = await User_1.default.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username is already taken.' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const newUser = new User_1.default({
            username,
            email,
            passwordHash,
            achievements: ['Noob Comedian']
        });
        await newUser.save();
        const token = jsonwebtoken_1.default.sign({ id: newUser._id, email: newUser.email, username: newUser.username }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
        return res.status(201).json({
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                xp: newUser.xp,
                level: newUser.level,
                achievements: newUser.achievements
            }
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: 'Server error during signup.' });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const user = await User_1.default.findOne({ email });
        if (!user || !user.passwordHash) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, username: user.username }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
        return res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                xp: user.xp,
                level: user.level,
                achievements: user.achievements
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Server error during login.' });
    }
}
async function googleLogin(req, res) {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ error: 'Google credential token is required.' });
        }
        let payload;
        if (process.env.GOOGLE_CLIENT_ID) {
            try {
                const ticket = await client.verifyIdToken({
                    idToken: credential,
                    audience: process.env.GOOGLE_CLIENT_ID
                });
                payload = ticket.getPayload();
            }
            catch (err) {
                console.error('Google token verify failed:', err);
                return res.status(400).json({ error: 'Invalid Google token.' });
            }
        }
        else {
            // Mock Google OAuth login fallback for local dev if client ID isn't configured
            console.log('⚠️ GOOGLE_CLIENT_ID not configured. Mocking Google authentication.');
            const decodedMock = jsonwebtoken_1.default.decode(credential);
            payload = decodedMock || {
                email: 'mockgoogleuser@example.com',
                name: 'MockGoogleUser',
                sub: 'mock-google-id-123456789'
            };
        }
        if (!payload) {
            return res.status(400).json({ error: 'Failed to verify Google token.' });
        }
        const { email, name, sub: googleId } = payload;
        let user = await User_1.default.findOne({ $or: [{ googleId }, { email }] });
        if (!user) {
            // Generate unique username from name
            let baseUsername = (name || email.split('@')[0]).replace(/\s+/g, '_').toLowerCase();
            let uniqueUsername = baseUsername;
            let counter = 1;
            while (await User_1.default.findOne({ username: uniqueUsername })) {
                uniqueUsername = `${baseUsername}_${counter}`;
                counter++;
            }
            user = new User_1.default({
                username: uniqueUsername,
                email,
                googleId,
                achievements: ['Google Laugher']
            });
            await user.save();
        }
        else if (!user.googleId) {
            // Link Google ID to existing email account
            user.googleId = googleId;
            await user.save();
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, username: user.username }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
        return res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                xp: user.xp,
                level: user.level,
                achievements: user.achievements
            }
        });
    }
    catch (error) {
        console.error('Google auth error:', error);
        return res.status(500).json({ error: 'Server error during Google auth.' });
    }
}
async function getProfile(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized.' });
        }
        const user = await User_1.default.findById(userId).populate({
            path: 'favorites',
            model: Joke_1.default
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        // Dynamic achievement recalculation
        const totalFavs = user.favorites.length;
        let achievements = [...user.achievements];
        const addAchievement = (badge) => {
            if (!achievements.includes(badge))
                achievements.push(badge);
        };
        if (totalFavs >= 1)
            addAchievement('Curator of Comedy');
        if (totalFavs >= 5)
            addAchievement('Giggle Collector');
        if (user.xp >= 500)
            addAchievement('Joke Cadet');
        if (user.xp >= 1500)
            addAchievement('Standup Hero');
        if (user.xp >= 3000)
            addAchievement('Meme Monarch');
        if (achievements.length !== user.achievements.length) {
            user.achievements = achievements;
            await user.save();
        }
        return res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                xp: user.xp,
                level: user.level,
                achievements: user.achievements,
                favorites: user.favorites
            }
        });
    }
    catch (error) {
        console.error('Profile fetch error:', error);
        return res.status(500).json({ error: 'Server error during profile retrieval.' });
    }
}
