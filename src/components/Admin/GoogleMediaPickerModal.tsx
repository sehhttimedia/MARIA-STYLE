import React, { useState, useEffect } from 'react';
import {
  getAccessToken,
  signInWithGoogleWorkspace,
  listDriveMediaFiles,
  uploadDriveMediaBlob,
  GoogleDriveFile,
  subscribeToTokenChange,
  ensureDriveFilePublic,
  trySilentTokenReconnect,
} from '../../lib/googleWorkspace';
import { normalizeDriveUrl, handleImageError } from '../../utils/drive';
import {
  X,
  Search,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Video,
  Check,
  AlertCircle,
  ExternalLink,
  Plus,
  Copy,
  Sparkles,
} from 'lucide-react';

interface GoogleMediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaUrl: string, file: GoogleDriveFile) => void;
  onSelectMultiple?: (mediaUrls: string[], files: GoogleDriveFile[]) => void;
  allowMultiple?: boolean;
  mediaType?: 'all' | 'image' | 'video';
  title?: string;
}

export const GoogleMediaPickerModal: React.FC<GoogleMediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  onSelectMultiple,
  allowMultiple = false,
  mediaType = 'all',
  title = 'اختيار وسائط من حساب Google / Gmail',
}) => {
  const [token, setToken] = useState<string | null>(getAccessToken());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Media listing states
  const [mediaFiles, setMediaFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'image' | 'video'>(mediaType);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<GoogleDriveFile[]>([]);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Subscribe to token changes
  useEffect(() => {
    return subscribeToTokenChange((newToken) => {
      setToken(newToken);
    });
  }, []);

  // Silent reconnect attempt when modal opens without active token
  useEffect(() => {
    if (isOpen && !token) {
      trySilentTokenReconnect().then((newToken) => {
        if (newToken) {
          setToken(newToken);
        }
      });
    }
  }, [isOpen, token]);

  // Fetch media files when token is present and modal is open
  useEffect(() => {
    if (isOpen && token) {
      loadMediaFiles();
    }
  }, [isOpen, token, selectedFilter]);

  const loadMediaFiles = async () => {
    setIsLoading(true);
    setUploadError(null);
    try {
      const files = await listDriveMediaFiles(selectedFilter, searchQuery);
      setMediaFiles(files);
    } catch (err: any) {
      console.error('Failed to load drive media:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const res = await signInWithGoogleWorkspace();
      setToken(res.accessToken);
    } catch (err: any) {
      console.error('Google Media Picker Sign-In Error:', err);
      setAuthError(
        err.message || 'تعذر تسجيل الدخول بحساب Google. يرجى التأكد من السماح بالنوافذ المنبثقة (Popups).'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const result = await uploadDriveMediaBlob(file);
      // Prepend to media list
      setMediaFiles((prev) => [result.file, ...prev]);

      // If single selection, auto pick it
      if (!allowMultiple) {
        onSelect(result.streamUrl, result.file);
        onClose();
      }
    } catch (err: any) {
      setUploadError(err.message || 'فشل رفع الملف إلى Google Drive');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handlePickSingle = (file: GoogleDriveFile) => {
    // Ensure public streaming permission on Drive so anyone globally can view it without logging in
    if (token) {
      ensureDriveFilePublic(file.id, token).catch(() => {});
    }
    const streamUrl = normalizeDriveUrl(file.id, 'product');
    onSelect(streamUrl, file);
    onClose();
  };

  const handleToggleSelect = (file: GoogleDriveFile) => {
    if (!allowMultiple) {
      handlePickSingle(file);
      return;
    }

    setSelectedFiles((prev) => {
      const exists = prev.some((f) => f.id === file.id);
      if (exists) {
        return prev.filter((f) => f.id !== file.id);
      } else {
        return [...prev, file];
      }
    });
  };

  const handleConfirmMultiple = () => {
    if (!onSelectMultiple) return;
    if (token) {
      selectedFiles.forEach((f) => {
        ensureDriveFilePublic(f.id, token).catch(() => {});
      });
    }
    const urls = selectedFiles.map((f) => normalizeDriveUrl(f.id, 'product'));
    onSelectMultiple(urls, selectedFiles);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#161114] rounded-3xl shadow-2xl border border-[#D4AF37]/35 flex flex-col max-h-[92vh] overflow-hidden text-start">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#D4AF37]/20 flex items-center justify-between bg-gradient-to-r from-[#FAF5EE] to-white dark:from-[#1A1418] dark:to-[#161114]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#C94C71] to-[#D4AF37] text-white flex items-center justify-center shadow-md">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-serif-luxury text-[#2D2A26] dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-[#7A6F65] dark:text-[#A8988B]">
                تصفح واختيار مباشر للصور ومقاطع الفيديو من وسائط Google Drive الخاصة بكِ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Required State */}
        {!token ? (
          <div className="p-8 sm:p-12 text-center flex-1 flex flex-col items-center justify-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-[#4285F4]/10 text-[#4285F4] flex items-center justify-center mx-auto border border-[#4285F4]/20 shadow-inner">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
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
            </div>

            <div className="max-w-md">
              <h4 className="text-base sm:text-lg font-bold text-[#2D2A26] dark:text-white mb-2">
                ربط حساب Google للوصول إلى وسائط Google Drive
              </h4>
              <p className="text-xs text-[#7A6F65] dark:text-[#A8988B] leading-relaxed">
                اضغطي أدناه لتسجيل الدخول والربط بحساب Google / Gmail الخاص بكِ لاختيار الصور والفيديوهات مباشرة من حسابك بدون الحاجة لنسخ ولصق الروابط يدوياً.
              </p>
            </div>

            {authError && (
              <div className="max-w-md p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs text-start flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{authError}</span>
              </div>
            )}

            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="py-3 px-8 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#4285F4] to-[#2B6CB0] shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2.5 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#fff"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
              </svg>
              <span>{isSigningIn ? 'جاري الاتصال بـ Google...' : 'تسجيل الدخول وربط Google Drive'}</span>
            </button>
          </div>
        ) : (
          /* Main Media Browser Content */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF7F2]/50 dark:bg-white/5">
              {/* Type Filter */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedFilter === 'all'
                      ? 'bg-[#C94C71] text-white shadow-sm'
                      : 'bg-white dark:bg-[#1E191C] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setSelectedFilter('image')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                    selectedFilter === 'image'
                      ? 'bg-[#C94C71] text-white shadow-sm'
                      : 'bg-white dark:bg-[#1E191C] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>الصور</span>
                </button>
                <button
                  onClick={() => setSelectedFilter('video')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                    selectedFilter === 'video'
                      ? 'bg-[#C94C71] text-white shadow-sm'
                      : 'bg-white dark:bg-[#1E191C] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>الفيديوهات</span>
                </button>
              </div>

              {/* Search & Upload Action */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadMediaFiles()}
                    placeholder="بحث في أسماء الملفات..."
                    className="w-full ps-8 pe-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white focus:outline-none"
                  />
                </div>

                <button
                  onClick={loadMediaFiles}
                  disabled={isLoading}
                  title="تحديث القائمة"
                  className="p-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E191C] text-gray-600 dark:text-gray-300 hover:text-[#C94C71]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>

                {/* Direct Upload to Google Drive */}
                <label className="cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 shadow-sm flex items-center gap-1.5 transition-all shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'جاري الرفع...' : 'رفع لـ Drive'}</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {uploadError && (
              <div className="mx-4 mt-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin" />
                  <span className="text-xs text-gray-500">جاري تحميل وسائط Google Drive...</span>
                </div>
              ) : mediaFiles.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-3 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    لم نعثر على وسائط في حساب Google Drive
                  </h4>
                  <p className="text-xs text-gray-400 max-w-sm">
                    يمكنكِ رفع الصور أو الفيديوهات مباشرة من زر "رفع لـ Drive" بأعلى النافذة ليتم إضافتها لحسابكِ فورياً.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaFiles.map((file) => {
                    const isVideo = file.mimeType.includes('video/');
                    const streamUrl = normalizeDriveUrl(file.id, 'product');
                    const isSelected = selectedFiles.some((f) => f.id === file.id);

                    return (
                      <div
                        key={file.id}
                        onClick={() => handleToggleSelect(file)}
                        className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 bg-[#FAF7F2] dark:bg-[#120E11] flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#C94C71] ring-2 ring-[#C94C71]/40 shadow-lg scale-[1.02]'
                            : 'border-gray-200 dark:border-white/10 hover:border-[#D4AF37]'
                        }`}
                      >
                        {/* Thumbnail Container */}
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
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-108"
                            />
                          )}

                          {/* Media Type Badge */}
                          <span className="absolute top-2 start-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/60 text-white backdrop-blur-sm flex items-center gap-1">
                            {isVideo ? <Video className="w-2.5 h-2.5 text-[#C94C71]" /> : <ImageIcon className="w-2.5 h-2.5 text-[#D4AF37]" />}
                            <span>{isVideo ? 'فيديو' : 'صورة'}</span>
                          </span>

                          {/* Selection Checkmark */}
                          {isSelected && (
                            <div className="absolute top-2 end-2 w-6 h-6 rounded-full bg-[#C94C71] text-white flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          {/* Hover action overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                            <span className="py-1.5 px-3 rounded-full text-[11px] font-bold bg-white text-[#2D2A26] shadow-lg flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-[#C94C71]" />
                              <span>{allowMultiple ? (isSelected ? 'إلغاء التحديد' : 'تحديد') : 'اختيار الآن'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Title & Info */}
                        <div className="p-2.5 text-start">
                          <p className="text-[11px] font-bold text-[#2D2A26] dark:text-white line-clamp-1">
                            {file.name}
                          </p>
                          <span className="text-[9px] text-gray-400 block mt-0.5">
                            {file.size ? `${Math.round(parseInt(file.size, 10) / 1024)} KB` : 'Google Drive'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Bottom Action Bar (For multiple selection) */}
            {allowMultiple && (
              <div className="p-4 border-t border-[#D4AF37]/20 flex items-center justify-between bg-white dark:bg-[#161114]">
                <span className="text-xs text-gray-500">
                  تم تحديد <strong className="text-[#C94C71]">{selectedFiles.length}</strong> عنصر
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-black/5"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleConfirmMultiple}
                    disabled={selectedFiles.length === 0}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#C94C71] hover:bg-[#A83256] shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>تأكيد إضافة المحدد</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
