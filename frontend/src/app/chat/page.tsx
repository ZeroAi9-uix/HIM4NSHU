'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Terminal, 
  Sparkles, 
  User, 
  MessageSquare,
  Bot
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const { user, token, apiBase } = useAuth();
  const { playSound, showToast, accentColor } = useUI();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);

  // Voice States
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Recommendations options
  const recommendations = [
    'Tell me a dark joke 🖤',
    'Hit me with a dad pun 🤦',
    'Flirt with me using pick-up lines ❤️',
    'Roast my software developer stack 🔥'
  ];

  // Set initial welcome message
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Greetings biological entity. I am RAJ AI. My circuits are fully optimized for stand-up routine delivery. Click any prompt below or speak into the microphone to initiate diagnostic laughs.`
      }
    ]);
    setupVoiceRecognition();
  }, []);

  useEffect(() => {
    // Scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing]);

  const setupVoiceRecognition = () => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setListening(true);
      };

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInputText(text);
        showToast('Speech recognized!', 'success');
      };

      rec.onerror = (e: any) => {
        console.error('Speech error:', e);
        setListening(false);
        showToast('Speech recognition failed.', 'error');
      };

      rec.onend = () => {
        setListening(false);
      };

      recognitionRef.current = rec;
    }
  };

  const toggleListening = () => {
    playSound('click');
    if (!recognitionRef.current) {
      showToast('Speech recognition is not supported in your browser.', 'error');
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    playSound('click');

    const nextMessages = [...messages, { role: 'user' as const, content: textToSend }];
    setMessages(nextMessages);
    setInputText('');
    setTyping(true);

    try {
      const res = await fetch(`${apiBase}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ messages: nextMessages })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        
        // Voice response
        if (ttsEnabled) {
          speakOutput(data.message.content);
        }
      }
    } catch (e) {
      // Fallback response
      const fallbackReplies = [
        "That is highly logical, but does it compile?",
        "My database of humor experienced a query lag, but I can confidently state that developers are weird.",
        "Why write clean code when you can write AI comedy engines?"
      ];
      const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      
      setTimeout(() => {
        const assistantMsg = { role: 'assistant' as const, content: reply };
        setMessages(prev => [...prev, assistantMsg]);
        if (ttsEnabled) speakOutput(reply);
      }, 1000);
    } finally {
      setTyping(false);
    }
  };

  const speakOutput = (text: string) => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (!synth) return;

    // Cancel existing
    synth.cancel();

    // Clean emojis from text before speaking
    const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Attempt to pick a robotic/decent male voice
    const voices = synth.getVoices();
    const googleVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Natural'));
    if (googleVoice) utterance.voice = googleVoice;

    synth.speak(utterance);
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
      purple: 'bg-neon-purple text-black hover:bg-neon-purple/90',
      cyan: 'bg-neon-cyan text-black hover:bg-neon-cyan/90',
      pink: 'bg-neon-pink text-black hover:bg-neon-pink/90',
      green: 'bg-neon-green text-black hover:bg-neon-green/90'
    };
    return bgs[accentColor] || bgs.purple;
  };

  const getAccentBorderClass = () => {
    const borders = {
      purple: 'border-neon-purple/35 focus-within:border-neon-purple shadow-[0_0_15px_rgba(168,36,255,0.05)]',
      cyan: 'border-neon-cyan/35 focus-within:border-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.05)]',
      pink: 'border-neon-pink/35 focus-within:border-neon-pink shadow-[0_0_15px_rgba(255,0,127,0.05)]',
      green: 'border-neon-green/35 focus-within:border-neon-green shadow-[0_0_15px_rgba(57,255,20,0.05)]'
    };
    return borders[accentColor] || borders.purple;
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto h-[78vh]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Terminal className={`w-5 h-5 ${getAccentText()}`} />
          <span className="font-orbitron font-extrabold text-sm tracking-widest text-white uppercase">RAJ AI Terminal Lobby</span>
        </div>
        
        {/* TTS Voicing Toggle */}
        <button
          onClick={() => {
            setTtsEnabled(!ttsEnabled);
            playSound('click');
            if (ttsEnabled) window.speechSynthesis?.cancel();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-xs text-white/50 hover:text-white transition"
        >
          {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="font-orbitron text-[10px] tracking-wider uppercase font-bold">
            Voice Readout: {ttsEnabled ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* CHAT DISPLAY PANELS */}
      <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/5 overflow-y-auto flex flex-col gap-6 relative bg-background/50">
        
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[80%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                  isUser 
                    ? 'bg-white/5 border-white/10 text-white/60' 
                    : 'bg-gradient-to-tr from-neon-purple/20 to-neon-cyan/20 border-neon-cyan/30 text-neon-cyan'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 animate-pulse" />}
                </div>

                {/* Message bubble */}
                <div className={`p-4 rounded-2xl text-xs font-outfit leading-relaxed ${
                  isUser 
                    ? 'bg-white/5 border border-white/10 rounded-tr-none text-white' 
                    : 'bg-white/[0.02] border border-white/5 rounded-tl-none text-white/95 shadow-lg'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {typing && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full border bg-white/5 border-white/10 flex items-center justify-center shrink-0 text-neon-cyan">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-white/[0.02] border border-white/5 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* RECOMMENDED CHAT PILLS */}
      <div className="flex flex-wrap gap-2 py-1">
        {recommendations.map((rec) => (
          <button
            key={rec}
            onClick={() => handleSendMessage(rec.slice(0, -2))} // trim emoji before sending
            className="px-3.5 py-1.5 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white/70 hover:text-white font-orbitron uppercase tracking-wider transition"
          >
            {rec}
          </button>
        ))}
      </div>

      {/* CHAT INPUT AREA */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className={`flex items-center gap-2 p-2.5 rounded-xl border bg-white/5 transition duration-300 ${getAccentBorderClass()}`}
      >
        {/* Voice Recognition toggle */}
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2.5 rounded-lg border transition ${
            listening 
              ? 'border-neon-pink text-neon-pink bg-neon-pink/10 shadow-[0_0_15px_rgba(255,0,127,0.25)]' 
              : 'border-white/10 text-white/55 hover:text-white'
          }`}
          title={listening ? 'Stop voice capture' : 'Capture voice input'}
        >
          {listening ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          placeholder={listening ? "Listening to biological coordinates..." : "Input message command here..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder-white/30"
          disabled={typing}
        />

        <button
          type="submit"
          disabled={typing || !inputText.trim()}
          className={`p-2.5 rounded-lg transition disabled:opacity-40 shrink-0 ${getAccentBg()}`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
