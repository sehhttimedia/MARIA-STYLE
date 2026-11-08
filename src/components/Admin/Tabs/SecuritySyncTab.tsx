import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { GOOGLE_SHEETS_WEBHOOK_URL } from '../../../utils/webhook';
import {
  Shield,
  Key,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

export const SecuritySyncTab: React.FC = () => {
  const {
    changeAdminPassword,
    syncAllWithWebhook,
    syncStatus,
    mlmLeads,
    bookings,
    sales,
    cms,
  } = useApp();

  // Password change form
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState<{ text: string; success: boolean } | null>(null);

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
  };

  return (
    <div className="space-y-8 text-start text-xs">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-[#2D2A26] dark:text-white font-serif-luxury">
          الأمان السيبراني والمزامنة السحابية (4-Sheets Engine)
        </h3>
        <p className="text-xs text-gray-500">
          إدارة جلسات الأدمن، تشفير المدخلات، ومزامنة فورية مع قاعدة البيانات المركزية لـ Google Sheets
        </p>
      </div>

      {/* Google Workspace 1P Integration Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0F9D58]/10 via-[#4285F4]/10 to-transparent border border-[#0F9D58]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F9D58]/20 text-[#0F9D58] flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#2D2A26] dark:text-white">
              تكامل Google Workspace الرسمي (1P API - Drive &amp; Sheets) مفعّل الآن!
            </h4>
            <p className="text-[11px] text-neutral-500">
              يمكنك الآن إدارة جداول Google Sheets وتصفح ملفات Google Drive وإنشاء نسخ احتياطية مباشرة من تبويب "9. تكامل Drive &amp; Sheets".
            </p>
          </div>
        </div>
      </div>

      {/* Cloud Sheets Webhook Control Card */}
      <div className="glass-luxury rounded-2xl border-2 border-[#D4AF37]/40 p-6 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#D4AF37]/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-5 h-5 text-[#D4AF37]" />
              <h4 className="text-sm font-bold text-[#2D2A26] dark:text-white font-serif-luxury">
                نظام المزامنة الدقيقة مع الشيتات الأربعة (Multi-Sheet Router)
              </h4>
            </div>
            <span className="text-xs text-[#7A6F65] dark:text-[#A8988B]">
              المسار الفعلي: Google Apps Script Webhook Endpoint
            </span>
          </div>

          <button
            onClick={syncAllWithWebhook}
            disabled={syncStatus.isSyncing}
            className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#C94C71] via-[#D4AF37] to-[#A83256] shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
            <span>{syncStatus.isSyncing ? 'جاري المزامنة...' : 'SYNC NOW (مزامنة كافة الشيتات الآن)'}</span>
          </button>
        </div>

        {/* Live Status Indicator & Ad Campaign Buffer */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#120E11] border border-[#D4AF37]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                syncStatus.success !== false ? 'bg-[#25D366] animate-ping' : 'bg-red-500'
              }`}
            />
            <div>
              <span className="font-bold text-[#2D2A26] dark:text-white block">
                {syncStatus.message}
              </span>
              {syncStatus.lastSyncedTime && (
                <span className="text-[10px] text-gray-400">
                  آخر مزامنة ناجحة: {syncStatus.lastSyncedTime}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
              (syncStatus.pendingCount ?? 0) > 0 
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {(syncStatus.pendingCount ?? 0) > 0 
                  ? `طابور الأوفلاين: ${syncStatus.pendingCount} طلبات معلقة` 
                  : 'حماية الحملات الإعلانية: 100% متزامن'}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Sheets Breakdown Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#FAF5EE] dark:bg-white/5 border border-[#C94C71]/30">
            <span className="text-[10px] font-mono text-gray-500 block">الشيت 1: Leads_MLM</span>
            <span className="text-sm font-bold text-[#C94C71]">{mlmLeads.length} طلبات انضمام</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">محفوظة وموجهة بالكامل</span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF5EE] dark:bg-white/5 border border-[#D4AF37]/30">
            <span className="text-[10px] font-mono text-gray-500 block">الشيت 2: Bookings</span>
            <span className="text-sm font-bold text-[#D4AF37]">{bookings.length} حجوزات استشارات</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">تحديث فوري للمواعيد</span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF5EE] dark:bg-white/5 border border-[#25D366]/30">
            <span className="text-[10px] font-mono text-gray-500 block">الشيت 3: Sales</span>
            <span className="text-sm font-bold text-[#25D366]">{sales.length} حركات مبيعات</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">تتبع أداء وعمولات العضوات</span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF5EE] dark:bg-white/5 border border-purple-500/30">
            <span className="text-[10px] font-mono text-gray-500 block">الشيت 4: CMS_Content</span>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">محتوى الموقع</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">النصوص والواتساب والسوشيال</span>
          </div>
        </div>

        {/* Webhook Endpoint Display (Read-Only) */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">
            رابط الـ Webhook النشط (Google Apps Script)
          </label>
          <input
            type="text"
            readOnly
            value={GOOGLE_SHEETS_WEBHOOK_URL}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/20 bg-gray-50 dark:bg-black/40 text-[11px] font-mono text-gray-600 dark:text-gray-300"
          />
        </div>
      </div>

      {/* Password & Security Card */}
      <div className="glass-luxury rounded-2xl border border-[#D4AF37]/30 p-6 shadow-md max-w-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#D4AF37]/20">
          <Key className="w-4 h-4 text-[#C94C71]" />
          <h4 className="text-sm font-bold text-[#2D2A26] dark:text-white font-serif-luxury">
            تغيير كلمة مرور المشرف (Admin Password)
          </h4>
        </div>

        {passMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              passMessage.success
                ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-700 dark:text-red-300'
            }`}
          >
            {passMessage.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{passMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold mb-1">كلمة المرور الحالية *</label>
            <input
              type="password"
              required
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">كلمة المرور الجديدة *</label>
            <input
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">تأكيد كلمة المرور الجديدة *</label>
            <input
              type="password"
              required
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-white font-bold rose-gold-gradient shadow-md hover:scale-[1.02] transition-all cursor-pointer"
            >
              تحديث كلمة المرور
            </button>
          </div>
        </form>
      </div>

      {/* Cloud & Local Platform Backup & Restore Card */}
      <div className="glass-luxury rounded-2xl border border-[#D4AF37]/30 p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#D4AF37]/20">
          <Database className="w-5 h-5 text-[#4285F4]" />
          <h4 className="text-sm font-bold text-[#2D2A26] dark:text-white font-serif-luxury">
            النسخ الاحتياطي والاستعادة الشاملة للمنصة (Multi-Device Portability)
          </h4>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          يمكنكِ تصدير كافة محتويات الموقع (المنتجات، أرقام الواتساب، التكريمات، طلبات الـ MLM، والحجوزات) في ملف نسخ احتياطي واحد لنقله فورياً لأي جهاز أو حاسوب آخر بضغطة زر.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Export Button */}
          <button
            type="button"
            onClick={() => {
              const { exportBackupData } = useApp() as any;
              const json = exportBackupData();
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `maria-style-backup-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="p-4 rounded-xl border border-[#4285F4]/30 bg-[#4285F4]/10 hover:bg-[#4285F4]/20 text-[#4285F4] text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            <span>تحميل نسخة احتياطية كاملة (JSON)</span>
            <span className="text-[10px] text-gray-400 font-normal">حفظ كافة الإعدادات والمنتجات والأرقام</span>
          </button>

          {/* Import Button */}
          <label className="p-4 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer">
            <CheckCircle2 className="w-5 h-5" />
            <span>استيراد نسخة احتياطية من ملف</span>
            <span className="text-[10px] text-gray-400 font-normal">استعادة الإعدادات على أي جهاز جديد</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const content = event.target?.result as string;
                    const { importBackupData } = useApp() as any;
                    const res = importBackupData(content);
                    alert(res.message);
                  } catch (err: any) {
                    alert(`خطأ في قراءة الملف: ${err.message}`);
                  }
                };
                reader.readAsText(file);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

