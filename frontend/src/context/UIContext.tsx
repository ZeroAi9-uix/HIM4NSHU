'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'joke';
}

interface UIContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  particlesEnabled: boolean;
  setParticlesEnabled: (enabled: boolean) => void;
  accentColor: 'cyan' | 'pink' | 'purple' | 'green';
  setAccentColor: (color: 'cyan' | 'pink' | 'purple' | 'green') => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'joke') => void;
  removeToast: (id: string) => void;
  playSound: (type: 'click' | 'success' | 'error' | 'levelup' | 'laser') => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [accentColor, setAccentColor] = useState<'cyan' | 'pink' | 'purple' | 'green'>('purple');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load preferences from localstorage
  useEffect(() => {
    const soundPref = localStorage.getItem('rajai_sound');
    const partPref = localStorage.getItem('rajai_particles');
    const colorPref = localStorage.getItem('rajai_accent');

    if (soundPref !== null) setSoundEnabled(soundPref === 'true');
    if (partPref !== null) setParticlesEnabled(partPref === 'true');
    if (colorPref !== null) setAccentColor(colorPref as any);
  }, []);

  const saveSound = (val: boolean) => {
    setSoundEnabled(val);
    localStorage.setItem('rajai_sound', String(val));
  };

  const saveParticles = (val: boolean) => {
    setParticlesEnabled(val);
    localStorage.setItem('rajai_particles', String(val));
  };

  const saveAccent = (val: 'cyan' | 'pink' | 'purple' | 'green') => {
    setAccentColor(val);
    localStorage.setItem('rajai_accent', val);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'joke' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Play alert sounds based on toast types
    if (type === 'success') playSound('success');
    if (type === 'error') playSound('error');
    if (type === 'joke') playSound('laser');

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Synthesizes high-fidelity sci-fi audio effects programmatically using Web Audio API
  const playSound = (type: 'click' | 'success' | 'error' | 'levelup' | 'laser') => {
    if (!soundEnabled) return;
    
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      if (type === 'click') {
        // Futuristic click: short frequency blip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'success') {
        // Satisfying chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'error') {
        // Flat electronic buzzer sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'levelup') {
        // Triumphant retro synth riser
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.6);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'laser') {
        // AI joke laser beam sound effect
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      console.warn('AudioContext failed:', e);
    }
  };

  return (
    <UIContext.Provider value={{
      soundEnabled,
      setSoundEnabled: saveSound,
      particlesEnabled,
      setParticlesEnabled: saveParticles,
      accentColor,
      setAccentColor: saveAccent,
      toasts,
      showToast,
      removeToast,
      playSound
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
