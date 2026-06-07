'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { motion } from 'framer-motion';
import { Lock, Mail, User as UserIcon, LogIn, Sparkles, AlertTriangle } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { user, login, signup, loginWithGoogle } = useAuth();
  const { playSound, showToast, accentColor } = useUI();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to home
    if (user) {
      router.push('/profile');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !username)) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    setLoading(true);
    playSound('click');

    const result = isLogin 
      ? await login(email, password)
      : await signup(username, email, password);

    setLoading(false);

    if (result.success) {
      showToast(isLogin ? 'Welcome back to the matrix!' : 'Account registered successfully!', 'success');
      playSound('success');
      router.push('/profile');
    } else {
      showToast(result.error || 'Authentication failed.', 'error');
      playSound('error');
    }
  };

  const handleMockGoogleLogin = async () => {
    playSound('click');
    setLoading(true);
    
    // Simulate Google OAuth ID Token
    // We generate a mock JWT containing generic profile info
    const mockGoogleToken = 'mock-google-token-' + Math.random().toString(36).substring(2, 12);
    
    const result = await loginWithGoogle(mockGoogleToken);
    setLoading(false);
    
    if (result.success) {
      showToast('Logged in with Google (Simulated)', 'success');
      playSound('success');
      router.push('/profile');
    } else {
      showToast(result.error || 'Google login failed.', 'error');
      playSound('error');
    }
  };

  const getAccentBorderClass = () => {
    const borders = {
      purple: 'border-neon-purple/30 focus-within:border-neon-purple shadow-[0_0_15px_rgba(168,36,255,0.05)]',
      cyan: 'border-neon-cyan/30 focus-within:border-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.05)]',
      pink: 'border-neon-pink/30 focus-within:border-neon-pink shadow-[0_0_15px_rgba(255,0,127,0.05)]',
      green: 'border-neon-green/30 focus-within:border-neon-green shadow-[0_0_15px_rgba(57,255,20,0.05)]'
    };
    return borders[accentColor] || borders.purple;
  };

  const getAccentBgClass = () => {
    const bgs = {
      purple: 'bg-neon-purple hover:bg-neon-purple/95 shadow-[0_0_15px_rgba(168,36,255,0.3)]',
      cyan: 'bg-neon-cyan hover:bg-neon-cyan/95 shadow-[0_0_15px_rgba(0,243,255,0.3)]',
      pink: 'bg-neon-pink hover:bg-neon-pink/95 shadow-[0_0_15px_rgba(255,0,127,0.3)]',
      green: 'bg-neon-green hover:bg-neon-green/95 shadow-[0_0_15px_rgba(57,255,20,0.3)]'
    };
    return bgs[accentColor] || bgs.purple;
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

  return (
    <div className="max-w-md mx-auto my-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col gap-6 relative"
      >
        {/* Glow decoration */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r ${
          accentColor === 'purple' ? 'from-neon-purple to-neon-cyan' :
          accentColor === 'cyan' ? 'from-neon-cyan to-neon-green' :
          accentColor === 'pink' ? 'from-neon-pink to-neon-purple' : 'from-neon-green to-neon-cyan'
        } rounded-full`} />

        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-orbitron font-extrabold text-2xl tracking-wide text-white">
            {isLogin ? 'INITIATE SESSION' : 'REGISTER PROTOCOL'}
          </h1>
          <p className="text-xs text-white/50">
            {isLogin ? 'Enter access credentials to sync laugh records.' : 'Establish a new biological profile.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* USERNAME (Signup only) */}
          {!isLogin && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-white/5 transition duration-300 ${getAccentBorderClass()}`}>
              <UserIcon className="w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-white/30"
                required={!isLogin}
              />
            </div>
          )}

          {/* EMAIL */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-white/5 transition duration-300 ${getAccentBorderClass()}`}>
            <Mail className="w-4 h-4 text-white/40" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-white/30"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-white/5 transition duration-300 ${getAccentBorderClass()}`}>
            <Lock className="w-4 h-4 text-white/40" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-white/30"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-black text-sm font-bold font-orbitron uppercase tracking-wide transition duration-300 flex items-center justify-center gap-2 ${getAccentBgClass()} disabled:opacity-50`}
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>

        </form>

        <div className="flex items-center justify-between my-2">
          <span className="h-[1px] bg-white/5 flex-1" />
          <span className="text-[10px] text-white/30 px-3 uppercase tracking-wider font-semibold">Or bypass via</span>
          <span className="h-[1px] bg-white/5 flex-1" />
        </div>

        {/* Google Mock Auth button */}
        <button
          onClick={handleMockGoogleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white/80 hover:text-white text-xs font-bold font-orbitron uppercase tracking-wide transition duration-300 flex items-center justify-center gap-2"
        >
          <Sparkles className={`w-4 h-4 ${getAccentTextClass()}`} />
          Google Account Sign In
        </button>

        <div className="text-center mt-2">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              playSound('click');
            }}
            className="text-xs text-white/40 hover:text-white transition font-outfit"
          >
            {isLogin ? "Don't have a profile? Register here." : 'Already have a profile? Sign in here.'}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
