import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { normalizeDriveUrl, handleImageError } from '../utils/drive';
import { Sparkles, X, Quote, CheckCircle, ArrowRight } from 'lucide-react';

export const MadameFatimaStory: React.FC = () => {
  const { t, cms, language } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const photoUrl = normalizeDriveUrl(cms.madameFatimaPhoto, 'story');

  const scrollToJoin = () => {
    setIsModalOpen(false);
    const el = document.getElementById('join-team');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="story" className="py-16 sm:py-24 relative overflow-hidden bg-[#FAF5EE]/70 dark:bg-[#100D0F]">
      {/* Decorative luxury background shapes */}
      <div className="absolute top-0 end-0 w-96 h-96 bg-[#C94C71]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 start-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#D4AF37]/40 bg-white/70 dark:bg-white/5 text-[#C94C71] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t.storyBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2D2A26] dark:text-white font-serif-luxury">
            {t.storyTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#7A6F65] dark:text-[#B2A497] mt-2">
            {cms.madameFatimaTitle || t.storySubtitle}
          </p>
        </div>

        {/* Story Card Grid */}
        <div className="glass-luxury rounded-3xl p-6 sm:p-10 border border-[#D4AF37]/30 shadow-xl max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Madame Fatima Portrait (Col 1-5) */}
            <div className="md:col-span-5 relative flex justify-center">
              <div className="relative group max-w-sm w-full">
                {/* Glow ring */}
                <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-[#C94C71] to-[#D4AF37] opacity-25 blur-lg group-hover:opacity-40 transition-opacity" />

                <div className="relative rounded-2xl overflow-hidden border-2 border-[#D4AF37]/40 shadow-2xl aspect-[4/5] bg-[#2E2429]">
                  <img
                    src={https://lh3.googleusercontent.com/d/1LdXGHuutvWZKKPn_2ORP69GpL_Ozvav4}
                    alt="مدام فاطمة - مؤسسة ماريا ستايل"
                    onError={(e) => handleImageError(e, 'story')}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                    <span className="text-xs uppercase tracking-widest text-[#F4E8C1] font-semibold">
                      Founder &amp; Diamond Leader
                    </span>
                    <h3 className="text-lg font-bold font-serif-luxury">مدام فاطمة (Madame Fatima)</h3>
                    <p className="text-xs text-[#FAF5EE]/90">مؤسسة ماريا ستايل وقائدة فريق Alialyna &amp; HomeLife</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Biography & Quote Excerpt (Col 6-12) */}
            <div className="md:col-span-7 flex flex-col justify-center text-start">
              {/* Luxury Quote */}
              <div className="relative mb-6 pl-4 border-l-2 rtl:border-l-0 rtl:border-r-2 border-[#C94C71]">
                <Quote className="w-8 h-8 text-[#D4AF37]/40 mb-2 mr-1.5" style={{ marginBottom: '8px', marginRight: '6px' }} />
                <p
                  className="text-base sm:text-lg font-bold italic text-right text-[#3A3530] dark:text-[#E8DDD2] leading-relaxed"
                  style={{
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    textAlign: 'right',
                    minHeight: '100px',
                    maxWidth: '500px',
                    width: '100%',
                    marginLeft: '0px',
                    marginRight: '8px',
                  }}
                >
                  {t.storyQuote}
                </p>
              </div>

              {/* Bio Summary */}
              <p className="text-sm sm:text-base text-[#61574E] dark:text-[#C5B7A9] leading-relaxed mb-6">
                {cms.madameFatimaStoryExcerpt}
              </p>

              {/* Key Leadership Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-xs text-[#443E38] dark:text-[#D1C5B8]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#C94C71] shrink-0" />
                  <span>أكثر من 3,500 سيدة تم تدريبهن مجاناً</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>تكريمات دولية في إسطنبول ودبي وأنطاليا</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>شراكة حصرية مع إدارات Alialyna و HomeLife</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#C94C71] shrink-0" />
                  <span>متابعة شخصية وخطط مالية مخصصة</span>
                </div>
              </div>

              {/* Interactive Modal Opener Button */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#A83256] via-[#C94C71] to-[#AA7A1E] shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {t.storyReadMore} ✦
                </button>

                <button
                  onClick={scrollToJoin}
                  className="text-xs sm:text-sm font-semibold text-[#C94C71] hover:text-[#A83256] underline underline-offset-4"
                >
                  {t.ctaJoinNow}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Inspiring Story Interactive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#161114] rounded-3xl shadow-2xl border border-[#D4AF37]/35 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#D4AF37]/20 flex items-center justify-between bg-gradient-to-r from-[#FAF5EE] to-white dark:from-[#1D161B] dark:to-[#161114]">
              <div className="flex items-center gap-3">
                <img
                  src={photoUrl}
                  alt="مدام فاطمة"
                  onError={(e) => handleImageError(e, 'story')}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37]"
                />
                <div>
                  <h3 className="text-base font-bold text-[#2D2A26] dark:text-[#FAF7F2] font-serif-luxury">
                    قصة نجاح مدام فاطمة الكاملة
                  </h3>
                  <span className="text-xs text-[#C94C71] dark:text-[#E55B82] font-semibold">مؤسسة ماريا ستايل والقائدة الماسية</span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Narrative */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-sm leading-relaxed text-[#4A453F] dark:text-[#D1C5B8] whitespace-pre-line text-start">
              {cms.madameFatimaFullStory}
            </div>

            {/* Modal Footer with Action */}
            <div className="p-4 sm:p-6 border-t border-[#D4AF37]/20 bg-[#FAF7F2] dark:bg-[#120E11] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#7A6F65] dark:text-[#A8988B] font-medium">
                هل أنتِ جاهزة لتكوني قصة النجاح القادمة؟
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-full border border-gray-300 dark:border-[#D4AF37]/30 text-gray-700 dark:text-[#E2D8CE] hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {t.storyClose}
                </button>
                <button
                  onClick={scrollToJoin}
                  className="flex-1 sm:flex-initial px-5 py-2 text-xs font-bold text-white rounded-full rose-gold-gradient shadow-md hover:scale-[1.02]"
                >
                  انضمي لفريقي الآن ✨
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
