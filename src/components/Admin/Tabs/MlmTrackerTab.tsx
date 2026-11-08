import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { MlmMember, MlmLead } from '../../../types';
import {
  Users,
  Search,
  Plus,
  Copy,
  Check,
  Award,
  Phone,
  DollarSign,
  TrendingUp,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

export const MlmTrackerTab: React.FC = () => {
  const { mlmMembers, addMlmMember, updateMlmMember, mlmLeads, updateLeadStatus, sales } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'leads' | 'sales'>('members');
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New member form
  const [newMember, setNewMember] = useState<Omit<MlmMember, 'id'>>({
    memberCode: '',
    name: '',
    phone: '',
    email: '',
    company: 'Alialyna',
    rank: 'Junior Associate',
    joinedDate: new Date().toISOString().slice(0, 10),
    totalSales: 0,
    totalOrders: 0,
    totalCommission: 0,
    status: 'active',
  });

  const handleCopyLink = (code: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.memberCode || !newMember.name) return;
    addMlmMember({
      ...newMember,
      memberCode: newMember.memberCode.toUpperCase().trim(),
    });
    setIsAddModalOpen(false);
  };

  const filteredMembers = mlmMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(search.toLowerCase()) ||
      m.company.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLeads = mlmLeads.filter(
    (l) =>
      l.fullName.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.city.toLowerCase().includes(search.toLowerCase()) ||
      l.targetCompany.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Sub Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#2D2A26] dark:text-white font-serif-luxury">
            إدارة الفريق وتتبع مبيعات العضوات (Sales Attribution)
          </h3>
          <p className="text-xs text-gray-500">
            تتبع مبيعات كل عضوة، حساب العمولات، إدارة الطلبات القادمة من الحملات الإعلانية
          </p>
        </div>

        {/* Sub-Tabs Pills */}
        <div className="inline-flex p-1 rounded-xl bg-[#FAF5EE] dark:bg-white/5 border border-[#D4AF37]/30">
          <button
            onClick={() => setActiveSubTab('members')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'members'
                ? 'bg-[#C94C71] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            العضوات والتتبع ({mlmMembers.length})
          </button>
          <button
            onClick={() => setActiveSubTab('leads')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'leads'
                ? 'bg-[#C94C71] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            طلبات الانضمام (Leads_MLM: {mlmLeads.length})
          </button>
          <button
            onClick={() => setActiveSubTab('sales')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'sales'
                ? 'bg-[#C94C71] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            حركات المبيعات (Sales: {sales.length})
          </button>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، الكود، المدينة..."
            className="w-full ps-9 pe-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white focus:outline-none"
          />
        </div>

        {activeSubTab === 'members' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white rose-gold-gradient shadow-md flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل عضوة جديدة في الفريق</span>
          </button>
        )}
      </div>

      {/* SubTab 1: Members & Performance Attribution */}
      {activeSubTab === 'members' && (
        <div className="glass-luxury rounded-2xl border border-[#D4AF37]/30 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#FAF5EE] dark:bg-white/5 border-b border-[#D4AF37]/20 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="p-3 text-start">العضوة / الكود</th>
                  <th className="p-3 text-start">الشركة</th>
                  <th className="p-3 text-start">الرتبة</th>
                  <th className="p-3 text-start">إجمالي مبيعاتها</th>
                  <th className="p-3 text-start">الطلبات</th>
                  <th className="p-3 text-start">عمولاتها المستحقة</th>
                  <th className="p-3 text-start">رابط الإحالة المباشر</th>
                  <th className="p-3 text-center">التواصل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <div>
                        <span className="font-bold text-[#2D2A26] dark:text-white block">
                          {m.name}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-[#C94C71]">
                          {m.memberCode}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C94C71]/15 text-[#C94C71]">
                        {m.company}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">{m.rank}</td>
                    <td className="p-3 font-bold text-[#2D2A26] dark:text-white">
                      {m.totalSales.toLocaleString()} TL
                    </td>
                    <td className="p-3 text-gray-500">{m.totalOrders} طلب</td>
                    <td className="p-3">
                      <span className="font-bold text-[#25D366]">
                        +{m.totalCommission.toLocaleString()} TL
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleCopyLink(m.memberCode)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all ${
                          copiedCode === m.memberCode
                            ? 'bg-[#25D366]/20 border-[#25D366] text-[#25D366]'
                            : 'border-[#D4AF37]/40 text-gray-600 dark:text-gray-300 hover:border-[#C94C71]'
                        }`}
                      >
                        {copiedCode === m.memberCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#25D366]" />
                            <span>تم النسخ!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ رابط الحملة</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <a
                        href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex p-1.5 rounded-lg text-[#25D366] hover:bg-[#25D366]/10"
                        title="محادثة واتساب"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: MLM Leads (Sheet 1 Leads_MLM) */}
      {activeSubTab === 'leads' && (
        <div className="glass-luxury rounded-2xl border border-[#D4AF37]/30 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#FAF5EE] dark:bg-white/5 border-b border-[#D4AF37]/20 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="p-3 text-start">الاسم</th>
                  <th className="p-3 text-start">الهاتف والواتساب</th>
                  <th className="p-3 text-start">الموقع</th>
                  <th className="p-3 text-start">الشركة المطلوبة</th>
                  <th className="p-3 text-start">الخبرة</th>
                  <th className="p-3 text-start">كود الداعية</th>
                  <th className="p-3 text-start">حالة الطلب</th>
                  <th className="p-3 text-start">المزامنة</th>
                  <th className="p-3 text-center">واتساب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-[#2D2A26] dark:text-white">
                      {l.fullName}
                    </td>
                    <td className="p-3 font-mono" dir="ltr">
                      {l.phone}
                    </td>
                    <td className="p-3 text-gray-500">
                      {l.country} - {l.city}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C94C71]/15 text-[#C94C71]">
                        {l.targetCompany}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{l.experience}</td>
                    <td className="p-3 font-mono font-bold text-[#D4AF37]">
                      {l.attributionCode || 'MS-FATIMA'}
                    </td>
                    <td className="p-3">
                      <select
                        value={l.status}
                        onChange={(e) =>
                          updateLeadStatus(l.id, e.target.value as MlmLead['status'])
                        }
                        className="px-2 py-1 rounded-lg border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11] text-[11px]"
                      >
                        <option value="new">طلب جديد 🔴</option>
                        <option value="contacted">تم التواصل 🟡</option>
                        <option value="registered">تم التسجيل بنجاح 🟢</option>
                        <option value="archived">مؤرشف ⚪</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          l.synced
                            ? 'bg-[#25D366]/20 text-[#25D366]'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {l.synced ? 'محدث في الشيت 1' : 'محفوظ محلياً'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <a
                        href={`https://wa.me/${l.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `أهلاً وسهلاً بكِ أختي ${l.fullName} في عائلة ماريا ستايل! معكِ منسقة فريق مدام فاطمة بخصوص طلب انضمامكِ لـ ${l.targetCompany}. هل الوقت مناسب لبدء تدريبكِ؟`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex p-1.5 rounded-lg text-[#25D366] hover:bg-[#25D366]/10"
                        title="فتح محادثة فورية"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 3: Sales Attribution (Sheet 3 Sales) */}
      {activeSubTab === 'sales' && (
        <div className="glass-luxury rounded-2xl border border-[#D4AF37]/30 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#FAF5EE] dark:bg-white/5 border-b border-[#D4AF37]/20 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="p-3 text-start">رقم الطلب</th>
                  <th className="p-3 text-start">العميلة</th>
                  <th className="p-3 text-start">المنتجات المطلوبة</th>
                  <th className="p-3 text-start">إجمالي الطلب</th>
                  <th className="p-3 text-start">الأرباح</th>
                  <th className="p-3 text-start">العضوة المنسوب لها (Attribution)</th>
                  <th className="p-3 text-start">عمولة العضوة (20%)</th>
                  <th className="p-3 text-start">حالة الدفع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#C94C71]">{s.orderId}</td>
                    <td className="p-3 font-bold text-[#2D2A26] dark:text-white">{s.customerName}</td>
                    <td className="p-3 text-gray-500">
                      {s.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="p-3 font-black text-[#2D2A26] dark:text-white">
                      {s.totalAmount} TL
                    </td>
                    <td className="p-3 text-[#25D366] font-bold">+{s.profitAmount} TL</td>
                    <td className="p-3 font-mono font-bold text-[#D4AF37]">
                      {s.memberCode} ({s.memberName})
                    </td>
                    <td className="p-3 text-[#25D366] font-bold">+{s.commissionEarned} TL</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#25D366]/15 text-[#25D366]">
                        {s.paymentStatus === 'paid' ? 'مدفوع' : 'معلق'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#161114] rounded-3xl shadow-2xl border border-[#D4AF37]/40 p-6 text-start text-xs space-y-4">
            <h4 className="text-base font-bold font-serif-luxury text-[#2D2A26] dark:text-white">
              إضافة عضوة جديدة وتخصيص كود التتبع
            </h4>

            <form onSubmit={handleCreateMember} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">اسم العضوة الثلاثي *</label>
                <input
                  type="text"
                  required
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">كود التتبع المخصص (Referral Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: MS-FATIMA"
                    value={newMember.memberCode}
                    onChange={(e) => setNewMember({ ...newMember, memberCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">الشركة الأساسية</label>
                  <select
                    value={newMember.company}
                    onChange={(e) =>
                      setNewMember({ ...newMember, company: e.target.value as MlmMember['company'] })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  >
                    <option value="Alialyna">Alialyna</option>
                    <option value="HomeLife">HomeLife</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">رقم الهاتف والواتساب *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+90 5XX XXX XX XX"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">الرتبة الأولية</label>
                  <input
                    type="text"
                    value={newMember.rank}
                    onChange={(e) => setNewMember({ ...newMember, rank: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#D4AF37]/20 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white font-bold rose-gold-gradient shadow-md"
                >
                  تأكيد وحفظ العضوة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
