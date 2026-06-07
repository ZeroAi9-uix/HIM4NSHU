'use client';

import React from 'react';
import Link from 'next/link';
import { useUI } from '../../context/UIContext';
import { Sparkles, MessageSquare, Terminal } from 'lucide-react';

export default function Footer() {
  const { playSound, accentColor } = useUI();

  const handleLinkClick = () => {
    playSound('click');
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
    <footer className="w-full relative z-20 border-t border-white/5 bg-background/80 py-12 px-4 md:px-8 mt-24 glass-panel">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2" onClick={handleLinkClick}>
            <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10 ${getAccentTextClass()}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-orbitron font-extrabold tracking-wider text-lg text-white">
              RAJ<span className={getAccentTextClass()}>AI</span>
            </span>
          </Link>
          <p className="text-sm text-white/50 max-w-sm font-outfit">
            A premium, Awwwards-inspired futuristic AI-powered platform delivering state-of-the-art stand-up, dad jokes, roasting, and interactive comedy.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-3">
          <h4 className="font-orbitron font-bold text-xs tracking-widest text-white uppercase">Comedy Tech</h4>
          <Link href="/jokes" onClick={handleLinkClick} className="text-sm text-white/40 hover:text-white transition">AI Joke Engine</Link>
          <Link href="/quiz" onClick={handleLinkClick} className="text-sm text-white/40 hover:text-white transition">Punchline Quiz</Link>
          <Link href="/chat" onClick={handleLinkClick} className="text-sm text-white/40 hover:text-white transition">AI Comedian Chat</Link>
        </div>

        {/* Resources */}
        <div className="flex flex-col gap-3">
          <h4 className="font-orbitron font-bold text-xs tracking-widest text-white uppercase">Connections</h4>
          <div className="flex items-center gap-4 mt-1">
            <a href="#" onClick={handleLinkClick} className="text-white/40 hover:text-white transition" title="GitHub">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="#" onClick={handleLinkClick} className="text-white/40 hover:text-white transition" title="Twitter">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" onClick={handleLinkClick} className="text-white/40 hover:text-white transition" title="Discord">
              <MessageSquare className="w-5 h-5" />
            </a>
            <a href="#" onClick={handleLinkClick} className="text-white/40 hover:text-white transition" title="API Status">
              <Terminal className="w-5 h-5" />
            </a>
          </div>
          <p className="text-xs text-white/30 mt-2">API Core: Port 5000</p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/30 font-outfit">
          © 2026 RAJ AI. Powered by Google Gemini and Next.js.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" onClick={handleLinkClick} className="text-xs text-white/30 hover:text-white transition">Privacy Policy</a>
          <a href="#" onClick={handleLinkClick} className="text-xs text-white/30 hover:text-white transition">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
