import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AwardItem } from '../types';
import { normalizeDriveUrl, handleImageError } from '../utils/drive';
import { Sparkles, Trophy, X, Eye, Calendar, Award } from 'lucide-react';

export const AwardsSection: React.FC = () => {
  const { awards, t, language } = useApp();
  const [lightboxAward, setLightboxAward] = useState<AwardItem | null>(null);

  return (
    <section id="awards" className="py-16 sm:py-24 relative overflow-hidden bg-[#FAF7F2] dark:bg-[#0C0A0B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#D4AF37]/40 bg-white/70 dark:bg-[#161114] text-[#C94C71] dark:text-[#E55B82] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#E5C358]" />
            <span>{t.awardsBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2D2A26] dark:text-[#FAF7F2] font-serif-luxury">
            {t.awardsTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#7A6F65] dark:text-[#C5B7A9] mt-2">
            {t.awardsSubtitle}
          </p>
        </div>

        {/* Awards Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {awards.map((award) => {
            const mediaSrc = normalizeDriveUrl(award.mediaUrl, 'award');
            const displayTitle = language === 'tr' ? award.titleTr : language === 'en' ? award.titleEn : award.title;

            return (
              <div
                key={award.id}
                onClick={() => setLightboxAward(award)}
                className="group relative rounded-3xl overflow-hidden glass-luxury border border-[#D4AF37]/30 shadow-md hover:shadow-2xl hover:border-[#D4AF37] transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Media Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#251D21]">
                  <img
                    src={mediaSrc}
                    alt={displayTitle}
                    loading="lazy"
                    onError={(e) => handleImageError(e, 'award')}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Year & Company Badge */}
                  <div className="absolute top-3 end-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-black">
                      {award.year}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                      {award.company}
                    </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="p-3 rounded-full bg-white/90 dark:bg-[#161114]/90 text-[#2D2A26] dark:text-[#FAF7F2] shadow-xl border border-transparent dark:border-[#D4AF37]/40">
                      <Eye className="w-5 h-5 text-[#C94C71] dark:text-[#E55B82]" />
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 text-start">
                  <div className="flex items-center gap-1.5 text-xs text-[#D4AF37] dark:text-[#E5C358] mb-1.5 font-bold">
                    <Trophy className="w-4 h-4" />
                    <span>تكريم ريادي رفيع المستوى</span>
                  </div>
                  <h3 className="text-base font-bold text-[#2D2A26] dark:text-[#FAF7F2] line-clamp-2 leading-snug mb-2">
                    {displayTitle}
                  </h3>
                  <p className="text-xs text-[#6B6158] dark:text-[#C5B7A9] line-clamp-3 leading-relaxed">
                    {award.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxAward && (
        <div
          onClick={() => setLightboxAward(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-white dark:bg-[#161114] rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/40 flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxAward(null)}
              className="absolute top-4 end-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Media side */}
            <div className="md:w-3/5 bg-black flex items-center justify-center">
              <img
                src={normalizeDriveUrl(lightboxAward.mediaUrl, 'award')}
                alt={lightboxAward.title}
                onError={(e) => handleImageError(e, 'award')}
                className="w-full h-full max-h-[500px] object-contain"
              />
            </div>

            {/* Content side */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between text-start overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C94C71] text-white">
                    {lightboxAward.company}
                  </span>
                  <span className="text-xs font-bold text-[#D4AF37]">
                    مؤتمر عام {lightboxAward.year}
                  </span>
                </div>

                <h3 className="text-xl font-bold font-serif-luxury text-[#2D2A26] dark:text-white mb-3 leading-snug">
                  {lightboxAward.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#4A453F] dark:text-[#D1C5B8] leading-relaxed mb-6">
                  {lightboxAward.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#D4AF37]/20 flex flex-col gap-2">
                <span className="text-xs text-gray-500">
                  هل تطمحين لتكوني على هذه المنصة في التكريم القادم؟
                </span>
                <button
                  onClick={() => {
                    setLightboxAward(null);
                    const el = document.getElementById('join-team');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white rose-gold-gradient shadow-md hover:scale-[1.02]"
                >
                  انضمي لفريقي وابدئي رحلة الصعود ✨
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
