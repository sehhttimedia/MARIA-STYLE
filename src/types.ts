export type Language = 'ar' | 'tr' | 'en';

export type TargetCompany = 'Alialyna' | 'HomeLife' | 'HelpMeChoose' | 'All';

export interface Product {
  id: string;
  name: string;
  nameTr: string;
  nameEn: string;
  price: number;
  costPrice: number;
  currency: string;
  category: 'skincare' | 'haircare' | 'fragrance' | 'makeup' | 'wellness' | 'bundles';
  categoryLabel: string;
  rating: number;
  reviewsCount: number;
  description: string;
  descriptionTr?: string;
  descriptionEn?: string;
  ingredients: string;
  howToUse: string;
  image: string;
  galleryImages: string[];
  badge?: string;
  inStock: boolean;
  featured: boolean;
  companyOrigin: 'Alialyna' | 'HomeLife' | 'MariaStyle';
}

export interface MlmLead {
  id: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  targetCompany: 'Alialyna' | 'HomeLife' | 'HelpMeChoose';
  experience: 'none' | 'beginner' | 'intermediate' | 'leader';
  availableHours: string;
  motivation: string;
  attributionCode: string;
  status: 'new' | 'contacted' | 'registered' | 'archived';
  notes?: string;
  createdAt: string;
  synced: boolean;
  [key: string]: any;
}

export interface Booking {
  id: string;
  clientName: string;
  phone: string;
  consultationType: 'skincare' | 'business' | 'products' | 'mlm_onboarding';
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  adminNotes?: string;
  createdAt: string;
  synced: boolean;
  [key: string]: any;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface SaleAttribution {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  items: SaleItem[];
  totalAmount: number;
  profitAmount: number;
  memberCode: string;
  memberName: string;
  commissionRate: number; // percentage (e.g., 15 for 15%)
  commissionEarned: number;
  paymentStatus: 'paid' | 'pending' | 'cancelled';
  orderDate: string;
  synced: boolean;
}

export interface MlmMember {
  id: string;
  memberCode: string;
  name: string;
  phone: string;
  email: string;
  company: 'Alialyna' | 'HomeLife';
  rank: string;
  joinedDate: string;
  totalSales: number;
  totalOrders: number;
  totalCommission: number;
  status: 'active' | 'top_performer' | 'inactive';
}

export interface AwardItem {
  id: string;
  title: string;
  titleTr: string;
  titleEn: string;
  year: string;
  company: 'Alialyna' | 'HomeLife' | 'MariaStyle';
  mediaType: 'image' | 'video';
  mediaUrl: string;
  description: string;
}

export interface FormFieldConfig {
  id: string;
  name: string;
  labelAr: string;
  labelTr: string;
  labelEn: string;
  type: 'text' | 'tel' | 'select' | 'textarea' | 'number';
  required: boolean;
  options?: string[];
  enabled: boolean;
}

export interface CMSContent {
  brandName: string;
  brandTagline: string;
  officialWhatsApp: string;
  officialPhone: string;
  emailContact: string;
  logoUrl: string;
  madameFatimaPhoto: string;
  madameFatimaTitle: string;
  madameFatimaStoryExcerpt: string;
  madameFatimaFullStory: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroCtaText: string;
  announcementText: string;
  announcementActive: boolean;
  socialLinks: {
    instagram: string;
    tiktok: string;
    facebook: string;
    telegram: string;
    youtube: string;
  };
  alialynaDescription: string;
  homelifeDescription: string;
  lastSyncedAt: string | null;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncedTime: string | null;
  success: boolean | null;
  message: string;
  pendingCount: number;
}
