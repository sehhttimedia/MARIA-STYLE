import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, X } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { cms, language } = useApp();
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!cms.announcementActive || !isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-[#A83256] via-[#C94C71] to-[#AA7A1E] text-white text-xs sm:text-sm py-2 px-4 shadow-md z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex-1 text-center font-medium flex items-center justify-center flex-wrap gap-2">
          <span>{cms.announcementText}</span>
          <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tracking-wider text-[#F4E8C1]">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="text-white/80 hover:text-white p-1 rounded transition-colors"
          aria-label={language === 'ar' ? 'إغلاق الإعلان' : 'Close banner'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
