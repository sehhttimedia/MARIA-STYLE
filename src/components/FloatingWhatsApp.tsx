import React from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { cms, activeAttribution } = useApp();

  const cleanPhone = cms.officialWhatsApp.replace(/[^0-9]/g, '');
  const message = `مرحباً مدام فاطمة وفريق ماريا ستايل، أود الاستفسار عن فرص الانضمام لفريقي Alialyna و HomeLife والتعرف على المنتجات.\nكود العضوة الراعية: ${activeAttribution || 'MS-FATIMA'}`;

  const handleOpen = () => {
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 end-6 z-40 flex items-center gap-2 group">
      {/* Tooltip Pill */}
      <span className="hidden md:inline-block px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-[#1E191C] text-[#2D2A26] dark:text-white shadow-xl border border-[#D4AF37]/30 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0">
        تحدثي مباشرة مع مدام فاطمة 💬
      </span>

      {/* Floating Button */}
      <button
        onClick={handleOpen}
        aria-label="تواصل عبر الواتساب"
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#25D366] to-[#128C7E] text-white flex items-center justify-center shadow-2xl shadow-[#25D366]/40 hover:scale-110 active:scale-95 transition-all duration-200 relative animate-bounce duration-1000"
      >
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping opacity-75" />
        <MessageCircle className="w-7 h-7 relative z-10" />
      </button>
    </div>
  );
};
