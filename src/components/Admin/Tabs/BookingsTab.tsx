import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Booking } from '../../../types';
import {
  Calendar,
  Search,
  MessageCircle,
  Clock,
  Check,
  X,
  FileText,
  User,
  Plus,
  Download,
  Edit3,
  Trash2,
  Phone,
  Sparkles,
  AlertTriangle,
  FolderSync,
} from 'lucide-react';

export const BookingsTab: React.FC = () => {
  const {
    bookings,
    updateBooking,
    deleteBooking,
    addManualBooking,
    updateBookingStatus,
    exportToCsv,
    cms,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<Booking | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Quick inline notes state
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');

  // New manual booking form state
  const [newBooking, setNewBooking] = useState({
    clientName: '',
    phone: '',
    consultationType: 'skincare' as Booking['consultationType'],
    preferredDate: new Date().toISOString().slice(0, 10),
    preferredTime: '16:00',
    notes: '',
    adminNotes: '',
    status: 'pending' as Booking['status'],
  });

  const filtered = bookings.filter(
    (b) =>
      b.clientName.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search) ||
      b.consultationType.toLowerCase().includes(search.toLowerCase()) ||
      (b.adminNotes && b.adminNotes.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  const handleSaveInlineNotes = (id: string) => {
    updateBooking(id, { adminNotes: notesInput });
    setEditingNotesId(null);
  };

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.clientName.trim() || !newBooking.phone.trim()) return;

    await addManualBooking(newBooking);
    setIsAddModalOpen(false);
    setNewBooking({
      clientName: '',
      phone: '',
      consultationType: 'skincare',
      preferredDate: new Date().toISOString().slice(0, 10),
      preferredTime: '16:00',
      notes: '',
      adminNotes: '',
      status: 'pending',
    });
  };

  const handleUpdateBookingFull = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForEdit) return;

    await updateBooking(selectedBookingForEdit.id, selectedBookingForEdit);
    setSelectedBookingForEdit(null);
  };

  const handleDeleteBooking = async (id: string) => {
    await deleteBooking(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#2D2A26] dark:text-white font-serif-luxury flex items-center gap-2">
            <span>إدارة حجوزات واستشارات الـ VIP</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-sans font-bold flex items-center gap-1">
              <FolderSync className="w-3 h-3" />
              <span>مخزنة في ملفات الموقع والسحاب</span>
            </span>
          </h3>
          <p className="text-xs text-gray-500">
            متابعة مواعيد العميلات، التعديل الشامل لكافة المعلومات، تأكيد الجلسات عبر واتساب، وتصدير السجلات
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => exportToCsv('bookings')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 text-[#8C7A6B] dark:text-[#E2D8CE] flex items-center gap-1.5 transition-all"
            title="تنزيل ملف Excel / CSV"
          >
            <Download className="w-4 h-4 text-[#D4AF37]" />
            <span>تصدير Excel (CSV)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white rose-gold-gradient shadow-md flex items-center gap-1.5 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ تسجيل حجز يدوي</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl glass-luxury border border-[#D4AF37]/30">
          <span className="text-[11px] text-gray-500 block">إجمالي الحجوزات</span>
          <span className="text-xl font-black text-[#2D2A26] dark:text-white mt-1 block">
            {stats.total}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl glass-luxury border border-amber-500/30">
          <span className="text-[11px] text-amber-600 dark:text-amber-400 block">بانتظار التأكيد ⏳</span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
            {stats.pending}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl glass-luxury border border-emerald-500/30">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block">مؤكدة رسمياً ✅</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {stats.confirmed}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl glass-luxury border border-[#C94C71]/30">
          <span className="text-[11px] text-[#C94C71] block">جلسات مكتملة 🌟</span>
          <span className="text-xl font-black text-[#C94C71] mt-1 block">
            {stats.completed}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث باسم العميلة، رقم الهاتف، نوع الاستشارة، أو الملاحظات..."
          className="w-full ps-9 pe-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white focus:outline-none focus:border-[#C94C71]"
        />
      </div>

      {/* Bookings Table */}
      <div className="glass-luxury rounded-2xl border border-[#D4AF37]/30 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#FAF5EE] dark:bg-white/5 border-b border-[#D4AF37]/20 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="p-3 text-start">العميلة</th>
                <th className="p-3 text-start">الهاتف والواتساب</th>
                <th className="p-3 text-start">نوع الاستشارة</th>
                <th className="p-3 text-start">الموعد والتوقيت</th>
                <th className="p-3 text-start">حالة الحجز</th>
                <th className="p-3 text-start">ملاحظات ومتابعة الإدارة</th>
                <th className="p-3 text-start">التخزين</th>
                <th className="p-3 text-center">إجراءات وتحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 text-xs">
                    لا توجد حجوزات تطابق البحث حالياً.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <span className="font-bold text-[#2D2A26] dark:text-white block">
                        {b.clientName}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono block">
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString('ar-EG') : 'حجز مسجل'}
                      </span>
                    </td>
                    <td className="p-3 font-mono" dir="ltr">
                      <a
                        href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{b.phone}</span>
                      </a>
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">
                      <span className="font-semibold text-[#C94C71] block">
                        {b.consultationType}
                      </span>
                      {b.notes && (
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 italic bg-black/5 dark:bg-white/5 p-1 rounded">
                          "{b.notes}"
                        </p>
                      )}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300 font-semibold">
                      <div>{b.preferredDate}</div>
                      <div className="text-[11px] text-[#D4AF37] font-mono">{b.preferredTime}</div>
                    </td>
                    <td className="p-3">
                      <select
                        value={b.status}
                        onChange={(e) =>
                          updateBookingStatus(b.id, e.target.value as Booking['status'])
                        }
                        className={`px-2 py-1 rounded-lg border text-[11px] font-bold focus:outline-none ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                            : b.status === 'completed'
                            ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300'
                            : b.status === 'cancelled'
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300'
                        }`}
                      >
                        <option value="pending">معلق ⏳</option>
                        <option value="confirmed">مؤكد رسمياً ✅</option>
                        <option value="completed">تمت الجلسة 🌟</option>
                        <option value="cancelled">ملغي ❌</option>
                      </select>
                    </td>
                    <td className="p-3">
                      {editingNotesId === b.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={notesInput}
                            onChange={(e) => setNotesInput(e.target.value)}
                            placeholder="ملاحظات المتابعة..."
                            className="px-2 py-1 text-xs border rounded bg-white dark:bg-[#120E11] w-36"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveInlineNotes(b.id)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="حفظ"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                            title="إلغاء"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNotesId(b.id);
                            setNotesInput(b.adminNotes || '');
                          }}
                          className="cursor-pointer hover:underline text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2"
                          title="انقري لكتابة ملاحظة سريعة"
                        >
                          {b.adminNotes ? (
                            <span>{b.adminNotes}</span>
                          ) : (
                            <span className="text-gray-400 italic">+ تدوين ملاحظة...</span>
                          )}
                        </div>
                      )}
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
                          onClick={() => setSelectedBookingForEdit({ ...b })}
                          className="px-2 py-1 rounded-lg bg-[#C94C71]/10 text-[#C94C71] hover:bg-[#C94C71] hover:text-white transition-all text-[11px] font-bold flex items-center gap-1"
                          title="تعديل شامل لكافة بيانات الحجز"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>تعديل شامل</span>
                        </button>

                        {/* WhatsApp Message */}
                        <a
                          href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `مرحباً ${b.clientName}، نؤكد معكِ موعد جلستكِ الاستشارية VIP مع مدام فاطمة بخصوص (${b.consultationType}) بتاريخ ${b.preferredDate} الساعة ${b.preferredTime}. هل الوقت مناسب؟`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          title="إرسال تأكيد عبر واتساب"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        {/* Delete Booking */}
                        {deleteConfirmId === b.id ? (
                          <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 p-1 rounded-lg">
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded"
                            >
                              تأكيد
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="p-0.5 text-gray-500 hover:text-gray-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(b.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            title="حذف الحجز نهائياً"
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

      {/* ========================================================================= */}
      {/* COMPREHENSIVE EDIT MODAL (تعديل شامل لكافة معلومات الحجز) */}
      {/* ========================================================================= */}
      {selectedBookingForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-luxury rounded-3xl border border-[#D4AF37]/40 max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full rose-gold-gradient text-white flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#2D2A26] dark:text-white font-serif-luxury">
                    تعديل شامل لبيانات الحجز والاستشارة
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    معرف الحجز: <span className="font-mono text-[#C94C71]">{selectedBookingForEdit.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBookingForEdit(null)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBookingFull} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    اسم العميلة الكريم:
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedBookingForEdit.clientName}
                    onChange={(e) =>
                      setSelectedBookingForEdit({ ...selectedBookingForEdit, clientName: e.target.value })
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
                    value={selectedBookingForEdit.phone}
                    onChange={(e) =>
                      setSelectedBookingForEdit({ ...selectedBookingForEdit, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    نوع الاستشارة:
                  </label>
                  <input
                    type="text"
                    value={selectedBookingForEdit.consultationType}
                    onChange={(e) =>
                      setSelectedBookingForEdit({
                        ...selectedBookingForEdit,
                        consultationType: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    حالة الحجز:
                  </label>
                  <select
                    value={selectedBookingForEdit.status}
                    onChange={(e) =>
                      setSelectedBookingForEdit({
                        ...selectedBookingForEdit,
                        status: e.target.value as Booking['status'],
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white font-bold"
                  >
                    <option value="pending">معلق ⏳</option>
                    <option value="confirmed">مؤكد رسمياً ✅</option>
                    <option value="completed">تمت الجلسة 🌟</option>
                    <option value="cancelled">ملغي ❌</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    التاريخ المفضل:
                  </label>
                  <input
                    type="date"
                    value={selectedBookingForEdit.preferredDate}
                    onChange={(e) =>
                      setSelectedBookingForEdit({ ...selectedBookingForEdit, preferredDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    التوقيت المفضل:
                  </label>
                  <input
                    type="text"
                    value={selectedBookingForEdit.preferredTime}
                    onChange={(e) =>
                      setSelectedBookingForEdit({ ...selectedBookingForEdit, preferredTime: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  ملاحظات العميلة الأصلية:
                </label>
                <textarea
                  rows={2}
                  value={selectedBookingForEdit.notes || ''}
                  onChange={(e) =>
                    setSelectedBookingForEdit({ ...selectedBookingForEdit, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  ملاحظات ومتابعة الإدارة (خاصة بالمشرفين):
                </label>
                <textarea
                  rows={2}
                  value={selectedBookingForEdit.adminNotes || ''}
                  onChange={(e) =>
                    setSelectedBookingForEdit({ ...selectedBookingForEdit, adminNotes: e.target.value })
                  }
                  placeholder="مثال: تم إرسال رابط المقابلة، بانتظار اتصال يوم السبت..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteBooking(selectedBookingForEdit.id);
                    setSelectedBookingForEdit(null);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الحجز</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingForEdit(null)}
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
      {/* ADD MANUAL BOOKING MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-luxury rounded-3xl border border-[#D4AF37]/40 max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full rose-gold-gradient text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#2D2A26] dark:text-white font-serif-luxury">
                    تسجيل حجز واستشارة VIP جديدة يدوياً
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    لحفظ المواعيد القادمة عبر الهاتف أو وسائل التواصل مباشرة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    اسم العميلة:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: نورة المحمد"
                    value={newBooking.clientName}
                    onChange={(e) => setNewBooking({ ...newBooking, clientName: e.target.value })}
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
                    value={newBooking.phone}
                    onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    نوع الاستشارة:
                  </label>
                  <input
                    type="text"
                    value={newBooking.consultationType}
                    onChange={(e) => setNewBooking({ ...newBooking, consultationType: e.target.value as any })}
                    placeholder="تحليل البشرة، فرصة العمل..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    حالة الحجز:
                  </label>
                  <select
                    value={newBooking.status}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, status: e.target.value as Booking['status'] })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white font-bold"
                  >
                    <option value="pending">معلق ⏳</option>
                    <option value="confirmed">مؤكد رسمياً ✅</option>
                    <option value="completed">تمت الجلسة 🌟</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    التاريخ المفضل:
                  </label>
                  <input
                    type="date"
                    value={newBooking.preferredDate}
                    onChange={(e) => setNewBooking({ ...newBooking, preferredDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    التوقيت المفضل:
                  </label>
                  <input
                    type="text"
                    value={newBooking.preferredTime}
                    onChange={(e) => setNewBooking({ ...newBooking, preferredTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  ملاحظات إضافية:
                </label>
                <textarea
                  rows={2}
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  placeholder="أي تفاصيل أو رغبات خاصة بالعميلة..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-black/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white rose-gold-gradient shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>تأكيد وتسجيل الحجز</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
