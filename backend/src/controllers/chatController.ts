import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import User from '../models/User';
import { chatWithAI } from '../config/gemini';

export async function chatRoute(req: AuthRequest, res: Response) {
  try {
    const { messages } = req.body;
    const userId = req.user?.id;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    let userContext = 'Anonymous user. Address them as standard peasant.';
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        userContext = `User: "${user.username}". Level: ${user.level}, XP: ${user.xp}, Achievements: [${user.achievements.join(', ')}]. Keep this in mind to tease or appreciate them accordingly.`;
      }
    }

    // Format the messages for Gemini
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: m.content || ''
    }));

    const aiResponseText = await chatWithAI(formattedMessages, userContext);

    // Minor XP for chatting
    if (userId) {
      await User.findByIdAndUpdate(userId, { $inc: { xp: 2 } });
    }

    return res.json({
      message: {
        role: 'assistant',
        content: aiResponseText
      }
    });
  } catch (error) {
    console.error('Chat controller error:', error);
    return res.status(500).json({ error: 'Chat session crashed.' });
  }
}
