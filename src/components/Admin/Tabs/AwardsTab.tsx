import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { AwardItem } from '../../../types';
import { normalizeDriveUrl, handleImageError } from '../../../utils/drive';
import { GoogleMediaPickerModal } from '../GoogleMediaPickerModal';
import { Trophy, Plus, Trash2, X, Sparkles, Image as ImageIcon } from 'lucide-react';

export const AwardsTab: React.FC = () => {
  const { awards, addAward, deleteAward } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [form, setForm] = useState<Omit<AwardItem, 'id'>>({
    title: '',
    titleTr: '',
    titleEn: '',
    year: '2026',
    company: 'Alialyna',
    mediaType: 'image',
    mediaUrl: '',
    description: '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    addAward({
      ...form,
      mediaUrl: normalizeDriveUrl(form.mediaUrl, 'award'),
    });
    setIsModalOpen(false);
    setForm({
      title: '',
      titleTr: '',
      titleEn: '',
      year: '2026',
      company: 'Alialyna',
      mediaType: 'image',
      mediaUrl: '',
      description: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#2D2A26] dark:text-white font-serif-luxury">
            إدارة معرض التكريمات والمؤتمرات والجوائز
          </h3>
          <p className="text-xs text-gray-500">
            إضافة وتعديل صور وفيديوهات تكريمات الفريق عبر Google Drive URLs المباشرة
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white rose-gold-gradient shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة تكريم جديد</span>
        </button>
      </div>

      {/* Grid of Awards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {awards.map((award) => (
          <div
            key={award.id}
            className="glass-luxury rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md flex flex-col justify-between"
          >
            <div className="relative aspect-video bg-black/10 overflow-hidden">
              {award.mediaType === 'video' || award.mediaUrl.endsWith('.mp4') || award.mediaUrl.endsWith('.webm') ? (
                <video
                  src={normalizeDriveUrl(award.mediaUrl, 'award')}
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={normalizeDriveUrl(award.mediaUrl, 'award')}
                  alt={award.title}
                  onError={(e) => handleImageError(e, 'award')}
                  className="w-full h-full object-cover"
                />
              )}
              <span className="absolute top-2 end-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37] text-black">
                {award.year}
              </span>
              <span className="absolute top-2 start-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white">
                {award.company}
              </span>
              {(award.mediaType === 'video' || award.mediaUrl.endsWith('.mp4')) && (
                <span className="absolute bottom-2 start-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#C94C71] text-white">
                  فيديو 🎬
                </span>
              )}
            </div>

            <div className="p-4 text-start">
              <h4 className="text-sm font-bold text-[#2D2A26] dark:text-white mb-1 line-clamp-1">
                {award.title}
              </h4>
              <p className="text-xs text-[#7A6F65] dark:text-[#A8988B] line-clamp-2 leading-relaxed mb-4">
                {award.description}
              </p>

              <div className="pt-3 border-t border-[#D4AF37]/20 flex justify-end">
                <button
                  onClick={() => {
                    if (confirm(`هل أنتِ متأكدة من حذف هذا التكريم؟`)) {
                      deleteAward(award.id);
                    }
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Award Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#161114] rounded-3xl shadow-2xl border border-[#D4AF37]/40 p-6 text-start text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20">
              <h4 className="text-base font-bold font-serif-luxury text-[#2D2A26] dark:text-white">
                إضافة تكريم أو فعالية جديدة
              </h4>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">عنوان التكريم أو المؤتمر *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تتويج القائد الماسي في إسطنبول"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">الشركة الراعية</label>
                  <select
                    value={form.company}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value as AwardItem['company'] })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  >
                    <option value="Alialyna">Alialyna</option>
                    <option value="HomeLife">HomeLife</option>
                    <option value="MariaStyle">ماريا ستايل</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">سنة الحدث</label>
                  <input
                    type="text"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold">
                    رابط الصورة أو الفيديو (Google Drive URL أو رابط مباشر)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#4285F4] to-[#2B6CB0] text-white text-[11px] font-bold shadow-sm hover:scale-[1.02] transition-all flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>اختيار من وسائط Google / Gmail</span>
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder="https://drive.google.com/file/d/... أو اختاري من وسائط Google"
                    value={form.mediaUrl}
                    onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  />
                  {form.mediaUrl && (
                    <img
                      src={normalizeDriveUrl(form.mediaUrl, 'award')}
                      alt="Preview"
                      onError={(e) => handleImageError(e, 'award')}
                      className="w-9 h-9 rounded-lg object-cover border border-[#D4AF37] shrink-0"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">وصف الحدث وتفاصيل التكريم</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                />
              </div>

              <div className="pt-3 border-t border-[#D4AF37]/20 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white font-bold rose-gold-gradient shadow-md"
                >
                  حفظ ونشر التكريم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Google Media Picker Modal */}
      <GoogleMediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        allowMultiple={false}
        mediaType="all"
        onSelect={(streamUrl, file) => {
          const isVideo = file?.mimeType?.includes('video/');
          setForm((prev) => ({
            ...prev,
            mediaUrl: streamUrl,
            mediaType: isVideo ? 'video' : 'image',
          }));
        }}
      />
    </div>
  );
};
