import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { cms, language } = useApp();
  const [progress, setProgress] = useState(15);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsClosing(true);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 18;
      });
    }, 120);

    return () => clearInterval(timer);
  }, [onComplete]);

  const handleSkip = () => {
    setIsClosing(true);
    setTimeout(onComplete, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#FAF7F2] dark:bg-[#0C0A0B] text-[#2D2A26] dark:text-[#FAF7F2] transition-opacity duration-400 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background radial luxury glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,76,113,0.12)_0%,transparent_70%)] pointer-events-none" />

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 left-6 z-10 text-xs px-3 py-1.5 rounded-full border border-[#D4AF37]/30 text-[#8C7A6B] dark:text-[#C5B4A3] hover:text-[#C94C71] hover:border-[#C94C71] transition-colors"
      >
        {language === 'ar' ? 'تخطي ⇥' : language === 'tr' ? 'Atla ⇥' : 'Skip ⇥'}
      </button>

      <div className="relative flex flex-col items-center max-w-sm px-6 text-center z-10">
        {/* Logo Container with Golden Aura */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#C94C71]/30 via-[#D4AF37]/30 to-[#C94C71]/30 blur-xl animate-pulse" />
          <img
            src={cms.logoUrl || '/assets/aistudio/LOGO_5dd3ae33.png'}
            alt="Maria Style Logo"
            className="relative w-44 h-auto drop-shadow-xl animate-float object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-wide font-serif-luxury text-[#2D2A26] dark:text-white mb-2">
          MARIA STYLE
        </h1>
        <p className="text-sm font-medium text-[#C94C71] tracking-widest uppercase mb-6">
          Alialyna &amp; HomeLife
        </p>

        {/* Luxury Progress Bar */}
        <div className="w-48 h-1.5 bg-[#E8DEC9] dark:bg-[#2E2429] rounded-full overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#C94C71] via-[#D4AF37] to-[#C94C71] rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[11px] font-sans text-[#8C7A6B] dark:text-[#A8988B] mt-2">
          {progress < 100 ? 'تحميل عالم الأناقة...' : 'مرحباً بكِ'}
        </span>
      </div>
    </div>
  );
};
