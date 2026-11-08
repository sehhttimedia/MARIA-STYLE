import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { FormFieldConfig } from '../../../types';
import {
  Sliders,
  Plus,
  Trash2,
  Check,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  Layers,
  Edit3,
} from 'lucide-react';

export const FormsCustomizerTab: React.FC = () => {
  const {
    mlmFieldsConfig,
    updateMlmFieldsConfig,
    bookingFieldsConfig,
    updateBookingFieldsConfig,
    syncFormHeadersNow,
    fireConfetti,
  } = useApp();

  const [activeFormType, setActiveFormType] = useState<'mlm' | 'booking'>('mlm');
  const [isSyncingHeaders, setIsSyncingHeaders] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Modal for adding a new custom field
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLabelAr, setNewFieldLabelAr] = useState('');
  const [newFieldType, setNewFieldType] = useState<FormFieldConfig['type']>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');

  // Editing options modal for existing select field
  const [editingOptionsFieldId, setEditingOptionsFieldId] = useState<string | null>(null);
  const [editingOptionsText, setEditingOptionsText] = useState('');

  const currentConfigs = activeFormType === 'mlm' ? mlmFieldsConfig : bookingFieldsConfig;
  const updateConfigs = activeFormType === 'mlm' ? updateMlmFieldsConfig : updateBookingFieldsConfig;

  const handleToggleEnabled = (id: string) => {
    const updated = currentConfigs.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f));
    updateConfigs(updated);
  };

  const handleToggleRequired = (id: string) => {
    const updated = currentConfigs.map((f) => (f.id === id ? { ...f, required: !f.required } : f));
    updateConfigs(updated);
  };

  const handleLabelChange = (id: string, newLabelAr: string) => {
    const updated = currentConfigs.map((f) => (f.id === id ? { ...f, labelAr: newLabelAr } : f));
    updateConfigs(updated);
  };

  const handleTypeChange = (id: string, newType: FormFieldConfig['type']) => {
    const updated = currentConfigs.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          type: newType,
          options: newType === 'select' && (!f.options || f.options.length === 0) ? ['خيار 1', 'خيار 2'] : f.options,
        };
      }
      return f;
    });
    updateConfigs(updated);
  };

  const handleOpenAddModal = () => {
    const defaultSlug = `custom_${Date.now().toString(36)}`;
    setNewFieldName(defaultSlug);
    setNewFieldLabelAr('');
    setNewFieldType('text');
    setNewFieldRequired(false);
    setNewFieldOptions('');
    setIsAddModalOpen(true);
  };

  const handleSaveNewField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabelAr.trim()) return;

    const rawSlug = newFieldName.trim() || `field_${Date.now()}`;
    const cleanSlug = rawSlug.replace(/[^a-zA-Z0-9_]/g, '_');

    let parsedOptions: string[] | undefined = undefined;
    if (newFieldType === 'select') {
      parsedOptions = newFieldOptions
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (parsedOptions.length === 0) {
        parsedOptions = ['نعم', 'لا'];
      }
    }

    const newField: FormFieldConfig = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanSlug,
      labelAr: newFieldLabelAr.trim(),
      labelTr: cleanSlug,
      labelEn: cleanSlug,
      type: newFieldType,
      required: newFieldRequired,
      enabled: true,
      options: parsedOptions,
    };

    updateConfigs([...currentConfigs, newField]);
    setIsAddModalOpen(false);
    fireConfetti();
  };

  const handleDeleteField = (id: string) => {
    if (confirm('هل أنتِ متأكدة من حذف هذا الحقل المخصص؟')) {
      updateConfigs(currentConfigs.filter((f) => f.id !== id));
    }
  };

  const handleOpenOptionsEditor = (field: FormFieldConfig) => {
    setEditingOptionsFieldId(field.id);
    setEditingOptionsText(field.options ? field.options.join('\n') : '');
  };

  const handleSaveOptions = () => {
    if (!editingOptionsFieldId) return;
    const parsed = editingOptionsText
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const updated = currentConfigs.map((f) =>
      f.id === editingOptionsFieldId ? { ...f, options: parsed.length > 0 ? parsed : ['خيار 1'] } : f
    );
    updateConfigs(updated);
    setEditingOptionsFieldId(null);
  };

  const handleManualSyncHeaders = async () => {
    setIsSyncingHeaders(true);
    setSyncFeedback(null);
    try {
      const result = await syncFormHeadersNow(activeFormType);
      setSyncFeedback({ success: result.success, message: result.message });
    } catch (err: any) {
      setSyncFeedback({ success: false, message: err.message || 'حدث خطأ أثناء المزامنة.' });
    } finally {
      setIsSyncingHeaders(false);
    }
  };

  return (
    <div className="space-y-6 text-start text-xs">
      {/* Header & Form Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#2D2A26] dark:text-white font-serif-luxury">
              مخصص ومصمم النماذج الديناميكي (Dynamic Forms &amp; Sheets Sync Engine)
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#25D366]/15 text-[#25D366] text-[10px] font-bold border border-[#25D366]/30">
              مزامنة أعمدة تلقائية
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            تحكم كامل في الحقول (إضافة، تعديل، إخفاء، قوائم منسدلة) مع توليد أعمدة Google Sheets المطابقة لها تلقائياً
          </p>
        </div>

        {/* Form Selector Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-[#FAF5EE] dark:bg-white/5 border border-[#D4AF37]/30">
          <button
            onClick={() => {
              setActiveFormType('mlm');
              setSyncFeedback(null);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFormType === 'mlm'
                ? 'bg-[#C94C71] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            استمارة الانضمام (Leads_MLM)
          </button>
          <button
            onClick={() => {
              setActiveFormType('booking');
              setSyncFeedback(null);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFormType === 'booking'
                ? 'bg-[#C94C71] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            استمارة الاستشارة (Bookings)
          </button>
        </div>
      </div>

      {/* Cloud Header Sync Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0F9D58]/10 via-[#FAF5EE] dark:via-[#161114] to-transparent border border-[#0F9D58]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F9D58]/20 text-[#0F9D58] flex items-center justify-center shrink-0 shadow-sm">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-[#2D2A26] dark:text-white block">
              محرك مطابقة أعمدة Google Sheets ({activeFormType === 'mlm' ? 'ورقة طلبات الانضمام MLM' : 'ورقة حجوزات الاستشارات'})
            </span>
            <span className="text-[11px] text-gray-500">
              أي حقل مخصص تضيفه هنا يتم إنشاء عمود مطابق له في السطر الأول لجدول Google Sheets تلقائياً عند الإرسال
            </span>
          </div>
        </div>

        <button
          onClick={handleManualSyncHeaders}
          disabled={isSyncingHeaders}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0F9D58] hover:bg-[#0c8248] shadow flex items-center gap-2 shrink-0 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingHeaders ? 'animate-spin' : ''}`} />
          <span>{isSyncingHeaders ? 'جاري الفحص والمزامنة...' : '⚡ مزامنة أعمدة الجدول الآن'}</span>
        </button>
      </div>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200 border ${
            syncFeedback.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
          }`}
        >
          {syncFeedback.success ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          )}
          <span className="leading-relaxed">{syncFeedback.message}</span>
        </div>
      )}

      {/* Fields List Card */}
      <div className="glass-luxury rounded-2xl border border-[#D4AF37]/30 p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#D4AF37]/20">
          <div>
            <h4 className="text-sm font-bold text-[#2D2A26] dark:text-white font-serif-luxury">
              الحقول المفعلة في {activeFormType === 'mlm' ? 'استمارة انضمام الفريق' : 'حجز استشارة VIP'} ({currentConfigs.length} حقول)
            </h4>
            <p className="text-[11px] text-gray-400">
              يتم حفظ التعديلات فورياً في الذاكرة الدائمة وتنعكس مباشرة لزوار الموقع
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white rose-gold-gradient shadow-md flex items-center gap-1.5 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حقل جديد للاستمارة</span>
          </button>
        </div>

        <div className="space-y-3">
          {currentConfigs.map((field) => (
            <div
              key={field.id}
              className={`p-4 rounded-xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                field.enabled
                  ? 'bg-white/80 dark:bg-[#120E11] border-[#D4AF37]/30 shadow-sm'
                  : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-[#D4AF37]/20 opacity-60'
              }`}
            >
              {/* Field Label and Key */}
              <div className="flex-1 w-full lg:w-auto space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-gray-500 font-semibold">
                    معرف الحقل: {field.name}
                  </span>

                  {field.id.startsWith('custom-') && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#C94C71]/15 text-[#C94C71] font-bold">
                      حقل مخصص جديد
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                      عنوان الحقل بالعربية (الظاهر للزائرة وعمود الشيت):
                    </label>
                    <input
                      type="text"
                      value={field.labelAr}
                      onChange={(e) => handleLabelChange(field.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#161114] text-[#2D2A26] dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                      نوع الإدخال:
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={field.type}
                        onChange={(e) => handleTypeChange(field.id, e.target.value as FormFieldConfig['type'])}
                        className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#161114] text-[#2D2A26] dark:text-white focus:outline-none"
                      >
                        <option value="text">نص عادي (Text)</option>
                        <option value="tel">رقم هاتف / واتساب (Phone)</option>
                        <option value="select">قائمة منسدلة (Dropdown / Select)</option>
                        <option value="textarea">نص تفصيلي (Textarea)</option>
                        <option value="number">رقم عددي (Number)</option>
                      </select>

                      {field.type === 'select' && (
                        <button
                          type="button"
                          onClick={() => handleOpenOptionsEditor(field)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#AA7A1E] dark:text-[#E5C358] font-bold text-[11px] flex items-center gap-1 shrink-0"
                          title="تعديل خيارات القائمة المنسدلة"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>خيارات ({field.options?.length || 0})</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggles & Controls */}
              <div className="flex items-center gap-3 text-xs w-full lg:w-auto justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-gray-100 dark:border-white/5">
                {/* Required Toggle */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={() => handleToggleRequired(field.id)}
                    className="rounded text-[#C94C71]"
                  />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">إلزامي (*)</span>
                </label>

                {/* Enable / Disable Button */}
                <button
                  type="button"
                  onClick={() => handleToggleEnabled(field.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    field.enabled
                      ? 'bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30'
                      : 'bg-gray-200 text-gray-500 dark:bg-white/10 hover:bg-gray-300'
                  }`}
                >
                  {field.enabled ? 'مفعّل' : 'معطّل'}
                </button>

                {/* Delete button (for custom fields) */}
                {field.id.startsWith('custom-') && (
                  <button
                    onClick={() => handleDeleteField(field.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    title="حذف هذا الحقل المخصص"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Field Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#161114] rounded-3xl shadow-2xl border border-[#D4AF37]/35 p-6 space-y-4 text-start">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#C94C71]" />
                <h4 className="text-sm font-bold font-serif-luxury text-[#2D2A26] dark:text-white">
                  إضافة حقل مخصص جديد ({activeFormType === 'mlm' ? 'استمارة الانضمام' : 'حجز الاستشارة'})
                </h4>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewField} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">
                  اسم الحقل بالعربية (الظاهر للزائرة وعنوان عمود Google Sheets) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حساب الإنستغرام أو التيك توك"
                  value={newFieldLabelAr}
                  onChange={(e) => setNewFieldLabelAr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  المعرف الإنجليزي للحقل (Slug - بدون مسافات)
                </label>
                <input
                  type="text"
                  placeholder="مثال: instagramAccount"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11] font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">نوع الحقل</label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as FormFieldConfig['type'])}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                >
                  <option value="text">نص عادي (Text)</option>
                  <option value="tel">رقم هاتف / واتساب (Phone)</option>
                  <option value="select">قائمة منسدلة (Dropdown / Select)</option>
                  <option value="textarea">نص تفصيلي (Textarea)</option>
                  <option value="number">رقم عددي (Number)</option>
                </select>
              </div>

              {newFieldType === 'select' && (
                <div>
                  <label className="block font-semibold mb-1">
                    خيارات القائمة المنسدلة (كل خيار في سطر أو مفصولة بفواصل)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="نعم&#10;لا&#10;أحتاج تفاصيل أكثر"
                    value={newFieldOptions}
                    onChange={(e) => setNewFieldOptions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  />
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newFieldRequired}
                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                  className="rounded text-[#C94C71]"
                />
                <span className="font-semibold">حقل إلزامي يجب على الزائرة تعبئته قبل الإرسال</span>
              </label>

              <div className="pt-3 border-t border-[#D4AF37]/20 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-white font-bold text-xs rose-gold-gradient shadow-md hover:scale-[1.02] transition-all"
                >
                  تأكيد وإضافة الحقل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Options Modal */}
      {editingOptionsFieldId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#161114] rounded-3xl shadow-2xl border border-[#D4AF37]/35 p-6 space-y-4 text-start">
            <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/20">
              <h4 className="text-sm font-bold text-[#2D2A26] dark:text-white font-serif-luxury">
                تعديل خيارات القائمة المنسدلة
              </h4>
              <button
                onClick={() => setEditingOptionsFieldId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              اكتبي كل خيار في سطر منفصل، أو افصلي بين الخيارات بفاصلة (،):
            </p>

            <textarea
              rows={5}
              value={editingOptionsText}
              onChange={(e) => setEditingOptionsText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11] text-xs"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingOptionsFieldId(null)}
                className="px-4 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveOptions}
                className="px-5 py-1.5 rounded-xl bg-[#0F9D58] hover:bg-[#0c8248] text-white text-xs font-bold shadow"
              >
                حفظ الخيارات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
