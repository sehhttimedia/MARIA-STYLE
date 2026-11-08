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
  Download,
  Edit3,
  Trash2,
  X,
  FolderSync,
} from 'lucide-react';

export const MlmTrackerTab: React.FC = () => {
  const {
    mlmMembers,
    addMlmMember,
    updateMlmMember,
    mlmLeads,
    updateLeadStatus,
    updateMlmLead,
    deleteMlmLead,
    addManualLead,
    exportToCsv,
    sales,
  } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'leads' | 'sales'>('members');
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Leads Management State
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<MlmLead | null>(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [deleteConfirmLeadId, setDeleteConfirmLeadId] = useState<string | null>(null);

  const [newLead, setNewLead] = useState({
    fullName: '',
    phone: '',
    country: 'تركيا',
    city: 'إسطنبول',
    targetCompany: 'Alialyna' as MlmLead['targetCompany'],
    experience: 'beginner' as MlmLead['experience'],
    availableHours: '3-4 ساعات',
    motivation: '',
    attributionCode: 'MS-FATIMA',
    status: 'new' as MlmLead['status'],
    notes: '',
  });

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

  const handleCreateManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.fullName.trim() || !newLead.phone.trim()) return;

    await addManualLead(newLead);
    setIsAddLeadModalOpen(false);
    setNewLead({
      fullName: '',
      phone: '',
      country: 'تركيا',
      city: 'إسطنبول',
      targetCompany: 'Alialyna',
      experience: 'beginner',
      availableHours: '3-4 ساعات',
      motivation: '',
      attributionCode: 'MS-FATIMA',
      status: 'new',
      notes: '',
    });
  };

  const handleUpdateLeadFull = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForEdit) return;

    await updateMlmLead(selectedLeadForEdit.id, selectedLeadForEdit);
    setSelectedLeadForEdit(null);
  };

  const handleDeleteLead = async (id: string) => {
    await deleteMlmLead(id);
    setDeleteConfirmLeadId(null);
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

      {/* SubTab 2: MLM Leads (Stored in Site Files & Google Sheets 1) */}
      {activeSubTab === 'leads' && (
        <div className="space-y-4">
          {/* Leads Action & Export Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl glass-luxury border border-[#D4AF37]/30">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2D2A26] dark:text-white">
                إجمالي طلبات الانضمام: <span className="text-[#C94C71] font-mono font-bold text-sm">({filteredLeads.length})</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <FolderSync className="w-3 h-3" />
                <span>مخزنة في ملفات الموقع والسحاب</span>
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => exportToCsv('leads')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 text-[#8C7A6B] dark:text-[#E2D8CE] flex items-center gap-1.5 transition-all"
                title="تصدير طلبات الانضمام بصيغة CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>تصدير Excel (CSV)</span>
              </button>

              <button
                onClick={() => setIsAddLeadModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white rose-gold-gradient shadow-md flex items-center gap-1.5 hover:scale-[1.02] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ تسجيل طلب انضمام يدوي</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="glass-luxury rounded-2xl border border-[#D4AF37]/30 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-[#FAF5EE] dark:bg-white/5 border-b border-[#D4AF37]/20 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="p-3 text-start">الاسم</th>
                    <th className="p-3 text-start">الهاتف والواتساب</th>
                    <th className="p-3 text-start">الموقع</th>
                    <th className="p-3 text-start">الشركة المطلوبة</th>
                    <th className="p-3 text-start">الخبرة وساعات العمل</th>
                    <th className="p-3 text-start">كود الداعية</th>
                    <th className="p-3 text-start">حالة الطلب</th>
                    <th className="p-3 text-start">ملاحظات المشرف</th>
                    <th className="p-3 text-start">التخزين</th>
                    <th className="p-3 text-center">إجراءات وتحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-gray-400 text-xs">
                        لا توجد طلبات انضمام مطابقة للبحث حالياً.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((l) => (
                      <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <span className="font-bold text-[#2D2A26] dark:text-white block">
                            {l.fullName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono block">
                            {l.createdAt ? new Date(l.createdAt).toLocaleDateString('ar-EG') : 'طلب مسجل'}
                          </span>
                        </td>
                        <td className="p-3 font-mono" dir="ltr">
                          <a
                            href={`https://wa.me/${l.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{l.phone}</span>
                          </a>
                        </td>
                        <td className="p-3 text-gray-500">
                          {l.country} - {l.city}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C94C71]/15 text-[#C94C71]">
                            {l.targetCompany}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500">
                          <span className="block font-semibold text-gray-700 dark:text-gray-300">
                            {l.experience}
                          </span>
                          {l.availableHours && (
                            <span className="text-[10px] text-[#D4AF37] block font-mono">
                              {l.availableHours}
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-[#D4AF37]">
                          {l.attributionCode || 'MS-FATIMA'}
                        </td>
                        <td className="p-3">
                          <select
                            value={l.status}
                            onChange={(e) =>
                              updateLeadStatus(l.id, e.target.value as MlmLead['status'])
                            }
                            className={`px-2 py-1 rounded-lg border text-[11px] font-bold focus:outline-none ${
                              l.status === 'registered'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                                : l.status === 'contacted'
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300'
                                : l.status === 'archived'
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-300'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300'
                            }`}
                          >
                            <option value="new">طلب جديد 🔴</option>
                            <option value="contacted">تم التواصل 🟡</option>
                            <option value="registered">تم التسجيل بنجاح 🟢</option>
                            <option value="archived">مؤرشف ⚪</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 italic max-w-xs">
                            {l.notes || l.motivation || '—'}
                          </p>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            ملفات الموقع + السحاب
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Comprehensive Full Edit */}
                            <button
                              onClick={() => setSelectedLeadForEdit({ ...l })}
                              className="px-2 py-1 rounded-lg bg-[#C94C71]/10 text-[#C94C71] hover:bg-[#C94C71] hover:text-white transition-all text-[11px] font-bold flex items-center gap-1"
                              title="تعديل شامل لبيانات الطلب"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>تعديل شامل</span>
                            </button>

                            {/* WhatsApp Direct */}
                            <a
                              href={`https://wa.me/${l.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `أهلاً وسهلاً بكِ أختي ${l.fullName} في عائلة ماريا ستايل! معكِ منسقة فريق مدام فاطمة بخصوص طلب انضمامكِ لـ ${l.targetCompany}. هل الوقت مناسب لبدء تدريبكِ؟`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              title="فتح محادثة فورية"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>

                            {/* Delete Lead */}
                            {deleteConfirmLeadId === l.id ? (
                              <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 p-1 rounded-lg">
                                <button
                                  onClick={() => handleDeleteLead(l.id)}
                                  className="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded"
                                >
                                  تأكيد
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmLeadId(null)}
                                  className="p-0.5 text-gray-500 hover:text-gray-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmLeadId(l.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                title="حذف الطلب نهائياً"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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

      {/* ========================================================================= */}
      {/* COMPREHENSIVE EDIT LEAD MODAL (تعديل شامل لطلب الانضمام) */}
      {/* ========================================================================= */}
      {selectedLeadForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-luxury rounded-3xl border border-[#D4AF37]/40 max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full rose-gold-gradient text-white flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#2D2A26] dark:text-white font-serif-luxury">
                    تعديل شامل لبيانات طلب الانضمام
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    معرف الطلب: <span className="font-mono text-[#C94C71]">{selectedLeadForEdit.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLeadForEdit(null)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateLeadFull} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    الاسم الكامل:
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedLeadForEdit.fullName}
                    onChange={(e) =>
                      setSelectedLeadForEdit({ ...selectedLeadForEdit, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    رقم الهاتف والواتساب:
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={selectedLeadForEdit.phone}
                    onChange={(e) =>
                      setSelectedLeadForEdit({ ...selectedLeadForEdit, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    الدولة:
                  </label>
                  <input
                    type="text"
                    value={selectedLeadForEdit.country}
                    onChange={(e) =>
                      setSelectedLeadForEdit({ ...selectedLeadForEdit, country: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    المدينة / الحي:
                  </label>
                  <input
                    type="text"
                    value={selectedLeadForEdit.city}
                    onChange={(e) =>
                      setSelectedLeadForEdit({ ...selectedLeadForEdit, city: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    الشركة المطلوبة:
                  </label>
                  <select
                    value={selectedLeadForEdit.targetCompany}
                    onChange={(e) =>
                      setSelectedLeadForEdit({
                        ...selectedLeadForEdit,
                        targetCompany: e.target.value as MlmLead['targetCompany'],
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white font-bold"
                  >
                    <option value="Alialyna">Alialyna (جمال وعطور)</option>
                    <option value="HomeLife">HomeLife (عناية وتخسيس)</option>
                    <option value="HelpMeChoose">ساعدوني في الاختيار</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    حالة الطلب:
                  </label>
                  <select
                    value={selectedLeadForEdit.status}
                    onChange={(e) =>
                      setSelectedLeadForEdit({
                        ...selectedLeadForEdit,
                        status: e.target.value as MlmLead['status'],
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white font-bold"
                  >
                    <option value="new">طلب جديد 🔴</option>
                    <option value="contacted">تم التواصل 🟡</option>
                    <option value="registered">تم التسجيل بنجاح 🟢</option>
                    <option value="archived">مؤرشف ⚪</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    مستوى الخبرة:
                  </label>
                  <select
                    value={selectedLeadForEdit.experience}
                    onChange={(e) =>
                      setSelectedLeadForEdit({
                        ...selectedLeadForEdit,
                        experience: e.target.value as MlmLead['experience'],
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white"
                  >
                    <option value="none">لا توجد خبرة سابقة</option>
                    <option value="beginner">مبتدئة</option>
                    <option value="intermediate">متوسطة</option>
                    <option value="leader">قائدة فريق</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    ساعات العمل المتاحة:
                  </label>
                  <input
                    type="text"
                    value={selectedLeadForEdit.availableHours}
                    onChange={(e) =>
                      setSelectedLeadForEdit({ ...selectedLeadForEdit, availableHours: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    كود الداعية / الإحالة:
                  </label>
                  <input
                    type="text"
                    value={selectedLeadForEdit.attributionCode || ''}
                    onChange={(e) =>
                      setSelectedLeadForEdit({ ...selectedLeadForEdit, attributionCode: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    تاريخ الطلب:
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedLeadForEdit.createdAt ? new Date(selectedLeadForEdit.createdAt).toLocaleString('ar-EG') : '—'}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  الدافع والهدف من الانضمام:
                </label>
                <textarea
                  rows={2}
                  value={selectedLeadForEdit.motivation || ''}
                  onChange={(e) =>
                    setSelectedLeadForEdit({ ...selectedLeadForEdit, motivation: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  ملاحظات المشرف والمتابعة:
                </label>
                <textarea
                  rows={2}
                  value={selectedLeadForEdit.notes || ''}
                  onChange={(e) =>
                    setSelectedLeadForEdit({ ...selectedLeadForEdit, notes: e.target.value })
                  }
                  placeholder="مثال: تم إرسال الحقيبة التدريبية، مهتمة بفرع إسطنبول..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteLead(selectedLeadForEdit.id);
                    setSelectedLeadForEdit(null);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الطلب</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLeadForEdit(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-black/5"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white rose-gold-gradient shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>حفظ التعديلات في ملفات الموقع</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD MANUAL LEAD MODAL (تسجيل طلب انضمام يدوي) */}
      {/* ========================================================================= */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-luxury rounded-3xl border border-[#D4AF37]/40 max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full rose-gold-gradient text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#2D2A26] dark:text-white font-serif-luxury">
                    تسجيل طلب انضمام جديد يدوياً
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    لحفظ الراغبات بالانضمام القادمات من المحادثات المباشرة أو المعارف
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddLeadModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualLead} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    الاسم الكامل:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أسماء يوسف"
                    value={newLead.fullName}
                    onChange={(e) => setNewLead({ ...newLead, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    رقم الهاتف والواتساب:
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    placeholder="+90555..."
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    الدولة:
                  </label>
                  <input
                    type="text"
                    value={newLead.country}
                    onChange={(e) => setNewLead({ ...newLead, country: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    المدينة:
                  </label>
                  <input
                    type="text"
                    value={newLead.city}
                    onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    الشركة المطلوبة:
                  </label>
                  <select
                    value={newLead.targetCompany}
                    onChange={(e) =>
                      setNewLead({ ...newLead, targetCompany: e.target.value as MlmLead['targetCompany'] })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white font-bold"
                  >
                    <option value="Alialyna">Alialyna</option>
                    <option value="HomeLife">HomeLife</option>
                    <option value="HelpMeChoose">ساعدوني في الاختيار</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    حالة الطلب:
                  </label>
                  <select
                    value={newLead.status}
                    onChange={(e) =>
                      setNewLead({ ...newLead, status: e.target.value as MlmLead['status'] })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white font-bold"
                  >
                    <option value="new">طلب جديد 🔴</option>
                    <option value="contacted">تم التواصل 🟡</option>
                    <option value="registered">تم التسجيل بنجاح 🟢</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    الخبرة:
                  </label>
                  <select
                    value={newLead.experience}
                    onChange={(e) =>
                      setNewLead({ ...newLead, experience: e.target.value as MlmLead['experience'] })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white"
                  >
                    <option value="beginner">مبتدئة</option>
                    <option value="intermediate">متوسطة</option>
                    <option value="leader">قائدة</option>
                    <option value="none">بدون خبرة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    كود الداعية:
                  </label>
                  <input
                    type="text"
                    value={newLead.attributionCode}
                    onChange={(e) => setNewLead({ ...newLead, attributionCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  ملاحظات إضافية:
                </label>
                <textarea
                  rows={2}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="تفاصيل المحادثة الأولى أو أي معلومات هامة..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-black/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white rose-gold-gradient shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>تأكيد وتسجيل الطلب في الموقع</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
