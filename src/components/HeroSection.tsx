import React from 'react';
import { useApp } from '../context/AppContext';
import { normalizeDriveUrl, handleImageError } from '../utils/drive';
import { Sparkles, ArrowDown, Award, TrendingUp, Users, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { t, cms, language } = useApp();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
      {/* Subtle Luxury Gradient Mesh Background */}
      <div className="absolute top-1/4 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#C94C71]/15 via-[#D4AF37]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Copy (Column 1-7) */}
          <div className="lg:col-span-7 text-center lg:text-start">
            {/* Urgency / Launch Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/40 bg-gradient-to-r from-[#FAF7F2] to-[#FFF9F0] dark:from-[#261E23] dark:to-[#1C1619] text-[#C94C71] dark:text-[#F4E8C1] text-xs font-semibold shadow-sm mb-6 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{cms.heroBadge || t.heroBadge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5.5xl font-extrabold leading-[1.25] text-[#2D2A26] dark:text-white mb-6">
              {t.heroTitle1}{' '}
              <span className="block mt-2 font-serif-luxury bg-gradient-to-r from-[#C94C71] via-[#D4AF37] to-[#A83256] bg-clip-text text-transparent">
                {t.heroTitleHighlight}
              </span>{' '}
              {t.heroTitle2}
            </h1>

            {/* Persuasive Marketing Subtitle */}
            <p className="text-base sm:text-lg text-[#5A524A] dark:text-[#D1C5B8] leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
              {cms.heroSubtitle || t.heroSubtitle}
            </p>

            {/* Conversion Triggers: Value Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-w-xl mx-auto lg:mx-0 text-xs sm:text-sm text-[#443E38] dark:text-[#FAF7F2]">
              <div className="flex items-center gap-2 bg-white/70 dark:bg-[#161114]/90 backdrop-blur-sm p-2.5 rounded-xl border border-[#D4AF37]/20 dark:border-[#D4AF37]/30 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#C94C71] dark:text-[#E55B82] shrink-0" />
                <span>تدريب مباشر وأكاديمية تسويقية مجانية</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 dark:bg-[#161114]/90 backdrop-blur-sm p-2.5 rounded-xl border border-[#D4AF37]/20 dark:border-[#D4AF37]/30 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] dark:text-[#E5C358] shrink-0" />
                <span>أرباح فورية وعمولات متصاعدة بالدولار والليرة</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 dark:bg-[#161114]/90 backdrop-blur-sm p-2.5 rounded-xl border border-[#D4AF37]/20 dark:border-[#D4AF37]/30 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] dark:text-[#E5C358] shrink-0" />
                <span>كتالوج منتجات أوروبية مرخصة ومطلوبة يومياً</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 dark:bg-[#161114]/90 backdrop-blur-sm p-2.5 rounded-xl border border-[#D4AF37]/20 dark:border-[#D4AF37]/30 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#C94C71] dark:text-[#E55B82] shrink-0" />
                <span>فرص تكريم وسفر ورحلات دولية سنوية</span>
              </div>
            </div>

            {/* High-Impact CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => scrollTo('join-team')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full text-base font-bold text-white rose-gold-gradient shadow-lg shadow-[#C94C71]/30 hover:shadow-xl hover:shadow-[#C94C71]/50 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2.5 shimmer-effect"
              >
                <Sparkles className="w-4 h-4 text-[#F4E8C1]" />
                <span>{t.ctaJoinNow}</span>
              </button>

              <button
                onClick={() => scrollTo('booking')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-bold border border-[#D4AF37] text-[#2D2A26] dark:text-[#FAF7F2] bg-white/60 dark:bg-[#161114] hover:bg-[#D4AF37]/15 dark:hover:bg-[#D4AF37]/20 hover:border-[#C94C71] dark:hover:border-[#D4AF37] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>{t.ctaBookVip}</span>
              </button>

              <button
                onClick={() => scrollTo('store')}
                className="text-xs sm:text-sm font-semibold text-[#C94C71] hover:text-[#A83256] underline underline-offset-4 transition-colors py-2"
              >
                {t.ctaShopNow}
              </button>
            </div>

            {/* Social Proof Trust Statistics */}
            <div className="mt-12 pt-8 border-t border-[#D4AF37]/20 grid grid-cols-3 gap-4 text-center lg:text-start">
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold text-[#C94C71] font-serif-luxury">
                  {t.heroStatMembers}
                </span>
                <span className="text-xs font-medium text-[#7A6F65] dark:text-[#B2A497]">
                  {t.heroStatMembersLabel}
                </span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold text-[#D4AF37] font-serif-luxury">
                  {t.heroStatSales}
                </span>
                <span className="text-xs font-medium text-[#7A6F65] dark:text-[#B2A497]">
                  {t.heroStatSalesLabel}
                </span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold text-[#2D2A26] dark:text-white font-serif-luxury">
                  {t.heroStatSatisfaction}
                </span>
                <span className="text-xs font-medium text-[#7A6F65] dark:text-[#B2A497]">
                  {t.heroStatSatisfactionLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Showcase (Column 8-12) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Frame Aura */}
            <div className="relative w-full max-w-md">
              {/* Background Glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#C94C71] via-[#D4AF37] to-[#C94C71] rounded-3xl opacity-20 blur-2xl animate-pulse" />

              {/* Main Card */}
              <div className="relative rounded-3xl overflow-hidden glass-luxury shadow-2xl p-6 sm:p-8 border border-[#D4AF37]/30 text-center">
                {/* Official Logo Banner */}
                <div className="flex justify-center mb-6">
                  <img
                    src={normalizeDriveUrl(cms.logoUrl, 'logo')}
                    alt="Maria Style Emblem"
                    onError={(e) => handleImageError(e, 'logo')}
                    className="h-28 sm:h-32 object-contain drop-shadow-md animate-float"
                  />
                </div>

                <h3 className="text-xl font-bold font-serif-luxury text-[#2D2A26] dark:text-white mb-2">
                  ماريا ستايل | MARIA STYLE
                </h3>
                <p className="text-xs text-[#C94C71] font-semibold mb-6">
                  التحالف الأقوى مع Alialyna &amp; HomeLife
                </p>

                {/* Dual Company Card Comparison Pill */}
                <div className="grid grid-cols-2 gap-3 mb-6 text-start">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#FAF5EE] to-white dark:from-[#181316] dark:to-[#120E10] border border-[#C94C71]/30 dark:border-[#C94C71]/40 shadow-sm">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#C94C71] text-white mb-1.5 shadow-sm">
                      Alialyna
                    </span>
                    <h4 className="text-xs font-bold text-[#2D2A26] dark:text-[#FAF7F2]">الجمال والعطور</h4>
                    <p className="text-[11px] text-[#7A6F65] dark:text-[#C5B7A9] mt-1 leading-snug">
                      مستحضرات عناية ملكية، مضادة للشيخوخة بتركيبات نقية.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#FAF5EE] to-white dark:from-[#181316] dark:to-[#120E10] border border-[#D4AF37]/30 dark:border-[#D4AF37]/40 shadow-sm">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37] text-[#1E191C] mb-1.5 shadow-sm">
                      HomeLife
                    </span>
                    <h4 className="text-xs font-bold text-[#2D2A26] dark:text-[#FAF7F2]">الصحة والمنزل</h4>
                    <p className="text-[11px] text-[#7A6F65] dark:text-[#C5B7A9] mt-1 leading-snug">
                      منظفات عضوية، منتجات رشاقة، استهلاك مستمر.
                    </p>
                  </div>
                </div>

                {/* Fast Action */}
                <button
                  onClick={() => scrollTo('join-team')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C94C71] to-[#D4AF37] text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity"
                >
                  اكتشفي الشركة الأنسب لطاقتكِ الآن ✦
                </button>
              </div>

              {/* Floating Trophy Badge */}
              <div className="absolute -top-4 -end-3 bg-white dark:bg-[#161114] rounded-2xl p-3 border border-[#D4AF37]/40 dark:border-[#D4AF37]/40 shadow-2xl flex items-center gap-2.5 animate-bounce duration-1000">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <span className="block text-[10px] font-bold text-[#2D2A26] dark:text-[#FAF7F2]">
                    المرتبة الأولى 2026
                  </span>
                  <span className="block text-[9px] text-[#C94C71] dark:text-[#E55B82] font-semibold">الفريق الماسي الأسرع نمواً</span>
                </div>
              </div>

              {/* Floating Commission Badge */}
              <div className="absolute -bottom-4 -start-3 bg-white dark:bg-[#161114] rounded-2xl p-3 border border-[#C94C71]/40 dark:border-[#C94C71]/40 shadow-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#C94C71]/20 flex items-center justify-center text-[#C94C71] dark:text-[#E55B82]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <span className="block text-[10px] font-bold text-[#2D2A26] dark:text-[#FAF7F2]">
                    عمولات متنامية فورية
                  </span>
                  <span className="block text-[9px] text-[#D4AF37] dark:text-[#E5C358] font-semibold">من اليوم الأول في الفريق</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
