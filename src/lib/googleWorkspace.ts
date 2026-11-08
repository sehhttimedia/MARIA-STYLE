import firebaseConfig from '../../firebase-applet-config.json';
import { normalizeDriveUrl } from '../utils/drive';
import { FormFieldConfig } from '../types';

declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
];

// MANDATORY: In-memory access token caching ONLY (never in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let cachedUserEmail: string | null = null;
let cachedUserName: string | null = null;
let cachedUserPhoto: string | null = null;
let isSigningIn = false;

// Custom listeners for token changes
type TokenListener = (token: string | null) => void;
const tokenListeners = new Set<TokenListener>();

export const subscribeToTokenChange = (listener: TokenListener) => {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
};

const notifyTokenChange = (token: string | null) => {
  tokenListeners.forEach((l) => l(token));
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getUserEmail = (): string | null => {
  return cachedUserEmail;
};

export const getUserProfile = (): { email: string | null; name: string | null; photo: string | null } => {
  return {
    email: cachedUserEmail,
    name: cachedUserName,
    photo: cachedUserPhoto,
  };
};

export const setCachedAccessToken = (
  token: string | null,
  email?: string,
  name?: string,
  photo?: string
) => {
  cachedAccessToken = token;
  if (email !== undefined) cachedUserEmail = email;
  if (name !== undefined) cachedUserName = name;
  if (photo !== undefined) cachedUserPhoto = photo;
  notifyTokenChange(token);
};

/**
 * Ensures Google Identity Services (GIS) script is loaded and ready.
 */
export const ensureGisLoaded = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  if (window.google?.accounts?.oauth2) return true;

  return new Promise((resolve) => {
    let script = document.querySelector('script[src*="accounts.google.com/gsi/client"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.google?.accounts?.oauth2) {
        clearInterval(interval);
        resolve(true);
      } else if (attempts >= 40) {
        // 8 seconds timeout
        clearInterval(interval);
        resolve(!!window.google?.accounts?.oauth2);
      }
    }, 200);
  });
};

/**
 * Requests an OAuth 2.0 access token via official Google Identity Services (GIS).
 * Completely bypasses Firebase Auth domain restrictions.
 */
export const requestAccessTokenViaGIS = async (
  prompt: 'consent' | '' = 'consent'
): Promise<{ accessToken: string; email?: string; displayName?: string; photoLink?: string }> => {
  if (typeof window === 'undefined') {
    throw new Error('البيئة الحالية لا تدعم المتصفح.');
  }

  const clientId = firebaseConfig.oAuthClientId;
  if (!clientId) {
    throw new Error('معرف OAuth Client ID غير معرّف في الإعدادات.');
  }

  const isLoaded = await ensureGisLoaded();
  if (!isLoaded || !window.google?.accounts?.oauth2) {
    throw new Error('مكتبة Google Identity Services لم تكتمل بعد، يرجى المحاولة بعد لحظات.');
  }

  return new Promise((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: WORKSPACE_SCOPES.join(' '),
        callback: async (response: any) => {
          if (response.error) {
            if (response.error === 'access_denied') {
              reject(new Error('تم رفض منح الصلاحيات من قِبل المستخدم.'));
            } else {
              reject(new Error(response.error_description || response.error));
            }
            return;
          }

          if (response.access_token) {
            const token = response.access_token;
            let email: string | undefined;
            let displayName: string | undefined;
            let photoLink: string | undefined;

            // Retrieve authenticated Google profile details
            try {
              const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.ok) {
                const data = await res.json();
                if (data.user) {
                  email = data.user.emailAddress;
                  displayName = data.user.displayName;
                  photoLink = data.user.photoLink;
                }
              }
            } catch {
              // Userinfo is optional, token is 100% active
            }

            setCachedAccessToken(token, email || 'حساب Google متصل', displayName, photoLink);
            resolve({ accessToken: token, email, displayName, photoLink });
          } else {
            reject(new Error('لم يتم استلام تصريح الدخول من Google.'));
          }
        },
        error_callback: (err: any) => {
          reject(
            new Error(
              err?.message ||
                'تعذر فتح نافذة تسجيل الدخول من Google. يرجى التأكد من السماح بالنوافذ المنبثقة (Popups) في المتصفح.'
            )
          );
        },
      });

      client.requestAccessToken({ prompt });
    } catch (err: any) {
      reject(err);
    }
  });
};

/**
 * Silent token reconnect / refresh routine using Google Identity Services (GIS).
 * If the user already has an active Google session, recovers the OAuth access token without popups.
 */
export const trySilentTokenReconnect = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  if (typeof window === 'undefined') return null;
  const clientId = firebaseConfig.oAuthClientId;
  if (!clientId) return null;

  try {
    const isLoaded = await ensureGisLoaded();
    if (!isLoaded || !window.google?.accounts?.oauth2) return null;
    const res = await requestAccessTokenViaGIS('');
    return res.accessToken;
  } catch {
    return null;
  }
};

/**
 * Pure 1P Google Workspace Sign-In:
 * Uses Google Identity Services token client to request Drive and Sheets scopes.
 * Eliminates Firebase Auth dependency and fixes "auth/unauthorized-domain" errors permanently.
 */
export const signInWithGoogleWorkspace = async (): Promise<{
  user?: { email?: string; displayName?: string; photoLink?: string };
  accessToken: string;
}> => {
  if (isSigningIn) {
    throw new Error('عملية تسجيل الدخول جارية بالفعل.');
  }

  isSigningIn = true;

  try {
    const result = await requestAccessTokenViaGIS('consent');
    return {
      user: {
        email: result.email || 'حساب Google متصل',
        displayName: result.displayName || result.email || 'مشرف Google',
        photoLink: result.photoLink,
      },
      accessToken: result.accessToken,
    };
  } finally {
    isSigningIn = false;
  }
};

export const signOutGoogleWorkspace = async (): Promise<void> => {
  if (cachedAccessToken && typeof window !== 'undefined' && window.google?.accounts?.oauth2?.revoke) {
    try {
      window.google.accounts.oauth2.revoke(cachedAccessToken, () => {});
    } catch {
      // Ignored
    }
  }
  cachedAccessToken = null;
  cachedUserEmail = null;
  cachedUserName = null;
  cachedUserPhoto = null;
  notifyTokenChange(null);
};

/**
 * Makes any Google Drive file publicly viewable to anyone with the link
 * so that raw CDN URLs (https://lh3.googleusercontent.com/d/FILE_ID) stream globally.
 */
export async function ensureDriveFilePublic(fileId: string, customToken?: string): Promise<boolean> {
  const token = customToken || getAccessToken();
  if (!token || !fileId) return false;

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('ensureDriveFilePublic notice:', err);
    return false;
  }
}

// ==========================================
// GOOGLE SHEETS API IMPLEMENTATION
// ==========================================

export interface GoogleSpreadsheet {
  spreadsheetId: string;
  spreadsheetUrl: string;
  properties: {
    title: string;
    locale?: string;
  };
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
      gridProperties?: {
        rowCount: number;
        columnCount: number;
      };
    };
  }>;
}

/**
 * Creates a brand new Google Spreadsheet in the user's Google Drive.
 */
export async function createSpreadsheet(
  title: string,
  sheetTitles: string[] = ['طلبات الانضمام MLM', 'حجوزات الاستشارات', 'سجل المبيعات']
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = getAccessToken();
  if (!token) throw new Error('يرجى تسجيل الدخول بحساب Google أولاً.');

  const body = {
    properties: {
      title,
    },
    sheets: sheetTitles.map((st) => ({
      properties: {
        title: st,
      },
    })),
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `فشل إنشاء جدول البيانات: ${res.statusText}`);
  }

  const data: GoogleSpreadsheet = await res.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl,
  };
}

/**
 * Fetches spreadsheet metadata including sheet tabs.
 */
export async function getSpreadsheetMetadata(spreadsheetId: string): Promise<GoogleSpreadsheet> {
  const token = getAccessToken();
  if (!token) throw new Error('يرجى تسجيل الدخول بحساب Google أولاً.');

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `فشل جلب تفاصيل الجدول: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Reads row values from a specific range in a Google Spreadsheet.
 */
export async function readSheetValues(
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  const token = getAccessToken();
  if (!token) throw new Error('يرجى تسجيل الدخول بحساب Google أولاً.');

  const encodedRange = encodeURIComponent(range);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `فشل قراءة بيانات الجدول: ${res.statusText}`);
  }

  const data = await res.json();
  return data.values || [];
}

/**
 * Appends rows to a spreadsheet.
 */
export async function appendSheetRows(
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<{ updatedRows: number }> {
  const token = getAccessToken();
  if (!token) throw new Error('يرجى تسجيل الدخول بحساب Google أولاً.');

  const encodedRange = encodeURIComponent(range);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `فشل إضافة الصفوف: ${res.statusText}`);
  }

  const data = await res.json();
  return { updatedRows: data.updates?.updatedRows || values.length };
}

/**
 * Overwrites / Updates rows in a spreadsheet range.
 */
export async function updateSheetValues(
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<void> {
  const token = getAccessToken();
  if (!token) throw new Error('يرجى تسجيل الدخول بحساب Google أولاً.');

  const encodedRange = encodeURIComponent(range);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `فشل تحديث الجدول: ${res.statusText}`);
  }
}

/**
 * Converts a 0-indexed column number to its spreadsheet column letter(s).
 * Example: 0 -> A, 25 -> Z, 26 -> AA, 27 -> AB
 */
export function columnToLetter(colIndex: number): string {
  let temp = colIndex;
  let letter = '';
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

/**
 * Automatically inspects the first row (headers) of a Google Sheet tab (e.g. 'طلبات الانضمام MLM' or 'حجوزات الاستشارات')
 * and dynamically appends any new custom fields as header columns on the fly.
 */
export async function syncFormFieldsWithSheetHeaders(
  spreadsheetId: string,
  sheetTitle: string,
  fields: FormFieldConfig[]
): Promise<{ currentHeaders: string[]; addedHeaders: string[] }> {
  const token = getAccessToken();
  if (!token || !spreadsheetId) {
    return { currentHeaders: [], addedHeaders: [] };
  }

  try {
    // 1. Read existing row 1 (A1:ZZ1)
    const headerRows = await readSheetValues(spreadsheetId, `'${sheetTitle}'!A1:ZZ1`);
    const currentHeaders: string[] =
      headerRows && headerRows[0]
        ? headerRows[0].map((h: any) => String(h || '').trim()).filter(Boolean)
        : [];

    const addedHeaders: string[] = [];

    // Base headers if sheet is completely empty
    if (currentHeaders.length === 0) {
      const baseHeaders = sheetTitle.includes('MLM')
        ? ['تاريخ الطلب', 'معرف الطلب', 'الاسم الكامل', 'رقم الهاتف', 'المدينة والدولة', 'الحالة', 'كود العضوة الراعية', 'ملاحظات']
        : ['تاريخ التسجيل', 'معرف الحجز', 'اسم العميلة', 'الهاتف', 'نوع الاستشارة', 'الموعد المفضل', 'الحالة والملاحظات'];

      currentHeaders.push(...baseHeaders);
      const endLetter = columnToLetter(baseHeaders.length - 1);
      await updateSheetValues(spreadsheetId, `'${sheetTitle}'!A1:${endLetter}1`, [baseHeaders]);
    }

    // 2. Check each enabled field in fields
    for (const field of fields) {
      if (!field.enabled) continue;
      const fieldLabel = field.labelAr.trim() || field.name;

      // Check if already in currentHeaders (case-insensitive and trimmed)
      const exists = currentHeaders.some(
        (h) => h.toLowerCase() === fieldLabel.toLowerCase() || h.toLowerCase() === field.name.toLowerCase()
      );

      if (!exists) {
        // Append this new header column
        const nextColIndex = currentHeaders.length;
        const colLetter = columnToLetter(nextColIndex);
        await updateSheetValues(spreadsheetId, `'${sheetTitle}'!${colLetter}1`, [[fieldLabel]]);
        currentHeaders.push(fieldLabel);
        addedHeaders.push(fieldLabel);
      }
    }

    return { currentHeaders, addedHeaders };
  } catch (err) {
    console.warn('syncFormFieldsWithSheetHeaders notice:', err);
    return { currentHeaders: [], addedHeaders: [] };
  }
}

/**
 * Dynamically maps submitted form data (including any custom fields) to the Google Sheet columns.
 */
export function buildRowValuesFromDynamicData(
  headers: string[],
  fields: FormFieldConfig[],
  data: Record<string, any>
): any[] {
  // Field name/label to value lookup map
  const valueMap = new Map<string, any>();

  // Put raw data keys
  for (const [k, v] of Object.entries(data)) {
    valueMap.set(k.toLowerCase(), v);
  }

  // Put field labels and names
  for (const field of fields) {
    const val = data[field.name] ?? data[field.labelAr] ?? data[field.id];
    if (val !== undefined && val !== null) {
      valueMap.set(field.name.toLowerCase(), val);
      valueMap.set(field.labelAr.toLowerCase(), val);
      if (field.labelEn) valueMap.set(field.labelEn.toLowerCase(), val);
      if (field.labelTr) valueMap.set(field.labelTr.toLowerCase(), val);
    }
  }

  // Standard semantic aliases for Moroccan / MLM / Booking domains
  const getMappedValue = (header: string): string => {
    const h = header.trim().toLowerCase();

    // Check exact in map
    if (valueMap.has(h)) return String(valueMap.get(h) ?? '');

    // Semantic matching for MLM leads
    if (h.includes('تاريخ') || h.includes('date') || h.includes('time')) {
      return String(data.createdAt || data.orderDate || data.preferredDate || new Date().toISOString());
    }
    if (h.includes('معرف') || h.includes('id')) {
      return String(data.id || data.orderId || '');
    }
    if (h.includes('اسم') || h.includes('name') || h.includes('العميل')) {
      return String(data.fullName || data.clientName || data.customerName || '');
    }
    if (h.includes('هاتف') || h.includes('phone') || h.includes('واتساب') || h.includes('whatsapp')) {
      return String(data.phone || data.customerPhone || '');
    }
    if (h.includes('مدينة') || h.includes('دولة') || h.includes('city') || h.includes('country')) {
      const city = data.city || '';
      const country = data.country ? `(${data.country})` : '';
      return `${city} ${country}`.trim();
    }
    if (h.includes('شركة') || h.includes('company')) {
      return String(data.targetCompany || data.company || '');
    }
    if (h.includes('خبرة') || h.includes('experience')) {
      return String(data.experience || '');
    }
    if (h.includes('ساعات') || h.includes('hours')) {
      return String(data.availableHours || '');
    }
    if (h.includes('دافع') || h.includes('طموح') || h.includes('motivation')) {
      return String(data.motivation || '');
    }
    if (h.includes('كود') || h.includes('راعي') || h.includes('attribution') || h.includes('sponsor')) {
      return String(data.attributionCode || data.memberCode || '');
    }
    if (h.includes('نوع الاستشارة') || h.includes('consultation')) {
      return String(data.consultationType || '');
    }
    if (h.includes('موعد') || h.includes('توقيت') || h.includes('schedule')) {
      return `${data.preferredDate || ''} ${data.preferredTime || ''}`.trim();
    }
    if (h.includes('حالة') || h.includes('status')) {
      return String(data.status || 'new');
    }
    if (h.includes('ملاحظات') || h.includes('notes')) {
      return String(data.notes || data.adminNotes || '');
    }

    return '';
  };

  return headers.map((h) => getMappedValue(h));
}

// ==========================================
// GOOGLE DRIVE & MEDIA API IMPLEMENTATION
// ==========================================

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
  parents?: string[];
  imageMediaMetadata?: {
    width?: number;
    height?: number;
    rotation?: number;
  };
  videoMediaMetadata?: {
    width?: number;
    height?: number;
    durationMillis?: string;
  };
}

/**
 * Lists files and folders from the user's Google Drive.
 */
export async function listDriveFiles(
  query: string = "trashed = false",
  pageSize: number = 30
): Promise<GoogleDriveFile[]> {
  const token = getAccessToken();
  if (!token) throw new Error('يرجى تسجيل الدخول بحساب Google أولاً.');

  const fields = 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink, iconLink, parents, imageMediaMetadata, videoMediaMetadata)';
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&pageSize=${pageSize}&orderBy=modifiedTime desc&fields=${encodeURIComponent(fields)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `فشل جلب ملفات Google Drive: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Specifically queries photos and videos from the connected Google / Gmail account.
 */
export async function listDriveMediaFiles(
  mediaType: 'all' | 'image' | 'video' = 'all',
  searchQuery: string = '',
  pageSize: number = 60
): Promise<GoogleDriveFile[]> {
  let mimeFilter = "(mimeType contains 'image/' or mimeType contains 'video/')";
  if (mediaType === 'image') {
    mimeFilter = "mimeType contains 'image/'";
  } else if (mediaType === 'video') {
    mimeFilter = "mimeType contains 'video/'";
  }

  let fullQuery = `${mimeFilter} and trashed = false`;
  if (searchQuery.trim()) {
    const cleanSearch = searchQuery.replace(/'/g, "\\'");
    fullQuery += ` and name contains '${cleanSearch}'`;
  }

  return listDriveFiles(fullQuery, pageSize);
}

/**
 * Creates a folder in Google Drive.
 */
export async function createDriveFolder(
  folderName: string,
  parentFolderId?: string
): Promise<GoogleDriveFile> {
  const token = getAccessToken();
  if (!token) throw new Error('يرجى تسجيل الدخول بحساب Google أولاً.');

  const body: Record<string, any> = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentFolderId) {
    body.parents = [parentFolderId];
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `فشل إنشاء المجلد: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Uploads a text or JSON file (e.g. backup, report, invoice) to Google Drive.
 */
export async function uploadDriveFile(
  fileName: string,
  mimeType: string,
  content: string,
  parentFolderId?: string
): Promise<GoogleDriveFile> {
  const token = getAccessToken();
  if (!token) throw new Error('يرجى تسجيل الدخول بحساب Google أولاً.');

  const metadata: Record<string, any> = {
    name: fileName,
    mimeType,
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size,createdTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `فشل رفع الملف إلى Google Drive: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Uploads an image or video Blob/File directly to Google Drive and sets public read permission.
 * Returns the created file and its direct normalized streaming URL.
 */
export async function uploadDriveMediaBlob(
  file: File,
  parentFolderId?: string
): Promise<{ file: GoogleDriveFile; streamUrl: string }> {
  const token = getAccessToken();
  if (!token) throw new Error('يرجى تسجيل الدخول بحساب Google أولاً.');

  const metadata: Record<string, any> = {
    name: file.name,
    mimeType: file.type || 'image/jpeg',
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', file);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,thumbnailLink,webViewLink,webContentLink,size,createdTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `فشل رفع الوسائط إلى Google Drive: ${res.statusText}`);
  }

  const createdFile: GoogleDriveFile = await res.json();

  // Make the file publicly viewable so it streams globally across all devices
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${createdFile.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });
  } catch (permErr) {
    console.warn('Public permission assignment notice:', permErr);
  }

  return {
    file: createdFile,
    streamUrl: normalizeDriveUrl(createdFile.id, 'product'),
  };
}

/**
 * Deletes a file from Google Drive.
 * NOTE: The calling UI must present an explicit user confirmation dialog beforehand.
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = getAccessToken();
  if (!token) throw new Error('يرجى تسجيل الدخول بحساب Google أولاً.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `فشل حذف الملف: ${res.statusText}`);
  }
}
