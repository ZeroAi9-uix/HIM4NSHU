import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import Joke from '../models/Joke';
import { AuthRequest } from '../middlewares/auth';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function signup(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    // Check existing
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      passwordHash,
      achievements: ['Noob Comedian']
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, username: newUser.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

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
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Server error during signup.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

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
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login.' });
  }
}

export async function googleLogin(req: Request, res: Response) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required.' });
    }

    let payload: any;

    if (process.env.GOOGLE_CLIENT_ID) {
      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
      } catch (err) {
        console.error('Google token verify failed:', err);
        return res.status(400).json({ error: 'Invalid Google token.' });
      }
    } else {
      // Mock Google OAuth login fallback for local dev if client ID isn't configured
      console.log('⚠️ GOOGLE_CLIENT_ID not configured. Mocking Google authentication.');
      const decodedMock = jwt.decode(credential) as any;
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

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // Generate unique username from name
      let baseUsername = (name || email.split('@')[0]).replace(/\s+/g, '_').toLowerCase();
      let uniqueUsername = baseUsername;
      let counter = 1;
      while (await User.findOne({ username: uniqueUsername })) {
        uniqueUsername = `${baseUsername}_${counter}`;
        counter++;
      }

      user = new User({
        username: uniqueUsername,
        email,
        googleId,
        achievements: ['Google Laugher']
      });
      await user.save();
    } else if (!user.googleId) {
      // Link Google ID to existing email account
      user.googleId = googleId;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

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
  } catch (error: any) {
    console.error('Google auth error:', error);
    return res.status(500).json({ error: 'Server error during Google auth.' });
  }
}

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const user = await User.findById(userId).populate({
      path: 'favorites',
      model: Joke
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Dynamic achievement recalculation
    const totalFavs = user.favorites.length;
    let achievements = [...user.achievements];
    const addAchievement = (badge: string) => {
      if (!achievements.includes(badge)) achievements.push(badge);
    };

    if (totalFavs >= 1) addAchievement('Curator of Comedy');
    if (totalFavs >= 5) addAchievement('Giggle Collector');
    if (user.xp >= 500) addAchievement('Joke Cadet');
    if (user.xp >= 1500) addAchievement('Standup Hero');
    if (user.xp >= 3000) addAchievement('Meme Monarch');

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
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ error: 'Server error during profile retrieval.' });
  }
}
