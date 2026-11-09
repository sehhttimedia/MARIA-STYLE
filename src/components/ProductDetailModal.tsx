import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { normalizeDriveUrl, handleImageError } from '../utils/drive';
import { X, Star, ShoppingBag, ShieldCheck, Truck, Sparkles, Check } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { cms, activeAttribution, createSale } = useApp();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [orderedSuccess, setOrderedSuccess] = useState(false);

  if (!product) return null;

  const images = product.galleryImages && product.galleryImages.length > 0
    ? product.galleryImages
    : [product.image];

  const currentImageUrl = normalizeDriveUrl(images[selectedImageIdx] || product.image, 'product');

  const handleOrderWhatsApp = () => {
    const cleanPhone = cms.officialWhatsApp.replace(/[^0-9]/g, '');
    const totalPrice = product.price * quantity;
    const message = `✨ طلب واستفسار عن منتج من منصة ماريا ستايل ✨\n\n- اسم المنتج: ${product.name}\n- الشركة التابعة: ${product.companyOrigin}\n- الكمية المطلوبة: ${quantity}\n- كود العضوة الراعية: ${activeAttribution || 'MS-FATIMA'}\n\nالسلام عليكم مدام فاطمة، أود تأكيد طلبي والحصول على تفاصيل السعر المخفض والعروض المتاحة مع الشحن والتوصيل. شكراً لكِ!`;
    
    // Automatically record sale attribution in background
    createSale({
      orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'عميلة واتساب جديدة',
      customerPhone: 'عبر تطبيق الواتساب',
      items: [{ productId: product.id, productName: product.name, quantity, price: product.price }],
      totalAmount: totalPrice,
      profitAmount: (product.price - product.costPrice) * quantity,
      memberCode: activeAttribution || 'MS-FATIMA',
      memberName: 'عضوة معتمدة',
      commissionRate: 20,
      commissionEarned: Math.round(totalPrice * 0.2),
      paymentStatus: 'pending',
      orderDate: new Date().toISOString(),
    });

    setOrderedSuccess(true);
    setTimeout(() => {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#161114] rounded-3xl shadow-2xl border border-[#D4AF37]/35 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#D4AF37]/20 flex items-center justify-between bg-white dark:bg-[#161114]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C94C71]/15 text-[#C94C71]">
              {product.companyOrigin}
            </span>
            <span className="text-xs text-[#7A6F65] dark:text-[#A8988B] font-medium">
              {product.categoryLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-black/5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Gallery Section */}
            <div className="flex flex-col gap-3">
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-[#D4AF37]/30 bg-[#FAF7F2] dark:bg-[#151214] flex items-center justify-center">
                <img
                  src={currentImageUrl}
                  alt={product.name}
                  onError={(e) => handleImageError(e, 'product')}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                {product.badge && (
                  <span className="absolute top-3 end-3 px-2.5 py-1 rounded-full text-xs font-bold bg-[#C94C71] text-white shadow-md">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Thumbnails if multiple images */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImageIdx === idx ? 'border-[#C94C71] scale-105 shadow-sm' : 'border-gray-200 dark:border-gray-700 opacity-70'
                      }`}
                    >
                      <img
                        src={normalizeDriveUrl(img, 'product')}
                        alt=""
                        onError={(e) => handleImageError(e, 'product')}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col text-start">
              <h3 className="text-xl font-bold font-serif-luxury text-[#2D2A26] dark:text-white mb-2">
                {product.name}
              </h3>

              {/* Ratings */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-[#D4AF37]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold ms-1 text-[#2D2A26] dark:text-white">
                    {product.rating}
                  </span>
                </div>
                <span className="text-xs text-[#7A6F65] dark:text-[#A8988B]">
                  ({product.reviewsCount} تقييم حقيقي)
                </span>
              </div>

              {/* Special Offer & Motivating Call to Action (Price removed for exclusive consultation) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#C94C71]/10 via-[#D4AF37]/15 to-[#25D366]/10 border border-[#D4AF37]/35 mb-4 text-start">
                <div className="flex items-center gap-1.5 mb-1 text-[#C94C71] dark:text-[#E55B82] font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>عروض حصرية وخاصة لعضوات وزوار ماريا ستايل</span>
                </div>
                <p className="text-xs text-[#2D2A26] dark:text-white font-medium leading-relaxed">
                  تواصلِ معنا مباشرة عبر الواتساب للحصول على سعر العضوات المخفض، خصومات الباقات الملكية، وهدايا الشحن والتوصيل الفوري!
                </p>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#4A453F] dark:text-[#D1C5B8] leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Active Ingredients & How to Use */}
              <div className="space-y-3 pt-3 border-t border-[#D4AF37]/20 text-xs">
                <div>
                  <strong className="block font-bold text-[#2D2A26] dark:text-white mb-1">
                    المكونات الفعالة:
                  </strong>
                  <p className="text-[#6B6158] dark:text-[#BFAF9F] leading-snug">
                    {product.ingredients}
                  </p>
                </div>
                <div>
                  <strong className="block font-bold text-[#2D2A26] dark:text-white mb-1">
                    طريقة الاستخدام:
                  </strong>
                  <p className="text-[#6B6158] dark:text-[#BFAF9F] leading-snug">
                    {product.howToUse}
                  </p>
                </div>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-3 mt-5 pt-3 border-t border-[#D4AF37]/20">
                <span className="text-xs font-bold text-[#2D2A26] dark:text-white">الكمية:</span>
                <div className="inline-flex items-center border border-[#D4AF37]/40 rounded-xl overflow-hidden bg-white dark:bg-[#140F12]">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-sm font-bold text-[#2D2A26] dark:text-[#FAF7F2] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-[#C94C71] dark:text-[#E55B82]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1 text-sm font-bold text-[#2D2A26] dark:text-[#FAF7F2] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Referral notice */}
              {activeAttribution && (
                <div className="mt-3 text-[11px] text-[#8C7A6B] dark:text-[#C5B7A9]">
                  سيتم تسجيل الطلب وحساب العمولة لصالح العضوة:{' '}
                  <span className="font-bold text-[#C94C71] dark:text-[#E55B82]">{activeAttribution}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Order Button */}
        <div className="p-4 sm:p-5 border-t border-[#D4AF37]/20 bg-[#FAF7F2] dark:bg-[#120E11] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-[#7A6F65] dark:text-[#A8988B]">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#25D366]" />
              <span>أصلي ومضمون 100%</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="w-4 h-4 text-[#D4AF37]" />
              <span>شحن سريع لجميع المدن</span>
            </div>
          </div>

          <button
            onClick={handleOrderWhatsApp}
            disabled={orderedSuccess}
            className="w-full sm:w-auto px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            {orderedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>تم تجهيز الطلب! جاري تحويلكِ للواتساب...</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>تأكيد الطلب الفوري عبر واتساب</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
