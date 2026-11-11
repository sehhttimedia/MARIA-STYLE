import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

/**
 * Ultra-Fast Luxury Brand Intro (Non-blocking, 0-freeze, instant dissolve)
 * Provides high-end branding aesthetic without blocking touch, clicks, or mobile performance.
 */
export const FastBrandIntro: React.FC = () => {
  const { cms } = useApp();
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    // Only show micro-fade once per browser session for 350ms max
    const seen = sessionStorage.getItem('maria_intro_seen');
    return !seen;
  });
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!visible) return;

    // Fast 300ms display, then silky fade out over 200ms
    const timer = setTimeout(() => {
      setOpacity(0);
      try {
        sessionStorage.setItem('maria_intro_seen', 'true');
      } catch {
        // Safe fallback
      }
      setTimeout(() => setVisible(false), 220);
    }, 320);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{ opacity, transition: 'opacity 220ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      className="fixed inset-0 z-[9999] pointer-events-none flex flex-col items-center justify-center bg-[#FAF7F2] dark:bg-[#0C0A0B]"
    >
      {/* Luxury Golden Aura Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,76,113,0.14)_0%,transparent_60%)]" />

      <div className="relative flex flex-col items-center max-w-xs px-6 text-center z-10 animate-fade-in">
        <div className="relative mb-3">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-[#C94C71]/30 via-[#D4AF37]/35 to-[#C94C71]/30 blur-lg" />
          <img
            src={cms.logoUrl || '/assets/aistudio/LOGO_5dd3ae33.png'}
            alt="Maria Style Logo"
            className="relative w-28 h-auto drop-shadow-xl object-contain"
          />
        </div>

        <h1 className="text-xl font-bold tracking-widest font-serif-luxury text-[#2D2A26] dark:text-white">
          MARIA STYLE
        </h1>
        <p className="text-[11px] font-medium text-[#C94C71] tracking-widest uppercase mt-0.5">
          Alialyna &amp; HomeLife
        </p>

        {/* Micro-Progress Shimmer Indicator */}
        <div className="w-24 h-0.5 bg-[#E8DEC9] dark:bg-[#2E2429] rounded-full overflow-hidden mt-3 shadow-inner">
          <div className="h-full bg-gradient-to-r from-[#C94C71] via-[#D4AF37] to-[#C94C71] rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};
