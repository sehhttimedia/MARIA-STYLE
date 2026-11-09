import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { CMSContent } from '../../../types';
import { normalizeDriveUrl, handleImageError } from '../../../utils/drive';
import { GoogleMediaPickerModal } from '../GoogleMediaPickerModal';
import { Settings, Save, Check, RefreshCw, Sparkles, MessageCircle, Link, Image as ImageIcon, ShieldCheck, Lock, Key } from 'lucide-react';

export const VisualCmsTab: React.FC = () => {
  const { cms, updateCMS, changeAdminPassword } = useApp();
  const [form, setForm] = useState<CMSContent>({ ...cms });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'logo' | 'story'>('logo');

  // Password change state
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Keep form updated if cms changes in context
  useEffect(() => {
    setForm({ ...cms });
  }, [cms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const normalizedPayload: CMSContent = {
      ...form,
      logoUrl: normalizeDriveUrl(form.logoUrl, 'logo'),
      madameFatimaPhoto: normalizeDriveUrl(form.madameFatimaPhoto, 'story'),
    };
    setForm(normalizedPayload);
    await updateCMS(normalizedPayload);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setPassMessage({ text: 'كلمة المرور الجديدة غير متطابقة مع التأكيد.', success: false });
      return;
    }
    const res = changeAdminPassword(oldPass, newPass);
    setPassMessage({ text: res.message, success: res.success });
    if (res.success) {
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    }
    setTimeout(() => setPassMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#2D2A26] dark:text-white font-serif-luxury">
            منشئ المحتوى البصري والإعدادات العامة للموقع
          </h3>
          <p className="text-xs text-gray-500">
            تحديث الهوية، الشعار، صورة مدام فاطمة، السوشيال ميديا، ورقم الواتساب فورياً لجميع الزوار
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 rounded-xl bg-[#25D366]/20 border border-[#25D366] text-[#25D366] text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>تم حفظ التعديلات ونشرها فوراً على الموقع لجميع الزوار!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-start text-xs">
        {/* Section 1: Brand & Official Contact */}
        <div className="glass-luxury rounded-2xl border border-[#D4AF37]/30 p-6 shadow-md space-y-4">
          <h4 className="text-sm font-bold text-[#2D2A26] dark:text-white font-serif-luxury border-b border-[#D4AF37]/20 pb-2">
            1. الهوية الرسمية وبيانات التواصل المباشر
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">اسم المنصة / البراند</label>
              <input
                type="text"
                value={form.brandName}
                onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">
                رقم الواتساب الرسمي المعتمد (مع كود الدولة وبدون فواصل) *
              </label>
              <input
                type="text"
                placeholder="+905528889900"
                value={form.officialWhatsApp}
                onChange={(e) => setForm({ ...form, officialWhatsApp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11] font-mono text-[#C94C71] font-bold"
              />
              <span className="text-[10px] text-gray-400">
                هذا الرقم يستقبل كافة طلبات المنتجات والاستشارات ورسائل العميلات تلقائياً
              </span>
            </div>

            <div>
              <label className="block font-semibold mb-1">رقم الهاتف للعرض</label>
              <input
                type="text"
                value={form.officialPhone}
                onChange={(e) => setForm({ ...form, officialPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">البريد الإلكتروني للدعم</label>
              <input
                type="email"
                value={form.emailContact}
                onChange={(e) => setForm({ ...form, emailContact: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Logo and Madame Fatima Google Drive Assets */}
        <div className="glass-luxury rounded-2xl border border-[#D4AF37]/30 p-6 shadow-md space-y-4">
          <h4 className="text-sm font-bold text-[#2D2A26] dark:text-white font-serif-luxury border-b border-[#D4AF37]/20 pb-2">
            2. روابط الأصول البصرية (Google Drive Assets &amp; Logo)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold">
                  رابط الشعار الرسمي (Logo URL أو Google Drive)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPickerTarget('logo');
                    setIsPickerOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#4285F4] to-[#2B6CB0] text-white text-[11px] font-bold shadow-sm hover:scale-[1.02] transition-all flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>اختيار من وسائط Google</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="https://drive.google.com/file/d/... أو اختاري من وسائط Google"
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
              />
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-gray-400">معاينة الشعار:</span>
                <img
                  src={normalizeDriveUrl(form.logoUrl, 'logo')}
                  alt="Logo Preview"
                  onError={(e) => handleImageError(e, 'logo')}
                  className="h-8 w-auto object-contain bg-black/5 dark:bg-white/5 p-1 rounded"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold">
                  رابط صورة قصة النجاح (مدام فاطمة - Google Drive URL)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPickerTarget('story');
                    setIsPickerOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#C94C71] to-[#D4AF37] text-white text-[11px] font-bold shadow-sm hover:scale-[1.02] transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>اختيار من وسائط Google</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="https://drive.google.com/file/d/... أو اختاري من وسائط Google"
                value={form.madameFatimaPhoto}
                onChange={(e) => setForm({ ...form, madameFatimaPhoto: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
              />
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-gray-400">معاينة الصورة:</span>
                <img
                  src={normalizeDriveUrl(form.madameFatimaPhoto, 'story')}
                  alt="Fatima Preview"
                  onError={(e) => handleImageError(e, 'story')}
                  className="w-8 h-8 rounded-full object-cover border border-[#D4AF37]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Madame Fatima Bio & Full Narrative */}
        <div className="glass-luxury rounded-2xl border border-[#D4AF37]/30 p-6 shadow-md space-y-4">
          <h4 className="text-sm font-bold text-[#2D2A26] dark:text-white font-serif-luxury border-b border-[#D4AF37]/20 pb-2">
            3. نصوص قصة النجاح والرسالة الملهمة
          </h4>

          <div>
            <label className="block font-semibold mb-1">الموجز التسويقي للقصة (الظاهر بالواجهة)</label>
            <textarea
              rows={2}
              value={form.madameFatimaStoryExcerpt}
              onChange={(e) => setForm({ ...form, madameFatimaStoryExcerpt: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">القصة الكاملة الملهمة (المعروضة داخل النافذة المنبثقة)</label>
            <textarea
              rows={5}
              value={form.madameFatimaFullStory}
              onChange={(e) => setForm({ ...form, madameFatimaFullStory: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
            />
          </div>
        </div>

        {/* Section 4: Announcement & Hero Texts */}
        <div className="glass-luxury rounded-2xl border border-[#D4AF37]/30 p-6 shadow-md space-y-4">
          <h4 className="text-sm font-bold text-[#2D2A26] dark:text-white font-serif-luxury border-b border-[#D4AF37]/20 pb-2">
            4. شريط الإعلان والعد التنازلي والنصوص الترويجية
          </h4>

          <div>
            <label className="block font-semibold mb-1">نص الشريط الإعلاني العلوي (Ticker Text)</label>
            <input
              type="text"
              value={form.announcementText}
              onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={form.announcementActive}
              onChange={(e) => setForm({ ...form, announcementActive: e.target.checked })}
              className="rounded text-[#C94C71]"
            />
            <span className="font-semibold">تفعيل وإظهار شريط الإعلان العلوي في الموقع</span>
          </label>
        </div>

        {/* Section 5: Social Media Links */}
        <div className="glass-luxury rounded-2xl border border-[#D4AF37]/30 p-6 shadow-md space-y-4">
          <h4 className="text-sm font-bold text-[#2D2A26] dark:text-white font-serif-luxury border-b border-[#D4AF37]/20 pb-2">
            5. قنوات التواصل الاجتماعي (تتحدث فورياً في الترويسة والتذييل)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1">رابط Instagram</label>
              <input
                type="text"
                value={form.socialLinks.instagram}
                onChange={(e) =>
                  setForm({
                    ...form,
                    socialLinks: { ...form.socialLinks, instagram: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">رابط TikTok</label>
              <input
                type="text"
                value={form.socialLinks.tiktok}
                onChange={(e) =>
                  setForm({
                    ...form,
                    socialLinks: { ...form.socialLinks, tiktok: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">رابط Telegram</label>
              <input
                type="text"
                value={form.socialLinks.telegram}
                onChange={(e) =>
                  setForm({
                    ...form,
                    socialLinks: { ...form.socialLinks, telegram: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">رابط Facebook</label>
              <input
                type="text"
                value={form.socialLinks.facebook}
                onChange={(e) =>
                  setForm({
                    ...form,
                    socialLinks: { ...form.socialLinks, facebook: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">رابط YouTube</label>
              <input
                type="text"
                value={form.socialLinks.youtube}
                onChange={(e) =>
                  setForm({
                    ...form,
                    socialLinks: { ...form.socialLinks, youtube: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-full text-sm font-bold text-white rose-gold-gradient shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ الإعدادات ونشرها فوراً على الموقع</span>
          </button>
        </div>
      </form>

      {/* Section 5: Admin Password & Account Security */}
      <div className="glass-luxury rounded-2xl border border-[#D4AF37]/30 p-6 shadow-md text-start text-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#D4AF37]/20 pb-3">
          <Lock className="w-4 h-4 text-[#C94C71]" />
          <div>
            <h4 className="text-sm font-bold text-[#2D2A26] dark:text-white font-serif-luxury">
              أمان الحساب وتغيير كلمة مرور المشرف
            </h4>
            <p className="text-[11px] text-gray-500">
              تغيير كلمة المرور الخاصة بتسجيل الدخول إلى لوحة التحكم
            </p>
          </div>
        </div>

        {passMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold ${
              passMessage.success
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                : 'bg-red-500/15 border border-red-500/40 text-red-700 dark:text-red-400'
            }`}
          >
            {passMessage.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block font-semibold mb-1">كلمة المرور الحالية</label>
            <input
              type="password"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">كلمة المرور الجديدة</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="6 أحرف أو أرقام على الأقل"
              required
              minLength={6}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="إعادة إدخال كلمة المرور"
              required
              minLength={6}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#2D2A26] to-[#4A453F] dark:from-[#3D353A] dark:to-[#574B53] hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Key className="w-3.5 h-3.5" />
              <span>تحديث كلمة المرور</span>
            </button>
          </div>
        </form>
      </div>

      {/* Google Media Picker Modal */}
      <GoogleMediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        allowMultiple={false}
        mediaType="image"
        title={pickerTarget === 'logo' ? 'اختيار الشعار الرسمي من وسائط Google' : 'اختيار صورة مدام فاطمة من وسائط Google'}
        onSelect={(streamUrl) => {
          if (pickerTarget === 'logo') {
            setForm((prev) => ({ ...prev, logoUrl: streamUrl }));
          } else {
            setForm((prev) => ({ ...prev, madameFatimaPhoto: streamUrl }));
          }
        }}
      />
    </div>
  );
};
