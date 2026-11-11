import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Product } from '../../../types';
import { normalizeDriveUrl, handleImageError } from '../../../utils/drive';
import { GoogleMediaPickerModal } from '../GoogleMediaPickerModal';
import { Plus, Edit2, Trash2, X, Check, Search, Image as ImageIcon, Sparkles, FolderPlus, DollarSign, Eye, EyeOff } from 'lucide-react';

export const ProductsTab: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, cms, updateCMS } = useApp();
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'main' | 'gallery'>('main');

  // Form State
  const [form, setForm] = useState<Omit<Product, 'id'>>({
    name: '',
    nameTr: '',
    nameEn: '',
    price: 300,
    costPrice: 150,
    currency: 'TL',
    category: 'skincare',
    categoryLabel: 'العناية بالبشرة',
    rating: 5.0,
    reviewsCount: 1,
    description: '',
    ingredients: '',
    howToUse: '',
    image: '',
    galleryImages: [],
    badge: '',
    inStock: true,
    featured: false,
    companyOrigin: 'Alialyna',
    hidePrice: false,
  });

  const [galleryInput, setGalleryInput] = useState('');

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      nameTr: '',
      nameEn: '',
      price: 350,
      costPrice: 160,
      currency: 'TL',
      category: 'skincare',
      categoryLabel: 'العناية بالبشرة',
      rating: 5.0,
      reviewsCount: 1,
      description: '',
      ingredients: '',
      howToUse: '',
      image: '',
      galleryImages: [],
      badge: 'جديد ✨',
      inStock: true,
      featured: false,
      companyOrigin: 'Alialyna',
      hidePrice: false,
    });
    setGalleryInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({ ...p, hidePrice: !!p.hidePrice });
    setGalleryInput(p.galleryImages ? p.galleryImages.join('\n') : '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedImage = normalizeDriveUrl(form.image, 'product');
    const parsedGallery = galleryInput
      .split('\n')
      .map((s) => normalizeDriveUrl(s.trim(), 'product'))
      .filter(Boolean);

    const payload = {
      ...form,
      image: normalizedImage,
      galleryImages: parsedGallery.length > 0 ? parsedGallery : [normalizedImage],
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }
    setIsModalOpen(false);
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(search.toLowerCase()) ||
      p.companyOrigin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#2D2A26] dark:text-white font-serif-luxury">
            إدارة متجر المنتجات والكوزمتك
          </h3>
          <p className="text-xs text-gray-500">
            تحكم كامل في الأسعار، التكاليف، الصور عبر Google Drive، وحساب الأرباح
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في المنتجات..."
              className="w-full ps-9 pe-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11] text-[#2D2A26] dark:text-white focus:outline-none"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white rose-gold-gradient shadow-md flex items-center gap-1.5 shrink-0 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </button>
        </div>
      </div>

      {/* Global Price Visibility Banner & Control (Requested: إضافة السعر أو إلغاؤه) */}
      <div className="p-4 rounded-2xl glass-luxury border border-[#D4AF37]/35 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C94C71]/15 text-[#C94C71] flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-start">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-[#2D2A26] dark:text-white">
                التحكم في عرض أسعار المنتجات في متجر الزوار (إظهار السعر أو إلغاؤه)
              </h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                cms.showProductPrices ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              }`}>
                {cms.showProductPrices ? 'الأسعار ظاهرة بالمتجر' : 'الأسعار ملغاة/مخفية (تواصل وعروض)'}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-[#A8988B] mt-1 leading-relaxed">
              {cms.showProductPrices
                ? 'الأسعار معروضة للزوار في صفحة المتجر. يمكنكِ إلغاء/إخفاء الأسعار بضغطة زر واحدة لتحفيز الزائرات على التواصل لطلب عروض وخصومات العضوات الملكية.'
                : 'الأسعار ملغاة/مخفية حالياً في صفحة الزوار ويظهر بدلاً منها عبارة محفزة لطلب استشارة والعروض الحصرية مباشرة عبر واتساب.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => updateCMS({ showProductPrices: !cms.showProductPrices })}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-sm ${
            cms.showProductPrices
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
          }`}
        >
          {cms.showProductPrices ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span>إلغاء / إخفاء الأسعار من المتجر</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>تفعيل وإظهار الأسعار للزوار</span>
            </>
          )}
        </button>
      </div>

      {/* Products Table */}
      <div className="glass-luxury rounded-2xl border border-[#D4AF37]/30 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#FAF5EE] dark:bg-white/5 border-b border-[#D4AF37]/20 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="p-3 text-start">المنتج</th>
                <th className="p-3 text-start">الشركة</th>
                <th className="p-3 text-start">التصنيف</th>
                <th className="p-3 text-start">سعر البيع</th>
                <th className="p-3 text-start">التكلفة</th>
                <th className="p-3 text-start">هامش الربح</th>
                <th className="p-3 text-start">الحالة</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((p) => {
                const profit = p.price - p.costPrice;
                const margin = Math.round((profit / p.price) * 100);
                const img = normalizeDriveUrl(p.image, 'product');

                return (
                  <tr key={p.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={img}
                          alt={p.name}
                          onError={(e) => handleImageError(e, 'product')}
                          className="w-10 h-10 rounded-lg object-cover border border-[#D4AF37]/30 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-[#2D2A26] dark:text-white block line-clamp-1">
                            {p.name}
                          </span>
                          {p.badge && (
                            <span className="text-[10px] text-[#C94C71] font-semibold">{p.badge}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C94C71]/15 text-[#C94C71]">
                        {p.companyOrigin}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-[#2D2A26] dark:text-white">
                        {p.price} {p.currency}
                      </div>
                      <span className={`text-[10px] font-semibold block ${
                        cms.showProductPrices && !p.hidePrice
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {cms.showProductPrices && !p.hidePrice ? '● معروض بالمتجر' : '○ السعر ملغى بالمتجر'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">
                      {p.costPrice} {p.currency}
                    </td>
                    <td className="p-3">
                      <span className="text-[#25D366] font-bold">
                        +{profit} TL ({margin}%)
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.inStock
                            ? 'bg-[#25D366]/15 text-[#25D366]'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {p.inStock ? 'متوفر' : 'نفد'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/15 dark:text-[#E5C358]"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنتِ متأكدة من حذف "${p.name}"؟`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#161114] rounded-3xl shadow-2xl border border-[#D4AF37]/40 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-[#D4AF37]/20 flex items-center justify-between">
              <h4 className="text-base font-bold text-[#2D2A26] dark:text-white font-serif-luxury">
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمتجر'}
              </h4>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-start text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">اسم المنتج (بالعربية) *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">الشركة المصدرة *</label>
                  <select
                    value={form.companyOrigin}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        companyOrigin: e.target.value as Product['companyOrigin'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  >
                    <option value="Alialyna">Alialyna (جمال وعطور)</option>
                    <option value="HomeLife">HomeLife (صحة ومنزل)</option>
                    <option value="MariaStyle">Maria Style (خاص)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">سعر البيع للجمهور (TL) *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">تكلفة المنتج لحساب الأرباح (TL) *</label>
                  <input
                    type="number"
                    required
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">التصنيف *</label>
                  <select
                    value={form.category}
                    onChange={(e) => {
                      const cat = e.target.value as Product['category'];
                      const labels: Record<string, string> = {
                        skincare: 'العناية بالبشرة',
                        haircare: 'العناية بالشعر',
                        fragrance: 'العطور الملكية',
                        makeup: 'المكياج',
                        wellness: 'الصحة والرشاقة',
                        bundles: 'الباقات الاقتصادية',
                      };
                      setForm({ ...form, category: cat, categoryLabel: labels[cat] || cat });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  >
                    <option value="skincare">العناية بالبشرة</option>
                    <option value="haircare">العناية بالشعر</option>
                    <option value="fragrance">العطور الملكية</option>
                    <option value="wellness">الصحة والرشاقة</option>
                    <option value="bundles">الباقات الاقتصادية</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">شارة مميزة (Badge)</label>
                  <input
                    type="text"
                    placeholder="مثال: الأكثر مبيعاً ⭐"
                    value={form.badge || ''}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold">
                    رابط الصورة الرئيسية (Google Drive URL أو رابط مباشر)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPickerTarget('main');
                      setIsPickerOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#4285F4] to-[#2B6CB0] text-white text-[11px] font-bold shadow-sm hover:scale-[1.02] transition-all flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>اختيار من وسائط Google / Gmail</span>
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="https://drive.google.com/file/d/... أو اختاري من وسائط Google"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  />
                  {form.image && (
                    <img
                      src={normalizeDriveUrl(form.image, 'product')}
                      alt="Preview"
                      onError={(e) => handleImageError(e, 'product')}
                      className="w-9 h-9 rounded-lg object-cover border border-[#D4AF37] shrink-0"
                    />
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold">
                    روابط صور إضافية للمعرض (كل رابط في سطر - Google Drive URLs)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPickerTarget('gallery');
                      setIsPickerOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#C94C71] to-[#D4AF37] text-white text-[11px] font-bold shadow-sm hover:scale-[1.02] transition-all flex items-center gap-1.5"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>تحديد صور وفيديوهات من وسائط Google</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="https://drive.google.com/file/d/IMAGE1...&#10;https://drive.google.com/file/d/IMAGE2..."
                  value={galleryInput}
                  onChange={(e) => setGalleryInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">الوصف التفصيلي التسويقي</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">المكونات الفعالة</label>
                  <input
                    type="text"
                    value={form.ingredients}
                    onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">طريقة الاستخدام</label>
                  <input
                    type="text"
                    value={form.howToUse}
                    onChange={(e) => setForm({ ...form, howToUse: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#D4AF37]/25 bg-white dark:bg-[#120E11]"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                    className="rounded text-[#C94C71]"
                  />
                  <span>متوفر في المخزون للطلب الفوري</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="rounded text-[#C94C71]"
                  />
                  <span>مميز في الصفحة الرئيسية</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.hidePrice}
                    onChange={(e) => setForm({ ...form, hidePrice: e.target.checked })}
                    className="rounded text-[#C94C71]"
                  />
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    إلغاء/إخفاء السعر لهذا المنتج بالمتجر (تشجيع الاستشارة)
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#D4AF37]/20 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-white font-bold rose-gold-gradient shadow-md"
                >
                  حفظ المنتج وتحديث المتجر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Google Drive Media Picker Modal */}
      <GoogleMediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        allowMultiple={pickerTarget === 'gallery'}
        mediaType="all"
        title={pickerTarget === 'main' ? 'اختيار الصورة الرئيسية للمنتج من وسائط Google' : 'اختيار صور وفيديوهات المعرض من وسائط Google'}
        onSelect={(streamUrl) => {
          if (pickerTarget === 'main') {
            setForm((prev) => ({ ...prev, image: streamUrl }));
          } else {
            setGalleryInput((prev) => (prev ? `${prev}\n${streamUrl}` : streamUrl));
          }
        }}
        onSelectMultiple={(streamUrls) => {
          const joined = streamUrls.join('\n');
          setGalleryInput((prev) => (prev ? `${prev}\n${joined}` : joined));
        }}
      />
    </div>
  );
};
