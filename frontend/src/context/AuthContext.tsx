'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface User {
  id: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  achievements: string[];
  favorites: Joke[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: String) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, password: String) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  addLocalXp: (amount: number) => { leveledUp: boolean; newLevel: number };
  toggleFavoriteLocal: (joke: Joke) => void;
  apiBase: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Check localStorage on mount
    const savedToken = localStorage.getItem('rajai_token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (authToken: string) => {
    try {
      const res = await fetch(`${apiBase}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token might be invalid, logout
        handleLogout();
      }
    } catch (err) {
      console.error('Profile fetch failed:', err);
      // Still keep token but run in offline/db-less simulated mode
      // Mock an anonymous profile if backend is down
      setUser({
        id: 'offline-peasant',
        username: 'OfflinePeasant',
        email: 'peasant@rajai.local',
        xp: 0,
        level: 1,
        achievements: ['Noob Comedian'],
        favorites: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rajai_token');
    setToken(null);
    setUser(null);
  };

  const login = async (email: string, password: String) => {
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Login failed.' };

      localStorage.setItem('rajai_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Cannot connect to backend server.' };
    }
  };

  const signup = async (username: string, email: string, password: String) => {
    try {
      const res = await fetch(`${apiBase}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Signup failed.' };

      localStorage.setItem('rajai_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      console.error('Signup error:', err);
      return { success: false, error: 'Cannot connect to backend server.' };
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      const res = await fetch(`${apiBase}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Google Authentication failed.' };

      localStorage.setItem('rajai_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      console.error('Google auth connection error:', err);
      return { success: false, error: 'Cannot connect to backend server.' };
    }
  };

  const refreshProfile = async () => {
    if (token) await fetchProfile(token);
  };

  const addLocalXp = (amount: number) => {
    if (!user) return { leveledUp: false, newLevel: 1 };
    
    const oldLevel = user.level;
    const nextXp = user.xp + amount;
    const nextLevel = Math.floor(Math.sqrt(nextXp / 100)) + 1;
    
    const leveledUp = nextLevel > oldLevel;
    
    setUser({
      ...user,
      xp: nextXp,
      level: nextLevel
    });

    return { leveledUp, newLevel: nextLevel };
  };

  const toggleFavoriteLocal = (joke: Joke) => {
    if (!user) return;
    const exists = user.favorites.some(f => f._id === joke._id);
    let nextFavorites = [...user.favorites];
    if (exists) {
      nextFavorites = nextFavorites.filter(f => f._id !== joke._id);
    } else {
      nextFavorites.push(joke);
    }
    setUser({
      ...user,
      favorites: nextFavorites
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      signup,
      loginWithGoogle,
      logout: handleLogout,
      refreshProfile,
      addLocalXp,
      toggleFavoriteLocal,
      apiBase
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
