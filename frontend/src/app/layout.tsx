import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { UIProvider } from '../context/UIContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FloatingParticles from '../components/canvas/FloatingParticles';
import ToastsContainer from '../components/ui/ToastsContainer';

export const metadata: Metadata = {
  title: 'RAJ AI — Premium Futuristic AI Comedy Platform',
  description: 'Experience the future of humor. AI-powered joke generation, savage roast modes, punchline guessing games, and an interactive AI comedian chat assistant.',
  keywords: 'AI jokes, stand-up comedy AI, automated roaster, dad joke generator, comedic neural networks, gaming, XP badges, premium glassmorphism design',
  authors: [{ name: 'RAJ AI Core Team' }],
  robots: 'index, follow'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col justify-between antialiased">
        <UIProvider>
          <AuthProvider>
            <div className="cyber-grid" />
            <FloatingParticles />
            <ToastsContainer />
            <Navbar />
            <main className="flex-1 w-full pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto z-20">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </UIProvider>
      </body>
    </html>
  );
}
