import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Joke from '../models/Joke';
import User from '../models/User';
import { generateQuizQuestion, evaluateQuizAnswer } from '../config/gemini';

export async function getQuizQuestion(req: AuthRequest, res: Response) {
  try {
    const { setup, punchline } = await generateQuizQuestion();

    // Store the joke setup/punchline in the DB so we can evaluate it securely in another call
    // This keeps the punchline secret from client-side inspect tools!
    const quizJoke = new Joke({
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
  } catch (error) {
    console.error('Quiz question generation error:', error);
    return res.status(500).json({ error: 'Failed to generate quiz question.' });
  }
}

export async function verifyQuizAnswer(req: AuthRequest, res: Response) {
  try {
    const { questionId, userGuess } = req.body;
    const userId = req.user?.id;

    if (!questionId || userGuess === undefined) {
      return res.status(400).json({ error: 'questionId and userGuess are required.' });
    }

    const quizJoke = await Joke.findById(questionId);
    if (!quizJoke || !quizJoke.setup || !quizJoke.punchline) {
      return res.status(404).json({ error: 'Quiz question not found.' });
    }

    // Call Gemini to semantically check user guess against the actual punchline
    const evaluation = await evaluateQuizAnswer(quizJoke.setup, quizJoke.punchline, userGuess);

    let xpEarned = evaluation.score; // XP earned matches score (0-100)
    let newLevel = 1;
    let oldLevel = 1;
    let newXp = 0;
    let leveledUp = false;
    let unlockedBadges: string[] = [];

    if (userId) {
      const user = await User.findById(userId);
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
        const hasBadge = (b: string) => user.achievements.includes(b);
        const addBadge = (b: string) => {
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
  } catch (error) {
    console.error('Quiz answer verification error:', error);
    return res.status(500).json({ error: 'Failed to verify quiz answer.' });
  }
}

export async function getLeaderboard(req: AuthRequest, res: Response) {
  try {
    const leaderboard = await User.find({})
      .select('username xp level achievements')
      .sort({ xp: -1 })
      .limit(10);
    return res.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
}
