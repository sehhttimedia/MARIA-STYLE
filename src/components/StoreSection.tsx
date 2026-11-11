import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { normalizeDriveUrl, handleImageError } from '../utils/drive';
import { ProductDetailModal } from './ProductDetailModal';
import { Sparkles, Search, Star, MessageCircle, Eye, ShoppingCart, Filter } from 'lucide-react';

export const StoreSection: React.FC = () => {
  const { products, t, cms, activeAttribution, createSale } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  const categories = [
    { id: 'all', label: t.categoryAll },
    { id: 'skincare', label: t.categorySkincare },
    { id: 'haircare', label: t.categoryHaircare },
    { id: 'fragrance', label: t.categoryFragrance },
    { id: 'wellness', label: t.categoryWellness },
    { id: 'bundles', label: t.categoryBundles },
  ];

  const companies = [
    { id: 'all', label: 'جميع الشركات' },
    { id: 'Alialyna', label: 'Alialyna (جمال وعطور)' },
    { id: 'HomeLife', label: 'HomeLife (صحة ومنزل)' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchComp = selectedCompany === 'all' || p.companyOrigin === selectedCompany;
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchComp && matchSearch;
    });
  }, [products, selectedCategory, selectedCompany, searchQuery]);

  const handleDirectWhatsAppOrder = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = cms.officialWhatsApp.replace(/[^0-9]/g, '');
    const message = `✨ استفسار وطلب منتج من متجر ماريا ستايل ✨\n\n- اسم المنتج: ${product.name}\n- الشركة التابعة: ${product.companyOrigin}\n- كود العضوة الراعية: ${activeAttribution || 'MS-FATIMA'}\n\nالسلام عليكم مدام فاطمة، أود الاستفسار عن تفاصيل هذا المنتج والعروض الحصرية المتاحة مع طريقة الشحن والطلب الفوري. شكراً لكِ!`;

    // Record sale attribution in background
    createSale({
      orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'عميلة واتساب مباشرة',
      customerPhone: 'عبر واتساب',
      items: [{ productId: product.id, productName: product.name, quantity: 1, price: product.price }],
      totalAmount: product.price,
      profitAmount: product.price - product.costPrice,
      memberCode: activeAttribution || 'MS-FATIMA',
      memberName: 'عضوة معتمدة',
      commissionRate: 20,
      commissionEarned: Math.round(product.price * 0.2),
      paymentStatus: 'pending',
      orderDate: new Date().toISOString(),
    });

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="store" className="py-16 sm:py-24 relative overflow-hidden bg-[#FAF7F2] dark:bg-[#0C0A0B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#D4AF37]/40 bg-white/70 dark:bg-[#161114] text-[#C94C71] dark:text-[#E55B82] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#E5C358]" />
            <span>{t.storeBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2D2A26] dark:text-[#FAF7F2] font-serif-luxury">
            {t.storeTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#7A6F65] dark:text-[#C5B7A9] mt-2">
            {t.storeSubtitle}
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-luxury rounded-2xl p-4 sm:p-5 border border-[#D4AF37]/30 shadow-md mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8C7E75]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحثي عن منتج، سيروم، عطر..."
              className="w-full ps-9 pe-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-[#D4AF37]/30 bg-white/70 dark:bg-[#161114] text-[#2D2A26] dark:text-[#FAF7F2] placeholder-gray-400 dark:placeholder-[#8C7E75] focus:outline-none focus:border-[#C94C71] dark:focus:border-[#D4AF37] shadow-inner"
            />
          </div>

          {/* Company Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCompany(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  selectedCompany === c.id
                    ? 'bg-[#C94C71] text-white shadow-sm'
                    : 'bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-black/5'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'border border-[#D4AF37] bg-gradient-to-r from-[#C94C71] to-[#D4AF37] text-white shadow-md'
                  : 'border border-[#D4AF37]/30 bg-white/60 dark:bg-white/5 text-[#5A524A] dark:text-[#C5B7A9] hover:border-[#C94C71]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 glass-luxury rounded-3xl border border-[#D4AF37]/20">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-[#2D2A26] dark:text-white">
              لم نعثر على منتجات تطابق هذا البحث
            </h4>
            <p className="text-xs text-gray-500 mt-1">جربي تغيير الكلمة المفتاحية أو التصنيف</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => {
              const displayImage = normalizeDriveUrl(product.image, 'product');

              return (
                <div
                  key={product.id}
                  onClick={() => setModalProduct(product)}
                  className="group relative rounded-3xl overflow-hidden glass-luxury border border-[#D4AF37]/30 shadow-md hover:shadow-2xl hover:border-[#C94C71] transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  {/* Top Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#FAF7F2] dark:bg-[#120E10]">
                    <img
                      src={displayImage}
                      alt={product.name}
                      loading="lazy"
                      onError={(e) => handleImageError(e, 'product')}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />

                    {/* Badge */}
                    {product.badge && (
                      <span className="absolute top-3 end-3 px-3 py-1 rounded-full text-xs font-bold bg-[#C94C71] dark:bg-[#E55B82] text-white shadow-md">
                        {product.badge}
                      </span>
                    )}

                    {/* Company Origin Pill */}
                    <span className="absolute top-3 start-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-[#F4E8C1] border border-white/20">
                      {product.companyOrigin}
                    </span>

                    {/* Hover Quick Action */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-[#161114] text-[#2D2A26] dark:text-[#FAF7F2] shadow-xl flex items-center gap-1.5 border border-transparent dark:border-[#D4AF37]/40">
                        <Eye className="w-3.5 h-3.5 text-[#C94C71] dark:text-[#E55B82]" />
                        <span>{t.btnQuickView}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between text-start">
                    <div>
                      {/* Rating & Category */}
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[#8C7A6B] dark:text-[#C5B7A9] font-medium">
                          {product.categoryLabel}
                        </span>
                        <div className="flex items-center text-[#D4AF37]">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold ms-1 text-[#2D2A26] dark:text-[#FAF7F2]">
                            {product.rating}
                          </span>
                        </div>
                      </div>

                      {/* Product Name */}
                      <h3 className="text-base font-bold text-[#2D2A26] dark:text-[#FAF7F2] line-clamp-1 group-hover:text-[#C94C71] dark:group-hover:text-[#E55B82] transition-colors mb-2">
                        {product.name}
                      </h3>

                      {/* Description excerpt */}
                      <p className="text-xs text-[#6B6158] dark:text-[#C5B7A9] line-clamp-2 leading-relaxed mb-4">
                        {product.description}
                      </p>
                    </div>

                    {/* Dynamic Pricing / Motivating Offer Action (Controlled via Admin) */}
                    <div className="pt-3.5 border-t border-[#D4AF37]/20 flex items-center justify-between gap-2">
                      {cms.showProductPrices && !product.hidePrice ? (
                        <div className="flex flex-col text-start">
                          <span className="text-[10px] text-[#8C7A6B] dark:text-[#A8988B] font-medium line-through">
                            {Math.round(product.price * 1.25)} {product.currency}
                          </span>
                          <span className="text-sm font-extrabold text-[#C94C71] dark:text-[#E55B82] flex items-center gap-1">
                            <span>{product.price} {product.currency}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#C94C71]/15 text-[#C94C71] font-bold">سعر العضوات</span>
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col text-start">
                          <span className="text-[10px] text-[#D4AF37] font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                            <span>عروض وهدايا حصرية</span>
                          </span>
                          <span className="text-xs font-bold text-[#C94C71] dark:text-[#E55B82]">
                            تواصلي لطلب المنتج الآن
                          </span>
                        </div>
                      )}

                      <button
                        onClick={(e) => handleDirectWhatsAppOrder(product, e)}
                        className="px-3.5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 shadow-md flex items-center gap-1.5 transition-all hover:scale-105 shrink-0"
                        title="تواصلي مباشرة مع مدام فاطمة للطلب الفوري والاستفسار عن العروض"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>طلب عبر واتساب</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal product={modalProduct} onClose={() => setModalProduct(null)} />
    </section>
  );
};
