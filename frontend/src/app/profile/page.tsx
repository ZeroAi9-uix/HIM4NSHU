'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { motion } from 'framer-motion';
import { 
  Award, 
  Trash2, 
  Copy, 
  Share2, 
  Zap, 
  Smile, 
  User as UserIcon, 
  ShieldAlert,
  Star,
  Activity
} from 'lucide-react';

interface Joke {
  _id: string;
  text?: string;
  setup?: string;
  punchline?: string;
  category: string;
  likes: string[];
  dislikes: string[];
  commentsCount: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, apiBase, refreshProfile, logout, toggleFavoriteLocal } = useAuth();
  const { playSound, showToast, accentColor } = useUI();

  useEffect(() => {
    if (token) {
      refreshProfile();
    }
  }, [token]);

  const handleUnfavorite = async (jokeId: string) => {
    playSound('click');
    try {
      const res = await fetch(`${apiBase}/jokes/favorite/${jokeId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        // Find the joke to pass to context remover
        const jokeToRemove = user?.favorites.find(f => f._id === jokeId);
        if (jokeToRemove) {
          toggleFavoriteLocal(jokeToRemove);
          showToast('Joke removed from favorites.', 'info');
        }
      }
    } catch (e) {
      const jokeToRemove = user?.favorites.find(f => f._id === jokeId);
      if (jokeToRemove) {
        toggleFavoriteLocal(jokeToRemove);
        showToast('Simulated Offline Unfavorite!', 'info');
      }
    }
  };

  const handleCopy = (text: string) => {
    playSound('click');
    navigator.clipboard.writeText(text);
    showToast('Joke copied to clipboard!', 'success');
  };

  const handleShare = (text: string) => {
    playSound('click');
    if (navigator.share) {
      navigator.share({ title: 'RAJ AI Joke', text, url: window.location.origin });
    } else {
      navigator.clipboard.writeText(text);
      showToast('Copied share content!', 'success');
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
      purple: 'bg-neon-purple text-black hover:bg-neon-purple/90 shadow-[0_0_15px_rgba(168,36,255,0.25)]',
      cyan: 'bg-neon-cyan text-black hover:bg-neon-cyan/90 shadow-[0_0_15px_rgba(0,243,255,0.25)]',
      pink: 'bg-neon-pink text-black hover:bg-neon-pink/90 shadow-[0_0_15px_rgba(255,0,127,0.25)]',
      green: 'bg-neon-green text-black hover:bg-neon-green/90 shadow-[0_0_15px_rgba(57,255,20,0.25)]'
    };
    return bgs[accentColor] || bgs.purple;
  };

  // Badge list data mapping
  const badgeDetails: Record<string, { icon: string; name: string; desc: string; glow: string }> = {
    'Noob Comedian': { icon: '🌱', name: 'Noob Comedian', desc: 'Registered your biological entity profile.', glow: 'border-white/20' },
    'Google Laugher': { icon: '🌐', name: 'Google Laugher', desc: 'Linked standard Google OAuth credentials.', glow: 'border-blue-500/30' },
    'Punchline Prophet': { icon: '🔮', name: 'Punchline Prophet', desc: 'Guessed a joke punchline correctly in quiz mode.', glow: 'border-purple-500/30' },
    'Comedic Genius': { icon: '🎭', name: 'Comedic Genius', desc: 'Submitted a guess rated funny >= 9 by Gemini.', glow: 'border-neon-cyan/35' },
    'Curator of Comedy': { icon: '📚', name: 'Curator of Comedy', desc: 'Added at least 1 joke to saved favorites.', glow: 'border-neon-purple/35' },
    'Giggle Collector': { icon: '💎', name: 'Giggle Collector', desc: 'Saved 5 or more jokes in favorites repository.', glow: 'border-yellow-500/30' },
    'Joke Cadet': { icon: '🛸', name: 'Joke Cadet', desc: 'Reached 500 total XP points.', glow: 'border-neon-pink/35' },
    'Standup Hero': { icon: '🎬', name: 'Standup Hero', desc: 'Reached 1500 total XP points.', glow: 'border-neon-green/35' },
    'Meme Monarch': { icon: '👑', name: 'Meme Monarch', desc: 'Earned 3000 XP. Elite comedy citizen.', glow: 'border-red-500/35' }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col gap-6 items-center"
        >
          <ShieldAlert className="w-12 h-12 text-neon-pink animate-pulse" />
          <h1 className="font-orbitron font-extrabold text-lg text-white uppercase tracking-wider">Access Restrained</h1>
          <p className="text-xs text-white/50 leading-relaxed font-outfit">
            Synchronizing data locks requires biological authorization. Please sign in to read custom XP achievements.
          </p>
          <button
            onClick={() => {
              router.push('/auth');
              playSound('click');
            }}
            className={`px-6 py-2.5 rounded-xl font-bold font-orbitron text-xs uppercase tracking-wider ${getAccentBg()}`}
          >
            Authorize Session
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      {/* LEFT: STATUS PANELS */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* User Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col items-center gap-4 relative overflow-hidden bg-background/50">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-gradient-to-bl from-neon-cyan/5 to-transparent blur-3xl" />
          
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-neon-purple to-neon-cyan p-0.5 shadow-lg animate-float">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-xl font-bold font-orbitron">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div className="text-center">
            <h2 className="font-orbitron font-extrabold text-base text-white tracking-wide">{user.username}</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">{user.email}</span>
          </div>

          <button
            onClick={() => {
              logout();
              playSound('click');
              router.push('/');
            }}
            className="text-xs font-semibold text-neon-pink/70 hover:text-neon-pink transition border border-neon-pink/10 hover:border-neon-pink/30 px-4 py-1.5 rounded-lg bg-white/5"
          >
            De-authorize Profile
          </button>
        </div>

        {/* XP Progress Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-orbitron font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-neon-purple" /> Comedic Level
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-white/50 uppercase font-orbitron">
              Level {user.level}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-white/55">Current XP</span>
            <span className="font-bold text-white font-orbitron">{user.xp} XP</span>
          </div>

          {/* Progress gauge bar */}
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan" 
              style={{ width: `${Math.min(100, (user.xp % 100))}%` }} 
            />
          </div>

          <div className="flex justify-between text-[9px] text-white/30 font-outfit">
            <span>Level {user.level}</span>
            <span>{100 - (user.xp % 100)} XP to Next Level</span>
            <span>Level {user.level + 1}</span>
          </div>
        </div>

        {/* Action summaries */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 text-center p-3 rounded-xl bg-white/[0.01] border border-white/5">
            <Smile className={`w-5 h-5 mx-auto ${getAccentText()}`} />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 mt-1">Saved Favorites</span>
            <span className="text-xl font-bold font-orbitron text-white">{user.favorites.length}</span>
          </div>
          <div className="flex flex-col gap-1 text-center p-3 rounded-xl bg-white/[0.01] border border-white/5">
            <Activity className="w-5 h-5 mx-auto text-neon-pink" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 mt-1">Unlocked Badges</span>
            <span className="text-xl font-bold font-orbitron text-white">{user.achievements.length}</span>
          </div>
        </div>

      </div>

      {/* RIGHT: DETAILED DATA (BADGES, FAVORITES) */}
      <div className="lg:col-span-8 flex flex-col gap-8">
        
        {/* BADGES BLOCK */}
        <div className="flex flex-col gap-4">
          <h3 className="font-orbitron font-bold text-sm tracking-widest text-white uppercase flex items-center gap-1.5">
            <Award className={`w-4 h-4 ${getAccentText()}`} /> Unlocked Achievements
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.achievements.map((badgeName) => {
              const details = badgeDetails[badgeName] || {
                icon: '🏅',
                name: badgeName,
                desc: 'Comedic milestone achieved.',
                glow: 'border-white/10'
              };
              return (
                <div
                  key={badgeName}
                  className={`glass-panel p-4 rounded-2xl border flex gap-3 items-center ${details.glow}`}
                >
                  <div className="text-3xl shrink-0 p-1.5 rounded-lg bg-white/5 border border-white/5 animate-pulse">
                    {details.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-orbitron font-bold text-xs text-white">{details.name}</span>
                    <span className="text-[10px] text-white/50 font-outfit mt-0.5 leading-relaxed">{details.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAVORITES JOKES LIST BLOCK */}
        <div className="flex flex-col gap-4">
          <h3 className="font-orbitron font-bold text-sm tracking-widest text-white uppercase flex items-center gap-1.5">
            <Star className="w-4 h-4 text-neon-green fill-current" /> Favorite Archive ({user.favorites.length})
          </h3>

          {user.favorites.length === 0 ? (
            <div className="glass-panel p-8 rounded-3xl text-center border border-white/5 text-xs text-white/40">
              No bookmarks inside your laugh cache. Start generating jokes to save favorites!
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {user.favorites.map((joke) => (
                <div
                  key={joke._id}
                  className="glass-panel p-6 rounded-2xl border border-white/5 relative flex flex-col gap-4 bg-background/30 group"
                >
                  <div className="absolute top-4 right-4 px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold font-orbitron uppercase text-white/40">
                    {joke.category}
                  </div>
                  
                  <p className="text-sm font-outfit text-white/80 leading-relaxed font-light mt-2 max-w-[90%]">
                    {joke.text || `${joke.setup} ... ${joke.punchline}`}
                  </p>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-4">
                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(joke.text || `${joke.setup} ${joke.punchline}`)}
                        className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition"
                        title="Copy to Clipboard"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>
                      {/* Share */}
                      <button
                        onClick={() => handleShare(joke.text || `${joke.setup} ${joke.punchline}`)}
                        className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition"
                        title="Share Joke"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>
                    </div>

                    {/* Delete bookmark */}
                    <button
                      onClick={() => handleUnfavorite(joke._id)}
                      className="flex items-center gap-1 text-xs text-neon-pink/70 hover:text-neon-pink transition"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
