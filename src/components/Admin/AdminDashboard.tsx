import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OverviewTab } from './Tabs/OverviewTab';
import { ProductsTab } from './Tabs/ProductsTab';
import { MlmTrackerTab } from './Tabs/MlmTrackerTab';
import { BookingsTab } from './Tabs/BookingsTab';
import { FormsCustomizerTab } from './Tabs/FormsCustomizerTab';
import { AwardsTab } from './Tabs/AwardsTab';
import { VisualCmsTab } from './Tabs/VisualCmsTab';
import {
  LayoutDashboard,
  Package,
  Users,
  Calendar,
  Sliders,
  Trophy,
  SlidersHorizontal,
  LogOut,
  X,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { logoutAdmin, cms } = useApp();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'mlm' | 'bookings' | 'forms' | 'awards' | 'cms'
  >('overview');

  const menuItems = [
    { id: 'overview', label: '1. الملخص التنفيذي', icon: LayoutDashboard },
    { id: 'products', label: '2. إدارة المنتجات', icon: Package },
    { id: 'mlm', label: '3. فريق MLM وتتبع المبيعات', icon: Users },
    { id: 'bookings', label: '4. حجوزات الاستشارات', icon: Calendar },
    { id: 'forms', label: '5. مخصص النماذج', icon: Sliders },
    { id: 'awards', label: '6. التكريمات والجوائز', icon: Trophy },
    { id: 'cms', label: '7. منشئ المحتوى CMS والإعدادات', icon: SlidersHorizontal },
  ];

  return (
    <div className="flex flex-col md:flex-row h-full max-h-[92vh] overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#FAF5EE] dark:bg-[#120E11] border-b md:border-b-0 md:border-e border-[#D4AF37]/25 p-4 flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[#D4AF37]/20">
            <img
              src={cms.logoUrl || '/assets/aistudio/LOGO_5dd3ae33.png'}
              alt="Logo"
              className="h-9 w-auto object-contain"
            />
            <div className="text-start">
              <span className="block font-bold text-xs font-serif-luxury text-[#2D2A26] dark:text-white">
                لوحة تحكم ماريا ستايل
              </span>
              <span className="block text-[10px] text-[#C94C71] font-semibold">
                Alialyna &amp; HomeLife
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-start transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#C94C71] to-[#D4AF37] text-white shadow-md'
                      : 'text-[#5A524A] dark:text-[#C5B7A9] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="line-clamp-1">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer controls & Quick Cloud Sync */}
        <div className="pt-3 border-t border-[#D4AF37]/20 space-y-2.5">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="leading-tight">الحفظ والتعديل المباشر نشط على الموقع</span>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                logoutAdmin();
                onClose();
              }}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>

            <button
              onClick={onClose}
              className="px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-black/5 cursor-pointer"
            >
              عرض المتجر
            </button>
          </div>
        </div>
      </aside>

      {/* Main Tab Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white/70 dark:bg-[#1A1518]/70">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'mlm' && <MlmTrackerTab />}
        {activeTab === 'bookings' && <BookingsTab />}
        {activeTab === 'forms' && <FormsCustomizerTab />}
        {activeTab === 'awards' && <AwardsTab />}
        {activeTab === 'cms' && <VisualCmsTab />}
      </main>
    </div>
  );
};
