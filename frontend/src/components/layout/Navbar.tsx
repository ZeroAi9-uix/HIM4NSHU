'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Volume2, VolumeX, Menu, X, User as UserIcon, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { soundEnabled, setSoundEnabled, playSound, accentColor } = useUI();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Jokes', path: '/jokes' },
    { name: 'Punchline Quiz', path: '/quiz' },
    { name: 'AI Comedian Chat', path: '/chat' }
  ];

  const handleLinkClick = () => {
    playSound('click');
    setMobileOpen(false);
  };

  const getAccentBorderClass = () => {
    const borders = {
      purple: 'border-neon-purple/30 focus-visible:border-neon-purple',
      cyan: 'border-neon-cyan/30 focus-visible:border-neon-cyan',
      pink: 'border-neon-pink/30 focus-visible:border-neon-pink',
      green: 'border-neon-green/30 focus-visible:border-neon-green'
    };
    return borders[accentColor] || borders.purple;
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
    <nav className="fixed top-0 left-0 w-full z-50 px-4 py-3 md:px-8 border-b border-white/5 glass-panel bg-background/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2" onClick={handleLinkClick}>
          <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10 ${getAccentTextClass()}`}>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-orbitron font-extrabold tracking-wider text-xl text-white">
            RAJ<span className={getAccentTextClass()}>AI</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={handleLinkClick}
                className={`font-outfit font-medium text-sm tracking-wide transition-colors duration-300 relative py-1 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className={`absolute bottom-0 left-0 w-full h-[2px] rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan`} />
                )}
              </Link>
            );
          })}
        </div>

        {/* ACTIONS & AUTH */}
        <div className="hidden md:flex items-center gap-4">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSound('click');
            }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition"
            title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* User auth */}
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                onClick={handleLinkClick}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-tr from-neon-purple to-neon-cyan text-white text-xs font-bold font-orbitron`}>
                  L{user.level}
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium text-white max-w-[80px] truncate">{user.username}</div>
                  <div className="text-[10px] text-white/50">{user.xp} XP</div>
                </div>
              </Link>
              <button
                onClick={() => {
                  logout();
                  playSound('click');
                }}
                className="text-xs font-medium text-white/40 hover:text-neon-pink transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              onClick={handleLinkClick}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg border text-white hover:bg-white/5 transition flex items-center gap-1.5 ${getAccentBorderClass()}`}
            >
              <UserIcon className="w-3.5 h-3.5" /> Sign In
            </Link>
          )}
        </div>

        {/* MOBILE MENU TRIGGER */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Mobile Sound */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSound('click');
            }}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              setMobileOpen(!mobileOpen);
              playSound('click');
            }}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE NAV PANEL */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass-panel border-t border-white/5 bg-background/95 py-6 px-4 flex flex-col gap-4 z-40 animate-float">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={handleLinkClick}
                className={`py-2 px-3 rounded-lg text-sm font-medium tracking-wide transition-colors ${
                  isActive 
                    ? `bg-white/5 text-white ${getAccentTextClass()}` 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          
          <hr className="border-white/5 my-2" />

          {user ? (
            <div className="flex flex-col gap-4">
              <Link
                href="/profile"
                onClick={handleLinkClick}
                className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-neon-purple to-neon-cyan text-white text-xs font-bold">
                  L{user.level}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{user.username}</div>
                  <div className="text-xs text-white/50">{user.xp} XP</div>
                </div>
              </Link>
              <button
                onClick={() => {
                  logout();
                  playSound('click');
                  setMobileOpen(false);
                }}
                className="w-full py-2 text-center text-sm font-medium text-neon-pink bg-white/5 border border-neon-pink/20 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              onClick={handleLinkClick}
              className={`w-full py-2.5 text-center text-sm font-semibold rounded-lg border text-white flex items-center justify-center gap-1.5 ${getAccentBorderClass()}`}
            >
              <UserIcon className="w-4 h-4" /> Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
