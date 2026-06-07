'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import ScrambleText from '../../components/ui/ScrambleText';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Copy,
  Share2,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flame,
  MessageSquare,
  Image as ImageIcon,
  RotateCw,
  Send,
  User
} from 'lucide-react';

interface Comment {
  _id: string;
  username: string;
  text: string;
  createdAt: string;
}

interface Joke {
  _id: string;
  text?: string;
  setup?: string;
  punchline?: string;
  category: 'dark' | 'funny' | 'lame' | 'romance' | 'roast' | 'general';
  likes: string[];
  dislikes: string[];
  commentsCount: number;
}

export default function JokesPage() {
  const { user, token, apiBase, addLocalXp, toggleFavoriteLocal } = useAuth();
  const { playSound, showToast, accentColor } = useUI();

  const [category, setCategory] = useState<'dark' | 'funny' | 'lame' | 'romance' | 'roast'>('funny');

  // Joke state
  const [currentJoke, setCurrentJoke] = useState<Joke | null>(null);
  const [loading, setLoading] = useState(false);
  const [scrambleTrigger, setScrambleTrigger] = useState(0);

  // Roast target state
  const [roastTopic, setRoastTopic] = useState('');

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // Meme state
  const [showMemeGen, setShowMemeGen] = useState(false);
  const [memeTemplate, setMemeTemplate] = useState('Drake Hotline Bling');
  const [memeCaptions, setMemeCaptions] = useState({ topText: 'Writing code manual', bottomText: 'Letting RAJ AI write your code' });
  const [generatingMeme, setGeneratingMeme] = useState(false);

  const categories = [
    { id: 'funny', label: 'Funny Jokes', emoji: '😂' },
    { id: 'dark', label: 'Dark Jokes', emoji: '🖤' },
    { id: 'lame', label: 'Lame Jokes', emoji: '🤦' },
    { id: 'romance', label: 'Romance Jokes', emoji: '❤️' },
    { id: 'roast', label: 'RAJ Roast Mode', emoji: '🔥' }
  ] as const;

  const memeTemplates = [
    'Drake Hotline Bling',
    'Distracted Boyfriend',
    'Two Buttons',
    'Change My Mind',
    'Expanding Brain'
  ];

  // Fetch initial joke
  useEffect(() => {
    handleGenerateJoke(true);
  }, [category]);

  const handleGenerateJoke = async (isInitial = false) => {
    if (!isInitial) playSound('laser');
    setLoading(true);
    setShowComments(false);
    setComments([]);

    let url = `${apiBase}/jokes/generate?category=${category}`;
    if (category === 'roast' && roastTopic) {
      url += `&roastTopic=${encodeURIComponent(roastTopic)}`;
    }

    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentJoke(data.joke);
        setScrambleTrigger(prev => prev + 1);
        if (!isInitial && user) {
          addLocalXp(10); // Local XP reward
          showToast('+10 XP Generated!', 'success');
        }
      }
    } catch (e) {
      // Local simulated response fallback
      console.warn('Backend offline, using fallback.');
      const localTexts = {
        funny: 'Why do programmers prefer dark mode? Because light attracts bugs.',
        dark: 'My grandfather has the heart of a lion... and a lifetime ban from the local zoo.',
        lame: 'What do you call a factory that makes okay products? A satisfactory.',
        romance: 'Are you made of copper and tellurium? Because you are CuTe.',
        roast: `Roasting ${roastTopic || 'you'}: You look like the type of person who double-clicks on email links.`
      };

      const text = localTexts[category];
      const mockJoke: Joke = {
        _id: `mock-${category}-${Math.random()}`,
        text,
        category,
        likes: [],
        dislikes: [],
        commentsCount: 0
      };
      setCurrentJoke(mockJoke);
      setScrambleTrigger(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!currentJoke) return;
    if (!user) {
      showToast('You must sign in to vote.', 'error');
      return;
    }

    playSound('click');
    try {
      const res = await fetch(`${apiBase}/jokes/${type}/${currentJoke._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentJoke(data.joke);
        showToast(type === 'like' ? 'Voted Up!' : 'Voted Down', 'success');
      }
    } catch (e) {
      // Sim vote
      const likes = [...currentJoke.likes];
      const dislikes = [...currentJoke.dislikes];
      if (type === 'like') {
        likes.push(user.id);
      } else {
        dislikes.push(user.id);
      }
      setCurrentJoke({ ...currentJoke, likes, dislikes });
      showToast('Offline Vote Logged!', 'success');
    }
  };

  const handleFavorite = async () => {
    if (!currentJoke) return;
    if (!user) {
      showToast('Sign in to favorite jokes.', 'error');
      return;
    }

    playSound('click');
    try {
      const res = await fetch(`${apiBase}/jokes/favorite/${currentJoke._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        toggleFavoriteLocal(currentJoke);
        showToast(data.isFavorite ? 'Saved to Favorites!' : 'Removed from Favorites', 'success');
        if (data.isFavorite) addLocalXp(15);
      }
    } catch (e) {
      toggleFavoriteLocal(currentJoke);
      showToast('Offline Favorite Saved!', 'success');
    }
  };

  // Helper: get displayable joke text (handles both text-only and setup/punchline jokes)
  const getJokeDisplayText = (joke: Joke) => {
    return joke.text || `${joke.setup || ''} — ${joke.punchline || ''}`.trim();
  };

  const handleCopy = () => {
    if (!currentJoke) return;
    playSound('click');
    navigator.clipboard.writeText(getJokeDisplayText(currentJoke));
    showToast('Joke copied to clipboard!', 'success');
  };

  const handleShare = async () => {
    if (!currentJoke) return;
    playSound('click');
    const jokeText = getJokeDisplayText(currentJoke);

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RAJ AI Jokes',
          text: jokeText,
          url: window.location.origin
        });
      } catch (err) {
        // Ignored share abort
      }
    } else {
      navigator.clipboard.writeText(`${jokeText} — Shared from RAJ AI`);
      showToast('Share link copied to clipboard!', 'success');
    }
  };

  const fetchComments = async () => {
    if (!currentJoke) return;
    setLoadingComments(true);
    try {
      const res = await fetch(`${apiBase}/jokes/comments/${currentJoke._id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (e) {
      setComments([
        { _id: 'c1', username: 'ComedyGuru', text: 'This joke is gold!', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoadingComments(false);
    }
  };

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentJoke || !newComment.trim()) return;
    if (!user) {
      showToast('Sign in to comment.', 'error');
      return;
    }

    playSound('click');
    try {
      const res = await fetch(`${apiBase}/jokes/comments/${currentJoke._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: newComment })
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
        addLocalXp(8);
        showToast('+8 XP for Commenting!', 'success');
        setCurrentJoke({
          ...currentJoke,
          commentsCount: currentJoke.commentsCount + 1
        });
      }
    } catch (e) {
      const mockComment: Comment = {
        _id: Math.random().toString(),
        username: user.username,
        text: newComment,
        createdAt: new Date().toISOString()
      };
      setComments(prev => [mockComment, ...prev]);
      setNewComment('');
      showToast('Simulated Offline Comment!', 'success');
    }
  };

  const handleGenerateMeme = async () => {
    playSound('laser');
    setGeneratingMeme(true);
    try {
      const res = await fetch(`${apiBase}/jokes/meme?template=${encodeURIComponent(memeTemplate)}`);
      if (res.ok) {
        const data = await res.json();
        setMemeCaptions(data.captions);
        showToast('Meme captions generated!', 'success');
      }
    } catch (e) {
      // offline mock
      const mockMeme = {
        'Drake Hotline Bling': { topText: 'Debugging vanilla JS arrays', bottomText: 'Using RAJ AI comedy generators' },
        'Distracted Boyfriend': { topText: 'Your homework', bottomText: 'Playing RAJ AI quiz' },
        'Two Buttons': { topText: 'Fix production crash', bottomText: 'Read dark comedy' },
        'Change My Mind': { topText: 'RAJ AI has the best jokes.', bottomText: 'Change my mind.' },
        'Expanding Brain': { topText: 'Normal laughs', bottomText: 'Supernova dark AI humour' }
      }[memeTemplate] || { topText: 'Mock Meme Title', bottomText: 'Mock Meme Caption' };
      setMemeCaptions(mockMeme);
      showToast('Simulated offline meme!', 'success');
    } finally {
      setGeneratingMeme(false);
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
      purple: 'bg-neon-purple hover:bg-neon-purple/80 shadow-[0_0_15px_rgba(168,36,255,0.35)]',
      cyan: 'bg-neon-cyan hover:bg-neon-cyan/80 shadow-[0_0_15px_rgba(0,243,255,0.35)]',
      pink: 'bg-neon-pink hover:bg-neon-pink/80 shadow-[0_0_15px_rgba(255,0,127,0.35)]',
      green: 'bg-neon-green hover:bg-neon-green/80 shadow-[0_0_15px_rgba(57,255,20,0.35)]'
    };
    return bgs[accentColor] || bgs.purple;
  };

  const isFavorited = user?.favorites.some(f => f._id === currentJoke?._id);

  return (
    <div className="flex flex-col gap-10">

      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="font-syne font-extrabold text-3xl md:text-5xl text-white">Humor Synthesizer</h1>
        <p className="text-sm text-white/50">Generate, customize, and react to next-generation AI comedy algorithms.</p>
      </div>

      {/* CONTROLS: CATEGORIES GRID */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                playSound('click');
              }}
              className={`p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all duration-300 text-center relative ${active
                  ? `glass-panel bg-white/5 border-white/20 text-white ${accentColor === 'purple' ? 'border-neon-purple/50 shadow-[0_0_15px_rgba(168,36,255,0.15)]' :
                    accentColor === 'cyan' ? 'border-neon-cyan/50 shadow-[0_0_15px_rgba(0,243,255,0.15)]' :
                      accentColor === 'pink' ? 'border-neon-pink/50 shadow-[0_0_15px_rgba(255,0,127,0.15)]' :
                        'border-neon-green/50 shadow-[0_0_15px_rgba(57,255,20,0.15)]'
                  }`
                  : 'border-white/5 hover:border-white/10 text-white/50 hover:text-white/85 bg-white/[0.01]'
                }`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="font-orbitron font-bold text-xs uppercase tracking-wider">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ROAST CUSTOMIZER DRAWER */}
      {category === 'roast' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-panel p-6 rounded-2xl border border-neon-pink/20 bg-neon-pink/[0.01] flex flex-col gap-3"
        >
          <div className="flex items-center gap-2 text-neon-pink font-orbitron text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 animate-pulse" /> Savage Parameters
          </div>
          <p className="text-[11px] text-white/50">Supply the name of the victim, developer stack, or life choices you wish to vaporize.</p>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="e.g. JavaScript Developers, Crypto Bros, Influencers"
              value={roastTopic}
              onChange={(e) => setRoastTopic(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-neon-pink transition placeholder-white/30"
            />
            <button
              onClick={() => handleGenerateJoke()}
              className="px-6 py-2.5 rounded-xl bg-neon-pink hover:bg-neon-pink/85 text-black font-orbitron font-bold text-xs uppercase transition"
            >
              Scorch
            </button>
          </div>
        </motion.div>
      )}

      {/* MAIN OUTPUT JOKE CARD */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col gap-6">
        <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-gradient-to-br from-neon-purple/5 to-transparent blur-[50px]" />

        {/* Loader inside card */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center gap-4 text-white/50"
            >
              <RotateCw className="w-8 h-8 animate-spin text-neon-cyan" />
              <p className="text-xs font-orbitron tracking-widest uppercase">Calculating Punchlines...</p>
            </motion.div>
          ) : (
            <motion.div
              key="output"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-widest font-orbitron ${getAccentText()}`}>
                  🤖 RAJ AI Core Output
                </span>
                {currentJoke && (
                  <span className="px-2.5 py-0.5 rounded bg-white/5 text-[9px] font-bold font-orbitron uppercase text-white/45">
                    {currentJoke.category}
                  </span>
                )}
              </div>

              {/* Glowing Text Area */}
              <div className="min-h-[90px] py-4 flex items-center justify-center">
                {currentJoke && (
                  <p className="text-lg md:text-2xl text-center font-outfit text-white font-light leading-relaxed max-w-2xl">
                    <ScrambleText text={getJokeDisplayText(currentJoke)} trigger={scrambleTrigger} />
                  </p>
                )}
              </div>

              {/* Utility actions */}
              {currentJoke && (
                <div className="flex flex-wrap items-center justify-between gap-6 border-t border-white/5 pt-6">
                  {/* Community Likes */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleVote('like')}
                      className={`flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-neon-cyan transition ${user && currentJoke.likes.includes(user.id) ? 'text-neon-cyan' : ''
                        }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{currentJoke.likes.length}</span>
                    </button>
                    <button
                      onClick={() => handleVote('dislike')}
                      className={`flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-neon-pink transition ${user && currentJoke.dislikes.includes(user.id) ? 'text-neon-pink' : ''
                        }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>{currentJoke.dislikes.length}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowComments(!showComments);
                        playSound('click');
                        if (!showComments) fetchComments();
                      }}
                      className="flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{currentJoke.commentsCount} Comments</span>
                    </button>
                  </div>

                  {/* Options */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCopy}
                      className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white transition hover:bg-white/10"
                      title="Copy to Clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white transition hover:bg-white/10"
                      title="Share Joke"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleFavorite}
                      className={`p-2.5 rounded-lg bg-white/5 border text-white/80 hover:text-white transition hover:bg-white/10 ${isFavorited ? 'border-neon-pink/40 text-neon-pink hover:text-neon-pink bg-neon-pink/5' : 'border-white/10'
                        }`}
                      title={isFavorited ? 'Remove from favorites' : 'Save to Favorites'}
                    >
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleGenerateJoke()}
                      className={`px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider font-orbitron text-black transition flex items-center gap-1.5 ${getAccentBg()}`}
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Next Joke
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* COMMENTS FEED EXPANSION PANEL */}
      {showComments && currentJoke && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-6"
        >
          <h3 className="font-orbitron font-bold text-sm tracking-wide text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-neon-cyan" /> Comedic Review Log
          </h3>

          {/* Form */}
          <form onSubmit={postComment} className="flex gap-4">
            <input
              type="text"
              placeholder={user ? "Post a witty comment..." : "Sign in to post comments..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-neon-cyan transition placeholder-white/30"
              disabled={!user}
            />
            <button
              type="submit"
              disabled={!user || !newComment.trim()}
              className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-white font-orbitron font-bold text-xs uppercase transition disabled:opacity-40 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>

          {/* List */}
          {loadingComments ? (
            <div className="py-4 flex justify-center text-xs text-white/40">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-xs text-white/40 text-center py-4">No comments. Be the first to express opinion.</div>
          ) : (
            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
              {comments.map((comm) => (
                <div key={comm._id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/70">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-orbitron font-bold text-xs text-white/80">{comm.username}</span>
                      <span className="text-[9px] text-white/30">
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed font-outfit">{comm.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* HTML MEME GENERATOR DRAWER */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => {
            setShowMemeGen(!showMemeGen);
            playSound('click');
          }}
          className="w-full py-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 flex items-center justify-center gap-2 text-white/70 hover:text-white transition duration-300 font-orbitron font-bold text-xs uppercase tracking-widest"
        >
          <ImageIcon className="w-4 h-4 text-neon-cyan" />
          {showMemeGen ? 'Hide Interactive Meme Generator' : 'Reveal Interactive Meme Generator'}
        </button>

        {showMemeGen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-12 gap-8"
          >
            {/* Left selector */}
            <div className="md:col-span-4 flex flex-col gap-4">
              <h3 className="font-orbitron font-bold text-xs uppercase tracking-wider text-white">Meme Template</h3>
              <div className="flex flex-col gap-2">
                {memeTemplates.map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      setMemeTemplate(t);
                      playSound('click');
                    }}
                    className={`px-4 py-2.5 rounded-xl border text-left text-xs font-bold font-orbitron uppercase tracking-wide transition ${memeTemplate === t
                        ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/5'
                        : 'border-white/5 hover:border-white/10 text-white/50 hover:text-white/80'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={handleGenerateMeme}
                disabled={generatingMeme}
                className={`w-full py-3 mt-4 rounded-xl text-black font-orbitron font-bold text-xs uppercase tracking-wider transition ${getAccentBg()}`}
              >
                {generatingMeme ? 'Creating Meme...' : 'Generate Meme Caption'}
              </button>
            </div>

            {/* Right Meme Visualizer */}
            <div className="md:col-span-8 flex items-center justify-center">
              <div className="max-w-[400px] w-full border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative bg-black select-none">

                {/* 🚀 Drake Hotline Bling - Styled HTML Template */}
                {memeTemplate === 'Drake Hotline Bling' && (
                  <div className="flex flex-col h-[360px]">
                    <div className="flex-1 flex border-b border-white/10">
                      <div className="w-[120px] bg-red-600 flex items-center justify-center font-bold text-white text-[32px] p-2 text-center select-none line-through">
                        😒
                      </div>
                      <div className="flex-1 bg-zinc-900 flex items-center justify-center p-6 text-center text-xs font-bold text-white leading-normal font-sans">
                        {memeCaptions.topText}
                      </div>
                    </div>
                    <div className="flex-1 flex">
                      <div className="w-[120px] bg-green-600 flex items-center justify-center font-bold text-white text-[32px] p-2 text-center select-none">
                        👉 😊
                      </div>
                      <div className="flex-1 bg-zinc-900 flex items-center justify-center p-6 text-center text-xs font-bold text-white leading-normal font-sans border-l border-white/5">
                        {memeCaptions.bottomText}
                      </div>
                    </div>
                  </div>
                )}

                {/* 🚀 Two Buttons - Styled HTML Template */}
                {memeTemplate === 'Two Buttons' && (
                  <div className="flex flex-col h-[360px] bg-zinc-950 p-6 text-center justify-between relative">
                    <div className="flex gap-4 justify-center mt-6">
                      <div className="px-3 py-6 rounded-full border border-red-500 bg-red-600/10 shadow-[0_0_15px_rgba(239,68,68,0.3)] text-white text-[10px] font-bold font-sans w-24 h-24 flex items-center justify-center">
                        {memeCaptions.topText}
                      </div>
                      <div className="px-3 py-6 rounded-full border border-blue-500 bg-blue-600/10 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white text-[10px] font-bold font-sans w-24 h-24 flex items-center justify-center">
                        {memeCaptions.bottomText}
                      </div>
                    </div>
                    <div className="text-white text-[32px] animate-bounce mb-4">😰</div>
                    <div className="text-[10px] text-white/55 tracking-wider uppercase font-orbitron font-semibold">Decisions of a peasant dev</div>
                  </div>
                )}

                {/* 🚀 Distracted Boyfriend - Styled HTML Template */}
                {memeTemplate === 'Distracted Boyfriend' && (
                  <div className="flex flex-col justify-between h-[360px] bg-zinc-900 p-8">
                    <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider text-center border border-red-500/20 bg-red-500/5 py-1 rounded">
                      Distracted Boyfriend Protocol
                    </div>
                    <div className="flex justify-between items-center gap-4 py-8">
                      <div className="flex-1 p-3 rounded-lg border border-white/5 bg-zinc-800 text-center text-[10px] font-bold text-white select-none">
                        💁‍♀️ {memeCaptions.topText} (Ignored tasks)
                      </div>
                      <div className="text-2xl">🏃‍♂️💨</div>
                      <div className="flex-1 p-3 rounded-lg border border-neon-cyan/25 bg-neon-cyan/5 text-center text-[10px] font-bold text-neon-cyan select-none">
                        💃 {memeCaptions.bottomText} (Shiny distraction)
                      </div>
                    </div>
                    <div className="text-[9px] text-white/35 text-center uppercase tracking-widest font-orbitron font-semibold">Gemini Caption Synthesis</div>
                  </div>
                )}

                {/* 🚀 Change My Mind - Styled HTML Template */}
                {memeTemplate === 'Change My Mind' && (
                  <div className="flex flex-col justify-between h-[360px] bg-zinc-950 p-6">
                    <div className="text-center font-orbitron font-bold text-[10px] tracking-wider text-white/40 uppercase">Interactive Argument panel</div>
                    <div className="flex-1 flex items-center justify-center px-4">
                      <div className="w-full border-2 border-white/10 bg-white p-6 text-center text-sm font-black text-black font-sans uppercase rounded shadow-lg transform -rotate-1">
                        {memeCaptions.topText} <br />
                        <span className="text-[11px] font-bold block text-zinc-500 mt-2 border-t border-zinc-200 pt-2">CHANGE MY MIND.</span>
                      </div>
                    </div>
                    <div className="text-white text-[32px] text-center">☕😐</div>
                  </div>
                )}

                {/* 🚀 Expanding Brain - Styled HTML Template */}
                {memeTemplate === 'Expanding Brain' && (
                  <div className="flex flex-col h-[360px] bg-zinc-900">
                    <div className="flex-1 flex border-b border-white/5">
                      <div className="w-[120px] bg-zinc-950 border-r border-white/5 flex items-center justify-center text-[28px]">
                        🧠 💡
                      </div>
                      <div className="flex-1 p-4 flex items-center justify-center text-center text-[10px] font-bold text-white leading-normal font-sans">
                        {memeCaptions.topText}
                      </div>
                    </div>
                    <div className="flex-1 flex">
                      <div className="w-[120px] bg-zinc-950 border-r border-white/5 flex items-center justify-center text-[36px] animate-pulse">
                        🤯 ⚡
                      </div>
                      <div className="flex-1 p-4 flex items-center justify-center text-center text-[10px] font-bold text-neon-cyan leading-normal font-sans">
                        {memeCaptions.bottomText}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </motion.div>
        )}
      </div>

    </div>
  );
}
