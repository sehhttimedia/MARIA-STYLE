import { Language } from '../types';

export interface TranslationDictionary {
  // Navigation & General
  navHome: string;
  navAbout: string;
  navStore: string;
  navRoadmap: string;
  navReviews: string;
  navJoinTeam: string;
  navBooking: string;
  navAwards: string;
  navAdmin: string;
  ctaJoinNow: string;
  ctaBookVip: string;
  ctaShopNow: string;
  tagline: string;
  currency: string;
  
  // Hero
  heroBadge: string;
  heroTitle1: string;
  heroTitleHighlight: string;
  heroTitle2: string;
  heroSubtitle: string;
  heroStatMembers: string;
  heroStatMembersLabel: string;
  heroStatSales: string;
  heroStatSalesLabel: string;
  heroStatSatisfaction: string;
  heroStatSatisfactionLabel: string;
  
  // Madame Fatima Story
  storyBadge: string;
  storyTitle: string;
  storySubtitle: string;
  storyQuote: string;
  storyReadMore: string;
  storyClose: string;
  storyRole: string;
  
  // Cosmetic Store
  storeBadge: string;
  storeTitle: string;
  storeSubtitle: string;
  categoryAll: string;
  categorySkincare: string;
  categoryHaircare: string;
  categoryFragrance: string;
  categoryMakeup: string;
  categoryWellness: string;
  categoryBundles: string;
  btnOrderWhatsApp: string;
  btnQuickView: string;
  ingredientsLabel: string;
  howToUseLabel: string;
  inStockBadge: string;
  outOfStockBadge: string;
  attributedBy: string;

  // Roadmap Section
  roadmapBadge: string;
  roadmapTitle: string;
  roadmapSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;

  // MLM Join Form
  mlmBadge: string;
  mlmTitle: string;
  mlmSubtitle: string;
  fieldFullName: string;
  fieldPhone: string;
  fieldCountry: string;
  fieldCity: string;
  fieldCompany: string;
  fieldExperience: string;
  fieldHours: string;
  fieldMotivation: string;
  fieldAttributionCode: string;
  btnSubmitMlm: string;
  submittingText: string;
  successTitleMlm: string;
  successDescMlm: string;

  // VIP Booking
  bookingBadge: string;
  bookingTitle: string;
  bookingSubtitle: string;
  fieldConsultationType: string;
  fieldPreferredDate: string;
  fieldPreferredTime: string;
  fieldNotes: string;
  btnSubmitBooking: string;
  successTitleBooking: string;
  successDescBooking: string;

  // Testimonials
  reviewsBadge: string;
  reviewsTitle: string;
  reviewsSubtitle: string;
  tabProductReviews: string;
  tabMlmStories: string;

  // Awards
  awardsBadge: string;
  awardsTitle: string;
  awardsSubtitle: string;

  // Footer & Trust
  footerAbout: string;
  footerQuickLinks: string;
  footerContact: string;
  footerRights: string;
  antiSpamNotice: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  ar: {
    navHome: 'الرئيسية',
    navAbout: 'قصة نجاحي',
    navStore: 'متجر الكوزمتك',
    navRoadmap: 'مسار الريادة',
    navReviews: 'التجارب والآراء',
    navJoinTeam: 'انضمي لفريقي',
    navBooking: 'استشارة VIP',
    navAwards: 'التكريمات والجوائز',
    navAdmin: 'لوحة التحكم',
    ctaJoinNow: 'انضمي لفريقي الآن',
    ctaBookVip: 'احجزي استشارتك المجانية',
    ctaShopNow: 'تسوقي المنتجات الفاخرة',
    tagline: 'عالمكِ الخاص للجمال الملكي والحرية المالية',
    currency: 'ليرة',

    heroBadge: '✨ الفرصة الاستثنائية لعام 2026 مع فريقي Alialyna & HomeLife',
    heroTitle1: 'تألقي بجمالكِ، واصنعي',
    heroTitleHighlight: 'ثروتكِ واستقلالكِ المالي',
    heroTitle2: 'من منزلكِ مع ماريا ستايل',
    heroSubtitle: 'انضمي إلى نخبة رائدات الأعمال في تركيا والعالم العربي. نقدم لكِ أفضل مستحضرات التجميل والعناية الفاخرة، مع تدريب مجاني شامل ومباشر برئاسة مدام فاطمة لتحقيق أرباح شهرية متنامية وتكريمات دولية.',
    heroStatMembers: '+3,500',
    heroStatMembersLabel: 'عضوة ناجحة في فريقي',
    heroStatSales: '+480,000$',
    heroStatSalesLabel: 'أرباح وعمولات محققة',
    heroStatSatisfaction: '99.4%',
    heroStatSatisfactionLabel: 'رضا العميلات والشريكات',

    storyBadge: '👑 من أنا؟ قصة إلهام حقيقية',
    storyTitle: 'رحلتي من الصفر إلى قمة ريادة الأعمال',
    storySubtitle: 'مع مدام فاطمة - القائدة الماسية ومؤسسة ماريا ستايل',
    storyQuote: '“لم يكن النجاح يوماً ضربة حظ، بل كان إيماناً لا يتزعزع بأن لكل امرأة قوة كامنة تستحق أن تتحول إلى استقلال مالي وهيبة تستحقها.”',
    storyReadMore: 'اقرئي قصتي الكاملة مع Alialyna & HomeLife',
    storyClose: 'إغلاق القصة',
    storyRole: 'القائدة الماسية ومؤسسة ماريا ستايل',

    storeBadge: '💎 مستحضرات حصرية فاخرة',
    storeTitle: 'تشكيلة العناية الملكية والجمال الفائق',
    storeSubtitle: 'مستحضرات طبيعية معتمدة بتركيبات أوروبية تمنحكِ إشراقة لا تضاهى وتضمن رضاكِ التام.',
    categoryAll: 'كافة المنتجات',
    categorySkincare: 'العناية بالبشرة',
    categoryHaircare: 'العناية بالشعر',
    categoryFragrance: 'العطور الملكية',
    categoryMakeup: 'المكياج الاحترافي',
    categoryWellness: 'الصحة والرشاقة',
    categoryBundles: 'الباقات الاقتصادية',
    btnOrderWhatsApp: 'اطلبي الآن عبر واتساب',
    btnQuickView: 'تفاصيل المنتج',
    ingredientsLabel: 'المكونات الفعالة',
    howToUseLabel: 'طريقة الاستخدام المثالية',
    inStockBadge: 'متوفر فوراً',
    outOfStockBadge: 'قريباً مجدداً',
    attributedBy: 'برعاية العضوة المعتمدة:',

    roadmapBadge: '🚀 خطوتكِ الأولى نحو القمة',
    roadmapTitle: 'خارطة طريق النجاح المالي والريادة',
    roadmapSubtitle: 'منهجية مجربة خطوة بخطوة تضمن انطلاقتكِ القوية وتحقيق أول أرباحكِ خلال أول 30 يوماً.',
    step1Title: '1. التسجيل واختيار الشركة المناسبة',
    step1Desc: 'حددي وجهتكِ بين Alialyna (المتخصصة بالجمال والعطور الفاخرة) أو HomeLife (العناية الشاملة والمنزلية والرشاقة). سنساعدكِ في اختيار الأنسب لطموحكِ.',
    step2Title: '2. أكاديمية التدريب والمتابعة الخاصة',
    step2Desc: 'دخول فوري لأكاديمية ماريا ستايل المغلقة: كورس التسويق عبر وسائل التواصل، أساليب الإقناع، وبناء الفريق مع متابعة شخصية من مدام فاطمة.',
    step3Title: '3. انطلاقة المبيعات والأرباح اليومية',
    step3Desc: 'استلمي مواد التسويق الاحترافية (فيديوهات وصور إعلانية جاهزة) وابدئي في استقبال طلباتكِ وعمولاتكِ المباشرة من اليوم الأول.',
    step4Title: '4. التكريم والرحلات والحرية المالية',
    step4Desc: 'ترقي في رتب القيادة لتحصلي على عوائد سنوية، سيارات وتكريمات في أرقى المؤتمرات الدولية بتركيا وخارجها.',

    mlmBadge: '🌟 باب الانضمام مفتوح لفترة محدودة',
    mlmTitle: 'استمارة الانضمام لفريق ماريا ستايل الذهبي',
    mlmSubtitle: 'املئي بياناتكِ بدقة وسنتواصل معكِ خلال دقائق لبدء رحلة التغيير وتحديد خطتكِ المالية المخصصة مجاناً.',
    fieldFullName: 'الاسم الكامل الثلاثي *',
    fieldPhone: 'رقم الهاتف والواتساب (مع كود الدولة) *',
    fieldCountry: 'الدولة ومكان الإقامة *',
    fieldCity: 'المدينة / المحافظة *',
    fieldCompany: 'الشركة التي تودين الانطلاق معها *',
    fieldExperience: 'مستوى خبرتكِ السابقة في التسويق *',
    fieldHours: 'كم ساعة يمكنكِ تخصيصها يومياً لمشروعكِ؟ *',
    fieldMotivation: 'ما هو حلمكِ أو دخلكِ الشهري المستهدف؟',
    fieldAttributionCode: 'كود العضوة الراعية أو الدعوة (إن وجد)',
    btnSubmitMlm: 'أرسلي طلبي وابدئي تدريبي الآن ✨',
    submittingText: 'جاري التحقق والإرسال الآمن...',
    successTitleMlm: 'تهانينا الحارة! تم استلام طلبكِ بنجاح 🎉',
    successDescMlm: 'أهلاً بكِ في عائلة ماريا ستايل. تم تحويل بياناتكِ إلى منسقة الفريق ومدام فاطمة وسنتواصل معكِ فوراً عبر الواتساب لتفعيل حسابكِ وإرسال دليل الانطلاقة.',

    bookingBadge: '🗓️ استشارة حصرية مجانية 1-on-1',
    bookingTitle: 'احجزي جلستكِ الاستشارية الخاصة VIP',
    bookingSubtitle: 'جلسة خاصة مدتها 25 دقيقة لتحليل روتينكِ الجمالي أو رسم خطة عمل لمشروعكِ الاستثماري مع مستشارينا.',
    fieldConsultationType: 'نوع الاستشارة المطلوبة *',
    fieldPreferredDate: 'التاريخ المفضل *',
    fieldPreferredTime: 'الوقت المفضل *',
    fieldNotes: 'ملاحظات إضافية أو أسئلة محددة',
    btnSubmitBooking: 'تأكيد حجز موعدي VIP 💎',
    successTitleBooking: 'تم تأكيد طلب الحجز بنجاح! 🌟',
    successDescBooking: 'تم حجز موعدكِ المبدئي. سيصلكِ تأكيد عبر الواتساب مع رابط الجلسة الخاصة قبل الموعد المحدد.',

    reviewsBadge: '❤️ ثقة لا تتزعزع',
    reviewsTitle: 'تجارب حقيقية وقصص نجاح من واقع الفريق',
    reviewsSubtitle: 'شاهدي كيف غيرت ماريا ستايل حياة آلاف السيدات ورفعت ثقتهن بأنفسهن وأوضاعهن المالية.',
    tabProductReviews: 'آراء عاشقات المنتجات (العميلات)',
    tabMlmStories: 'قصص نجاح عضوات فريقي (Alialyna & HomeLife)',

    awardsBadge: '🏆 الفخر والريادة',
    awardsTitle: 'التكريمات الدولية والمؤتمرات الكبرى',
    awardsSubtitle: 'لحظات استثنائية لصعود المنصات وتكريم بطلات الفريق في إسطنبول وأنطاليا ودول الخليج.',

    footerAbout: 'منصة ماريا ستايل برئاسة مدام فاطمة، الشريك الاستراتيجي والقيادي لشركتي Alialyna و HomeLife في تركيا والشرق الأوسط، المتخصصة في أرقى منتجات الجمال وبناء فرق ريادة الأعمال النسائية.',
    footerQuickLinks: 'روابط هامة وسريعة',
    footerContact: 'قنوات التواصل والدعم الفوري',
    footerRights: 'جميع الحقوق محفوظة © 2026 ماريا ستايل (MARIA STYLE) - مرخصة ومسجلة نظامياً.',
    antiSpamNotice: '🔒 محمي بنظام Zero-Knowledge وتشفير فائق ضد هجمات السبام والاختراق.',
  },
  tr: {
    navHome: 'Ana Sayfa',
    navAbout: 'Başarı Hikayesi',
    navStore: 'Kozmetik Mağazası',
    navRoadmap: 'Girişimcilik Yolu',
    navReviews: 'Yorumlar',
    navJoinTeam: 'Ekibe Katıl',
    navBooking: 'VIP Danışmanlık',
    navAwards: 'Ödüller',
    navAdmin: 'Yönetici Paneli',
    ctaJoinNow: 'Hemen Ekibime Katıl',
    ctaBookVip: 'Ücretsiz VIP Randevu Al',
    ctaShopNow: 'Ürünleri İncele',
    tagline: 'Kraliyet Güzelliği ve Finansal Özgürlük Dünyanız',
    currency: 'TL',

    heroBadge: '✨ 2026 Alialyna & HomeLife ile Olağanüstü Fırsat',
    heroTitle1: 'Güzelliğinizle Parlayın,',
    heroTitleHighlight: 'Finansal Özgürlüğünüzü',
    heroTitle2: 'Evinizden İnşa Edin',
    heroSubtitle: 'Madam Fatima liderliğinde Alialyna ve HomeLife ile Türkiye ve Arap dünyasındaki başarılı kadın girişimciler arasına katılın.',
    heroStatMembers: '+3.500',
    heroStatMembersLabel: 'Başarılı Ekip Üyesi',
    heroStatSales: '+480.000$',
    heroStatSalesLabel: 'Kazanılan Komisyon ve Satış',
    heroStatSatisfaction: '%99.4',
    heroStatSatisfactionLabel: 'Müşteri Memnuniyeti',

    storyBadge: '👑 Ben Kimim? Gerçek İlham',
    storyTitle: 'Sıfırdan Zirveye Girişimcilik Yolculuğum',
    storySubtitle: 'Madam Fatima ile - Elmas Lider & Maria Style Kurucusu',
    storyQuote: '“Başarı asla bir şans değil; her kadının içinde yatan gücün finansal özgürlüğe dönüşebileceğine olan sarsılmaz inançtır.”',
    storyReadMore: 'Hikayemin Tamamını Oku',
    storyClose: 'Kapat',
    storyRole: 'Elmas Lider & Maria Style Kurucusu',

    storeBadge: '💎 Özel Lüks Kozmetik',
    storeTitle: 'Kraliyet Bakımı ve Üstün Güzellik Koleksiyonu',
    storeSubtitle: 'Avrupa formüllü doğal içeriklerimizle benzersiz ışıltınızı ortaya çıkarın.',
    categoryAll: 'Tüm Ürünler',
    categorySkincare: 'Cilt Bakımı',
    categoryHaircare: 'Saç Bakımı',
    categoryFragrance: 'Parfüm',
    categoryMakeup: 'Makyaj',
    categoryWellness: 'Sağlık & Zindelik',
    categoryBundles: 'Avantajlı Paketler',
    btnOrderWhatsApp: "WhatsApp'tan Sipariş Ver",
    btnQuickView: 'Ürün Detayı',
    ingredientsLabel: 'Aktif İçerikler',
    howToUseLabel: 'Kullanım Önerisi',
    inStockBadge: 'Stokta Var',
    outOfStockBadge: 'Tükendi',
    attributedBy: 'Öneren Temsilci:',

    roadmapBadge: '🚀 Zirveye İlk Adımınız',
    roadmapTitle: 'Başarı ve Finansal Özgürlük Haritası',
    roadmapSubtitle: 'İlk 30 gününüzde kazanç sağlamanız için adım adım rehberlik.',
    step1Title: '1. Kayıt ve Şirket Seçimi',
    step1Desc: 'Alialyna veya HomeLife şirketlerinden size en uygun olanını seçin.',
    step2Title: '2. Özel Eğitim Akademisi',
    step2Desc: 'Madam Fatima eşliğinde sosyal medya ve satış eğitimleri.',
    step3Title: '3. Günlük Satış ve Kazanç',
    step3Desc: 'Hazır reklam materyalleriyle ilk günden komisyon kazanmaya başlayın.',
    step4Title: '4. Ödüller, Seyahatler ve Liderlik',
    step4Desc: 'Uluslararası etkinliklerde sahneye çıkın ve ödüllerinizi alın.',

    mlmBadge: '🌟 Başvurular Kısa Süre İçin Açık',
    mlmTitle: 'Maria Style Altın Ekip Başvuru Formu',
    mlmSubtitle: 'Bilgilerinizi doldurun, birkaç dakika içinde sizinle iletişime geçelim.',
    fieldFullName: 'Adınız Soyadınız *',
    fieldPhone: 'Telefon & WhatsApp Numaranız *',
    fieldCountry: 'Ülke *',
    fieldCity: 'Şehir *',
    fieldCompany: 'Başlamak İstediğiniz Şirket *',
    fieldExperience: 'Pazarlama Deneyiminiz *',
    fieldHours: 'Günlük Ayırabileceğiniz Süre *',
    fieldMotivation: 'Aylık Kazanç Hedefiniz',
    fieldAttributionCode: 'Referans veya Davet Kodu',
    btnSubmitMlm: 'Başvurumu Gönder ve Eğitime Başla ✨',
    submittingText: 'Güvenli gönderiliyor...',
    successTitleMlm: 'Tebrikler! Başvurunuz Alındı 🎉',
    successDescMlm: 'Maria Style ailesine hoş geldiniz. Ekibimiz sizinle WhatsApp üzerinden derhal iletişime geçecektir.',

    bookingBadge: '🗓️ Özel 1-e-1 Danışmanlık',
    bookingTitle: 'VIP Randevunuzu Alın',
    bookingSubtitle: '25 dakikalık özel cilt veya iş planı danışmanlığı.',
    fieldConsultationType: 'Danışmanlık Türü *',
    fieldPreferredDate: 'Tercih Edilen Tarih *',
    fieldPreferredTime: 'Tercih Edilen Saat *',
    fieldNotes: 'Ekstra Notlar veya Sorularınız',
    btnSubmitBooking: 'Randevumu Onayla 💎',
    successTitleBooking: 'Randevu Talebiniz Alındı! 🌟',
    successDescBooking: 'Randevu detayları WhatsApp üzerinden iletilecektir.',

    reviewsBadge: '❤️ Sarsılmaz Güven',
    reviewsTitle: 'Gerçek Deneyimler ve Başarı Hikayeleri',
    reviewsSubtitle: 'Ekibimizin kazandığı başarıları keşfedin.',
    tabProductReviews: 'Müşteri Deneyimleri',
    tabMlmStories: 'Ekip Üyelerinin Başarıları',

    awardsBadge: '🏆 Gurur ve Liderlik',
    awardsTitle: 'Uluslararası Ödüllerimiz',
    awardsSubtitle: 'İstanbul ve Antalya sahnelerindeki gurur anlarımız.',

    footerAbout: 'Madam Fatima liderliğinde Alialyna ve HomeLife stratejik iş ortağı Maria Style platformu.',
    footerQuickLinks: 'Hızlı Bağlantılar',
    footerContact: 'İletişim & Destek',
    footerRights: 'Tüm Hakları Saklıdır © 2026 MARIA STYLE.',
    antiSpamNotice: '🔒 Zero-Knowledge güvenlik ve spam koruması aktiftir.',
  },
  en: {
    navHome: 'Home',
    navAbout: 'Success Story',
    navStore: 'Cosmetics Store',
    navRoadmap: 'Success Roadmap',
    navReviews: 'Reviews & Stories',
    navJoinTeam: 'Join My Team',
    navBooking: 'VIP Booking',
    navAwards: 'Awards',
    navAdmin: 'Admin Dashboard',
    ctaJoinNow: 'Join My Team Now',
    ctaBookVip: 'Book Free VIP Session',
    ctaShopNow: 'Shop Luxury Products',
    tagline: 'Your Royal Realm of Beauty and Financial Freedom',
    currency: 'USD',

    heroBadge: '✨ Exceptional 2026 Opportunity with Alialyna & HomeLife',
    heroTitle1: 'Radiate with Beauty, Create Your',
    heroTitleHighlight: 'Financial Freedom & Wealth',
    heroTitle2: 'From Home with Maria Style',
    heroSubtitle: 'Join elite female entrepreneurs across Turkey and the Arab world. Get premium cosmetics, free 1-on-1 coaching by Madame Fatima, growing monthly profits, and international recognition.',
    heroStatMembers: '+3,500',
    heroStatMembersLabel: 'Successful Team Members',
    heroStatSales: '+$480,000',
    heroStatSalesLabel: 'Commissions & Sales Achieved',
    heroStatSatisfaction: '99.4%',
    heroStatSatisfactionLabel: 'Customer & Partner Satisfaction',

    storyBadge: '👑 Who Am I? Real Inspiration',
    storyTitle: 'My Journey from Scratch to Entrepreneurial Summit',
    storySubtitle: 'With Madame Fatima - Diamond Leader & Founder of Maria Style',
    storyQuote: '“Success was never sheer luck; it was an unwavering belief that every woman possesses untapped strength to achieve financial sovereignty.”',
    storyReadMore: 'Read My Full Inspiring Story',
    storyClose: 'Close Story',
    storyRole: 'Diamond Leader & Founder of Maria Style',

    storeBadge: '💎 Exclusive Luxury Care',
    storeTitle: 'Royal Skincare & High-End Cosmetics',
    storeSubtitle: 'Certified European natural formulas providing unmatched radiance and guaranteed elegance.',
    categoryAll: 'All Products',
    categorySkincare: 'Skincare',
    categoryHaircare: 'Haircare',
    categoryFragrance: 'Royal Fragrance',
    categoryMakeup: 'Professional Makeup',
    categoryWellness: 'Wellness & Shape',
    categoryBundles: 'Value Bundles',
    btnOrderWhatsApp: 'Order via WhatsApp',
    btnQuickView: 'Quick View',
    ingredientsLabel: 'Active Ingredients',
    howToUseLabel: 'How to Use',
    inStockBadge: 'In Stock',
    outOfStockBadge: 'Sold Out',
    attributedBy: 'Sponsored by Member:',

    roadmapBadge: '🚀 Your First Step to the Top',
    roadmapTitle: 'The Proven Roadmap to Wealth and Leadership',
    roadmapSubtitle: 'Step-by-step guidance ensuring your first profits within your first 30 days.',
    step1Title: '1. Registration & Company Choice',
    step1Desc: 'Choose between Alialyna (luxury beauty & fragrance) or HomeLife (wellness & holistic household care). We help you pick the best fit.',
    step2Title: '2. Private Academy & 1-on-1 Mentorship',
    step2Desc: 'Instant access to Maria Style Private Academy with personal mentorship from Madame Fatima.',
    step3Title: '3. Launch Sales & Daily Profits',
    step3Desc: 'Receive turnkey promotional videos, ads, and product assets to start earning commissions from Day 1.',
    step4Title: '4. Recognition, Global Trips & Royalties',
    step4Desc: 'Climb leadership ranks to earn yearly incentives, cars, and gala recognitions in luxury conventions.',

    mlmBadge: '🌟 Limited Enrollment Window',
    mlmTitle: 'Maria Style Golden Team Application',
    mlmSubtitle: 'Fill your details accurately and our leadership team will reach out within minutes to start your personalized plan.',
    fieldFullName: 'Full Name *',
    fieldPhone: 'Phone & WhatsApp (with country code) *',
    fieldCountry: 'Country of Residence *',
    fieldCity: 'City / State *',
    fieldCompany: 'Preferred Company to Launch With *',
    fieldExperience: 'Previous Marketing Experience *',
    fieldHours: 'Hours You Can Dedicate Daily *',
    fieldMotivation: 'Target Monthly Income or Dream',
    fieldAttributionCode: 'Referral or Sponsor Code (Optional)',
    btnSubmitMlm: 'Submit Application & Start Training ✨',
    submittingText: 'Submitting securely...',
    successTitleMlm: 'Congratulations! Application Received 🎉',
    successDescMlm: 'Welcome to Maria Style family. Madame Fatima and team will contact you on WhatsApp shortly.',

    bookingBadge: '🗓️ Exclusive 1-on-1 Consultation',
    bookingTitle: 'Book Your VIP Consultation Session',
    bookingSubtitle: 'A 25-minute private session to analyze your skin routine or design your business blueprint.',
    fieldConsultationType: 'Consultation Topic *',
    fieldPreferredDate: 'Preferred Date *',
    fieldPreferredTime: 'Preferred Time *',
    fieldNotes: 'Additional Notes or Specific Inquiries',
    btnSubmitBooking: 'Confirm VIP Booking 💎',
    successTitleBooking: 'Booking Confirmed Successfully! 🌟',
    successDescBooking: 'Your appointment is reserved. WhatsApp confirmation with meeting link will arrive shortly.',

    reviewsBadge: '❤️ Unshakable Trust',
    reviewsTitle: 'Real Testimonials and Success Proof',
    reviewsSubtitle: 'Discover how Maria Style transformed thousands of lives.',
    tabProductReviews: 'Cosmetic Lovers Reviews',
    tabMlmStories: 'Team Members Success Stories',

    awardsBadge: '🏆 Pride & Excellence',
    awardsTitle: 'International Conventions & Grand Galas',
    awardsSubtitle: 'Celebrating our top female leaders in Istanbul, Antalya, and beyond.',

    footerAbout: 'Maria Style platform led by Madame Fatima, premier strategic leader for Alialyna and HomeLife in Turkey and the MENA region.',
    footerQuickLinks: 'Quick Links',
    footerContact: 'Contact & Instant Support',
    footerRights: 'All Rights Reserved © 2026 MARIA STYLE.',
    antiSpamNotice: '🔒 Zero-Knowledge security and submit throttling active.',
  },
};
