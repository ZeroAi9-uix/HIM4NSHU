'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import HeroOrb from '../components/canvas/HeroOrb';
import ScrambleText from '../components/ui/ScrambleText';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { motion } from 'framer-motion';
import { 
  Smile, 
  Flame, 
  MessageSquare, 
  TrendingUp, 
  UserCheck, 
  Sparkles, 
  ChevronRight, 
  ThumbsUp, 
  ThumbsDown,
  BrainCircuit,
  MessageCircle,
  Star
} from 'lucide-react';

interface Joke {
  _id: string;
  text?: string;
  setup?: string;
  punchline?: string;
  category: 'dark' | 'funny' | 'lame' | 'romance' | 'general' | 'roast';
  likes: string[];
  dislikes: string[];
  commentsCount: number;
}

export default function Home() {
  const { user, apiBase, token } = useAuth();
  const { playSound, showToast, accentColor, setAccentColor } = useUI();
  const [trending, setTrending] = useState<Joke[]>([]);
  const [loadingJokes, setLoadingJokes] = useState(true);

  // Stats values
  const [stats, setStats] = useState({ jokes: 0, users: 0, xp: 0 });

  useEffect(() => {
    fetchTrending();
    animateStats();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await fetch(`${apiBase}/jokes/trending`);
      if (res.ok) {
        const data = await res.json();
        setTrending(data.jokes || []);
      }
    } catch (e) {
      console.warn('Could not fetch trending jokes, using mock.');
      setTrending([
        {
          _id: 'mock-1',
          text: 'Why do programmers wear glasses? Because they can\'t C#.',
          category: 'funny',
          likes: ['1'],
          dislikes: [],
          commentsCount: 3
        },
        {
          _id: 'mock-2',
          text: 'There are 10 types of people in the world: those who understand binary, and those who don\'t.',
          category: 'funny',
          likes: ['1', '2'],
          dislikes: [],
          commentsCount: 5
        }
      ]);
    } finally {
      setLoadingJokes(false);
    }
  };

  const animateStats = () => {
    // Simple dynamic statistics incrementation on load
    const target = { jokes: 15420, users: 8904, xp: 320900 };
    let current = { jokes: 0, users: 0, xp: 0 };
    const duration = 1200; // ms
    const stepTime = 30;
    const steps = duration / stepTime;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current.jokes = Math.floor((target.jokes / steps) * step);
      current.users = Math.floor((target.users / steps) * step);
      current.xp = Math.floor((target.xp / steps) * step);
      
      setStats({ ...current });
      
      if (step >= steps) {
        setStats(target);
        clearInterval(timer);
      }
    }, stepTime);
  };

  const handleVote = async (jokeId: string, type: 'like' | 'dislike') => {
    if (!user) {
      showToast('You must be signed in to upvote jokes.', 'error');
      return;
    }

    playSound('click');
    try {
      const res = await fetch(`${apiBase}/jokes/${type}/${jokeId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTrending(prev => prev.map(j => j._id === jokeId ? data.joke : j));
        showToast(type === 'like' ? 'Voted Up!' : 'Voted Down', 'success');
      }
    } catch (e) {
      // Offline fallback toggle simulation
      setTrending(prev => prev.map(j => {
        if (j._id === jokeId) {
          const likes = [...j.likes];
          const idx = likes.indexOf(user.id);
          if (idx > -1) {
            likes.splice(idx, 1);
          } else {
            likes.push(user.id);
          }
          return { ...j, likes };
        }
        return j;
      }));
      showToast('Simulated Offline Vote!', 'success');
    }
  };

  const getAccentTextClass = () => {
    const texts = {
      purple: 'text-neon-purple',
      cyan: 'text-neon-cyan',
      pink: 'text-neon-pink',
      green: 'text-neon-green'
    };
    return texts[accentColor] || texts.purple;
  };

  const getAccentBgClass = () => {
    const bgs = {
      purple: 'bg-neon-purple hover:bg-neon-purple/80 shadow-[0_0_20px_rgba(168,36,255,0.4)]',
      cyan: 'bg-neon-cyan hover:bg-neon-cyan/80 shadow-[0_0_20px_rgba(0,243,255,0.4)]',
      pink: 'bg-neon-pink hover:bg-neon-pink/80 shadow-[0_0_20px_rgba(255,0,127,0.4)]',
      green: 'bg-neon-green hover:bg-neon-green/80 shadow-[0_0_20px_rgba(57,255,20,0.4)]'
    };
    return bgs[accentColor] || bgs.purple;
  };

  const getAccentBorderClass = () => {
    const borders = {
      purple: 'border-neon-purple/40 hover:border-neon-purple/80',
      cyan: 'border-neon-cyan/40 hover:border-neon-cyan/80',
      pink: 'border-neon-pink/40 hover:border-neon-pink/80',
      green: 'border-neon-green/40 hover:border-neon-green/80'
    };
    return borders[accentColor] || borders.purple;
  };

  const categories = [
    { name: 'Dark Humor', slug: 'dark', emoji: '🖤', desc: 'Edgy comedy and pitch black sarcasm.' },
    { name: 'Pure Funny', slug: 'funny', emoji: '😂', desc: 'High-IQ observational and situational humor.' },
    { name: 'Cheesy Puns', slug: 'lame', emoji: '🤦', desc: 'Dad jokes that make the entire room groan.' },
    { name: 'Pick-Up Lines', slug: 'romance', emoji: '❤️', desc: 'Cheesy romance lines to crack the ice.' }
  ];

  return (
    <div className="flex flex-col gap-24 relative">
      
      {/* Accent Theme Picker - Top Right Corner */}
      <div className="absolute top-[-40px] right-0 flex items-center gap-2 p-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md z-30">
        <span className="text-[10px] uppercase tracking-widest text-white/50 px-2 font-orbitron font-semibold">Glow Accent:</span>
        {(['purple', 'cyan', 'pink', 'green'] as const).map((color) => (
          <button
            key={color}
            onClick={() => {
              setAccentColor(color);
              playSound('click');
            }}
            className={`w-3.5 h-3.5 rounded-full border transition-all ${
              color === 'purple' ? 'bg-[#a824ff]' : 
              color === 'cyan' ? 'bg-[#00f3ff]' : 
              color === 'pink' ? 'bg-[#ff007f]' : 'bg-[#39ff14]'
            } ${accentColor === color ? 'border-white scale-125' : 'border-transparent hover:scale-110'}`}
          />
        ))}
      </div>

      {/* 🚀 HERO SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[70vh]">
        <div className="lg:col-span-7 flex flex-col items-start gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
          >
            <Sparkles className={`w-3.5 h-3.5 ${getAccentTextClass()} animate-pulse`} />
            <span className="text-xs font-semibold tracking-wider uppercase font-orbitron text-white/80">AI Stand-Up Engine v3.5</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-syne font-extrabold text-4xl sm:text-6xl text-white leading-tight"
          >
            Laugh Smarter<br />
            with <span className={`gradient-text ${getAccentTextClass()}`}>AI.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-white/60 font-outfit text-base md:text-lg max-w-lg leading-relaxed"
          >
            Elevate your serotonin levels with RAJ AI. Generate dark jokes, play our semantic punchline quiz, chat with our witty stand-up bot, and earn XP rewards.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-wrap items-center gap-4 mt-2"
          >
            <Link 
              href="/jokes"
              onClick={() => playSound('click')}
              className={`px-6 py-3 text-sm font-bold rounded-xl text-black transition-all flex items-center gap-2 font-orbitron uppercase ${getAccentBgClass()}`}
            >
              Start Generating <ChevronRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/quiz"
              onClick={() => playSound('click')}
              className={`px-6 py-3 text-sm font-semibold rounded-xl border text-white backdrop-blur-sm transition-all hover:bg-white/5 font-orbitron uppercase ${getAccentBorderClass()}`}
            >
              Play Punchline Quiz
            </Link>
          </motion.div>
        </div>

        {/* WebGL Canvas Sphere Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="lg:col-span-5 flex justify-center items-center"
        >
          <HeroOrb />
        </motion.div>
      </section>

      {/* 📊 LIVE STATISTICS COUNTER */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'AI Jokes Crafted', val: stats.jokes.toLocaleString(), desc: 'Fresh jokes generated live' },
          { label: 'Humor Cadets Registered', val: stats.users.toLocaleString(), desc: 'Climbing the leaderboard' },
          { label: 'Comedic XP Earned', val: stats.xp.toLocaleString(), desc: 'Gamified stand-up achievements' }
        ].map((item, index) => (
          <div key={index} className="glass-panel p-6 rounded-2xl flex flex-col gap-2 relative overflow-hidden border-t-2 border-t-white/10 hover:border-t-neon-purple/50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 font-orbitron">{item.label}</span>
            <span className="text-3xl font-black font-orbitron text-white glow-text-purple tracking-tight">
              {item.val}
            </span>
            <span className="text-xs text-white/50">{item.desc}</span>
          </div>
        ))}
      </section>

      {/* 🔮 CORE AI FEATURES SECTION */}
      <section className="flex flex-col gap-12">
        <div className="flex flex-col gap-3 text-center items-center">
          <h2 className="font-syne font-bold text-3xl md:text-4xl text-white">Quantum Comedics</h2>
          <p className="text-white/50 text-sm max-w-md">Our neural nets are trained on thousands of comedic setups to deliver optimal laughter ratios.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Smile className="w-8 h-8 text-neon-cyan" />,
              title: 'AI Humor Generator',
              desc: 'Select your preferred humor palette: Dark, Funny, Lame, or Romance. Toggle Roast Mode for target-specific burns.'
            },
            {
              icon: <BrainCircuit className="w-8 h-8 text-neon-purple" />,
              title: 'Punchline Quiz Mode',
              desc: 'Test your comedic timing. Read setups, guess the punchlines, and let Gemini check your semantic accuracy. Earn XP and ranks.'
            },
            {
              icon: <MessageCircle className="w-8 h-8 text-neon-pink" />,
              title: 'Interactive Comedian Chat',
              desc: 'Have a conversation with our custom witty AI standup persona. Features text-to-speech voicing and instant joke recommendations.'
            }
          ].map((feat, i) => (
            <div key={i} className="glass-panel p-8 rounded-2xl flex flex-col gap-4 border border-white/5 hover:-translate-y-1 transition duration-300">
              <div className="p-3 w-max rounded-xl bg-white/5 border border-white/10">
                {feat.icon}
              </div>
              <h3 className="font-orbitron font-bold text-lg text-white">{feat.title}</h3>
              <p className="text-xs text-white/60 leading-relaxed font-outfit">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🖤 POPULAR CATEGORIES */}
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <h2 className="font-syne font-bold text-3xl text-white">Popular Genres</h2>
          <p className="text-white/50 text-sm">Pick your poison. Hand-crafted prompt templates ensure authentic comedic deliveries.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/jokes?category=${cat.slug}`}
              onClick={() => playSound('click')}
              className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border border-white/5 hover:border-white/10 group relative overflow-hidden text-left"
            >
              {/* Background gradient float hover effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition duration-500" />
              
              <div className="text-3xl">{cat.emoji}</div>
              <div className="flex flex-col gap-1">
                <h3 className="font-orbitron font-bold text-sm text-white group-hover:text-neon-cyan transition">{cat.name}</h3>
                <p className="text-[11px] text-white/55 leading-relaxed font-outfit">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 🔥 TRENDING JOKES */}
      <section className="flex flex-col gap-10">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="font-syne font-bold text-3xl text-white flex items-center gap-2">
              <Flame className="w-7 h-7 text-neon-pink animate-pulse" /> Trending Laughs
            </h2>
            <p className="text-white/50 text-sm">Upvoted by the cyber comedy guild.</p>
          </div>
          <Link 
            href="/jokes" 
            onClick={() => playSound('click')}
            className={`text-xs font-semibold ${getAccentTextClass()} hover:underline font-orbitron tracking-wider uppercase flex items-center gap-1`}
          >
            Browse All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingJokes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="glass-panel p-6 rounded-2xl h-36 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trending.map((joke) => (
              <div key={joke._id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between gap-6 relative border border-white/5">
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold font-orbitron uppercase text-white/40">
                  {joke.category}
                </div>
                
                <p className="text-sm font-outfit text-white/80 leading-relaxed font-light mt-3">
                  {joke.text || `${joke.setup} ... ${joke.punchline}`}
                </p>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  {/* Likes/Dislikes */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleVote(joke._id, 'like')}
                      className={`flex items-center gap-1.5 text-xs text-white/50 hover:text-neon-cyan transition`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{joke.likes.length}</span>
                    </button>
                    <button
                      onClick={() => handleVote(joke._id, 'dislike')}
                      className="flex items-center gap-1.5 text-xs text-white/50 hover:text-neon-pink transition"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>{joke.dislikes.length}</span>
                    </button>
                  </div>

                  {/* Comments count */}
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{joke.commentsCount} Comments</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* ⭐ TESTIMONIALS / USER REVIEWS */}
      <section className="flex flex-col gap-12">
        <div className="text-center flex flex-col gap-3">
          <h2 className="font-syne font-bold text-3xl text-white">Comedian Reviews</h2>
          <p className="text-white/50 text-sm">See what prominent biological entities are saying about RAJ AI.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: '@dev_giggle', role: 'Full Stack Dev', comment: 'I asked RAJ AI to roast my code and it roasted my entire career. 10/10, would get emotionally damaged again.', stars: 5 },
            { name: '@punchline_queen', role: 'Stand-Up Creator', comment: 'The AI Quiz Mode is highly addictive. The semantic evaluation is extremely clever; it understands puns perfectly.', stars: 5 },
            { name: '@peasant_laugher', role: 'Memer', comment: 'The glassmorphic design and WebGL sphere look amazing. This feels like a million-dollar startup website.', stars: 5 }
          ].map((rev, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative border border-white/5">
              <div className="flex items-center gap-1 text-neon-green">
                {[...Array(rev.stars)].map((_, idx) => (
                  <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-white/70 italic leading-relaxed">"{rev.comment}"</p>
              <div className="flex flex-col pt-2 border-t border-white/5">
                <span className="font-orbitron font-bold text-xs text-white">{rev.name}</span>
                <span className="text-[10px] text-white/40">{rev.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
