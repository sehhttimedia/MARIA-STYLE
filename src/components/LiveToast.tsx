import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ShoppingBag, UserCheck, Calendar, X } from 'lucide-react';

interface ActivityItem {
  id: number;
  type: 'join' | 'order' | 'booking';
  name: string;
  location: string;
  detail: string;
  timeAgo: string;
}

export const LiveToast: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const activities: ActivityItem[] = [
    {
      id: 1,
      type: 'join',
      name: 'سارة عبد الله',
      location: 'الرياض، السعودية',
      detail: 'انضمت رسمياً لفريق Alialyna الذهبي',
      timeAgo: 'منذ دقيقتين',
    },
    {
      id: 2,
      type: 'order',
      name: 'Merve Kaya',
      location: 'İstanbul',
      detail: 'طلبت سيروم الذهب 24K وعطر ماريا ستايل',
      timeAgo: 'منذ 5 دقائق',
    },
    {
      id: 3,
      type: 'booking',
      name: 'أمل القحطاني',
      location: 'الدمام',
      detail: 'حجزت استشارة VIP خاصة مع مدام فاطمة',
      timeAgo: 'منذ 7 دقائق',
    },
    {
      id: 4,
      type: 'join',
      name: 'هدى الزهراني',
      location: 'جدة',
      detail: 'انضمت لفريق HomeLife للعناية والرشاقة',
      timeAgo: 'منذ 11 دقيقة',
    },
    {
      id: 5,
      type: 'order',
      name: 'نوف الشمري',
      location: 'الكويت',
      detail: 'تم تفعيل طلبها بواسطة كود العضوة MS-FATIMA',
      timeAgo: 'منذ 14 دقيقة',
    },
  ];

  useEffect(() => {
    if (dismissed) return;

    // Show first toast after 4 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    // Rotate toasts every 18 seconds
    const cycleTimer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 1000);
    }, 18000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(cycleTimer);
    };
  }, [dismissed, activities.length]);

  if (dismissed || !isVisible) return null;

  const current = activities[currentIdx];

  const getIcon = () => {
    switch (current.type) {
      case 'join':
        return <UserCheck className="w-4 h-4 text-[#C94C71]" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />;
      case 'booking':
        return <Calendar className="w-4 h-4 text-[#25D366]" />;
    }
  };

  return (
    <div className="fixed bottom-6 start-6 z-40 max-w-xs animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="glass-luxury rounded-2xl p-3.5 border border-[#D4AF37]/35 shadow-xl flex items-start gap-3 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setDismissed(true);
          }}
          className="absolute top-2 end-2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Icon Circle */}
        <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#161114] shadow-sm border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
          {getIcon()}
        </div>

        {/* Text Details */}
        <div className="flex-1 pe-4 text-start">
          <div className="flex items-center justify-between text-[11px] mb-0.5">
            <span className="font-bold text-[#2D2A26] dark:text-[#FAF7F2] line-clamp-1">
              {current.name}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-[#8C7E75] ms-1 shrink-0">{current.timeAgo}</span>
          </div>

          <p className="text-[11px] text-[#C94C71] dark:text-[#E55B82] font-semibold leading-tight mb-0.5">
            {current.detail}
          </p>

          <span className="text-[10px] text-gray-500 dark:text-[#A8988B]">
            {current.location}
          </span>
        </div>
      </div>
    </div>
  );
};
