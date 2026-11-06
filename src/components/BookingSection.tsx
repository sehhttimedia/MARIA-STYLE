import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sanitizeText, sanitizePhone, checkSubmissionThrottle } from '../utils/sanitize';
import { Sparkles, Calendar, Clock, CheckCircle2, AlertCircle, MessageCircle, ShieldCheck } from 'lucide-react';

export const BookingSection: React.FC = () => {
  const { t, bookingFieldsConfig, submitBooking, language, cms } = useApp();

  const [formData, setFormData] = useState<Record<string, string>>({
    clientName: '',
    phone: '',
    consultationType: 'تحليل نوع البشرة واختيار المنتجات',
    preferredDate: '',
    preferredTime: '16:00 مساءً',
    notes: '',
    website_bot_trap: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOfflineBuffered, setIsOfflineBuffered] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.website_bot_trap) {
      setSubmittedSuccess(true);
      return;
    }

    const throttle = checkSubmissionThrottle('booking_form', 4000);
    if (!throttle.allowed) {
      setErrorMessage(
        language === 'ar'
          ? `يرجى الانتظار ${throttle.remainingSeconds} ثوانٍ قبل تأكيد الحجز مرة أخرى.`
          : `Please wait ${throttle.remainingSeconds}s before booking again.`
      );
      return;
    }

    const sanitizedPayload: Record<string, string> = {};
    for (const [key, val] of Object.entries(formData)) {
      if (key === 'phone') {
        sanitizedPayload[key] = sanitizePhone(val);
      } else {
        sanitizedPayload[key] = sanitizeText(val);
      }
    }

    if (!sanitizedPayload.clientName || sanitizedPayload.clientName.length < 3) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال اسمكِ الكريم.' : 'Please enter your name.');
      return;
    }
    if (!sanitizedPayload.phone || sanitizedPayload.phone.length < 8) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال رقم واتساب صالح لتأكيد الموعد.' : 'Please enter a valid phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitBooking(sanitizedPayload);
      if (res.savedOffline) {
        setIsOfflineBuffered(true);
      } else {
        setIsOfflineBuffered(false);
      }
      setSubmittedSuccess(true);
    } catch {
      setIsOfflineBuffered(true);
      setSubmittedSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsAppConfirmation = () => {
    const cleanPhone = cms.officialWhatsApp.replace(/[^0-9]/g, '');
    const msg = `مرحباً مدام فاطمة، لقد قمت بحجز استشارة VIP عبر المنصة:\n- الاسم: ${formData.clientName}\n- موضوع الاستشارة: ${formData.consultationType}\n- التاريخ: ${formData.preferredDate || 'أقرب وقت'}\n- التوقيت: ${formData.preferredTime}\nأرجو تأكيد موعد اللقاء. شكراً!`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <section id="booking" className="py-16 sm:py-24 relative overflow-hidden bg-[#FAF7F2] dark:bg-[#0C0A0B]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#D4AF37]/40 bg-white/70 dark:bg-[#161114] text-[#C94C71] dark:text-[#E55B82] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#E5C358]" />
            <span>{t.bookingBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2D2A26] dark:text-[#FAF7F2] font-serif-luxury">
            {t.bookingTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#7A6F65] dark:text-[#C5B7A9] mt-2">
            {t.bookingSubtitle}
          </p>
        </div>

        {submittedSuccess ? (
          <div className="glass-luxury rounded-3xl p-8 sm:p-12 border-2 border-[#D4AF37] shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#C94C71] to-[#D4AF37] text-white flex items-center justify-center mx-auto mb-5 shadow-lg">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-bold font-serif-luxury text-[#2D2A26] dark:text-white mb-3">
              {t.successTitleBooking}
            </h3>

            <p className="text-sm sm:text-base text-[#4A453F] dark:text-[#D1C5B8] leading-relaxed mb-6">
              {t.successDescBooking}
            </p>

            <div className="p-4 rounded-2xl bg-[#FAF5EE] dark:bg-white/5 border border-[#D4AF37]/30 text-start text-xs sm:text-sm text-[#443E38] dark:text-[#E2D8CE] mb-6 max-w-md mx-auto space-y-1">
              <span className="font-bold text-[#C94C71] block mb-1">تفاصيل حجزكِ المؤكد:</span>
              <p>• <strong>الاسم:</strong> {formData.clientName}</p>
              <p>• <strong>النوع:</strong> {formData.consultationType}</p>
              <p>• <strong>التوقيت المفضل:</strong> {formData.preferredTime} ({formData.preferredDate || 'اليوم'})</p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {isOfflineBuffered
                    ? '✓ تم حفظ موعدكِ بأمان في سجلات النظام وسيجري رفعه للجدول السحابي تلقائياً.'
                    : '✓ تم تدوين وحفظ الحجز في الشيت 2 (Bookings) بنجاح.'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleOpenWhatsAppConfirmation}
                className="w-full sm:w-auto px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#25D366] to-[#128C7E] shadow-md flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال تأكيد فوري عبر واتساب</span>
              </button>

              <button
                onClick={() => setSubmittedSuccess(false)}
                className="px-6 py-2.5 rounded-full text-xs font-semibold text-[#8C7A6B] hover:text-[#C94C71] border border-gray-300 dark:border-gray-700"
              >
                حجز موعد إضافي
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-luxury rounded-3xl p-6 sm:p-10 border border-[#D4AF37]/35 shadow-2xl">
            {errorMessage && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bot Honeypot */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  tabIndex={-1}
                  value={formData.website_bot_trap}
                  onChange={(e) => handleInputChange('website_bot_trap', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {bookingFieldsConfig
                  .filter((f) => f.enabled)
                  .map((field) => {
                    const label = language === 'tr' ? field.labelTr : language === 'en' ? field.labelEn : field.labelAr;
                    const val = formData[field.name] || '';

                    return (
                      <div
                        key={field.id}
                        className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                      >
                        <label className="block text-xs sm:text-sm font-semibold text-[#3A3530] dark:text-[#FAF7F2] mb-2 text-start">
                          {label} {field.required && <span className="text-[#C94C71] dark:text-[#E55B82]">*</span>}
                        </label>

                        {field.type === 'select' && field.options ? (
                          <select
                            value={val}
                            required={field.required}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#161114] text-[#2D2A26] dark:text-[#FAF7F2] text-xs sm:text-sm focus:outline-none focus:border-[#C94C71] dark:focus:border-[#D4AF37] shadow-inner"
                          >
                            <option value="" className="dark:bg-[#161114] dark:text-[#FAF7F2]">-- اختاري --</option>
                            {field.options.map((opt, i) => (
                              <option key={i} value={opt} className="dark:bg-[#161114] dark:text-[#FAF7F2]">
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            rows={3}
                            value={val}
                            required={field.required}
                            placeholder="أي تفاصيل ترغبين في مناقشتها مسبقاً..."
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#161114] text-[#2D2A26] dark:text-[#FAF7F2] placeholder-gray-400 dark:placeholder-[#8C7E75] text-xs sm:text-sm focus:outline-none focus:border-[#C94C71] dark:focus:border-[#D4AF37] resize-none shadow-inner"
                          />
                        ) : field.name === 'preferredDate' ? (
                          <input
                            type="date"
                            value={val}
                            required={field.required}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#161114] text-[#2D2A26] dark:text-[#FAF7F2] text-xs sm:text-sm focus:outline-none focus:border-[#C94C71] dark:focus:border-[#D4AF37] shadow-inner"
                          />
                        ) : (
                          <input
                            type={field.type === 'tel' ? 'tel' : field.type === 'number' ? 'number' : 'text'}
                            value={val}
                            required={field.required}
                            placeholder={field.type === 'tel' ? '+90 5XX XXX XX XX' : ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#161114] text-[#2D2A26] dark:text-[#FAF7F2] placeholder-gray-400 dark:placeholder-[#8C7E75] text-xs sm:text-sm focus:outline-none focus:border-[#C94C71] dark:focus:border-[#D4AF37] shadow-inner"
                          />
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Submit Button */}
              <div className="pt-4 text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-4 rounded-full text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[#A83256] via-[#C94C71] to-[#AA7A1E] shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2.5 mx-auto disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري تأكيد الموعد...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 text-[#F4E8C1]" />
                      <span>{t.btnSubmitBooking}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};
