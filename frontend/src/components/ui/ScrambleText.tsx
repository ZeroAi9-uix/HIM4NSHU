'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ScrambleTextProps {
  text: string;
  duration?: number;
  className?: string;
  trigger?: any;
}

const glyphs = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$%&*?[]{}<>-+=';

export default function ScrambleText({
  text,
  duration = 800,
  className = '',
  trigger
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let start = 0;
    const end = text.length;
    const startTime = Date.now();

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const timeElapsed = Date.now() - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Determine how many characters are resolved
      const resolvedChars = Math.floor(progress * end);

      const scrambled = text
        .split('')
        .map((char, index) => {
          if (index < resolvedChars) {
            return char; // Resolved
          }
          if (char === ' ') {
            return ' '; // Keep spaces
          }
          // Random glyph
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        })
        .join('');

      setDisplayText(scrambled);

      if (progress >= 1) {
        setDisplayText(text);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 30);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, duration, trigger]);

  return <span className={className}>{displayText}</span>;
}
