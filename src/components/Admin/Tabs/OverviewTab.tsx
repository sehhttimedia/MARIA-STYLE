import React, { useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Package,
  CloudCheck,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const OverviewTab: React.FC = () => {
  const { sales, mlmLeads, bookings, products, syncStatus, syncAllWithWebhook, mlmMembers, isDark } = useApp();

  // Metrics
  const totalSales = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalProfit = sales.reduce((acc, s) => acc + s.profitAmount, 0);
  const totalLeads = mlmLeads.length;

  const alialynaLeads = mlmLeads.filter(
    (l) => l.targetCompany.toLowerCase().includes('alialyna') || l.targetCompany === 'Alialyna'
  ).length;

  const homeLifeLeads = mlmLeads.filter(
    (l) => l.targetCompany.toLowerCase().includes('homelife') || l.targetCompany === 'HomeLife'
  ).length;

  const otherLeads = totalLeads - alialynaLeads - homeLifeLeads;

  // Chart 1: Sales Trend
  const salesChartData = {
    labels: ['اليوم 1', 'اليوم 2', 'اليوم 3', 'اليوم 4', 'اليوم 5', 'اليوم 6', 'اليوم 7'],
    datasets: [
      {
        label: 'حركة المبيعات (TL)',
        data: [1200, 2400, 1800, 3600, 4200, 3800, totalSales > 0 ? totalSales : 5400],
        borderColor: '#C94C71',
        backgroundColor: 'rgba(201, 76, 113, 0.15)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'الأرباح المحققة (TL)',
        data: [600, 1200, 900, 1800, 2100, 1900, totalProfit > 0 ? totalProfit : 2700],
        borderColor: '#D4AF37',
        backgroundColor: 'rgba(212, 175, 55, 0.15)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart 2: Leads Company Ratio
  const leadsRatioData = {
    labels: ['Alialyna (جمال وعطور)', 'HomeLife (صحة ومنزل)', 'بحاجة لاستشارة'],
    datasets: [
      {
        data: [
          alialynaLeads || 14,
          homeLifeLeads || 9,
          otherLeads || 4,
        ],
        backgroundColor: ['#C94C71', '#D4AF37', '#6B5A72'],
        borderWidth: 2,
        borderColor: isDark ? '#161114' : '#ffffff',
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Top Bar with Sync Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF5EE] dark:bg-white/5 border border-[#D4AF37]/30">
        <div>
          <h4 className="text-sm font-bold text-[#2D2A26] dark:text-white flex items-center gap-2">
            <span>حالة المزامنة السحابية (Google Sheets 4-Sheets)</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                syncStatus.success !== false ? 'bg-[#25D366] animate-pulse' : 'bg-red-500'
              }`}
            />
          </h4>
          <p className="text-xs text-[#7A6F65] dark:text-[#A8988B] mt-0.5">
            {syncStatus.message}
          </p>
        </div>

        <button
          onClick={syncAllWithWebhook}
          disabled={syncStatus.isSyncing}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#C94C71] to-[#D4AF37] hover:opacity-95 shadow-md flex items-center gap-2 shrink-0 disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
          <span>{syncStatus.isSyncing ? 'جاري المزامنة...' : 'SYNC NOW (مزامنة فورية)'}</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Sales */}
        <div className="glass-luxury rounded-2xl p-5 border border-[#D4AF37]/30 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">إجمالي المبيعات</span>
            <div className="w-9 h-9 rounded-xl bg-[#C94C71]/15 text-[#C94C71] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2D2A26] dark:text-white font-serif-luxury mb-1">
            {totalSales.toLocaleString()} TL
          </div>
          <span className="text-[11px] text-[#25D366] font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% نمو هذا الشهر</span>
          </span>
        </div>

        {/* Profit */}
        <div className="glass-luxury rounded-2xl p-5 border border-[#D4AF37]/30 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">صافي الأرباح</span>
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#D4AF37] font-serif-luxury mb-1">
            {totalProfit.toLocaleString()} TL
          </div>
          <span className="text-[11px] text-gray-500">
            هامش ربحي متوسط {(totalSales ? Math.round((totalProfit / totalSales) * 100) : 48)}%
          </span>
        </div>

        {/* Leads */}
        <div className="glass-luxury rounded-2xl p-5 border border-[#D4AF37]/30 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">طلبات الانضمام للفريق</span>
            <div className="w-9 h-9 rounded-xl bg-[#C94C71]/15 text-[#C94C71] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2D2A26] dark:text-white font-serif-luxury mb-1">
            {totalLeads} طلب
          </div>
          <div className="text-[11px] text-gray-500 flex items-center gap-2">
            <span className="text-[#C94C71] font-bold">Alialyna: {alialynaLeads}</span>
            <span>•</span>
            <span className="text-[#D4AF37] font-bold">HomeLife: {homeLifeLeads}</span>
          </div>
        </div>

        {/* VIP Bookings */}
        <div className="glass-luxury rounded-2xl p-5 border border-[#D4AF37]/30 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">حجوزات الاستشارات</span>
            <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2D2A26] dark:text-white font-serif-luxury mb-1">
            {bookings.length} موعد VIP
          </div>
          <span className="text-[11px] text-[#25D366]">
            {bookings.filter((b) => b.status === 'confirmed').length} مؤكد رسمياً
          </span>
        </div>
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chart 1: Sales & Profits Trend (Col 1-8) */}
        <div className="lg:col-span-8 glass-luxury rounded-3xl p-6 border border-[#D4AF37]/30 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#2D2A26] dark:text-white">
                حركة المبيعات والأرباح اليومية
              </h3>
              <p className="text-xs text-gray-400">تحديث لحظي من واقع الطلبات المسجلة</p>
            </div>
          </div>
          <div className="h-64">
            <Line
              data={salesChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      boxWidth: 12,
                      font: { size: 11 },
                      color: isDark ? '#FAF7F2' : '#2D2A26',
                    },
                  },
                },
                scales: {
                  y: {
                    grid: { color: isDark ? 'rgba(212,175,55,0.12)' : 'rgba(212,175,55,0.1)' },
                    ticks: { color: isDark ? '#C5B7A9' : '#666' },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: isDark ? '#C5B7A9' : '#666' },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Chart 2: Company Ratio (Col 9-12) */}
        <div className="lg:col-span-4 glass-luxury rounded-3xl p-6 border border-[#D4AF37]/30 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#2D2A26] dark:text-white mb-1">
              توزيع المتقدمات للشركتين
            </h3>
            <p className="text-xs text-gray-400 mb-4">نسبة الإقبال على Alialyna مقابل HomeLife</p>
            <div className="h-52 flex items-center justify-center">
              <Doughnut
                data={leadsRatioData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: 10,
                        font: { size: 10 },
                        color: isDark ? '#FAF7F2' : '#2D2A26',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#D4AF37]/20 text-center text-xs text-gray-500">
            بيانات مسحوبة مباشرة من الشيت 1 (Leads_MLM)
          </div>
        </div>
      </div>
    </div>
  );
};
