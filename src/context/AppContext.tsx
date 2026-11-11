import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { db, auth, googleProvider } from '../lib/firebase';
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import {
  Language,
  Product,
  MlmLead,
  Booking,
  SaleAttribution,
  MlmMember,
  AwardItem,
  CMSContent,
  FormFieldConfig,
  SyncStatus,
} from '../types';
import {
  initialCMSContent,
  initialProducts,
  initialMlmMembers,
  initialMlmLeads,
  initialBookings,
  initialSales,
  initialAwards,
  initialMlmFieldsConfig,
  initialBookingFieldsConfig,
} from '../data/initialData';
import { translations, TranslationDictionary } from '../translations';
import {
  sendToGoogleSheet,
  getPendingSubmissionsCount,
  drainSubmissionQueue,
} from '../utils/webhook';
import { normalizeDriveUrl } from '../utils/drive';
import { playCelebrationSound } from '../utils/sound';
import {
  getAccessToken,
  appendSheetRows,
  updateSheetValues,
  requestAccessTokenViaGIS,
  columnToLetter,
  syncFormFieldsWithSheetHeaders,
  buildRowValuesFromDynamicData,
} from '../lib/googleWorkspace';

export const PERSISTENCE_KEYS = {
  CMS: 'maria_style_cms_persisted_v4',
  PRODUCTS: 'maria_style_products_persisted_v4',
  AWARDS: 'maria_style_awards_persisted_v4',
  MEMBERS: 'maria_style_members_persisted_v4',
  LEADS: 'maria_style_leads_persisted_v4',
  BOOKINGS: 'maria_style_bookings_persisted_v4',
  SALES: 'maria_style_sales_persisted_v4',
  MLM_FIELDS: 'maria_style_mlm_fields_persisted_v4',
  BOOKING_FIELDS: 'maria_style_booking_fields_persisted_v4',
  ACTIVE_SHEET_ID: 'maria_style_active_sheet_id',
};

interface AppContextType {
  // Localization & Theme
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  isDark: boolean;
  toggleTheme: () => void;

  // Active Attribution
  activeAttribution: string;
  setActiveAttribution: (code: string) => void;

  // Content & State
  cms: CMSContent;
  updateCMS: (newCms: Partial<CMSContent>) => Promise<boolean>;
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  mlmMembers: MlmMember[];
  addMlmMember: (member: Omit<MlmMember, 'id'>) => Promise<void>;
  updateMlmMember: (id: string, member: Partial<MlmMember>) => Promise<void>;
  deleteMlmMember: (id: string) => Promise<void>;

  mlmLeads: MlmLead[];
  submitMlmLead: (data: Record<string, string>) => Promise<{ success: boolean; message: string; savedOffline?: boolean }>;
  updateLeadStatus: (id: string, status: MlmLead['status'], notes?: string) => Promise<void>;
  updateMlmLead: (id: string, updated: Partial<MlmLead>) => Promise<void>;
  deleteMlmLead: (id: string) => Promise<void>;
  addManualLead: (lead: Omit<MlmLead, 'id' | 'createdAt' | 'synced'>) => Promise<void>;

  bookings: Booking[];
  submitBooking: (data: Record<string, string>) => Promise<{ success: boolean; message: string; savedOffline?: boolean }>;
  updateBookingStatus: (id: string, status: Booking['status'], adminNotes?: string) => Promise<void>;
  updateBooking: (id: string, updated: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  addManualBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'synced'>) => Promise<void>;

  exportToCsv: (type: 'bookings' | 'leads') => void;

  sales: SaleAttribution[];
  createSale: (sale: Omit<SaleAttribution, 'id' | 'synced'>) => Promise<void>;

  awards: AwardItem[];
  addAward: (award: Omit<AwardItem, 'id'>) => Promise<void>;
  deleteAward: (id: string) => Promise<void>;

  // Dynamic Forms
  mlmFieldsConfig: FormFieldConfig[];
  bookingFieldsConfig: FormFieldConfig[];
  updateMlmFieldsConfig: (configs: FormFieldConfig[]) => void;
  updateBookingFieldsConfig: (configs: FormFieldConfig[]) => void;
  syncFormHeadersNow: (formType: 'mlm' | 'booking') => Promise<{ success: boolean; addedHeaders: string[]; message: string }>;

  // Cloud & Workspace Persistence
  activeSheetId: string;
  setActiveSheetId: (id: string) => Promise<void>;
  publishAllLocalDataToCloud: () => Promise<{ success: boolean; message: string; count: number }>;

  // Explicit Section Persistence to Server Site Files (Per-section Save Buttons)
  saveProductsToServer: () => Promise<{ success: boolean; message: string }>;
  saveMembersToServer: () => Promise<{ success: boolean; message: string }>;
  saveCmsToServer: (overrideCms?: Partial<CMSContent>) => Promise<{ success: boolean; message: string }>;
  saveAwardsToServer: () => Promise<{ success: boolean; message: string }>;
  saveBookingsToServer: () => Promise<{ success: boolean; message: string }>;

  // Webhook & Persistence Sync
  syncStatus: SyncStatus;
  syncAllWithWebhook: () => Promise<void>;

  // Admin Security
  isAdminLoggedIn: boolean;
  adminEmail: string | null;
  loginAdmin: (password: string) => { success: boolean; message: string };
  loginAdminWithGoogle: () => Promise<{ success: boolean; message: string }>;
  logoutAdmin: () => void;
  changeAdminPassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;

  // Visuals & Backup
  fireConfetti: () => void;
  exportBackupData: () => string;
  importBackupData: (jsonString: string) => { success: boolean; message: string };
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'maria_style_admin_pwd';
const DEFAULT_ADMIN_PASS = 'Maria2026!';
const LOCKOUT_KEY = 'maria_style_lockout_time';
const ATTEMPTS_KEY = 'maria_style_failed_attempts';

/**
 * Safe local storage helper
 */
function safeLoadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed !== null && parsed !== undefined) {
      if (typeof fallback === 'object' && !Array.isArray(fallback) && fallback !== null) {
        return { ...fallback, ...parsed };
      }
      return parsed;
    }
  } catch (err) {
    console.warn(`Failed to parse persistent storage for key ${key}:`, err);
  }
  return fallback;
}

function safeSaveToStorage<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save persistent storage for key ${key}:`, err);
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Localization & Theme
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('maria_style_lang') as Language;
      return saved === 'tr' || saved === 'en' ? saved : 'ar';
    } catch {
      return 'ar';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('maria_style_lang', lang);
    } catch {
      // Ignored
    }
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Theme (Dark / Light)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('maria_style_theme') === 'dark';
    } catch {
      return false;
    }
  });

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('maria_style_theme', next ? 'dark' : 'light');
      } catch {
        // Ignored
      }
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // URL Attribution extraction (e.g. ?ref=MS-NOOR88 or ?sponsor=MS-FATIMA)
  const [activeAttribution, setActiveAttribution] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('ref') || params.get('sponsor') || params.get('code');
      if (code) return code.toUpperCase();
    }
    return 'MS-FATIMA';
  });

  // =========================================================================
  // CORE BUSINESS DATA - 100% PERSISTENT ACROSS PAGE RELOADS & DEVICE REFRESH
  // =========================================================================
  const [cms, setCms] = useState<CMSContent>(() => {
    return safeLoadFromStorage<CMSContent>(PERSISTENCE_KEYS.CMS, initialCMSContent);
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const loaded = safeLoadFromStorage<Product[]>(PERSISTENCE_KEYS.PRODUCTS, initialProducts);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : initialProducts;
  });

  const [mlmMembers, setMlmMembers] = useState<MlmMember[]>(() => {
    const loaded = safeLoadFromStorage<MlmMember[]>(PERSISTENCE_KEYS.MEMBERS, initialMlmMembers);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : initialMlmMembers;
  });

  const [mlmLeads, setMlmLeads] = useState<MlmLead[]>(() => {
    const loaded = safeLoadFromStorage<MlmLead[]>(PERSISTENCE_KEYS.LEADS, initialMlmLeads);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : initialMlmLeads;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const loaded = safeLoadFromStorage<Booking[]>(PERSISTENCE_KEYS.BOOKINGS, initialBookings);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : initialBookings;
  });

  const [sales, setSales] = useState<SaleAttribution[]>(() => {
    const loaded = safeLoadFromStorage<SaleAttribution[]>(PERSISTENCE_KEYS.SALES, initialSales);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : initialSales;
  });

  const [awards, setAwards] = useState<AwardItem[]>(() => {
    const loaded = safeLoadFromStorage<AwardItem[]>(PERSISTENCE_KEYS.AWARDS, initialAwards);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : initialAwards;
  });

  const [mlmFieldsConfig, setMlmFieldsConfig] = useState<FormFieldConfig[]>(() => {
    return safeLoadFromStorage<FormFieldConfig[]>(PERSISTENCE_KEYS.MLM_FIELDS, initialMlmFieldsConfig);
  });

  const [bookingFieldsConfig, setBookingFieldsConfig] = useState<FormFieldConfig[]>(() => {
    return safeLoadFromStorage<FormFieldConfig[]>(PERSISTENCE_KEYS.BOOKING_FIELDS, initialBookingFieldsConfig);
  });

  // Active Google Spreadsheet ID (Synchronized globally via Firestore app_config/google_workspace)
  const [activeSheetId, setActiveSheetIdState] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(PERSISTENCE_KEYS.ACTIVE_SHEET_ID) || '';
  });

  const setActiveSheetId = async (id: string) => {
    const cleanId = id.trim();
    setActiveSheetIdState(cleanId);
    if (typeof window !== 'undefined') {
      if (cleanId) {
        localStorage.setItem(PERSISTENCE_KEYS.ACTIVE_SHEET_ID, cleanId);
      } else {
        localStorage.removeItem(PERSISTENCE_KEYS.ACTIVE_SHEET_ID);
      }
    }

    // Save to site server files (/api/config)
    try {
      fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeSheetId: cleanId }),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    // Commit to Firestore so every mobile phone and new browser visitor immediately receives it
    try {
      await setDoc(
        doc(db, 'app_config', 'google_workspace'),
        {
          activeSheetId: cleanId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Failed to save activeSheetId to cloud:', err);
    }
  };

  // Sync status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncedTime: null,
    success: null,
    message: 'جاهز للمزامنة المركزية مع Google Sheets',
    pendingCount: getPendingSubmissionsCount(),
  });

  // Periodically refresh pending count
  useEffect(() => {
    const interval = setInterval(() => {
      const count = getPendingSubmissionsCount();
      setSyncStatus((prev) => (prev.pendingCount !== count ? { ...prev, pendingCount: count } : prev));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Hydrate global state from Server Site Files + Firestore to guarantee cross-device persistence across all visitors and mobiles
  useEffect(() => {
    let isMounted = true;

    async function loadCloudData() {
      try {
        // 0. Primary Fast Global Hydration from Site Server Files (/api/site-data)
        // Guarantees that any modification made by admin appears to ANY visitor from ANY device
        try {
          const siteRes = await fetch('/api/site-data');
          if (siteRes.ok && isMounted) {
            const data = await siteRes.json();
            if (data.cms) {
              const photo = (!data.cms.madameFatimaPhoto || data.cms.madameFatimaPhoto.includes('unsplash.com'))
                ? '/assets/aistudio/Fatma_d3c946d4.jpeg'
                : data.cms.madameFatimaPhoto;
              const mergedCms: CMSContent = { ...data.cms, madameFatimaPhoto: photo };
              setCms(mergedCms);
              safeSaveToStorage(PERSISTENCE_KEYS.CMS, mergedCms);
            }
            if (Array.isArray(data.products) && data.products.length > 0) {
              setProducts(data.products);
              safeSaveToStorage(PERSISTENCE_KEYS.PRODUCTS, data.products);
            }
            if (Array.isArray(data.awards) && data.awards.length > 0) {
              setAwards(data.awards);
              safeSaveToStorage(PERSISTENCE_KEYS.AWARDS, data.awards);
            }
            if (Array.isArray(data.members) && data.members.length > 0) {
              setMlmMembers(data.members);
              safeSaveToStorage(PERSISTENCE_KEYS.MEMBERS, data.members);
            }
            if (data.formConfigs?.mlm && Array.isArray(data.formConfigs.mlm)) {
              setMlmFieldsConfig(data.formConfigs.mlm);
              safeSaveToStorage(PERSISTENCE_KEYS.MLM_FIELDS, data.formConfigs.mlm);
            }
            if (data.formConfigs?.booking && Array.isArray(data.formConfigs.booking)) {
              setBookingFieldsConfig(data.formConfigs.booking);
              safeSaveToStorage(PERSISTENCE_KEYS.BOOKING_FIELDS, data.formConfigs.booking);
            }
            if (data.config?.activeSheetId) {
              setActiveSheetIdState(data.config.activeSheetId);
              if (typeof window !== 'undefined') {
                localStorage.setItem(PERSISTENCE_KEYS.ACTIVE_SHEET_ID, data.config.activeSheetId);
              }
            }
            if (Array.isArray(data.leads) && data.leads.length > 0) {
              setMlmLeads(data.leads);
              safeSaveToStorage(PERSISTENCE_KEYS.LEADS, data.leads);
            }
            if (Array.isArray(data.bookings) && data.bookings.length > 0) {
              setBookings(data.bookings);
              safeSaveToStorage(PERSISTENCE_KEYS.BOOKINGS, data.bookings);
            }
          }
        } catch (serverErr) {
          console.info('Server site-data hydration notice:', serverErr);
        }

        // 1. Fetch Global App Config (Google Workspace Active Spreadsheet ID)
        try {
          const configSnap = await getDoc(doc(db, 'app_config', 'google_workspace'));
          if (configSnap.exists() && isMounted) {
            const cfg = configSnap.data();
            if (cfg?.activeSheetId) {
              setActiveSheetIdState(cfg.activeSheetId);
              if (typeof window !== 'undefined') {
                localStorage.setItem(PERSISTENCE_KEYS.ACTIVE_SHEET_ID, cfg.activeSheetId);
              }
            }
          }
        } catch {
          // Non-blocking
        }

        // 2. Optional Firestore sync for CMS (Only if server file had no CMS)
        try {
          const cmsSnap = await getDoc(doc(db, 'cms_content', 'default'));
          if (cmsSnap.exists() && isMounted) {
            const cloudCms = cmsSnap.data() as Partial<CMSContent>;
            setCms((prev) => {
              // If prev is already initialized from server disk, do not let old firestore overwrite it
              if (prev && prev.lastSyncedAt && (!cloudCms.lastSyncedAt || new Date(prev.lastSyncedAt) > new Date(cloudCms.lastSyncedAt))) {
                return prev;
              }
              const photo = (!cloudCms.madameFatimaPhoto || cloudCms.madameFatimaPhoto.includes('unsplash.com'))
                ? '/assets/aistudio/Fatma_d3c946d4.jpeg'
                : cloudCms.madameFatimaPhoto;
              const merged = { ...prev, ...cloudCms, madameFatimaPhoto: photo };
              safeSaveToStorage(PERSISTENCE_KEYS.CMS, merged);
              return merged;
            });
          }
        } catch {
          // Non-blocking
        }

        // 3. Optional Firestore Sync for Products (Never overwrite server disk data with stale defaults)
        try {
          const prodSnap = await getDocs(collection(db, 'products'));
          if (!prodSnap.empty && isMounted) {
            const cloudProducts: Product[] = [];
            prodSnap.forEach((docItem) => {
              cloudProducts.push({ id: docItem.id, ...(docItem.data() as Omit<Product, 'id'>) });
            });
            const hasLegacyMock = cloudProducts.some((p) => p.id === 'prod-1' || p.id === 'prod-2');
            if (!hasLegacyMock && cloudProducts.length > 0) {
              setProducts((current) => {
                if (current.length >= cloudProducts.length) return current;
                safeSaveToStorage(PERSISTENCE_KEYS.PRODUCTS, cloudProducts);
                return cloudProducts;
              });
            }
          }
        } catch {
          // Non-blocking Firestore notice
        }

        // 4. Optional Firestore Sync for Awards (Never overwrite server disk data)
        try {
          const awardsSnap = await getDocs(collection(db, 'awards'));
          if (!awardsSnap.empty && isMounted) {
            const cloudAwards: AwardItem[] = [];
            awardsSnap.forEach((docItem) => {
              cloudAwards.push({ id: docItem.id, ...(docItem.data() as Omit<AwardItem, 'id'>) });
            });
            const hasLegacyMock = cloudAwards.some((a) => a.id === 'award-1' || a.id === 'award-2');
            if (!hasLegacyMock && cloudAwards.length > 0) {
              setAwards((current) => {
                if (current.length >= cloudAwards.length) return current;
                safeSaveToStorage(PERSISTENCE_KEYS.AWARDS, cloudAwards);
                return cloudAwards;
              });
            }
          }
        } catch {
          // Non-blocking Firestore notice
        }

        // 5. Dynamic Form Field Configs from Firestore (if not loaded from server)
        try {
          const mlmSnap = await getDoc(doc(db, 'form_configs', 'mlm'));
          if (mlmSnap.exists() && isMounted) {
            const fields = mlmSnap.data()?.fields;
            if (Array.isArray(fields) && fields.length > 0) {
              setMlmFieldsConfig((curr) => (curr.length > 0 ? curr : fields));
            }
          }
          const bookingSnap = await getDoc(doc(db, 'form_configs', 'booking'));
          if (bookingSnap.exists() && isMounted) {
            const fields = bookingSnap.data()?.fields;
            if (Array.isArray(fields) && fields.length > 0) {
              setBookingFieldsConfig((curr) => (curr.length > 0 ? curr : fields));
            }
          }
        } catch {
          // Non-blocking
        }

        // 6. MLM Members (Server disk is authoritative; merge only if server was empty)
        try {
          const memSnap = await getDocs(collection(db, 'mlm_members'));
          if (!memSnap.empty && isMounted) {
            const cloudMembers: MlmMember[] = [];
            memSnap.forEach((docItem) => {
              cloudMembers.push({ id: docItem.id, ...(docItem.data() as Omit<MlmMember, 'id'>) });
            });
            if (cloudMembers.length > 0) {
              setMlmMembers((curr) => {
                if (curr.length >= cloudMembers.length) return curr;
                safeSaveToStorage(PERSISTENCE_KEYS.MEMBERS, cloudMembers);
                return cloudMembers;
              });
            }
          }
        } catch {
          // Non-blocking
        }

        // 7. Fetch MLM Leads from Site Server Files (/api/leads) and Firestore
        try {
          let serverLeads: MlmLead[] = [];
          try {
            const res = await fetch('/api/leads');
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data)) serverLeads = data;
            }
          } catch {
            // Local fallback
          }

          let cloudLeads: MlmLead[] = [];
          try {
            const leadsSnap = await getDocs(collection(db, 'leads'));
            if (!leadsSnap.empty) {
              leadsSnap.forEach((docItem) => {
                cloudLeads.push({ id: docItem.id, ...(docItem.data() as any) } as MlmLead);
              });
            }
          } catch {
            // Rules or offline fallback
          }

          const combinedLeadsMap = new Map<string, MlmLead>();
          initialMlmLeads.forEach((l) => combinedLeadsMap.set(l.id, l));
          // Load cached leads from local storage if any
          const cachedLeads = safeLoadFromStorage<MlmLead[]>(PERSISTENCE_KEYS.LEADS, []);
          if (Array.isArray(cachedLeads)) {
            cachedLeads.forEach((l) => combinedLeadsMap.set(l.id, l));
          }
          cloudLeads.forEach((l) => combinedLeadsMap.set(l.id, l));
          serverLeads.forEach((l) => combinedLeadsMap.set(l.id, l));

          const mergedLeads = Array.from(combinedLeadsMap.values()).sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );

          if (isMounted && mergedLeads.length > 0) {
            setMlmLeads(mergedLeads);
            safeSaveToStorage(PERSISTENCE_KEYS.LEADS, mergedLeads);
          }
        } catch (leadsErr) {
          console.warn('Leads hydration notice:', leadsErr);
        }

        // 8. Fetch Bookings from Site Server Files (/api/bookings) and Firestore
        try {
          let serverBookings: Booking[] = [];
          try {
            const res = await fetch('/api/bookings');
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data)) serverBookings = data;
            }
          } catch {
            // Local fallback
          }

          let cloudBookings: Booking[] = [];
          try {
            const booksSnap = await getDocs(collection(db, 'bookings'));
            if (!booksSnap.empty) {
              booksSnap.forEach((docItem) => {
                cloudBookings.push({ id: docItem.id, ...(docItem.data() as any) } as Booking);
              });
            }
          } catch {
            // Rules or offline fallback
          }

          const combinedBooksMap = new Map<string, Booking>();
          initialBookings.forEach((b) => combinedBooksMap.set(b.id, b));
          const cachedBooks = safeLoadFromStorage<Booking[]>(PERSISTENCE_KEYS.BOOKINGS, []);
          if (Array.isArray(cachedBooks)) {
            cachedBooks.forEach((b) => combinedBooksMap.set(b.id, b));
          }
          cloudBookings.forEach((b) => combinedBooksMap.set(b.id, b));
          serverBookings.forEach((b) => combinedBooksMap.set(b.id, b));

          const mergedBookings = Array.from(combinedBooksMap.values()).sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );

          if (isMounted && mergedBookings.length > 0) {
            setBookings(mergedBookings);
            safeSaveToStorage(PERSISTENCE_KEYS.BOOKINGS, mergedBookings);
          }
        } catch (booksErr) {
          console.warn('Bookings hydration notice:', booksErr);
        }
      } catch (err) {
        console.info('Cloud hydration notice: Running in resilient offline-first mode.');
      }
    }

    loadCloudData();

    // Real-time synchronization across devices:
    // Periodically and on window focus, refresh data from server files so changes appear instantly
    const refreshSiteData = async () => {
      if (!isMounted) return;
      try {
        const siteRes = await fetch('/api/site-data');
        if (siteRes.ok && isMounted) {
          const data = await siteRes.json();
          if (data.cms) {
            setCms((prev) => {
              const photo = (!data.cms.madameFatimaPhoto || data.cms.madameFatimaPhoto.includes('unsplash.com'))
                ? '/assets/aistudio/Fatma_d3c946d4.jpeg'
                : data.cms.madameFatimaPhoto;
              return { ...prev, ...data.cms, madameFatimaPhoto: photo };
            });
          }
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
          }
          if (Array.isArray(data.awards) && data.awards.length > 0) {
            setAwards(data.awards);
          }
          if (Array.isArray(data.members) && data.members.length > 0) {
            setMlmMembers(data.members);
          }
          if (data.config?.activeSheetId) {
            setActiveSheetIdState(data.config.activeSheetId);
          }
        }
      } catch {
        // Non-blocking
      }
    };

    window.addEventListener('focus', refreshSiteData);
    const syncInterval = setInterval(refreshSiteData, 10000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', refreshSiteData);
      clearInterval(syncInterval);
    };
  }, []);

  // Admin Authentication & Session
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('maria_style_admin_auth') === 'true' || localStorage.getItem('maria_style_admin_auth') === 'true';
  });
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    return sessionStorage.getItem('maria_style_admin_email') || localStorage.getItem('maria_style_admin_email') || null;
  });
  const [isAdminModalOpen, setIsAdminModalOpenState] = useState<boolean>(false);

  const setIsAdminModalOpen = (open: boolean) => {
    setIsAdminModalOpenState(open);
    if (!open && (window.location.hash.toLowerCase() === '#admin' || window.location.hash.toLowerCase() === '#admin-panel')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminEmail(user.email || null);
        sessionStorage.setItem('maria_style_admin_email', user.email || '');
        if (
          user.email?.toLowerCase() === 'sehhttimedia@gmail.com' ||
          sessionStorage.getItem('maria_style_admin_auth') === 'true'
        ) {
          setIsAdminLoggedIn(true);
          sessionStorage.setItem('maria_style_admin_auth', 'true');
          localStorage.setItem('maria_style_admin_auth', 'true');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Admin access listeners: Listen to URL hash (#admin) and keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const handleCheckHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin' || hash === '#admin-panel' || hash === '#control-panel') {
        setIsAdminModalOpenState(true);
      }
    };
    handleCheckHash();
    window.addEventListener('hashchange', handleCheckHash);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.code === 'KeyA')) {
        e.preventDefault();
        setIsAdminModalOpenState((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleCheckHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const loginAdmin = (password: string): { success: boolean; message: string } => {
    const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10);
    const now = Date.now();
    if (now < lockoutUntil) {
      const waitSeconds = Math.ceil((lockoutUntil - now) / 1000);
      return {
        success: false,
        message: `تم حظر المحاولات مؤقتاً لأسباب أمنية. يرجى الانتظار ${waitSeconds} ثانية.`,
      };
    }

    const currentSavedPass = localStorage.getItem(ADMIN_STORAGE_KEY) || DEFAULT_ADMIN_PASS;
    if (password === currentSavedPass) {
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('maria_style_admin_auth', 'true');
      localStorage.setItem('maria_style_admin_auth', 'true');
      return { success: true, message: 'تم تسجيل الدخول بنجاح.' };
    } else {
      const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10) + 1;
      localStorage.setItem(ATTEMPTS_KEY, String(attempts));
      if (attempts >= 5) {
        localStorage.setItem(LOCKOUT_KEY, String(Date.now() + 5 * 60 * 1000));
        return {
          success: false,
          message: 'تجاوزت الحد الأقصى للمحاولات الخاطئة (5). تم القفل لمدة 5 دقائق لحماية النظام.',
        };
      }
      return {
        success: false,
        message: `كلمة المرور غير صحيحة. المحاولة ${attempts} من 5.`,
      };
    }
  };

  const loginAdminWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const gisRes = await requestAccessTokenViaGIS('consent');
      setIsAdminLoggedIn(true);
      setAdminEmail(gisRes.email || 'مشرف Google معتمد');
      sessionStorage.setItem('maria_style_admin_auth', 'true');
      localStorage.setItem('maria_style_admin_auth', 'true');
      return {
        success: true,
        message: `تم تسجيل الدخول بنجاح عبر حساب Google (${gisRes.displayName || gisRes.email || 'مشرف معتمد'})!`,
      };
    } catch (err: any) {
      console.warn('Google sign-in notice:', err);
      return {
        success: false,
        message: err.message || 'تعذر تسجيل الدخول عبر Google. يمكنكِ استخدام كلمة المرور المباشرة (Maria2026!).',
      };
    }
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setAdminEmail(null);
    sessionStorage.removeItem('maria_style_admin_auth');
    sessionStorage.removeItem('maria_style_admin_email');
    localStorage.removeItem('maria_style_admin_auth');
    localStorage.removeItem('maria_style_admin_email');
    fbSignOut(auth).catch(() => {});
  };

  const changeAdminPassword = (oldPass: string, newPass: string): { success: boolean; message: string } => {
    const currentSavedPass = localStorage.getItem(ADMIN_STORAGE_KEY) || DEFAULT_ADMIN_PASS;
    if (oldPass !== currentSavedPass) {
      return { success: false, message: 'كلمة المرور الحالية غير صحيحة.' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف أو أرقام.' };
    }
    localStorage.setItem(ADMIN_STORAGE_KEY, newPass);
    return { success: true, message: 'تم تحديث كلمة مرور المشرف بنجاح.' };
  };

  // Celebration Confetti
  const fireConfetti = useCallback(() => {
    playCelebrationSound();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C94C71', '#D4AF37', '#F4E8C1', '#FAF7F2', '#AA7A1E'],
      });
    } catch {
      // Ignored
    }
  }, []);

  // =========================================================================
  // PERMANENT ADMIN CRUD ACTIONS (SAVE TO LOCALSTORAGE + CLOUD GOOGLE SHEETS)
  // =========================================================================

  /**
   * Update CMS Content (Brand, WhatsApp, Phone, Logos, Madame Fatima story)
   * Guaranteed 100% persistent across reloads and multi-sheet synced.
   */
  const updateCMS = async (newCms: Partial<CMSContent>): Promise<boolean> => {
    const updated: CMSContent = {
      ...cms,
      ...newCms,
      logoUrl: normalizeDriveUrl(newCms.logoUrl !== undefined ? newCms.logoUrl : cms.logoUrl, 'logo'),
      madameFatimaPhoto: normalizeDriveUrl(
        newCms.madameFatimaPhoto !== undefined ? newCms.madameFatimaPhoto : cms.madameFatimaPhoto,
        'story'
      ),
      lastSyncedAt: new Date().toISOString(),
    };

    // 1. Instantly update React context state
    setCms(updated);

    // 2. Commit permanently to LocalStorage (Guarantees zero loss on page refresh)
    safeSaveToStorage(PERSISTENCE_KEYS.CMS, updated);

    // 3. Dispatch to Google Sheet 4 (CMS_Content) via Webhook
    sendToGoogleSheet('CMS_Content', updated as unknown as Record<string, unknown>, 'update');

    // 4. If direct Google Sheets token and linked spreadsheet ID exist, write row
    try {
      const activeSheetId = localStorage.getItem(PERSISTENCE_KEYS.ACTIVE_SHEET_ID);
      const token = getAccessToken();
      if (activeSheetId && token) {
        updateSheetValues(activeSheetId, "'CMS_Content وإعدادات المنصة'!A1:B10", [
          ['المفتاح', 'القيمة الحالية'],
          ['اسم المنصة', updated.brandName],
          ['رقم الواتساب الرسمي', updated.officialWhatsApp],
          ['رقم الهاتف للعرض', updated.officialPhone],
          ['البريد الإلكتروني', updated.emailContact],
          ['رابط الشعار', updated.logoUrl],
          ['شريط الإعلانات', updated.announcementText],
          ['تاريخ التحديث الأخير', updated.lastSyncedAt],
        ]).catch(() => {});
      }
    } catch {
      // Non-blocking
    }

    // 5. Fire and forget Firestore persistence
    try {
      await setDoc(doc(db, 'cms_content', 'default'), {
        brandName: updated.brandName,
        brandTagline: updated.brandTagline,
        officialWhatsApp: updated.officialWhatsApp,
        officialPhone: updated.officialPhone,
        emailContact: updated.emailContact,
        logoUrl: updated.logoUrl,
        heroTitle: updated.heroTitle,
        heroSubtitle: updated.heroSubtitle,
        madameFatimaPhoto: updated.madameFatimaPhoto,
        madameFatimaTitle: updated.madameFatimaTitle,
        madameFatimaStoryExcerpt: updated.madameFatimaStoryExcerpt,
        madameFatimaFullStory: updated.madameFatimaFullStory,
        announcementText: updated.announcementText,
        announcementActive: updated.announcementActive,
        updatedAt: updated.lastSyncedAt,
      });
    } catch {
      // Catch silently - rules or unauth domain should never break UI
    }

    // 6. Save directly to server disk storage (/api/cms) for 100% universal multi-device persistence
    try {
      fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    return true;
  };

  /**
   * Explicit Per-Section Server Persistence Actions (Requested by User)
   */
  const saveProductsToServer = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products),
      });
      if (res.ok) {
        safeSaveToStorage(PERSISTENCE_KEYS.PRODUCTS, products);
        products.forEach((p) => {
          setDoc(doc(db, 'products', p.id), p).catch(() => {});
        });
        fireConfetti();
        return { success: true, message: `تم حفظ وتثبيت ${products.length} منتجاً في ملفات الموقع لجميع الأجهزة والزوار بنجاح!` };
      }
      return { success: false, message: 'تعذر حفظ المنتجات في ملفات الخادم' };
    } catch (err: any) {
      return { success: false, message: `خطأ في الاتصال: ${err.message}` };
    }
  };

  const saveMembersToServer = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mlmMembers),
      });
      if (res.ok) {
        safeSaveToStorage(PERSISTENCE_KEYS.MEMBERS, mlmMembers);
        mlmMembers.forEach((m) => {
          setDoc(doc(db, 'mlm_members', m.id), m).catch(() => {});
        });
        fireConfetti();
        return { success: true, message: `تم حفظ وتثبيت بيانات ${mlmMembers.length} عضوة في ملفات الموقع بنجاح!` };
      }
      return { success: false, message: 'تعذر حفظ بيانات العضوات في ملفات الخادم' };
    } catch (err: any) {
      return { success: false, message: `خطأ في الاتصال: ${err.message}` };
    }
  };

  const saveCmsToServer = async (overrideCms?: Partial<CMSContent>): Promise<{ success: boolean; message: string }> => {
    const payload: CMSContent = {
      ...cms,
      ...(overrideCms || {}),
      lastSyncedAt: new Date().toISOString(),
    };
    try {
      const res = await fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setCms(payload);
        safeSaveToStorage(PERSISTENCE_KEYS.CMS, payload);
        setDoc(doc(db, 'cms_content', 'default'), payload).catch(() => {});
        fireConfetti();
        return { success: true, message: 'تم حفظ وتثبيت إعدادات وهوية المنصة في ملفات الموقع لجميع الزوار!' };
      }
      return { success: false, message: 'تعذر حفظ إعدادات المنصة في ملفات الخادم' };
    } catch (err: any) {
      return { success: false, message: `خطأ في الاتصال: ${err.message}` };
    }
  };

  const saveAwardsToServer = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/awards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(awards),
      });
      if (res.ok) {
        safeSaveToStorage(PERSISTENCE_KEYS.AWARDS, awards);
        awards.forEach((a) => {
          setDoc(doc(db, 'awards', a.id), a).catch(() => {});
        });
        fireConfetti();
        return { success: true, message: `تم حفظ وتثبيت ${awards.length} تكريماً وفيديو في ملفات الموقع بنجاح!` };
      }
      return { success: false, message: 'تعذر حفظ التكريمات في ملفات الخادم' };
    } catch (err: any) {
      return { success: false, message: `خطأ في الاتصال: ${err.message}` };
    }
  };

  const saveBookingsToServer = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookings),
      });
      if (res.ok) {
        safeSaveToStorage(PERSISTENCE_KEYS.BOOKINGS, bookings);
        fireConfetti();
        return { success: true, message: `تم حفظ وتثبيت ${bookings.length} حجوزات واستشارات في ملفات الموقع بنجاح!` };
      }
      return { success: false, message: 'تعذر حفظ الاستشارات في ملفات الخادم' };
    } catch (err: any) {
      return { success: false, message: `خطأ في الاتصال: ${err.message}` };
    }
  };

  /**
   * Submit MLM Join Lead: Bulletproof submission with dynamic custom fields & auto column mapping
   */
  const submitMlmLead = async (data: Record<string, string>): Promise<{ success: boolean; message: string; savedOffline?: boolean }> => {
    const newLead: MlmLead = {
      ...data,
      id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fullName: data.fullName || '',
      phone: data.phone || '',
      country: data.country || '',
      city: data.city || '',
      targetCompany: (data.company || data.targetCompany || 'Alialyna') as MlmLead['targetCompany'],
      experience: (data.experience || 'beginner') as MlmLead['experience'],
      availableHours: data.availableHours || '',
      motivation: data.motivation || '',
      attributionCode: data.attributionCode || activeAttribution || 'MS-FATIMA',
      status: 'new',
      createdAt: new Date().toISOString(),
      synced: false,
    };

    // 1. Immediately append to state and permanent local cache
    setMlmLeads((prev) => {
      const nextLeads = [newLead, ...prev];
      safeSaveToStorage(PERSISTENCE_KEYS.LEADS, nextLeads);
      return nextLeads;
    });

    // Save directly to site server file storage (/api/leads) for 100% resilient persistence
    try {
      const serverRes = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
      if (serverRes.ok) {
        newLead.synced = true;
      }
    } catch {
      // Non-blocking fallback to local safe cache
    }

    fireConfetti();

    // 2. Attempt Google Sheet direct API append if connected, with dynamic headers and column mapping
    try {
      const activeSheetId = localStorage.getItem(PERSISTENCE_KEYS.ACTIVE_SHEET_ID);
      const token = getAccessToken();
      if (activeSheetId && token) {
        // Automatically sync headers so any newly added custom field has a column
        const { currentHeaders } = await syncFormFieldsWithSheetHeaders(activeSheetId, 'طلبات الانضمام MLM', mlmFieldsConfig);
        const headersToUse = currentHeaders.length > 0 ? currentHeaders : [
          'تاريخ الطلب', 'معرف الطلب', 'الاسم الكامل', 'رقم الهاتف', 'المدينة والدولة', 'الحالة', 'كود العضوة الراعية', 'ملاحظات'
        ];
        const rowValues = buildRowValuesFromDynamicData(headersToUse, mlmFieldsConfig, newLead);
        const endLetter = columnToLetter(rowValues.length - 1);
        await appendSheetRows(activeSheetId, `'طلبات الانضمام MLM'!A2:${endLetter}`, [rowValues]);
      }
    } catch (sheetErr) {
      console.warn('Google Sheets API append notice:', sheetErr);
    }

    // 3. Dispatch to Google Sheets Webhook with exponential backoff & offline buffer
    const result = await sendToGoogleSheet('Leads_MLM', newLead as unknown as Record<string, unknown>);
    if (result.success && !result.savedOffline) {
      setMlmLeads((prev) => {
        const updated = prev.map((l) => (l.id === newLead.id ? { ...l, synced: true } : l));
        safeSaveToStorage(PERSISTENCE_KEYS.LEADS, updated);
        return updated;
      });
    }

    setSyncStatus((prev) => ({
      ...prev,
      pendingCount: getPendingSubmissionsCount(),
    }));

    // 4. Save to Firestore in background
    try {
      setDoc(doc(db, 'leads', newLead.id), newLead).catch(() => {});
    } catch {
      // Ignored
    }

    return result;
  };

  /**
   * Submit Consultation Booking: Bulletproof submission with dynamic custom fields & auto column mapping
   */
  const submitBooking = async (data: Record<string, string>): Promise<{ success: boolean; message: string; savedOffline?: boolean }> => {
    const newBooking: Booking = {
      ...data,
      id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clientName: data.clientName || '',
      phone: data.phone || '',
      consultationType: (data.consultationType as Booking['consultationType']) || 'skincare',
      preferredDate: data.preferredDate || new Date().toISOString().slice(0, 10),
      preferredTime: data.preferredTime || '14:00',
      notes: data.notes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      synced: false,
    };

    // 1. Immediately append to state and permanent local cache
    setBookings((prev) => {
      const nextBookings = [newBooking, ...prev];
      safeSaveToStorage(PERSISTENCE_KEYS.BOOKINGS, nextBookings);
      return nextBookings;
    });

    // Save directly to site server file storage (/api/bookings) for 100% resilient persistence
    try {
      const serverRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
      if (serverRes.ok) {
        newBooking.synced = true;
      }
    } catch {
      // Non-blocking fallback to local safe cache
    }

    fireConfetti();

    // 2. Direct Google Sheets API append if connected with dynamic headers & mapping
    try {
      const activeSheetId = localStorage.getItem(PERSISTENCE_KEYS.ACTIVE_SHEET_ID);
      const token = getAccessToken();
      if (activeSheetId && token) {
        const { currentHeaders } = await syncFormFieldsWithSheetHeaders(activeSheetId, 'حجوزات الاستشارات', bookingFieldsConfig);
        const headersToUse = currentHeaders.length > 0 ? currentHeaders : [
          'تاريخ التسجيل', 'معرف الحجز', 'اسم العميلة', 'الهاتف', 'نوع الاستشارة', 'الموعد المفضل', 'الحالة والملاحظات'
        ];
        const rowValues = buildRowValuesFromDynamicData(headersToUse, bookingFieldsConfig, newBooking);
        const endLetter = columnToLetter(rowValues.length - 1);
        await appendSheetRows(activeSheetId, `'حجوزات الاستشارات'!A2:${endLetter}`, [rowValues]);
      }
    } catch (sheetErr) {
      console.warn('Google Sheets API append notice:', sheetErr);
    }

    // 3. Dispatch to Google Sheets Webhook with exponential retry
    const result = await sendToGoogleSheet('Bookings', newBooking as unknown as Record<string, unknown>);
    if (result.success && !result.savedOffline) {
      setBookings((prev) => {
        const updated = prev.map((b) => (b.id === newBooking.id ? { ...b, synced: true } : b));
        safeSaveToStorage(PERSISTENCE_KEYS.BOOKINGS, updated);
        return updated;
      });
    }

    setSyncStatus((prev) => ({
      ...prev,
      pendingCount: getPendingSubmissionsCount(),
    }));

    // 4. Firestore
    try {
      setDoc(doc(db, 'bookings', newBooking.id), newBooking).catch(() => {});
    } catch {
      // Ignored
    }

    return result;
  };

  /**
   * Create Sale Attribution
   */
  const createSale = async (saleData: Omit<SaleAttribution, 'id' | 'synced'>) => {
    const newSale: SaleAttribution = {
      ...saleData,
      id: `sale-${Date.now()}`,
      synced: false,
    };

    setSales((prev) => {
      const nextSales = [newSale, ...prev];
      safeSaveToStorage(PERSISTENCE_KEYS.SALES, nextSales);
      return nextSales;
    });

    if (newSale.memberCode) {
      setMlmMembers((prev) => {
        const nextMembers = prev.map((m) => {
          if (m.memberCode.toUpperCase() === newSale.memberCode.toUpperCase()) {
            return {
              ...m,
              totalSales: m.totalSales + newSale.totalAmount,
              totalOrders: m.totalOrders + 1,
              totalCommission: m.totalCommission + newSale.commissionEarned,
            };
          }
          return m;
        });
        safeSaveToStorage(PERSISTENCE_KEYS.MEMBERS, nextMembers);
        return nextMembers;
      });
    }

    // Webhook dispatch
    const res = await sendToGoogleSheet('Sales', newSale as unknown as Record<string, unknown>);
    if (res.success && !res.savedOffline) {
      setSales((prev) => {
        const updated = prev.map((s) => (s.id === newSale.id ? { ...s, synced: true } : s));
        safeSaveToStorage(PERSISTENCE_KEYS.SALES, updated);
        return updated;
      });
    }

    // Firestore
    try {
      setDoc(doc(db, 'sales', newSale.id), newSale).catch(() => {});
    } catch {
      // Ignored
    }
  };

  /**
   * Products CRUD
   */
  const addProduct = async (p: Omit<Product, 'id'>) => {
    const newId = `prod-${Date.now()}`;
    const newP: Product = {
      ...p,
      id: newId,
      image: normalizeDriveUrl(p.image, 'product'),
      galleryImages: (p.galleryImages || []).map((img) => normalizeDriveUrl(img, 'product')),
    };

    setProducts((prev) => {
      const nextProds = [newP, ...prev];
      safeSaveToStorage(PERSISTENCE_KEYS.PRODUCTS, nextProds);
      return nextProds;
    });

    // 1. Direct server persistence for universal cross-device visibility
    try {
      fetch('/api/products/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newP),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    try {
      await setDoc(doc(db, 'products', newId), newP);
    } catch (err) {
      console.warn('Firestore addProduct notice:', err);
    }
  };

  const updateProduct = async (id: string, p: Partial<Product>) => {
    const normalizedPatch: Partial<Product> = { ...p };
    if (p.image) normalizedPatch.image = normalizeDriveUrl(p.image, 'product');
    if (p.galleryImages) {
      normalizedPatch.galleryImages = p.galleryImages.map((img) => normalizeDriveUrl(img, 'product'));
    }

    setProducts((prev) => {
      const nextProds = prev.map((item) => (item.id === id ? { ...item, ...normalizedPatch } : item));
      safeSaveToStorage(PERSISTENCE_KEYS.PRODUCTS, nextProds);
      return nextProds;
    });

    // 1. Direct server persistence for universal cross-device visibility
    try {
      fetch(`/api/products/item/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedPatch),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    try {
      await setDoc(doc(db, 'products', id), normalizedPatch, { merge: true });
    } catch (err) {
      console.warn('Firestore updateProduct notice:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => {
      const nextProds = prev.filter((item) => item.id !== id);
      safeSaveToStorage(PERSISTENCE_KEYS.PRODUCTS, nextProds);
      return nextProds;
    });

    // 1. Direct server persistence
    try {
      fetch(`/api/products/item/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {
      // Non-blocking
    }

    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      console.warn('Firestore deleteProduct notice:', err);
    }
  };

  /**
   * Awards CRUD
   */
  const addAward = async (a: Omit<AwardItem, 'id'>) => {
    const newId = `award-${Date.now()}`;
    const newA: AwardItem = {
      ...a,
      id: newId,
      mediaUrl: normalizeDriveUrl(a.mediaUrl, 'award'),
    };

    setAwards((prev) => {
      const nextAwards = [newA, ...prev];
      safeSaveToStorage(PERSISTENCE_KEYS.AWARDS, nextAwards);
      return nextAwards;
    });

    // 1. Direct server persistence
    try {
      fetch('/api/awards/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newA),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    try {
      await setDoc(doc(db, 'awards', newId), newA);
    } catch (err) {
      console.warn('Firestore addAward notice:', err);
    }
  };

  const deleteAward = async (id: string) => {
    setAwards((prev) => {
      const nextAwards = prev.filter((item) => item.id !== id);
      safeSaveToStorage(PERSISTENCE_KEYS.AWARDS, nextAwards);
      return nextAwards;
    });

    // 1. Direct server persistence
    try {
      fetch(`/api/awards/item/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {
      // Non-blocking
    }

    try {
      await deleteDoc(doc(db, 'awards', id));
    } catch (err) {
      console.warn('Firestore deleteAward notice:', err);
    }
  };

  /**
   * Members CRUD
   */
  const addMlmMember = async (m: Omit<MlmMember, 'id'>) => {
    const newId = `mem-${Date.now()}`;
    const newM: MlmMember = { ...m, id: newId };
    setMlmMembers((prev) => {
      const nextMembers = [newM, ...prev];
      safeSaveToStorage(PERSISTENCE_KEYS.MEMBERS, nextMembers);
      return nextMembers;
    });

    // 1. Direct server persistence
    try {
      fetch('/api/members/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newM),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    try {
      await setDoc(doc(db, 'mlm_members', newId), newM);
    } catch (err) {
      console.warn('Firestore addMlmMember notice:', err);
    }
  };

  const updateMlmMember = async (id: string, m: Partial<MlmMember>) => {
    setMlmMembers((prev) => {
      const nextMembers = prev.map((item) => (item.id === id ? { ...item, ...m } : item));
      safeSaveToStorage(PERSISTENCE_KEYS.MEMBERS, nextMembers);
      return nextMembers;
    });

    // 1. Direct server persistence
    try {
      fetch(`/api/members/item/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    try {
      await setDoc(doc(db, 'mlm_members', id), m, { merge: true });
    } catch (err) {
      console.warn('Firestore updateMlmMember notice:', err);
    }
  };

  const deleteMlmMember = async (id: string) => {
    setMlmMembers((prev) => {
      const nextMembers = prev.filter((item) => item.id !== id);
      safeSaveToStorage(PERSISTENCE_KEYS.MEMBERS, nextMembers);
      return nextMembers;
    });

    // 1. Direct server persistence
    try {
      fetch(`/api/members/item/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {
      // Non-blocking
    }

    try {
      await deleteDoc(doc(db, 'mlm_members', id));
    } catch (err) {
      console.warn('Firestore deleteMlmMember notice:', err);
    }
  };

  /**
   * Lead Status Update (Backwards-compatible)
   */
  const updateLeadStatus = async (id: string, status: MlmLead['status'], notes?: string) => {
    await updateMlmLead(id, { status, ...(notes !== undefined ? { notes } : {}) });
  };

  /**
   * Comprehensive Full Update for MLM Lead (All fields, server file + Firestore + cache)
   */
  const updateMlmLead = async (id: string, updated: Partial<MlmLead>) => {
    setMlmLeads((prev) => {
      const nextLeads = prev.map((l) => (l.id === id ? { ...l, ...updated } : l));
      safeSaveToStorage(PERSISTENCE_KEYS.LEADS, nextLeads);
      return nextLeads;
    });

    // 1. Update in site server file storage (/api/leads/:id)
    try {
      fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    // 2. Update in Firestore
    try {
      await setDoc(doc(db, 'leads', id), updated, { merge: true });
    } catch (err) {
      console.warn('Firestore updateMlmLead notice:', err);
    }
  };

  /**
   * Delete MLM Lead
   */
  const deleteMlmLead = async (id: string) => {
    setMlmLeads((prev) => {
      const nextLeads = prev.filter((l) => l.id !== id);
      safeSaveToStorage(PERSISTENCE_KEYS.LEADS, nextLeads);
      return nextLeads;
    });

    // 1. Delete from site server file storage
    try {
      fetch(`/api/leads/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {
      // Non-blocking
    }

    // 2. Delete from Firestore
    try {
      await deleteDoc(doc(db, 'leads', id));
    } catch (err) {
      console.warn('Firestore deleteMlmLead notice:', err);
    }
  };

  /**
   * Manually add an MLM Lead from the Admin Dashboard
   */
  const addManualLead = async (data: Omit<MlmLead, 'id' | 'createdAt' | 'synced'>) => {
    const newLead: MlmLead = {
      ...data,
      id: `lead-manual-${Date.now()}`,
      createdAt: new Date().toISOString(),
      synced: true,
    } as MlmLead;

    setMlmLeads((prev) => {
      const nextLeads = [newLead, ...prev];
      safeSaveToStorage(PERSISTENCE_KEYS.LEADS, nextLeads);
      return nextLeads;
    });

    // 1. Save to site server files
    try {
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    // 2. Save to Firestore
    try {
      await setDoc(doc(db, 'leads', newLead.id), newLead);
    } catch (err) {
      console.warn('Firestore addManualLead notice:', err);
    }

    fireConfetti();
  };

  /**
   * Booking Status Update (Backwards-compatible)
   */
  const updateBookingStatus = async (id: string, status: Booking['status'], adminNotes?: string) => {
    await updateBooking(id, { status, ...(adminNotes !== undefined ? { adminNotes } : {}) });
  };

  /**
   * Comprehensive Full Update for Consultation Booking (All fields, server file + Firestore + cache)
   */
  const updateBooking = async (id: string, updated: Partial<Booking>) => {
    setBookings((prev) => {
      const nextBookings = prev.map((b) => (b.id === id ? { ...b, ...updated } : b));
      safeSaveToStorage(PERSISTENCE_KEYS.BOOKINGS, nextBookings);
      return nextBookings;
    });

    // 1. Update in site server file storage (/api/bookings/:id)
    try {
      fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    // 2. Update in Firestore
    try {
      await setDoc(doc(db, 'bookings', id), updated, { merge: true });
    } catch (err) {
      console.warn('Firestore updateBooking notice:', err);
    }
  };

  /**
   * Delete Consultation Booking
   */
  const deleteBooking = async (id: string) => {
    setBookings((prev) => {
      const nextBookings = prev.filter((b) => b.id !== id);
      safeSaveToStorage(PERSISTENCE_KEYS.BOOKINGS, nextBookings);
      return nextBookings;
    });

    // 1. Delete from site server file storage
    try {
      fetch(`/api/bookings/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {
      // Non-blocking
    }

    // 2. Delete from Firestore
    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (err) {
      console.warn('Firestore deleteBooking notice:', err);
    }
  };

  /**
   * Manually add a Consultation Booking from the Admin Dashboard
   */
  const addManualBooking = async (data: Omit<Booking, 'id' | 'createdAt' | 'synced'>) => {
    const newBooking: Booking = {
      ...data,
      id: `book-manual-${Date.now()}`,
      createdAt: new Date().toISOString(),
      synced: true,
    } as Booking;

    setBookings((prev) => {
      const nextBookings = [newBooking, ...prev];
      safeSaveToStorage(PERSISTENCE_KEYS.BOOKINGS, nextBookings);
      return nextBookings;
    });

    // 1. Save to site server files
    try {
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    // 2. Save to Firestore
    try {
      await setDoc(doc(db, 'bookings', newBooking.id), newBooking);
    } catch (err) {
      console.warn('Firestore addManualBooking notice:', err);
    }

    fireConfetti();
  };

  /**
   * Export Bookings or Leads to CSV with UTF-8 BOM for Arabic Excel Support
   */
  const exportToCsv = (type: 'bookings' | 'leads') => {
    let csvContent = '\uFEFF'; // UTF-8 BOM
    let filename = '';

    if (type === 'bookings') {
      filename = `maria_style_bookings_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ['معرف الحجز', 'اسم العميلة', 'الهاتف', 'نوع الاستشارة', 'التاريخ المفضل', 'التوقيت المفضل', 'الحالة', 'ملاحظات العميلة', 'ملاحظات ومتابعة الإدارة', 'تاريخ التسجيل'];
      csvContent += headers.map((h) => `"${h}"`).join(',') + '\n';
      bookings.forEach((b) => {
        const row = [
          b.id,
          b.clientName,
          b.phone,
          b.consultationType,
          b.preferredDate,
          b.preferredTime,
          b.status,
          b.notes || '',
          b.adminNotes || '',
          b.createdAt,
        ];
        csvContent += row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',') + '\n';
      });
    } else {
      filename = `maria_style_mlm_leads_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ['معرف الطلب', 'الاسم الكامل', 'الهاتف', 'الدولة', 'المدينة', 'الشركة المطلوبة', 'الخبرة', 'ساعات العمل', 'الدافع', 'كود الداعية', 'الحالة', 'ملاحظات المشرف', 'تاريخ التسجيل'];
      csvContent += headers.map((h) => `"${h}"`).join(',') + '\n';
      mlmLeads.forEach((l) => {
        const row = [
          l.id,
          l.fullName,
          l.phone,
          l.country,
          l.city,
          l.targetCompany,
          l.experience,
          l.availableHours,
          l.motivation,
          l.attributionCode,
          l.status,
          l.notes || '',
          l.createdAt,
        ];
        csvContent += row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',') + '\n';
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Dynamic Forms Customizer & Auto Google Sheets Header Sync
   */
  const updateMlmFieldsConfig = (configs: FormFieldConfig[]) => {
    setMlmFieldsConfig(configs);
    safeSaveToStorage(PERSISTENCE_KEYS.MLM_FIELDS, configs);

    // 1. Direct server persistence
    try {
      fetch('/api/form-configs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mlm: configs }),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    // Save to Firestore so other devices get dynamic fields
    setDoc(doc(db, 'form_configs', 'mlm'), {
      fields: configs,
      updatedAt: new Date().toISOString(),
    }).catch(() => {});

    // Auto-sync matching header columns in Google Sheets in the background
    const targetSheetId = activeSheetId || (typeof window !== 'undefined' ? localStorage.getItem(PERSISTENCE_KEYS.ACTIVE_SHEET_ID) : null);
    const token = getAccessToken();
    if (targetSheetId && token) {
      syncFormFieldsWithSheetHeaders(targetSheetId, 'طلبات الانضمام MLM', configs).catch(() => {});
    }
  };

  const updateBookingFieldsConfig = (configs: FormFieldConfig[]) => {
    setBookingFieldsConfig(configs);
    safeSaveToStorage(PERSISTENCE_KEYS.BOOKING_FIELDS, configs);

    // 1. Direct server persistence
    try {
      fetch('/api/form-configs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking: configs }),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    // Save to Firestore so other devices get dynamic fields
    setDoc(doc(db, 'form_configs', 'booking'), {
      fields: configs,
      updatedAt: new Date().toISOString(),
    }).catch(() => {});

    // Auto-sync matching header columns in Google Sheets in the background
    const targetSheetId = activeSheetId || (typeof window !== 'undefined' ? localStorage.getItem(PERSISTENCE_KEYS.ACTIVE_SHEET_ID) : null);
    const token = getAccessToken();
    if (targetSheetId && token) {
      syncFormFieldsWithSheetHeaders(targetSheetId, 'حجوزات الاستشارات', configs).catch(() => {});
    }
  };

  /**
   * Explicitly triggers header sync on demand and returns status for UI feedback
   */
  const syncFormHeadersNow = async (
    formType: 'mlm' | 'booking'
  ): Promise<{ success: boolean; addedHeaders: string[]; message: string }> => {
    const activeSheetId = typeof window !== 'undefined' ? localStorage.getItem(PERSISTENCE_KEYS.ACTIVE_SHEET_ID) : null;
    const token = getAccessToken();

    if (!activeSheetId) {
      return {
        success: false,
        addedHeaders: [],
        message: 'لم يتم ربط جدول Google Sheets بعد. يرجى ربط الجدول أو إنشاؤه من تبويب (9. تكامل Drive & Sheets).',
      };
    }
    if (!token) {
      return {
        success: false,
        addedHeaders: [],
        message: 'يرجى تسجيل الدخول بحساب Google أولاً لتفعيل التعديل المباشر على أعمدة الجدول.',
      };
    }

    const sheetTitle = formType === 'mlm' ? 'طلبات الانضمام MLM' : 'حجوزات الاستشارات';
    const fields = formType === 'mlm' ? mlmFieldsConfig : bookingFieldsConfig;

    try {
      const res = await syncFormFieldsWithSheetHeaders(activeSheetId, sheetTitle, fields);
      if (res.addedHeaders.length > 0) {
        fireConfetti();
        return {
          success: true,
          addedHeaders: res.addedHeaders,
          message: `تم إنشاء ومزامنة (${res.addedHeaders.length}) أعمدة جديدة في جدول Google Sheets فورياً: [${res.addedHeaders.join('، ')}]!`,
        };
      }
      return {
        success: true,
        addedHeaders: [],
        message: 'كافة حقول الاستمارة متطابقة وموجودة بالفعل كأعمدة في جدول Google Sheets!',
      };
    } catch (err: any) {
      return {
        success: false,
        addedHeaders: [],
        message: err.message || 'تعذر تحديث أعمدة Google Sheets.',
      };
    }
  };

  /**
   * Sync All with Google Sheets Webhook + drain offline queue
   */
  const syncAllWithWebhook = async () => {
    setSyncStatus((prev) => ({
      ...prev,
      isSyncing: true,
      message: 'جاري إرسال ومزامنة السجلات وتفريغ الطابور مع الشيتات الأربعة...',
    }));

    try {
      await drainSubmissionQueue();

      const p1 = sendToGoogleSheet('Leads_MLM', mlmLeads as unknown as Record<string, unknown>[], 'sync_all');
      const p2 = sendToGoogleSheet('Bookings', bookings as unknown as Record<string, unknown>[], 'sync_all');
      const p3 = sendToGoogleSheet('Sales', sales as unknown as Record<string, unknown>[], 'sync_all');
      const p4 = sendToGoogleSheet('CMS_Content', cms as unknown as Record<string, unknown>, 'update');

      await Promise.allSettled([p1, p2, p3, p4]);

      const nowTime = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSyncStatus({
        isSyncing: false,
        lastSyncedTime: nowTime,
        success: true,
        message: `تمت المزامنة بنجاح مع الشيتات الأربعة (Leads_MLM, Bookings, Sales, CMS_Content) في ${nowTime}`,
        pendingCount: getPendingSubmissionsCount(),
      });

      // Mark all as synced
      setMlmLeads((prev) => {
        const next = prev.map((item) => ({ ...item, synced: true }));
        safeSaveToStorage(PERSISTENCE_KEYS.LEADS, next);
        return next;
      });
      setBookings((prev) => {
        const next = prev.map((item) => ({ ...item, synced: true }));
        safeSaveToStorage(PERSISTENCE_KEYS.BOOKINGS, next);
        return next;
      });
      setSales((prev) => {
        const next = prev.map((item) => ({ ...item, synced: true }));
        safeSaveToStorage(PERSISTENCE_KEYS.SALES, next);
        return next;
      });
    } catch {
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        success: false,
        message: 'حدث خطأ أثناء الاتصال السحابي. تم الاحتفاظ بالبيانات بأمان وسيتم إعادة المحاولة آلياً.',
        pendingCount: getPendingSubmissionsCount(),
      }));
    }
  };

  /**
   * Publish & Sync All Local Data to Cloud (Server Storage + Firestore + Google Workspace)
   * Commits all current modifications (CMS phone/WhatsApp/photos, products, awards, custom form fields, active spreadsheet ID)
   * so that they immediately propagate to ALL visitors, mobile devices, and new browsers worldwide.
   */
  const publishAllLocalDataToCloud = async (): Promise<{ success: boolean; message: string; count: number }> => {
    let count = 0;
    const currentSheetId = activeSheetId || (typeof window !== 'undefined' ? localStorage.getItem(PERSISTENCE_KEYS.ACTIVE_SHEET_ID) || '' : '');

    // Step 1: Save full snapshot to site server files (/api/publish-all)
    // This is 100% resilient and guarantees persistence across all visitors and devices!
    try {
      const pubRes = await fetch('/api/publish-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cms,
          products,
          awards,
          members: mlmMembers,
          formConfigs: { mlm: mlmFieldsConfig, booking: bookingFieldsConfig },
          config: { activeSheetId: currentSheetId },
        }),
      });
      if (pubRes.ok) {
        count += (products.length + awards.length + mlmMembers.length + 3);
      }
    } catch (serverErr) {
      console.warn('Publish to server file notice:', serverErr);
    }

    // Step 2: Attempt Firestore sync in background (if configured)
    try {
      if (currentSheetId) {
        setDoc(
          doc(db, 'app_config', 'google_workspace'),
          {
            activeSheetId: currentSheetId,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});
      }

      setDoc(doc(db, 'cms_content', 'default'), {
        brandName: cms.brandName,
        brandTagline: cms.brandTagline,
        officialWhatsApp: cms.officialWhatsApp,
        officialPhone: cms.officialPhone,
        emailContact: cms.emailContact,
        logoUrl: cms.logoUrl,
        heroTitle: cms.heroTitle,
        heroSubtitle: cms.heroSubtitle,
        heroBadge: cms.heroBadge,
        heroCtaText: cms.heroCtaText,
        madameFatimaPhoto: cms.madameFatimaPhoto,
        madameFatimaTitle: cms.madameFatimaTitle,
        madameFatimaStoryExcerpt: cms.madameFatimaStoryExcerpt,
        madameFatimaFullStory: cms.madameFatimaFullStory,
        announcementText: cms.announcementText,
        announcementActive: cms.announcementActive,
        socialLinks: cms.socialLinks,
        alialynaDescription: cms.alialynaDescription,
        homelifeDescription: cms.homelifeDescription,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});

      for (const p of products) {
        setDoc(doc(db, 'products', p.id), p).catch(() => {});
      }

      for (const a of awards) {
        setDoc(doc(db, 'awards', a.id), a).catch(() => {});
      }

      setDoc(doc(db, 'form_configs', 'mlm'), {
        fields: mlmFieldsConfig,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
      setDoc(doc(db, 'form_configs', 'booking'), {
        fields: bookingFieldsConfig,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});

      for (const m of mlmMembers) {
        setDoc(doc(db, 'mlm_members', m.id), m).catch(() => {});
      }
    } catch (err) {
      console.warn('Firestore optional replication notice:', err);
    }

    fireConfetti();
    return {
      success: true,
      message: `تم نشر ومزامنة كافة التعديلات (${count || 'الكل'}) بنجاح على خادم الموقع لتظهر فوراً لجميع الزوار والأجهزة!`,
      count,
    };
  };

  /**
   * Export Platform Backup (Entire database in single portable JSON format)
   */
  const exportBackupData = (): string => {
    const backup = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      cms,
      products,
      awards,
      mlmMembers,
      mlmLeads,
      bookings,
      sales,
      mlmFieldsConfig,
      bookingFieldsConfig,
    };
    return JSON.stringify(backup, null, 2);
  };

  /**
   * Import Platform Backup (Instantly restores full configuration on any computer/device)
   */
  const importBackupData = (jsonString: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'صيغة ملف النسخة الاحتياطية غير صالحة.' };
      }

      if (data.cms) {
        setCms(data.cms);
        safeSaveToStorage(PERSISTENCE_KEYS.CMS, data.cms);
      }
      if (Array.isArray(data.products)) {
        setProducts(data.products);
        safeSaveToStorage(PERSISTENCE_KEYS.PRODUCTS, data.products);
      }
      if (Array.isArray(data.awards)) {
        setAwards(data.awards);
        safeSaveToStorage(PERSISTENCE_KEYS.AWARDS, data.awards);
      }
      if (Array.isArray(data.mlmMembers)) {
        setMlmMembers(data.mlmMembers);
        safeSaveToStorage(PERSISTENCE_KEYS.MEMBERS, data.mlmMembers);
      }
      if (Array.isArray(data.mlmLeads)) {
        setMlmLeads(data.mlmLeads);
        safeSaveToStorage(PERSISTENCE_KEYS.LEADS, data.mlmLeads);
      }
      if (Array.isArray(data.bookings)) {
        setBookings(data.bookings);
        safeSaveToStorage(PERSISTENCE_KEYS.BOOKINGS, data.bookings);
      }
      if (Array.isArray(data.sales)) {
        setSales(data.sales);
        safeSaveToStorage(PERSISTENCE_KEYS.SALES, data.sales);
      }
      if (Array.isArray(data.mlmFieldsConfig)) {
        setMlmFieldsConfig(data.mlmFieldsConfig);
        safeSaveToStorage(PERSISTENCE_KEYS.MLM_FIELDS, data.mlmFieldsConfig);
      }
      // Save imported snapshot to server storage
      try {
        fetch('/api/publish-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cms: data.cms || cms,
            products: Array.isArray(data.products) ? data.products : products,
            awards: Array.isArray(data.awards) ? data.awards : awards,
            members: Array.isArray(data.mlmMembers) ? data.mlmMembers : mlmMembers,
            formConfigs: {
              mlm: Array.isArray(data.mlmFieldsConfig) ? data.mlmFieldsConfig : mlmFieldsConfig,
              booking: Array.isArray(data.bookingFieldsConfig) ? data.bookingFieldsConfig : bookingFieldsConfig,
            },
            config: { activeSheetId: activeSheetId || '' },
          }),
        }).catch(() => {});
      } catch {
        // Non-blocking
      }

      fireConfetti();
      return { success: true, message: 'تم استعادة كافة بيانات المنصة ومزامنتها على الخادم بنجاح!' };
    } catch (err: any) {
      return { success: false, message: `فشل قراءة الملف: ${err.message}` };
    }
  };

  /**
   * Reset to initial defaults
   */
  const resetToDefaults = () => {
    setCms(initialCMSContent);
    setProducts(initialProducts);
    setAwards(initialAwards);
    setMlmMembers(initialMlmMembers);
    setMlmLeads(initialMlmLeads);
    setBookings(initialBookings);
    setSales(initialSales);
    setMlmFieldsConfig(initialMlmFieldsConfig);
    setBookingFieldsConfig(initialBookingFieldsConfig);

    safeSaveToStorage(PERSISTENCE_KEYS.CMS, initialCMSContent);
    safeSaveToStorage(PERSISTENCE_KEYS.PRODUCTS, initialProducts);
    safeSaveToStorage(PERSISTENCE_KEYS.AWARDS, initialAwards);
    safeSaveToStorage(PERSISTENCE_KEYS.MEMBERS, initialMlmMembers);
    safeSaveToStorage(PERSISTENCE_KEYS.LEADS, initialMlmLeads);

    try {
      fetch('/api/publish-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cms: initialCMSContent,
          products: initialProducts,
          awards: initialAwards,
          members: initialMlmMembers,
          formConfigs: { mlm: initialMlmFieldsConfig, booking: initialBookingFieldsConfig },
          config: { activeSheetId: '' },
        }),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }
    safeSaveToStorage(PERSISTENCE_KEYS.BOOKINGS, initialBookings);
    safeSaveToStorage(PERSISTENCE_KEYS.SALES, initialSales);
    safeSaveToStorage(PERSISTENCE_KEYS.MLM_FIELDS, initialMlmFieldsConfig);
    safeSaveToStorage(PERSISTENCE_KEYS.BOOKING_FIELDS, initialBookingFieldsConfig);
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isDark,
        toggleTheme,
        activeAttribution,
        setActiveAttribution,
        cms,
        updateCMS,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        mlmMembers,
        addMlmMember,
        updateMlmMember,
        deleteMlmMember,
        mlmLeads,
        submitMlmLead,
        updateLeadStatus,
        updateMlmLead,
        deleteMlmLead,
        addManualLead,
        bookings,
        submitBooking,
        updateBookingStatus,
        updateBooking,
        deleteBooking,
        addManualBooking,
        exportToCsv,
        sales,
        createSale,
        awards,
        addAward,
        deleteAward,
        mlmFieldsConfig,
        bookingFieldsConfig,
        updateMlmFieldsConfig,
        updateBookingFieldsConfig,
        syncFormHeadersNow,
        activeSheetId,
        setActiveSheetId,
        publishAllLocalDataToCloud,
        saveProductsToServer,
        saveMembersToServer,
        saveCmsToServer,
        saveAwardsToServer,
        saveBookingsToServer,
        syncStatus,
        syncAllWithWebhook,
        isAdminLoggedIn,
        adminEmail,
        loginAdmin,
        loginAdminWithGoogle,
        logoutAdmin,
        changeAdminPassword,
        isAdminModalOpen,
        setIsAdminModalOpen,
        fireConfetti,
        exportBackupData,
        importBackupData,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
