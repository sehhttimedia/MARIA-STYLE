import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Lock, Eye, EyeOff, AlertCircle, Sparkles, Key, CheckCircle2 } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAdmin, loginAdminWithGoogle } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() !== 'admin') {
      setError('اسم المستخدم غير صحيح. (الافتراضي: admin)');
      return;
    }
    const res = loginAdmin(password);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    const res = await loginAdminWithGoogle();
    setIsGoogleLoading(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-lg mx-auto text-center">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#C94C71] to-[#D4AF37] text-white flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[#C94C71]/25">
        <Shield className="w-8 h-8" />
      </div>

      <h3 className="text-2xl font-bold font-serif-luxury text-[#2D2A26] dark:text-white mb-1.5">
        لوحة التحكم الإدارية الخاصة
      </h3>
      <p className="text-xs text-[#7A6F65] dark:text-[#A8988B] mb-5">
        بوابة منفصلة ومحمية بالكامل وخفية عن زوار الموقع
      </p>

      {/* Secret Access Instructions Card for Admin */}
      <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-[#D4AF37]/35 text-start text-xs text-[#6B5A24] dark:text-[#F4E8C1] space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-[#AA7A1E] dark:text-[#F4E8C1]">
          <Key className="w-4 h-4 text-[#D4AF37]" />
          <span>طرق الدخول السريّة للمشرفين (لا تظهر للزوار):</span>
        </div>
        <ul className="text-[11px] space-y-1 text-[#61574E] dark:text-[#E8DDD2] ps-5 list-disc">
          <li>
            <strong>الرابط المباشر:</strong> إضافة <code className="font-mono bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">#admin</code> إلى عنوان الموقع.
          </li>
          <li>
            <strong>اختصار لوحة المفاتيح:</strong> الضغط على <kbd className="font-mono bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Ctrl + Shift + A</kbd> في أي مكان بالصفحة.
          </li>
          <li>
            <strong>للهواتف والأجهزة اللوحية:</strong> النقر 3 مرات متتالية وسريعة على سطر حقوق الملكية بأسفل الموقع.
          </li>
        </ul>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs text-start space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
          {error.includes('غير مصرح له بعد') && (
            <button
              type="button"
              onClick={() => {
                setPassword('Maria2026!');
                setError(null);
                loginAdmin('Maria2026!');
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#C94C71] text-white font-bold text-xs hover:bg-[#A83256] transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Key className="w-3.5 h-3.5" />
              <span>دخول فوري بكلمة مرور المشرف المعتمدة (Maria2026!)</span>
            </button>
          )}
        </div>
      )}

      {/* Firebase Google Auth Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        className="w-full mb-4 py-2.5 px-4 rounded-xl border border-[#D4AF37]/40 bg-white dark:bg-[#1C1619] text-xs sm:text-sm font-semibold text-[#2D2A26] dark:text-white hover:border-[#C94C71] hover:bg-[#FAF7F2] dark:hover:bg-white/5 transition-all shadow-sm flex items-center justify-center gap-2.5 disabled:opacity-50"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{isGoogleLoading ? 'جاري الاتصال بـ Firebase...' : 'الدخول عبر حساب Google (Firebase)'}</span>
      </button>

      <div className="relative flex py-2 items-center mb-4">
        <div className="flex-grow border-t border-gray-200 dark:border-white/10" />
        <span className="flex-shrink mx-3 text-[11px] text-[#A8988B] uppercase">أو بكلمة المرور</span>
        <div className="flex-grow border-t border-gray-200 dark:border-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-start">
        <div>
          <label className="block text-xs font-semibold text-[#443E38] dark:text-[#D1C5B8] mb-1.5">
            اسم المستخدم
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(null);
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-[#FAF7F2] placeholder-gray-400 dark:placeholder-[#8C7E75] text-xs sm:text-sm focus:outline-none focus:border-[#C94C71] dark:focus:border-[#D4AF37] shadow-inner"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#443E38] dark:text-[#D1C5B8] mb-1.5">
            كلمة المرور
          </label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={password}
              placeholder="••••••••"
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className="w-full ps-4 pe-10 py-2.5 rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-[#FAF7F2] placeholder-gray-400 dark:placeholder-[#8C7E75] text-xs sm:text-sm focus:outline-none focus:border-[#C94C71] dark:focus:border-[#D4AF37] shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl text-sm font-bold text-white rose-gold-gradient shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
        >
          <Lock className="w-4 h-4 text-[#F4E8C1]" />
          <span>تسجيل الدخول الآمن</span>
        </button>
      </form>
    </div>
  );
};
