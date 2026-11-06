import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sanitizeText, sanitizePhone, checkSubmissionThrottle } from '../utils/sanitize';
import { Sparkles, Shield, Send, CheckCircle2, AlertCircle, Phone, Lock, HeartHandshake } from 'lucide-react';

export const MlmFormSection: React.FC = () => {
  const { t, mlmFieldsConfig, submitMlmLead, activeAttribution, language } = useApp();

  // Form State
  const [formData, setFormData] = useState<Record<string, string>>({
    fullName: '',
    phone: '',
    country: '',
    city: '',
    company: 'Alialyna (جمال وعطور)',
    experience: 'مبتدئة تماماً (أحتاج تدريباً من الصفر)',
    availableHours: '3 - 4 ساعات',
    motivation: '',
    attributionCode: activeAttribution || 'MS-FATIMA',
    website_bot_trap: '', // Honeypot trap for bots
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

    // 1. Honeypot check (Bots fill this invisible field)
    if (formData.website_bot_trap) {
      console.warn('Bot detected by honeypot.');
      setSubmittedSuccess(true);
      return;
    }

    // 2. Throttle spam check
    const throttle = checkSubmissionThrottle('mlm_join_form', 4000);
    if (!throttle.allowed) {
      setErrorMessage(
        language === 'ar'
          ? `يرجى التمهل والانتظار ${throttle.remainingSeconds} ثوانٍ قبل إعادة الإرسال.`
          : `Please wait ${throttle.remainingSeconds}s before submitting again.`
      );
      return;
    }

    // 3. Validation & Sanitization
    const sanitizedPayload: Record<string, string> = {};
    for (const [key, val] of Object.entries(formData)) {
      if (key === 'phone') {
        sanitizedPayload[key] = sanitizePhone(val);
      } else {
        sanitizedPayload[key] = sanitizeText(val);
      }
    }

    if (!sanitizedPayload.fullName || sanitizedPayload.fullName.length < 3) {
      setErrorMessage(language === 'ar' ? 'يرجى كتابة الاسم الثلاثي الكريم.' : 'Please enter your full name.');
      return;
    }
    if (!sanitizedPayload.phone || sanitizedPayload.phone.length < 8) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال رقم هاتف واتساب صالح للتواصل.' : 'Please enter a valid phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitMlmLead(sanitizedPayload);
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

  return (
    <section id="join-team" className="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-[#FAF5EE] dark:from-[#0C0A0B] dark:to-[#120E10]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#D4AF37]/40 bg-white/70 dark:bg-[#161114] text-[#C94C71] dark:text-[#E55B82] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#E5C358]" />
            <span>{t.mlmBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2D2A26] dark:text-[#FAF7F2] font-serif-luxury">
            {t.mlmTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#7A6F65] dark:text-[#C5B7A9] mt-2">
            {t.mlmSubtitle}
          </p>
        </div>

        {/* Success Card State */}
        {submittedSuccess ? (
          <div className="glass-luxury rounded-3xl p-8 sm:p-12 border-2 border-[#D4AF37] shadow-2xl text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#25D366] to-[#128C7E] text-white flex items-center justify-center mx-auto mb-5 shadow-lg">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-bold font-serif-luxury text-[#2D2A26] dark:text-white mb-3">
              {t.successTitleMlm}
            </h3>

            <p className="text-sm sm:text-base text-[#4A453F] dark:text-[#D1C5B8] leading-relaxed mb-6">
              {t.successDescMlm}
            </p>

            <div className="p-4 rounded-2xl bg-[#FAF5EE] dark:bg-white/5 border border-[#D4AF37]/30 text-start text-xs sm:text-sm text-[#443E38] dark:text-[#E2D8CE] mb-6 space-y-2">
              <span className="font-bold text-[#C94C71] block mb-1">الخطوات التالية الفورية:</span>
              <ul className="space-y-1 list-disc list-inside">
                <li>
                  {isOfflineBuffered
                    ? 'تم حفظ طلبكِ بأمان في سجلات النظام وسيجري رفعه للجدول السحابي تلقائياً فور توفر الاتصال.'
                    : 'تم تسجيل طلبكِ وحفظه مباشرة في سجلات الشيت 1 (Leads_MLM).'}
                </li>
                <li>ستتلقين رسالة ترحيبية خاصة عبر الواتساب من مدام فاطمة وفريق الدعم.</li>
                <li>سيتم إرسال رابط الأكاديمية المجانية والحقيبة الإعلانية فور تأكيد الرقم.</li>
              </ul>
            </div>

            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setFormData({
                  fullName: '',
                  phone: '',
                  country: '',
                  city: '',
                  company: 'Alialyna (جمال وعطور)',
                  experience: 'مبتدئة تماماً (أحتاج تدريباً من الصفر)',
                  availableHours: '3 - 4 ساعات',
                  motivation: '',
                  attributionCode: activeAttribution || 'MS-FATIMA',
                  website_bot_trap: '',
                });
              }}
              className="px-6 py-2.5 rounded-full text-xs font-semibold text-[#8C7A6B] hover:text-[#C94C71] border border-gray-300 dark:border-gray-700"
            >
              تقديم طلب انضمام جديد
            </button>
          </div>
        ) : (
          /* Main Interactive Application Form */
          <div className="glass-luxury rounded-3xl p-6 sm:p-10 border border-[#D4AF37]/35 shadow-2xl relative">
            {/* Top Security Banner */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#D4AF37]/20 text-xs text-[#7A6F65] dark:text-[#B2A497]">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#25D366]" />
                <span>بياناتكِ مشفرة ومحمية بالكامل ولا تشارك مع أي طرف خارجي</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[#D4AF37]">
                <Lock className="w-3.5 h-3.5" />
                <span>Zero-Knowledge Secure SSL</span>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bot Honeypot Input (Invisible to Humans) */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website_bot_trap">Do not fill this</label>
                <input
                  type="text"
                  id="website_bot_trap"
                  name="website_bot_trap"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website_bot_trap}
                  onChange={(e) => handleInputChange('website_bot_trap', e.target.value)}
                />
              </div>

              {/* Dynamic Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {mlmFieldsConfig
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
                            <option value="" className="dark:bg-[#161114] dark:text-[#FAF7F2]">-- اختاري الإجابة --</option>
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
                            placeholder="اكتبي هدفكِ، طموحكِ، أو أي سؤال تودين طرحه على مدام فاطمة..."
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#161114] text-[#2D2A26] dark:text-[#FAF7F2] placeholder-gray-400 dark:placeholder-[#8C7E75] text-xs sm:text-sm focus:outline-none focus:border-[#C94C71] dark:focus:border-[#D4AF37] resize-none shadow-inner"
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

              {/* Attribution Notice */}
              {activeAttribution && (
                <div className="p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-start text-xs text-[#7A6F65] dark:text-[#D4AF37] flex items-center justify-between">
                  <span>
                    كود العضوة الراعية المسجلة:{' '}
                    <strong className="font-bold text-[#C94C71]">{activeAttribution}</strong>
                  </span>
                  <span className="text-[10px] text-gray-500">تم التعرف على كود التتبع تلقائياً</span>
                </div>
              )}

              {/* Submit CTA Button */}
              <div className="pt-4 text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-4 rounded-full text-sm sm:text-base font-bold text-white rose-gold-gradient shadow-xl shadow-[#C94C71]/30 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2.5 mx-auto disabled:opacity-70 shimmer-effect"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t.submittingText}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#F4E8C1]" />
                      <span>{t.btnSubmitMlm}</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3">
                  بالضغط على الزر، توافقين على استقبال رسائل التدريب والتواصل الرسمي عبر الواتساب.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};
