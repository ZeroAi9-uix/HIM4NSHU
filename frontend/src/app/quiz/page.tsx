'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import ScrambleText from '../../components/ui/ScrambleText';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  HelpCircle, 
  Send, 
  RotateCw, 
  Sparkles, 
  Star, 
  Award,
  Zap,
  TrendingUp,
  User
} from 'lucide-react';

interface LeaderboardUser {
  _id: string;
  username: string;
  xp: number;
  level: number;
  achievements: string[];
}

export default function QuizPage() {
  const { user, token, apiBase, addLocalXp } = useAuth();
  const { playSound, showToast, accentColor } = useUI();

  const [questionId, setQuestionId] = useState<string>('');
  const [setup, setSetup] = useState<string>('');
  const [guess, setGuess] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  // Quiz evaluation result
  const [evaluation, setEvaluation] = useState<{
    correct: boolean;
    actualPunchline: string;
    score: number;
    funnyRating: number;
    explanation: string;
    xpEarned: number;
    leveledUp: boolean;
    unlockedBadges: string[];
  } | null>(null);

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    fetchQuestion(true);
    fetchLeaderboard();
  }, []);

  const fetchQuestion = async (isInitial = false) => {
    if (!isInitial) playSound('laser');
    setLoading(true);
    setEvaluation(null);
    setGuess('');
    try {
      const res = await fetch(`${apiBase}/quiz/question`);
      if (res.ok) {
        const data = await res.json();
        setQuestionId(data.questionId);
        setSetup(data.setup);
      }
    } catch (e) {
      // Offline fallback
      setSetup("Why did the computer go to the doctor?");
      setQuestionId('mock-quiz-1');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch(`${apiBase}/quiz/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (e) {
      setLeaderboard([
        { _id: 'l1', username: 'JokeLord', xp: 5200, level: 8, achievements: ['Punchline Prophet', 'Dark Lord'] },
        { _id: 'l2', username: 'MemeGod', xp: 3400, level: 6, achievements: ['Comedic Genius'] },
        { _id: 'l3', username: 'ChuckleWorthy', xp: 1200, level: 3, achievements: ['Giggle Intern'] }
      ]);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) {
      showToast('Please enter a guess first.', 'error');
      return;
    }

    playSound('click');
    setEvaluating(true);

    try {
      const res = await fetch(`${apiBase}/quiz/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ questionId, userGuess: guess })
      });

      if (res.ok) {
        const data = await res.json();
        setEvaluation(data);

        // UI FX response triggers
        if (data.correct) {
          playSound('success');
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          showToast(`Correct! +${data.xpEarned} XP Earned.`, 'success');
        } else {
          playSound('error');
          showToast(`Incorrect guess. Actual punchline revealed.`, 'info');
        }

        if (data.leveledUp) {
          setTimeout(() => {
            playSound('levelup');
            confetti({
              particleCount: 150,
              spread: 100,
              colors: ['#a824ff', '#00f3ff', '#ff007f']
            });
            showToast(`LEVEL UP! You reached Level ${data.level}!`, 'success');
          }, 1000);
        }

        if (user) {
          addLocalXp(data.xpEarned); // Dynamic update local
        }
        
        // Refresh leaderboard
        fetchLeaderboard();
      }
    } catch (e) {
      // Offline fallback grading
      console.warn('Backend offline, grading locally.');
      const isClose = guess.toLowerCase().includes('virus') || guess.length > 5;
      
      const mockEval = {
        correct: isClose,
        actualPunchline: "Because it had a virus!",
        score: isClose ? 100 : 25,
        funnyRating: isClose ? 8 : 5,
        explanation: isClose 
          ? "Spot on! Programmers and computers both fear viruses. Well played." 
          : "Not quite, though a good attempt. The actual punchline is that it had a virus.",
        xpEarned: isClose ? 100 : 25,
        leveledUp: false,
        unlockedBadges: isClose ? ['Punchline Prophet'] : []
      };

      setEvaluation(mockEval);
      if (isClose) {
        playSound('success');
        confetti({ particleCount: 80, spread: 60 });
      } else {
        playSound('error');
      }

      if (user) {
        addLocalXp(mockEval.xpEarned);
      }
    } finally {
      setEvaluating(false);
    }
  };

  const getAccentText = () => {
    const texts = {
      purple: 'text-neon-purple',
      cyan: 'text-neon-cyan',
      pink: 'text-neon-pink',
      green: 'text-neon-green'
    };
    return texts[accentColor] || texts.purple;
  };

  const getAccentBg = () => {
    const bgs = {
      purple: 'bg-neon-purple hover:bg-neon-purple/85 shadow-[0_0_15px_rgba(168,36,255,0.35)]',
      cyan: 'bg-neon-cyan hover:bg-neon-cyan/85 shadow-[0_0_15px_rgba(0,243,255,0.35)]',
      pink: 'bg-neon-pink hover:bg-neon-pink/85 shadow-[0_0_15px_rgba(255,0,127,0.35)]',
      green: 'bg-neon-green hover:bg-neon-green/85 shadow-[0_0_15px_rgba(57,255,20,0.35)]'
    };
    return bgs[accentColor] || bgs.purple;
  };

  const getAccentBorderClass = () => {
    const borders = {
      purple: 'border-neon-purple/40 hover:border-neon-purple/80 focus-within:border-neon-purple shadow-[0_0_15px_rgba(168,36,255,0.05)]',
      cyan: 'border-neon-cyan/40 hover:border-neon-cyan/80 focus-within:border-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.05)]',
      pink: 'border-neon-pink/40 hover:border-neon-pink/80 focus-within:border-neon-pink shadow-[0_0_15px_rgba(255,0,127,0.05)]',
      green: 'border-neon-green/40 hover:border-neon-green/80 focus-within:border-neon-green shadow-[0_0_15px_rgba(57,255,20,0.05)]'
    };
    return borders[accentColor] || borders.purple;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      {/* LEFT: GAME BOARD */}
      <div className="lg:col-span-8 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="font-syne font-extrabold text-3xl md:text-5xl text-white">Punchline Arena</h1>
          <p className="text-sm text-white/50">Guess setups, evaluate semantics via AI, and harvest comedic XP.</p>
        </div>

        {/* Board Panel */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col gap-6 relative">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-neon-purple" />
            <span className="font-orbitron font-bold text-xs uppercase tracking-wider text-white">Setup Protocol</span>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4 text-white/50">
                <RotateCw className="w-8 h-8 animate-spin text-neon-cyan" />
                <p className="text-xs font-orbitron tracking-widest uppercase">Drafting Riddles...</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-6"
              >
                {/* Joke Setup Text */}
                <h2 className="text-xl md:text-2xl font-outfit text-white font-light text-center leading-relaxed">
                  "{setup}"
                </h2>

                {/* Guess input form */}
                {!evaluation ? (
                  <form onSubmit={handleEvaluate} className="flex flex-col gap-4 mt-4">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-white/5 transition duration-300 ${getAccentBorderClass()}`}>
                      <input
                        type="text"
                        placeholder="Type your punchline guess here..."
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-white/30"
                        disabled={evaluating}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={evaluating || !guess.trim()}
                      className={`w-full py-3 rounded-xl text-black font-orbitron font-bold text-xs uppercase tracking-wider transition duration-300 flex items-center justify-center gap-1.5 ${getAccentBg()} disabled:opacity-40`}
                    >
                      <Send className="w-4 h-4" />
                      {evaluating ? 'Analyzing Semantics...' : 'Evaluate Guess'}
                    </button>
                  </form>
                ) : (
                  /* EVALUATION RESULTS SCREEN */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-2xl border ${
                      evaluation.correct 
                        ? 'border-neon-green/30 bg-neon-green/5' 
                        : 'border-neon-pink/30 bg-neon-pink/5'
                    } flex flex-col gap-4`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-orbitron font-bold text-xs uppercase ${
                        evaluation.correct ? 'text-neon-green' : 'text-neon-pink'
                      }`}>
                        {evaluation.correct ? '🎯 Correct Guess!' : '❌ Incorrect Attempt'}
                      </span>
                      <span className="text-white/50 text-[10px] uppercase font-bold font-orbitron">
                        +{evaluation.xpEarned} XP
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold font-orbitron">Actual Punchline:</span>
                      <p className="text-sm font-semibold text-white">
                        <ScrambleText text={evaluation.actualPunchline} />
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold font-orbitron">Gemini Evaluation:</span>
                      <p className="text-xs text-white/70 leading-relaxed italic font-outfit">
                        "{evaluation.explanation}"
                      </p>
                    </div>

                    {/* Funny Gauge */}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold font-orbitron">Humor Rating:</span>
                      <div className="flex items-center gap-1 text-neon-green">
                        {[...Array(10)].map((_, index) => (
                          <Star 
                            key={index} 
                            className={`w-3.5 h-3.5 ${
                              index < evaluation.funnyRating ? 'fill-current text-neon-green' : 'text-white/10'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-white/80">{evaluation.funnyRating}/10</span>
                    </div>

                    {/* Badges unlocked */}
                    {evaluation.unlockedBadges.length > 0 && (
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <Award className="w-4 h-4 text-neon-purple animate-pulse" />
                        <span className="text-[10px] font-bold text-neon-purple uppercase font-orbitron">Unlocks:</span>
                        {evaluation.unlockedBadges.map((badge, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-neon-purple/15 border border-neon-purple/35 text-[9px] font-bold text-white">
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => fetchQuestion()}
                      className={`w-full py-3 mt-2 rounded-xl text-black font-orbitron font-bold text-xs uppercase tracking-wider transition ${getAccentBg()}`}
                    >
                      Play Again
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* RIGHT: LEADERBOARD LOBBY */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Lobby title */}
        <h3 className="font-orbitron font-bold text-sm tracking-widest text-white uppercase flex items-center gap-2">
          <Trophy className="w-5 h-5 text-neon-cyan animate-pulse" /> Comedy Guild Leaderboard
        </h3>

        {loadingLeaderboard ? (
          <div className="glass-panel p-6 rounded-3xl animate-pulse h-[350px]" />
        ) : (
          <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col gap-4 bg-background/50">
            {leaderboard.map((usr, idx) => {
              const isTop = idx < 3;
              const isCurrentUser = user && usr.username === user.username;
              return (
                <div
                  key={usr._id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition duration-300 ${
                    isCurrentUser 
                      ? 'border-neon-cyan bg-neon-cyan/5 shadow-[0_0_15px_rgba(0,243,255,0.08)]' 
                      : 'border-white/5 bg-white/[0.01]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-orbitron font-extrabold text-xs ${
                      idx === 0 ? 'bg-[#ffd700] text-black shadow-[0_0_10px_rgba(255,215,0,0.4)]' :
                      idx === 1 ? 'bg-[#c0c0c0] text-black' :
                      idx === 2 ? 'bg-[#cd7f32] text-black' : 'bg-white/5 text-white/50'
                    }`}>
                      {idx + 1}
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="font-orbitron font-bold text-xs text-white truncate max-w-[110px]">{usr.username}</span>
                      <span className="text-[9px] text-white/40">Lvl {usr.level}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-white/80 font-orbitron">
                    <Zap className="w-3.5 h-3.5 text-neon-purple fill-current" />
                    <span>{usr.xp} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Local Gamification info card */}
        {user && (
          <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 font-orbitron">Your status</span>
            <div className="flex justify-between items-center">
              <span className="font-orbitron font-bold text-xs text-white">Level {user.level}</span>
              <span className="text-[10px] text-white/50">{user.xp} XP</span>
            </div>
            {/* Custom progress bar */}
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan" 
                style={{ 
                  width: `${Math.min(100, (user.xp % 100))}%` 
                }} 
              />
            </div>
            <p className="text-[10px] text-white/30 leading-normal font-outfit">
              Earn {100 - (user.xp % 100)} XP to reach Level {user.level + 1}. Upvotes and comments reward XP.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
