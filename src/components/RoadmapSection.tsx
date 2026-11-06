import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, UserCheck, GraduationCap, Coins, Trophy, ChevronRight, Check } from 'lucide-react';

export const RoadmapSection: React.FC = () => {
  const { t } = useApp();
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      num: '01',
      title: t.step1Title,
      desc: t.step1Desc,
      icon: UserCheck,
      color: 'from-[#C94C71] to-[#A83256]',
      perks: [
        'تسجيل مجاني وبدون أي رسوم اشتراك خفية',
        'مقارنة شفافة لاختيار Alialyna أو HomeLife',
        'تخصيص كود التتبع الخاص بكِ فورياً',
      ],
    },
    {
      id: 2,
      num: '02',
      title: t.step2Title,
      desc: t.step2Desc,
      icon: GraduationCap,
      color: 'from-[#D4AF37] to-[#AA7A1E]',
      perks: [
        'دخول فوري لأكاديمية ماريا ستايل المغلقة',
        'حقيبة إعلانية احترافية (فيديوهات وصور جاهزة)',
        'لقاءات تدريب مباشرة 1-on-1 مع مدام فاطمة',
      ],
    },
    {
      id: 3,
      num: '03',
      title: t.step3Title,
      desc: t.step3Desc,
      icon: Coins,
      color: 'from-[#C94C71] to-[#D4AF37]',
      perks: [
        'عمولات بيع مباشر تصل حتى 35% إلى 50%',
        'مكافآت نمو الفريق وبناء الشبكة الاستهلاكية',
        'تحويل الأرباح دورياً وبأمان مصرفي تام',
      ],
    },
    {
      id: 4,
      num: '04',
      title: t.step4Title,
      desc: t.step4Desc,
      icon: Trophy,
      color: 'from-[#D4AF37] to-[#C94C71]',
      perks: [
        'صعود المنصات الدولية في أرقى مؤتمرات إسطنبول',
        'رحلات سياحية وكروز فاخر مدفوع التكاليف',
        'سيارات قيادية ودروع شرف ماسية',
      ],
    },
  ];

  return (
    <section id="roadmap" className="py-16 sm:py-24 relative overflow-hidden bg-[#FAF5EE]/50 dark:bg-[#100D0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#D4AF37]/40 bg-white/70 dark:bg-[#161114] text-[#C94C71] dark:text-[#E55B82] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#E5C358]" />
            <span>{t.roadmapBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2D2A26] dark:text-[#FAF7F2] font-serif-luxury">
            {t.roadmapTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#7A6F65] dark:text-[#C5B7A9] mt-2">
            {t.roadmapSubtitle}
          </p>
        </div>

        {/* Infographic Steps Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            const isSelected = activeStep === step.id;

            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`relative rounded-3xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                  isSelected
                    ? 'glass-luxury border-[#C94C71] dark:border-[#E55B82] shadow-2xl shadow-[#C94C71]/15 scale-[1.02] bg-white dark:bg-[#161114]'
                    : 'bg-white/60 dark:bg-[#140F12]/90 border-[#D4AF37]/25 dark:border-[#D4AF37]/20 hover:border-[#D4AF37] dark:hover:border-[#D4AF37]/50 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Step Header with Number & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-extrabold font-serif-luxury text-[#D4AF37]">
                      {step.num}
                    </span>
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md bg-gradient-to-tr ${step.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-base font-bold text-[#2D2A26] dark:text-white mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#6B6158] dark:text-[#BFAF9F] leading-relaxed mb-4">
                    {step.desc}
                  </p>
                </div>

                {/* Benefits / Perks */}
                <div className="pt-4 border-t border-[#D4AF37]/20">
                  <span className="block text-[11px] font-bold text-[#C94C71] mb-2 uppercase tracking-wider">
                    المزايا المكتسبة:
                  </span>
                  <ul className="space-y-1.5">
                    {step.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-[#4A453F] dark:text-[#D1C5B8]">
                        <Check className="w-3.5 h-3.5 text-[#25D366] shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Active Indicator */}
                <div className="mt-4 pt-2 flex items-center justify-end">
                  <span className={`text-[11px] font-semibold flex items-center gap-1 ${isSelected ? 'text-[#C94C71]' : 'text-gray-400'}`}>
                    <span>{isSelected ? 'المرحلة النشطة' : 'استعراض'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Roadmap Call to Action Strip */}
        <div className="mt-12 glass-luxury rounded-2xl p-6 border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
          <div>
            <h4 className="text-base font-bold text-[#2D2A26] dark:text-white">
              لا تنتظري الغد.. خطوتكِ الأولى تبدأ من هنا!
            </h4>
            <p className="text-xs text-[#7A6F65] dark:text-[#A8988B] mt-0.5">
              كل سيدة بدأت معنا كانت تتساءل مثلِك تماماً.. واليوم تحقق استقلالها المالي الكامل.
            </p>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('join-team');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white rose-gold-gradient shadow-md hover:scale-[1.02] shrink-0"
          >
            ابدئي الخطوة الأولى الآن ✨
          </button>
        </div>
      </div>
    </section>
  );
};
