import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { AwardItem } from '../../../types';
import { normalizeDriveUrl, handleImageError } from '../../../utils/drive';
import { GoogleMediaPickerModal } from '../GoogleMediaPickerModal';
import { Trophy, Plus, Trash2, X, Sparkles, Image as ImageIcon, Save, RefreshCw, Check, Edit3 } from 'lucide-react';

export const AwardsTab: React.FC = () => {
  const { awards, addAward, deleteAward, saveAwardsToServer } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerForEdit, setPickerForEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [editingAward, setEditingAward] = useState<AwardItem | null>(null);

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

  const handleSaveAllAwards = async () => {
    setIsSaving(true);
    setSaveSuccessMsg('');
    const res = await saveAwardsToServer();
    setIsSaving(false);
    if (res.success) {
      setSaveSuccessMsg(`تم حفظ وتثبيت ${awards.length} تكريماً وفيديو بنجاح في ملفات الموقع لجميع الأجهزة والزوار!`);
      setTimeout(() => setSaveSuccessMsg(''), 4500);
    } else {
      alert(res.message || 'حدث خطأ أثناء حفظ التكريمات');
    }
  };

  const handleUpdateAwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAward || !editingAward.title) return;
    try {
      await fetch(`/api/awards/item/${editingAward.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAward),
      });
      await saveAwardsToServer();
      setEditingAward(null);
    } catch {
      // Fallback
      setEditingAward(null);
    }
  };

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
      {/* Sticky Save & Action Bar */}
      <div className="sticky top-0 z-30 -mx-2 px-3 py-3 backdrop-blur-md bg-[#FAF7F2]/90 dark:bg-[#120E11]/90 border-b border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-3 shadow-sm rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAllAwards}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 shadow-md hover:shadow-lg hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
            title="حفظ وتثبيت كافة التكريمات والفيديوهات بملفات الموقع لجميع الأجهزة والزوار"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Save className="w-4 h-4 text-white" />
            )}
            <span>{isSaving ? 'جارٍ الحفظ بالخادم...' : 'حفظ التكريمات والفيديوهات (ملفات الخادم)'}</span>
          </button>

          {saveSuccessMsg && (
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>{saveSuccessMsg}</span>
            </span>
          )}
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>إجمالي عناصر المعرض: <strong className="text-[#C94C71]">{awards.length}</strong></span>
        </div>
      </div>

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

              <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-between">
                <button
                  onClick={() => setEditingAward({ ...award })}
                  className="px-2.5 py-1 text-[#C94C71] hover:bg-[#C94C71]/10 rounded-lg flex items-center gap-1 text-xs font-bold transition-all"
                  title="تعديل هذا التكريم"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`هل أنتِ متأكدة من حذف هذا التكريم؟`)) {
                      deleteAward(award.id);
                    }
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg flex items-center gap-1 text-xs font-semibold"
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

      {/* Edit Award Modal */}
      {editingAward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#161114] rounded-3xl shadow-2xl border border-[#D4AF37]/40 p-6 text-start text-xs space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20">
              <h4 className="text-base font-bold font-serif-luxury text-[#2D2A26] dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#C94C71]" />
                <span>تعديل تفاصيل التكريم / الفيديو</span>
              </h4>
              <button onClick={() => setEditingAward(null)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleUpdateAwardSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">عنوان التكريم أو المؤتمر *</label>
                <input
                  type="text"
                  required
                  value={editingAward.title}
                  onChange={(e) => setEditingAward({ ...editingAward, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">الشركة الراعية</label>
                  <select
                    value={editingAward.company}
                    onChange={(e) =>
                      setEditingAward({ ...editingAward, company: e.target.value as AwardItem['company'] })
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
                    value={editingAward.year}
                    onChange={(e) => setEditingAward({ ...editingAward, year: e.target.value })}
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
                    onClick={() => {
                      setPickerForEdit(true);
                      setIsPickerOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#4285F4] to-[#2B6CB0] text-white text-[11px] font-bold shadow-sm hover:scale-[1.02] transition-all flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>تغيير الوسائط</span>
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    value={editingAward.mediaUrl}
                    onChange={(e) => setEditingAward({ ...editingAward, mediaUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  />
                  {editingAward.mediaUrl && (
                    <img
                      src={normalizeDriveUrl(editingAward.mediaUrl, 'award')}
                      alt="Preview"
                      onError={(e) => handleImageError(e, 'award')}
                      className="w-9 h-9 rounded-lg object-cover border border-[#D4AF37] shrink-0"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">نوع الوسائط</label>
                <select
                  value={editingAward.mediaType}
                  onChange={(e) =>
                    setEditingAward({ ...editingAward, mediaType: e.target.value as 'image' | 'video' })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                >
                  <option value="image">صورة 📷</option>
                  <option value="video">فيديو 🎬</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">وصف الحدث وتفاصيل التكريم</label>
                <textarea
                  rows={3}
                  value={editingAward.description}
                  onChange={(e) => setEditingAward({ ...editingAward, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                />
              </div>

              <div className="pt-3 border-t border-[#D4AF37]/20 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAward(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white font-bold rose-gold-gradient shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>تحديث وحفظ التكريم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Media Picker Modal */}
      <GoogleMediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => {
          setIsPickerOpen(false);
          setPickerForEdit(false);
        }}
        allowMultiple={false}
        mediaType="all"
        onSelect={(streamUrl, file) => {
          const isVideo = file?.mimeType?.includes('video/');
          if (pickerForEdit && editingAward) {
            setEditingAward((prev) =>
              prev
                ? {
                    ...prev,
                    mediaUrl: streamUrl,
                    mediaType: isVideo ? 'video' : 'image',
                  }
                : null
            );
          } else {
            setForm((prev) => ({
              ...prev,
              mediaUrl: streamUrl,
              mediaType: isVideo ? 'video' : 'image',
            }));
          }
          setPickerForEdit(false);
        }}
      />
    </div>
  );
};
