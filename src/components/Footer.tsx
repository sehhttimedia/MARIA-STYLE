import React from 'react';
import { useApp } from '../context/AppContext';
import { normalizeDriveUrl, handleImageError } from '../utils/drive';
import { Shield, Sparkles, MessageCircle, Phone, Mail, Instagram, Send, Facebook, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  const { cms, t, setIsAdminModalOpen, language } = useApp();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#141012] text-[#D8CDC2] pt-16 pb-12 border-t border-[#D4AF37]/25 overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
      <div className="absolute -top-32 start-1/2 -translate-x-1/2 w-96 h-96 bg-[#C94C71]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12 text-start">
          {/* Col 1: Brand & Bio (Col 1-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={normalizeDriveUrl(cms.logoUrl, 'logo')}
                alt="Maria Style Logo"
                onError={(e) => handleImageError(e, 'logo')}
                className="h-14 w-auto object-contain"
              />
              <div>
                <span className="block text-xl font-bold font-serif-luxury text-white tracking-wide">
                  MARIA STYLE
                </span>
                <span className="block text-xs font-semibold text-[#D4AF37] tracking-wider uppercase">
                  Alialyna &amp; HomeLife Official Partner
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#A8988B] leading-relaxed">
              {cms.brandTagline || t.footerAbout}
            </p>

            {/* Social Media Links (CMS controlled) */}
            <div className="pt-2 flex items-center gap-3">
              {cms.socialLinks.instagram && (
                <a
                  href={cms.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#F4E8C1] hover:text-[#C94C71] hover:border-[#C94C71] hover:scale-110 transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {cms.socialLinks.facebook && (
                <a
                  href={cms.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#F4E8C1] hover:text-[#C94C71] hover:border-[#C94C71] hover:scale-110 transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {cms.socialLinks.telegram && (
                <a
                  href={cms.socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#F4E8C1] hover:text-[#C94C71] hover:border-[#C94C71] hover:scale-110 transition-all"
                  aria-label="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
              )}
              {cms.socialLinks.youtube && (
                <a
                  href={cms.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#F4E8C1] hover:text-[#C94C71] hover:border-[#C94C71] hover:scale-110 transition-all"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {cms.socialLinks.tiktok && (
                <a
                  href={cms.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#F4E8C1] hover:text-[#C94C71] hover:border-[#C94C71] hover:scale-110 transition-all text-xs font-bold"
                  aria-label="TikTok"
                >
                  TT
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Navigation Links (Col 6-8) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white font-serif-luxury tracking-wide border-b border-[#D4AF37]/20 pb-2">
              {t.footerQuickLinks}
            </h4>
            <ul className="space-y-2 text-xs text-[#A8988B]">
              <li>
                <button onClick={() => scrollTo('home')} className="hover:text-[#D4AF37] transition-colors">
                  {t.navHome}
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('story')} className="hover:text-[#D4AF37] transition-colors">
                  {t.navAbout}
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('store')} className="hover:text-[#D4AF37] transition-colors">
                  {t.navStore}
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('roadmap')} className="hover:text-[#D4AF37] transition-colors">
                  {t.navRoadmap}
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('join-team')} className="hover:text-[#D4AF37] transition-colors">
                  {t.navJoinTeam}
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('booking')} className="hover:text-[#D4AF37] transition-colors">
                  {t.navBooking}
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('awards')} className="hover:text-[#D4AF37] transition-colors">
                  {t.navAwards}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Contact (Col 9-12) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-white font-serif-luxury tracking-wide border-b border-[#D4AF37]/20 pb-2">
              {t.footerContact}
            </h4>
            <div className="space-y-2.5 text-xs text-[#A8988B]">
              <a
                href={`https://wa.me/${cms.officialWhatsApp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#25D366] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span dir="ltr">{cms.officialWhatsApp} (واتساب المعتمد)</span>
              </a>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span dir="ltr">{cms.officialPhone}</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C94C71]" />
                <span>{cms.emailContact}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Rights & Security Note */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C7A6B]">
          <p
            onClick={() => {
              // Discreet admin trigger: triple-click detection without any visual cues
              const now = Date.now();
              const lastClicks = JSON.parse(sessionStorage.getItem('__ms_adm_clicks') || '[]');
              const recent = [...lastClicks.filter((t: number) => now - t < 1200), now];
              sessionStorage.setItem('__ms_adm_clicks', JSON.stringify(recent));
              if (recent.length >= 3) {
                sessionStorage.removeItem('__ms_adm_clicks');
                setIsAdminModalOpen(true);
              }
            }}
            className="cursor-default select-none"
            title=""
          >
            {t.footerRights}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-[#A8988B]">
            <Shield className="w-3.5 h-3.5 text-[#25D366]" />
            <span>{t.antiSpamNotice}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
