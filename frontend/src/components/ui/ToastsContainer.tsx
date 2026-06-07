'use client';

import React from 'react';
import { useUI } from '../../context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function ToastsContainer() {
  const { toasts, removeToast, playSound } = useUI();

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-neon-green" />,
    error: <AlertCircle className="w-4 h-4 text-neon-pink" />,
    info: <Info className="w-4 h-4 text-neon-cyan" />,
    joke: <Sparkles className="w-4 h-4 text-neon-purple" />
  };

  const borderClasses = {
    success: 'border-neon-green/30 shadow-[0_0_15px_rgba(57,255,20,0.15)]',
    error: 'border-neon-pink/30 shadow-[0_0_15px_rgba(255,0,127,0.15)]',
    info: 'border-neon-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.15)]',
    joke: 'border-neon-purple/30 shadow-[0_0_15px_rgba(168,36,255,0.15)]'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border glass-panel bg-background/90 ${borderClasses[toast.type]}`}
          >
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 text-xs font-outfit font-medium text-white/90 leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => {
                removeToast(toast.id);
                playSound('click');
              }}
              className="text-white/40 hover:text-white transition mt-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
