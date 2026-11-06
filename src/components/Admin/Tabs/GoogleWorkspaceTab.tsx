import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  getAccessToken,
  setCachedAccessToken,
  signInWithGoogleWorkspace,
  signOutGoogleWorkspace,
  requestAccessTokenViaGIS,
  createSpreadsheet,
  getSpreadsheetMetadata,
  readSheetValues,
  appendSheetRows,
  updateSheetValues,
  listDriveFiles,
  listDriveMediaFiles,
  createDriveFolder,
  uploadDriveFile,
  uploadDriveMediaBlob,
  deleteDriveFile,
  GoogleSpreadsheet,
  GoogleDriveFile,
  subscribeToTokenChange,
  trySilentTokenReconnect,
  getUserProfile,
} from '../../../lib/googleWorkspace';
import { normalizeDriveUrl, handleImageError } from '../../../utils/drive';
import {
  FileSpreadsheet,
  FolderOpen,
  UploadCloud,
  RefreshCw,
  ExternalLink,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Folder,
  Image as ImageIcon,
  Video,
  Download,
  Database,
  ArrowRight,
  ShieldAlert,
  Copy,
  Check,
  Upload,
  Search,
  Sparkles,
  Key,
  X,
} from 'lucide-react';

export const GoogleWorkspaceTab: React.FC = () => {
  const { mlmLeads, bookings, sales, products, cms, fireConfetti } = useApp();

  const [accessToken, setAccessToken] = useState<string | null>(getAccessToken());
  const [currentUser, setCurrentUser] = useState<{ displayName?: string; email?: string; photoURL?: string } | null>(() => {
    const p = getUserProfile();
    return (p.email || p.name) ? { displayName: p.name || undefined, email: p.email || undefined, photoURL: p.photo || undefined } : null;
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showManualToken, setShowManualToken] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [domainCopied, setDomainCopied] = useState(false);

  // Active sub-view: 'sheets' | 'media' | 'drive'
  const [subView, setSubView] = useState<'sheets' | 'media' | 'drive'>('sheets');

  // Google Sheets states
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem('maria_style_active_sheet_id') || '';
  });
  const [spreadsheetInfo, setSpreadsheetInfo] = useState<GoogleSpreadsheet | null>(null);
  const [sheetPreviewData, setSheetPreviewData] = useState<any[][]>([]);
  const [activeSheetTab, setActiveSheetTab] = useState<string>('طلبات الانضمام MLM');
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [sheetMessage, setSheetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Google Drive generic files states
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileFilter, setFileFilter] = useState<'all' | 'sheets' | 'folders' | 'media'>('all');
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<GoogleDriveFile | null>(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  // Dedicated Media (Photos & Videos) Gallery states
  const [mediaFiles, setMediaFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
  const [mediaSearch, setMediaSearch] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Subscribe to token changes & profile info
  useEffect(() => {
    const unsubscribeToken = subscribeToTokenChange((token) => {
      setAccessToken(token);
      if (token) {
        const p = getUserProfile();
        if (p.email || p.name) {
          setCurrentUser({
            displayName: p.name || undefined,
            email: p.email || undefined,
            photoURL: p.photo || undefined,
          });
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => {
      unsubscribeToken();
    };
  }, []);

  // Attempt silent reconnect on mount
  useEffect(() => {
    if (!accessToken) {
      trySilentTokenReconnect().then((t) => {
        if (t) setAccessToken(t);
      });
    }
  }, [accessToken]);

  // Fetch drive files when authenticated or subview changes to 'drive'
  useEffect(() => {
    if (accessToken && subView === 'drive') {
      loadDriveFiles();
    }
  }, [accessToken, subView, fileFilter]);

  // Fetch media files when authenticated and subview is 'media'
  useEffect(() => {
    if (accessToken && subView === 'media') {
      loadMediaFiles();
    }
  }, [accessToken, subView, mediaFilter]);

  // Load spreadsheet details if ID exists
  useEffect(() => {
    if (accessToken && spreadsheetId) {
      loadSpreadsheetDetails(spreadsheetId);
    }
  }, [accessToken, spreadsheetId]);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await signInWithGoogleWorkspace();
      setCurrentUser(res.user as any);
      setAccessToken(res.accessToken);
      fireConfetti();
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'فشل تسجيل الدخول وربط Google Workspace');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGisDirectConnect = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await requestAccessTokenViaGIS();
      setAccessToken(res.accessToken);
      fireConfetti();
    } catch (err: any) {
      setAuthError(err.message || 'تعذر الاتصال المباشر عبر Google Identity Services');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleApplyManualToken = () => {
    if (!manualToken.trim()) return;
    setCachedAccessToken(manualToken.trim(), 'مشرف معتمد');
    setAccessToken(manualToken.trim());
    setAuthError(null);
    setShowManualToken(false);
    fireConfetti();
  };

  const handleSignOut = async () => {
    await signOutGoogleWorkspace();
    setAccessToken(null);
    setCurrentUser(null);
    setSpreadsheetInfo(null);
    setDriveFiles([]);
    setMediaFiles([]);
  };

  // ==========================================
  // SHEETS ACTIONS
  // ==========================================

  const handleCreateNewSpreadsheet = async () => {
    setIsCreatingSheet(true);
    setSheetMessage(null);
    try {
      const title = `ماريا ستايل CRM - ${new Date().toLocaleDateString('ar-DZ')}`;
      const result = await createSpreadsheet(title, [
        'طلبات الانضمام MLM',
        'حجوزات الاستشارات',
        'سجل المبيعات والعمولات',
      ]);
      setSpreadsheetId(result.spreadsheetId);
      localStorage.setItem('maria_style_active_sheet_id', result.spreadsheetId);

      // Seed initial headers
      await updateSheetValues(result.spreadsheetId, "'طلبات الانضمام MLM'!A1:H1", [
        ['تاريخ الطلب', 'معرف الطلب', 'الاسم الكامل', 'رقم الهاتف', 'المدينة والدولة', 'الحالة', 'كود العضوة الراعية', 'ملاحظات'],
      ]);
      await updateSheetValues(result.spreadsheetId, "'حجوزات الاستشارات'!A1:G1", [
        ['تاريخ التسجيل', 'معرف الحجز', 'اسم العميلة', 'الهاتف', 'نوع الاستشارة', 'الموعد المفضل', 'الحالة والملاحظات'],
      ]);
      await updateSheetValues(result.spreadsheetId, "'سجل المبيعات والعمولات'!A1:G1", [
        ['تاريخ الطلب', 'معرف الطلب', 'اسم المشترية', 'المبلغ الإجمالي', 'كود العضوة', 'العمولة المستحقة', 'حالة الدفع'],
      ]);

      await loadSpreadsheetDetails(result.spreadsheetId);
      fireConfetti();
      setSheetMessage({
        type: 'success',
        text: `تم إنشاء جدول Google Sheets جديد بنجاح وربطه بالمنصة!`,
      });
    } catch (err: any) {
      console.error(err);
      setSheetMessage({ type: 'error', text: err.message || 'فشل إنشاء جدول البيانات.' });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleSyncAllData = async (targetId: string) => {
    if (!targetId) {
      setSheetMessage({ type: 'error', text: 'يرجى ربط جدول Google Sheets أولاً قبل المزامنة.' });
      return;
    }

    setIsSyncingSheet(true);
    setSheetMessage(null);

    try {
      // 1. Format MLM Leads
      const leadsRows = mlmLeads.map((l) => [
        l.createdAt || new Date().toISOString(),
        l.id,
        l.fullName || 'غير محدد',
        l.phone || 'غير محدد',
        `${l.city || ''} ${l.country ? `(${l.country})` : ''}`,
        l.status,
        l.attributionCode || 'مباشر',
        l.notes || '',
      ]);

      // 2. Format Bookings
      const bookingsRows = bookings.map((b) => [
        b.createdAt || new Date().toISOString(),
        b.id,
        b.clientName || 'غير محدد',
        b.phone || 'غير محدد',
        b.consultationType || 'استشارة عامة',
        `${b.preferredDate || ''} ${b.preferredTime || ''}`,
        `${b.status} - ${b.adminNotes || ''}`,
      ]);

      // 3. Format Sales
      const salesRows = sales.map((s) => [
        s.orderDate || new Date().toISOString(),
        s.orderId || s.id,
        s.customerName,
        s.totalAmount,
        s.memberCode,
        s.commissionEarned,
        s.synced ? 'مكتمل' : 'معلق',
      ]);

      // Write headers + data
      if (leadsRows.length > 0) {
        await updateSheetValues(targetId, `'طلبات الانضمام MLM'!A2:H${leadsRows.length + 1}`, leadsRows);
      }
      if (bookingsRows.length > 0) {
        await updateSheetValues(targetId, `'حجوزات الاستشارات'!A2:G${bookingsRows.length + 1}`, bookingsRows);
      }
      if (salesRows.length > 0) {
        await updateSheetValues(targetId, `'سجل المبيعات والعمولات'!A2:G${salesRows.length + 1}`, salesRows);
      }

      await loadSheetPreview(targetId, activeSheetTab);
      fireConfetti();
      setSheetMessage({
        type: 'success',
        text: `تمت مزامنة (${leadsRows.length}) طلب انضمام و (${bookingsRows.length}) حجز و (${salesRows.length}) مبيعات إلى Google Sheets بنجاح!`,
      });
    } catch (err: any) {
      console.error(err);
      setSheetMessage({ type: 'error', text: err.message || 'فشلت المزامنة مع Google Sheets.' });
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const loadSpreadsheetDetails = async (id: string) => {
    try {
      const meta = await getSpreadsheetMetadata(id);
      setSpreadsheetInfo(meta);
      if (meta.sheets.length > 0) {
        const firstSheetName = meta.sheets[0].properties.title;
        setActiveSheetTab(firstSheetName);
        await loadSheetPreview(id, firstSheetName);
      }
    } catch (err: any) {
      console.warn('Could not load spreadsheet details:', err);
    }
  };

  const loadSheetPreview = async (id: string, sheetTitle: string) => {
    try {
      const rows = await readSheetValues(id, `'${sheetTitle}'!A1:H20`);
      setSheetPreviewData(rows);
    } catch (err) {
      setSheetPreviewData([]);
    }
  };

  // ==========================================
  // DRIVE MEDIA ACTIONS
  // ==========================================

  const loadMediaFiles = async () => {
    setIsLoadingMedia(true);
    try {
      const files = await listDriveMediaFiles(mediaFilter, mediaSearch);
      setMediaFiles(files);
    } catch (err) {
      console.error('Failed to load media files:', err);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    try {
      const result = await uploadDriveMediaBlob(file);
      setMediaFiles((prev) => [result.file, ...prev]);
      fireConfetti();
      alert('تم رفع الصورة/الفيديو بنجاح إلى Google Drive!');
    } catch (err: any) {
      alert(`فشل رفع الوسائط إلى Google Drive: ${err.message}`);
    } finally {
      setIsUploadingMedia(false);
      e.target.value = '';
    }
  };

  const copyMediaStreamUrl = (fileId: string) => {
    const url = normalizeDriveUrl(fileId, 'product');
    navigator.clipboard.writeText(url);
    setCopiedUrl(fileId);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // ==========================================
  // DRIVE GENERIC ACTIONS
  // ==========================================

  const loadDriveFiles = async () => {
    setIsLoadingFiles(true);
    try {
      let q = "trashed = false";
      if (fileFilter === 'sheets') {
        q += " and mimeType = 'application/vnd.google-apps.spreadsheet'";
      } else if (fileFilter === 'folders') {
        q += " and mimeType = 'application/vnd.google-apps.folder'";
      } else if (fileFilter === 'media') {
        q += " and (mimeType contains 'image/' or mimeType contains 'video/')";
      }

      const files = await listDriveFiles(q, 40);
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      await createDriveFolder(newFolderName.trim());
      setNewFolderName('');
      await loadDriveFiles();
      fireConfetti();
    } catch (err: any) {
      alert(`فشل إنشاء المجلد: ${err.message}`);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleBackupToDrive = async () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        brand: 'ماريا ستايل - Maria Style',
        leads: mlmLeads,
        bookings,
        sales,
        products,
        cms,
      };

      const nowStr = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `maria-style-backup-${nowStr}.json`;
      const content = JSON.stringify(backupData, null, 2);

      await uploadDriveFile(filename, 'application/json', content);
      await loadDriveFiles();
      fireConfetti();
      alert('تم رفع ملف النسخة الاحتياطية بنجاح إلى حسابك في Google Drive!');
    } catch (err: any) {
      alert(`فشل رفع النسخة الاحتياطية إلى Google Drive: ${err.message}`);
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeletingFile(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      setFileToDelete(null);
      await loadDriveFiles();
      if (subView === 'media') {
        await loadMediaFiles();
      }
    } catch (err: any) {
      alert(`فشل حذف الملف: ${err.message}`);
    } finally {
      setIsDeletingFile(false);
    }
  };

  return (
    <div className="space-y-6 text-[#2D2A26] dark:text-[#FAF7F2]">
      {/* Top Banner & OAuth Connection Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-white/80 to-[#FAF5EE]/90 dark:from-[#1A1418] dark:to-[#120E11] border border-[#D4AF37]/30 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0F9D58] via-[#4285F4] to-[#F4B400] flex items-center justify-center p-3 shadow-lg shrink-0">
              <FileSpreadsheet className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-serif-luxury text-[#2D2A26] dark:text-white">
                  تكامل Google Drive &amp; Google Sheets
                </h3>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#0F9D58]/15 text-[#0F9D58] font-bold border border-[#0F9D58]/30">
                  سحابي رسمي 1P
                </span>
              </div>
              <p className="text-xs text-[#5A524A] dark:text-[#C5B7A9] mt-1 max-w-xl leading-relaxed">
                اربط حساب Google لمزامنة استفسارات MLM، حجوزات الجمال والاستشارات، والمبيعات مباشرة في جداول Google Sheets، مع استعراض واستخدام وسائط الصور والفيديوهات من Google Drive.
              </p>
            </div>
          </div>

          {/* Auth Action */}
          <div className="shrink-0">
            {accessToken ? (
              <div className="flex items-center gap-3 bg-white/70 dark:bg-black/40 p-2.5 rounded-xl border border-[#D4AF37]/30">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#C94C71] to-[#D4AF37] text-white flex items-center justify-center font-bold text-xs shadow">
                  G
                </div>
                <div className="text-start">
                  <div className="text-xs font-bold leading-tight">
                    {currentUser?.displayName || 'حساب Google متصل'}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>تم التحقق والاتصال السحابي</span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ms-2 px-2.5 py-1 text-[11px] rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold transition-colors"
                >
                  فصل الحساب
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={handleSignIn}
                  disabled={isAuthenticating}
                  className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white dark:bg-[#1E191C] border border-[#D4AF37]/40 shadow-md hover:shadow-lg hover:border-[#D4AF37] transition-all cursor-pointer font-medium text-xs text-[#2D2A26] dark:text-white"
                >
                  {isAuthenticating ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#C94C71]" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  )}
                  <span>تسجيل الدخول وربط Google Workspace</span>
                </button>

                <button
                  onClick={handleGisDirectConnect}
                  disabled={isAuthenticating}
                  className="px-3.5 py-2.5 rounded-xl bg-[#4285F4]/10 hover:bg-[#4285F4]/20 text-[#4285F4] border border-[#4285F4]/30 text-xs font-bold transition-all"
                  title="اتصال مباشر عبر Google Identity Services"
                >
                  اتصال GIS المباشر
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Authentication Notice / Error Card */}
        {authError && (
          <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs space-y-3">
            <div className="flex items-start justify-between gap-2.5 text-red-700 dark:text-red-300">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <div className="space-y-1">
                  <span className="font-bold block">تعذر استكمال الاتصال بحساب Google:</span>
                  <p className="leading-relaxed">{authError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuthError(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white"
                aria-label="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {/* Option 1: Re-try GIS Direct Connect */}
              <button
                type="button"
                onClick={handleGisDirectConnect}
                disabled={isAuthenticating}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#4285F4] to-[#2B6CB0] text-white font-bold flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>إعادة الاتصال عبر Google Identity Services</span>
              </button>

              {/* Option 2: Manual token input if needed */}
              <button
                type="button"
                onClick={() => setShowManualToken(!showManualToken)}
                className="py-2 px-3 rounded-xl bg-white dark:bg-[#1E191C] border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-bold flex items-center justify-center gap-1.5 hover:bg-neutral-100 transition-all"
              >
                <Key className="w-3.5 h-3.5" />
                <span>ربط Access Token يدوياً (اختياري)</span>
              </button>
            </div>

            {showManualToken && (
              <div className="p-3 rounded-xl bg-white dark:bg-[#120E11] border border-neutral-300 dark:border-neutral-700 space-y-2 mt-2">
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  أدخلي OAuth Access Token المباشر من Google Cloud أو OAuth Playground:
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="ya29.a0..."
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-neutral-50 dark:bg-black/30 font-mono text-xs focus:outline-none"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={handleApplyManualToken}
                    className="px-4 py-1.5 rounded-lg bg-[#0F9D58] text-white font-bold text-xs hover:bg-[#0c8248]"
                  >
                    تطبيق وتوصيل
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Workspace Navigation Subtabs */}
      <div className="flex border-b border-[#D4AF37]/25 gap-2 overflow-x-auto">
        <button
          onClick={() => setSubView('sheets')}
          className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 shrink-0 ${
            subView === 'sheets'
              ? 'border-[#0F9D58] text-[#0F9D58] bg-[#0F9D58]/10'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>1. جداول Google Sheets والمزامنة</span>
        </button>

        <button
          onClick={() => setSubView('media')}
          className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 shrink-0 ${
            subView === 'media'
              ? 'border-[#C94C71] text-[#C94C71] bg-[#C94C71]/10'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>2. وسائط الحساب المربوط (صور وفيديوهات Drive)</span>
        </button>

        <button
          onClick={() => setSubView('drive')}
          className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 shrink-0 ${
            subView === 'drive'
              ? 'border-[#4285F4] text-[#4285F4] bg-[#4285F4]/10'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>3. ملفات Google Drive والنسخ الاحتياطي</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: GOOGLE SHEETS CRM SYNC */}
      {/* ============================================================== */}
      {subView === 'sheets' && (
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action 1: Create New Sheet */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#1A1418] border border-[#D4AF37]/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#0F9D58] mb-1.5">
                  <Plus className="w-4 h-4" />
                  <span>إنشاء جدول جديد بضغطة واحدة</span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed mb-4">
                  يقوم بإنشاء جدول بيانات رسمي في حسابك Google Drive مقسّم إلى 3 صفحات لطلبات MLM، الحجوزات، وسجل المبيعات.
                </p>
              </div>
              <button
                onClick={handleCreateNewSpreadsheet}
                disabled={!accessToken || isCreatingSheet}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#0F9D58] hover:bg-[#0c8248] text-white text-xs font-bold shadow disabled:opacity-50 transition-all cursor-pointer"
              >
                {isCreatingSheet ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                )}
                <span>إنشاء ومزامنة جدول جديد</span>
              </button>
            </div>

            {/* Action 2: Connect Existing Sheet */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#1A1418] border border-[#D4AF37]/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#4285F4] mb-1.5">
                  <Database className="w-4 h-4" />
                  <span>ربط جدول حالي عبر المعرف</span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed mb-2">
                  أدخل معرف جدول Google Sheets (Spreadsheet ID من رابط الجدول) لربطه مباشرة.
                </p>
                <input
                  type="text"
                  placeholder="مثال: 1BxiMVs0XRA5nFMdKvBdB..."
                  value={spreadsheetId}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setSpreadsheetId(val);
                    localStorage.setItem('maria_style_active_sheet_id', val);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-black/30 mb-3"
                  dir="ltr"
                />
              </div>
              <button
                onClick={() => loadSpreadsheetDetails(spreadsheetId)}
                disabled={!accessToken || !spreadsheetId}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-bold shadow disabled:opacity-50 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تحميل بيانات الجدول</span>
              </button>
            </div>

            {/* Action 3: Push Live Sync */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#1A1418] border border-[#D4AF37]/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#C94C71] mb-1.5">
                  <UploadCloud className="w-4 h-4" />
                  <span>تحديث ومزامنة البيانات الآن</span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed mb-4">
                  إرسال وتحديث كافة بيانات الاستفسارات والمبيعات والحجوزات الحالية إلى الجدول المرتبط مباشرة.
                </p>
              </div>
              <button
                onClick={() => handleSyncAllData(spreadsheetId)}
                disabled={!accessToken || !spreadsheetId || isSyncingSheet}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-[#C94C71] to-[#D4AF37] text-white text-xs font-bold shadow hover:shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSyncingSheet ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>مزامنة كافة السجلات فورياً</span>
              </button>
            </div>
          </div>

          {sheetMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                sheetMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
              }`}
            >
              {sheetMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{sheetMessage.text}</span>
            </div>
          )}

          {/* Connected Spreadsheet Details */}
          {spreadsheetInfo && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1418] border border-[#D4AF37]/25 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#0F9D58]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#2D2A26] dark:text-white">
                      {spreadsheetInfo.properties.title}
                    </h4>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      ID: {spreadsheetInfo.spreadsheetId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={spreadsheetInfo.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F9D58]/10 text-[#0F9D58] hover:bg-[#0F9D58]/20 text-xs font-bold transition-all"
                  >
                    <span>فتح في Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Sheet Tabs Selector */}
              {spreadsheetInfo.sheets.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[11px] text-neutral-400 font-bold shrink-0 me-2">الصفحات:</span>
                  {spreadsheetInfo.sheets.map((s) => {
                    const title = s.properties.title;
                    const isSelected = activeSheetTab === title;
                    return (
                      <button
                        key={title}
                        onClick={() => {
                          setActiveSheetTab(title);
                          loadSheetPreview(spreadsheetId, title);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                          isSelected
                            ? 'bg-[#0F9D58] text-white shadow-sm'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                        }`}
                      >
                        {title}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Table Preview */}
              <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 max-h-80">
                {sheetPreviewData.length > 0 ? (
                  <table className="w-full text-xs text-start">
                    <thead>
                      <tr className="bg-neutral-100 dark:bg-neutral-800/80 font-bold border-b border-neutral-200 dark:border-neutral-700">
                        {sheetPreviewData[0]?.map((col: any, idx: number) => (
                          <th key={idx} className="p-2.5 text-start whitespace-nowrap text-[#C94C71]">
                            {String(col || '')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      {sheetPreviewData.slice(1).map((row: any[], rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                          {row.map((cell: any, cIdx: number) => (
                            <td key={cIdx} className="p-2.5 whitespace-nowrap text-neutral-600 dark:text-neutral-300">
                              {String(cell || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-xs text-neutral-400">
                    لا توجد بيانات معروضة في هذه الورقة حالياً. اضغط على "مزامنة السجلات" أعلاه لتعبئتها فورياً.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: DEDICATED MEDIA (PHOTOS & VIDEOS) FROM CONNECTED GOOGLE DRIVE */}
      {/* ============================================================== */}
      {subView === 'media' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1A1418] border border-[#D4AF37]/20 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {[
                { id: 'all', label: 'كافة الوسائط (صور وفيديوهات)' },
                { id: 'image', label: 'الصور فقط' },
                { id: 'video', label: 'الفيديوهات فقط' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setMediaFilter(f.id as typeof mediaFilter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    mediaFilter === f.id
                      ? 'bg-[#C94C71] text-white shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search and Upload */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث في أسماء الوسائط..."
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadMediaFiles()}
                  className="w-full ps-8 pe-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-black/30 focus:outline-none"
                />
              </div>

              <button
                onClick={loadMediaFiles}
                disabled={!accessToken || isLoadingMedia}
                className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                title="تحديث القائمة"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingMedia ? 'animate-spin' : ''}`} />
              </button>

              {/* Direct Upload to Google Drive */}
              <label className="cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-xs font-bold shadow hover:opacity-95 transition-all shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingMedia ? 'جاري الرفع...' : 'رفع وسائط جديدة لـ Drive'}</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  disabled={!accessToken || isUploadingMedia}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Media Grid */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1418] border border-[#D4AF37]/25 shadow-sm">
            <h4 className="text-xs font-bold text-neutral-500 mb-3 flex items-center justify-between">
              <span>وسائط الصور والفيديوهات من حسابك ({mediaFiles.length})</span>
              {isLoadingMedia && <span className="text-[11px] text-[#C94C71]">جاري الفحص والتحميل...</span>}
            </h4>

            {mediaFiles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {mediaFiles.map((file) => {
                  const isVideo = file.mimeType.includes('video/');
                  const streamUrl = normalizeDriveUrl(file.id, 'product');
                  const isCopied = copiedUrl === file.id;

                  return (
                    <div
                      key={file.id}
                      className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black/20 flex flex-col justify-between group hover:border-[#D4AF37] transition-all"
                    >
                      <div className="relative aspect-square overflow-hidden bg-black/10 flex items-center justify-center">
                        {isVideo && !file.thumbnailLink ? (
                          <div className="flex flex-col items-center justify-center text-gray-500 p-2 text-center">
                            <Video className="w-10 h-10 text-[#C94C71] mb-1" />
                            <span className="text-[10px] font-bold">فيديو Drive</span>
                          </div>
                        ) : (
                          <img
                            src={file.thumbnailLink || streamUrl}
                            alt={file.name}
                            loading="lazy"
                            onError={(e) => handleImageError(e, isVideo ? 'award' : 'product')}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}

                        <span className="absolute top-2 start-2 px-2 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white backdrop-blur-sm flex items-center gap-1">
                          {isVideo ? <Video className="w-2.5 h-2.5 text-[#C94C71]" /> : <ImageIcon className="w-2.5 h-2.5 text-[#D4AF37]" />}
                          <span>{isVideo ? 'فيديو' : 'صورة'}</span>
                        </span>
                      </div>

                      <div className="p-2.5 text-start space-y-1.5">
                        <h5 className="text-[11px] font-bold truncate text-[#2D2A26] dark:text-white" title={file.name}>
                          {file.name}
                        </h5>
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span>{file.size ? `${Math.round(parseInt(file.size, 10) / 1024)} KB` : 'Google Drive'}</span>
                        </div>

                        {/* Action: Copy Streaming URL */}
                        <button
                          onClick={() => copyMediaStreamUrl(file.id)}
                          className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                            isCopied
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white dark:bg-[#1E191C] border border-[#D4AF37]/30 text-[#C94C71] hover:bg-[#FAF7F2]'
                          }`}
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'تم نسخ الرابط المباشر!' : 'نسخ رابط البث المباشر'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-neutral-400">
                {!accessToken
                  ? 'يرجى تسجيل الدخول بحساب Google لعرض وسائطك.'
                  : isLoadingMedia
                  ? 'جاري فحص الصور والفيديوهات في Google Drive...'
                  : 'لم يتم العثور على صور أو مقاطع فيديو في حسابك. يمكنك رفعها من زر "رفع وسائط جديدة" أعلاه.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: GOOGLE DRIVE FILE EXPLORER */}
      {/* ============================================================== */}
      {subView === 'drive' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1A1418] border border-[#D4AF37]/20 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {[
                { id: 'all', label: 'كافة الملفات' },
                { id: 'sheets', label: 'جداول البيانات' },
                { id: 'folders', label: 'المجلدات' },
                { id: 'media', label: 'الوسائط والصور' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFileFilter(f.id as typeof fileFilter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    fileFilter === f.id
                      ? 'bg-[#4285F4] text-white shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={handleBackupToDrive}
                disabled={!accessToken}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C94C71] to-[#D4AF37] text-white text-xs font-bold shadow hover:shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>حفظ نسخة احتياطية في Drive</span>
              </button>

              <button
                onClick={loadDriveFiles}
                disabled={!accessToken || isLoadingFiles}
                className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                title="تحديث القائمة"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Create Folder Form */}
          <form
            onSubmit={handleCreateFolder}
            className="p-3.5 rounded-xl bg-white dark:bg-[#1A1418] border border-[#D4AF37]/20 flex items-center gap-2"
          >
            <Folder className="w-4 h-4 text-[#4285F4] shrink-0" />
            <input
              type="text"
              placeholder="اسم مجلد جديد في Google Drive (مثال: ماريا ستايل - العقود والوسائط)..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="flex-1 bg-transparent border-0 text-xs focus:outline-none"
            />
            <button
              type="submit"
              disabled={!accessToken || !newFolderName.trim() || isCreatingFolder}
              className="px-3 py-1.5 rounded-lg bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-bold disabled:opacity-50 transition-all cursor-pointer shrink-0"
            >
              {isCreatingFolder ? 'جاري الإنشاء...' : 'إنشاء مجلد'}
            </button>
          </form>

          {/* Files Grid */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1418] border border-[#D4AF37]/25 shadow-sm">
            <h4 className="text-xs font-bold text-neutral-500 mb-3 flex items-center justify-between">
              <span>ملفاتك في Google Drive ({driveFiles.length})</span>
              {isLoadingFiles && <span className="text-[11px] text-[#4285F4]">جاري التحديث...</span>}
            </h4>

            {driveFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {driveFiles.map((file) => {
                  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                  const isSheet = file.mimeType.includes('spreadsheet');
                  const isImage = file.mimeType.includes('image');

                  return (
                    <div
                      key={file.id}
                      className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#D4AF37]/60 bg-neutral-50/50 dark:bg-black/20 flex flex-col justify-between gap-2.5 transition-all group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {isFolder ? (
                            <Folder className="w-5 h-5 text-amber-500" />
                          ) : isSheet ? (
                            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                          ) : isImage ? (
                            <ImageIcon className="w-5 h-5 text-purple-500" />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold truncate text-[#2D2A26] dark:text-white" title={file.name}>
                            {file.name}
                          </h5>
                          <span className="text-[10px] text-neutral-400 block truncate">
                            {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('ar-DZ') : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 text-xs">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-[#4285F4] hover:underline font-medium"
                          >
                            <span>فتح</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {isSheet && (
                          <button
                            onClick={() => {
                              setSpreadsheetId(file.id);
                              localStorage.setItem('maria_style_active_sheet_id', file.id);
                              setSubView('sheets');
                              loadSpreadsheetDetails(file.id);
                            }}
                            className="text-[11px] text-[#0F9D58] hover:underline font-bold"
                          >
                            عرض وإدارة
                          </button>
                        )}

                        <button
                          onClick={() => setFileToDelete(file)}
                          className="text-neutral-400 hover:text-red-500 p-1 rounded transition-colors"
                          title="حذف الملف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-neutral-400">
                {!accessToken
                  ? 'يرجى تسجيل الدخول بحساب Google لعرض ملفاتك.'
                  : isLoadingFiles
                  ? 'جاري فحص ملفات Google Drive...'
                  : 'لم يتم العثور على ملفات مطابقة في حسابك.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MANDATORY USER CONFIRMATION MODAL FOR DESTRUCTIVE ACTION (DELETE) */}
      {/* ============================================================== */}
      {fileToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1418] max-w-md w-full rounded-2xl border border-red-500/30 p-6 shadow-2xl text-start space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-600 dark:text-red-400">
                  تأكيد حذف الملف من Google Drive
                </h4>
                <p className="text-[11px] text-neutral-500">هذا الإجراء سيقوم بحذف الملف من حسابك.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-black/30 text-xs font-medium">
              <span className="text-neutral-400 block text-[10px]">اسم الملف:</span>
              <span className="font-bold text-[#2D2A26] dark:text-white break-all">
                {fileToDelete.name}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                إلغاء التراجع
              </button>

              <button
                onClick={confirmDeleteFile}
                disabled={isDeletingFile}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isDeletingFile ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>تأكيد الحذف نهائياً</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
