import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Star, Quote, Award, Heart, CheckCircle2 } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState<'products' | 'mlm'>('mlm');

  const productReviews = [
    {
      id: 1,
      name: 'هناء السليمان',
      city: 'الرياض، السعودية',
      product: 'سيروم الذهب 24K والكولاجين',
      rating: 5,
      review: 'أقسم بالله فرقت بشرتي من أول أسبوع! المسام صغرت والتجاعيد التعبيرية اختفت ونضارة غير طبيعية، الكل يسألني وش مسوية بوجهك. شكراً ماريا ستايل!',
      date: 'منذ 3 أيام',
    },
    {
      id: 2,
      name: 'Burcu Aksoy',
      city: 'İstanbul, Türkiye',
      product: 'عطر ماريا ستايل الملكي',
      rating: 5,
      review: 'Kokusuna tek kelimeyle aşık oldum! Kıyafetlerimde günlerce kalıyor ve inanılmaz asil bir havası var. Siparişim 24 saat içinde teslim edildi.',
      date: 'Hafta önce',
    },
    {
      id: 3,
      name: 'دانة الشريف',
      city: 'جدة، السعودية',
      product: 'كريم التفتيح الماسي وتوحيد اللون',
      rating: 5,
      review: 'كنت أعاني من تصبغات الشمس الشديدة في الوجه والرقبة، الكريم خفيف جداً وملمسه حريري وبدون أي تحسس، النتيجة واضحة جداً وتستاهل كل ليرة!',
      date: 'منذ 5 أيام',
    },
  ];

  const mlmStories = [
    {
      id: 1,
      name: 'نور الهدى إبراهيم',
      rank: 'Ruby Director - شركة Alialyna',
      location: 'إسطنبول',
      earnings: '+10,800 TL شهرياً',
      story: 'بدأت بدون أي خبرة تسويقية، كنت ربة منزل وأريد مساعدة زوجي. مدام فاطمة وأكاديمية ماريا ستايل دربوني خطوة بخطوة بالصور والفيديوهات. خلال 6 أشهر سددت كل ديوني وأصبحت أملك فريقي الخاص!',
      badge: 'قصة نجاح Alialyna ⭐',
    },
    {
      id: 2,
      name: 'ريم العتيبي',
      rank: 'Emerald Leader - شركة HomeLife',
      location: 'الدمام',
      earnings: '+3,200$ شهرياً',
      story: 'منتجات هوم لايف الصحية والعضوية مريحة جداً ومطلوبة بكل بيت. بفضل الدعم المستمر والتوجيه الاحترافي، حققت المرتبة الزمردية واستلمت جائزة التميز السنوي مع الفريق!',
      badge: 'قصة نجاح HomeLife 🌿',
    },
    {
      id: 3,
      name: 'Ayşe Yılmaz',
      rank: 'Sapphire Manager',
      location: 'Bursa, Türkiye',
      earnings: '+8,500 TL ek gelir',
      story: 'Evden çıkmadan, sadece sosyal medya ve WhatsApp üzerinden çalışarak kendi maaşımı kazanıyorum. Madam Fatima’nın desteği paha biçilemez!',
      badge: 'Altın Başarı 👑',
    },
  ];

  return (
    <section id="reviews" className="py-16 sm:py-24 relative overflow-hidden bg-[#FAF5EE]/70 dark:bg-[#100D0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#D4AF37]/40 bg-white/70 dark:bg-[#161114] text-[#C94C71] dark:text-[#E55B82] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#E5C358]" />
            <span>{t.reviewsBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2D2A26] dark:text-[#FAF7F2] font-serif-luxury">
            {t.reviewsTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#7A6F65] dark:text-[#C5B7A9] mt-2">
            {t.reviewsSubtitle}
          </p>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-full glass-luxury border border-[#D4AF37]/30 shadow-md">
            <button
              onClick={() => setActiveTab('mlm')}
              className={`px-5 sm:px-8 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'mlm'
                  ? 'bg-gradient-to-r from-[#C94C71] to-[#D4AF37] text-white shadow-md'
                  : 'text-[#61574E] dark:text-[#C5B7A9] hover:text-[#C94C71]'
              }`}
            >
              {t.tabMlmStories}
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-5 sm:px-8 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-gradient-to-r from-[#C94C71] to-[#D4AF37] text-white shadow-md'
                  : 'text-[#61574E] dark:text-[#C5B7A9] hover:text-[#C94C71]'
              }`}
            >
              {t.tabProductReviews}
            </button>
          </div>
        </div>

        {/* Tab 1: MLM Leaders Success Stories */}
        {activeTab === 'mlm' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {mlmStories.map((item) => (
              <div
                key={item.id}
                className="glass-luxury rounded-3xl p-6 sm:p-7 border border-[#D4AF37]/30 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between text-start"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#C94C71]/15 text-[#C94C71]">
                      {item.badge}
                    </span>
                    <Quote className="w-6 h-6 text-[#D4AF37]/40" />
                  </div>

                  <p className="text-xs sm:text-sm text-[#4A453F] dark:text-[#D1C5B8] leading-relaxed italic mb-6">
                    “{item.story}”
                  </p>
                </div>

                <div className="pt-4 border-t border-[#D4AF37]/20 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#2D2A26] dark:text-white">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-[#C94C71] font-semibold block">
                      {item.rank}
                    </span>
                    <span className="text-[10px] text-gray-400">{item.location}</span>
                  </div>

                  <div className="text-end bg-[#D4AF37]/10 px-3 py-1.5 rounded-xl border border-[#D4AF37]/20">
                    <span className="block text-[10px] text-gray-500">العائد المكتسب</span>
                    <span className="text-xs font-black text-[#D4AF37]">{item.earnings}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Products Reviews */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {productReviews.map((item) => (
              <div
                key={item.id}
                className="glass-luxury rounded-3xl p-6 sm:p-7 border border-[#D4AF37]/30 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between text-start"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-[#D4AF37]">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400">{item.date}</span>
                  </div>

                  <span className="inline-block text-xs font-bold text-[#C94C71] mb-2">
                    المنتج: {item.product}
                  </span>

                  <p className="text-xs sm:text-sm text-[#4A453F] dark:text-[#D1C5B8] leading-relaxed mb-6">
                    “{item.review}”
                  </p>
                </div>

                <div className="pt-4 border-t border-[#D4AF37]/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#2D2A26] dark:text-white block">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-gray-400">{item.city}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#25D366] text-[11px] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>مشتري موثق</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
