import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Booking } from '../../../types';
import { Calendar, Search, MessageCircle, Clock, Check, X, FileText, User } from 'lucide-react';

export const BookingsTab: React.FC = () => {
  const { bookings, updateBookingStatus, cms } = useApp();
  const [search, setSearch] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');

  const filtered = bookings.filter(
    (b) =>
      b.clientName.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search) ||
      b.consultationType.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveNotes = (id: string) => {
    updateBookingStatus(id, bookings.find((b) => b.id === id)?.status || 'pending', notesInput);
    setEditingNotesId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#2D2A26] dark:text-white font-serif-luxury">
            إدارة حجوزات واستشارات الـ VIP (مرتبطة بالشيت 2 Bookings)
          </h3>
          <p className="text-xs text-gray-500">
            متابعة مواعيد العميلات، تأكيد الجلسات عبر الواتساب، وتدوين ملاحظات المستشار
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف..."
            className="w-full ps-9 pe-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white focus:outline-none"
          />
        </div>
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
                <th className="p-3 text-start">ملاحظات الإدارة</th>
                <th className="p-3 text-start">المزامنة</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-3 font-bold text-[#2D2A26] dark:text-white">
                    {b.clientName}
                  </td>
                  <td className="p-3 font-mono" dir="ltr">
                    {b.phone}
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-[#C94C71]">{b.consultationType}</span>
                    {b.notes && (
                      <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 italic">
                        "{b.notes}"
                      </p>
                    )}
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-300 font-semibold">
                    <div>{b.preferredDate}</div>
                    <div className="text-[11px] text-[#D4AF37]">{b.preferredTime}</div>
                  </td>
                  <td className="p-3">
                    <select
                      value={b.status}
                      onChange={(e) =>
                        updateBookingStatus(b.id, e.target.value as Booking['status'])
                      }
                      className="px-2 py-1 rounded-lg border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11] text-[11px] font-bold"
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
                          className="px-2 py-1 text-xs border rounded bg-white dark:bg-[#120E11]"
                        />
                        <button
                          onClick={() => handleSaveNotes(b.id)}
                          className="p-1 text-green-600"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setEditingNotesId(b.id);
                          setNotesInput(b.adminNotes || '');
                        }}
                        className="cursor-pointer hover:underline text-[11px] text-gray-500 line-clamp-2"
                        title="انقري للتعديل"
                      >
                        {b.adminNotes || '+ إضافة ملاحظة...'}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.synced
                          ? 'bg-[#25D366]/20 text-[#25D366]'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {b.synced ? 'محدث في الشيت 2' : 'محفوظ محلياً'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <a
                      href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `مرحباً ${b.clientName}، نؤكد معكِ موعد جلستكِ الاستشارية VIP مع مدام فاطمة بخصوص (${b.consultationType}) بتاريخ ${b.preferredDate} الساعة ${b.preferredTime}. هل الوقت مناسب؟`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex p-1.5 rounded-lg text-[#25D366] hover:bg-[#25D366]/10"
                      title="إرسال تأكيد عبر واتساب"
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
    </div>
  );
};
