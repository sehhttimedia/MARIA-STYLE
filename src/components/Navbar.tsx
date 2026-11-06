import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { normalizeDriveUrl, handleImageError } from '../utils/drive';
import { Sun, Moon, Globe, Menu, X, Sparkles, MessageCircle } from 'lucide-react';
import { Language } from '../types';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t, isDark, toggleTheme, cms, activeAttribution } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-luxury border-b border-[#D4AF37]/25 shadow-lg shadow-black/20 py-2.5'
          : 'bg-[#FAF7F2]/90 dark:bg-[#0C0A0B]/90 backdrop-blur-md py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo and Brand */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('home');
          }}
          className="flex items-center gap-3 group"
        >
          <img
            src={normalizeDriveUrl(cms.logoUrl, 'logo')}
            alt="Maria Style Logo"
            onError={(e) => handleImageError(e, 'logo')}
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="hidden sm:block text-start">
            <span className="block text-base sm:text-lg font-bold font-serif-luxury tracking-wide text-[#2D2A26] dark:text-white group-hover:text-[#C94C71] transition-colors">
              MARIA STYLE
            </span>
            <span className="block text-[10px] font-medium text-[#C94C71] tracking-wider uppercase">
              Alialyna &amp; HomeLife
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#4A453F] dark:text-[#E2D8CE]">
          <button
            onClick={() => scrollToSection('home')}
            className="hover:text-[#C94C71] transition-colors"
          >
            {t.navHome}
          </button>
          <button
            onClick={() => scrollToSection('story')}
            className="hover:text-[#C94C71] transition-colors"
          >
            {t.navAbout}
          </button>
          <button
            onClick={() => scrollToSection('store')}
            className="hover:text-[#C94C71] transition-colors"
          >
            {t.navStore}
          </button>
          <button
            onClick={() => scrollToSection('roadmap')}
            className="hover:text-[#C94C71] transition-colors"
          >
            {t.navRoadmap}
          </button>
          <button
            onClick={() => scrollToSection('reviews')}
            className="hover:text-[#C94C71] transition-colors"
          >
            {t.navReviews}
          </button>
          <button
            onClick={() => scrollToSection('awards')}
            className="hover:text-[#C94C71] transition-colors"
          >
            {t.navAwards}
          </button>
          <button
            onClick={() => scrollToSection('booking')}
            className="hover:text-[#C94C71] transition-colors"
          >
            {t.navBooking}
          </button>
        </nav>

        {/* Action Controls: Lang, Theme, Admin, Join CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Switcher */}
          <div className="relative group">
            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-full border border-[#D4AF37]/30 bg-white/50 dark:bg-black/30 text-[#2D2A26] dark:text-white hover:border-[#C94C71] transition-all"
              aria-label="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="uppercase font-semibold">{language}</span>
            </button>
            <div className="absolute top-full end-0 mt-1.5 w-32 bg-white dark:bg-[#161114] rounded-xl shadow-2xl border border-[#D4AF37]/30 p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    language === l.code
                      ? 'bg-[#C94C71] text-white font-bold'
                      : 'text-[#4A453F] dark:text-[#E2D8CE] hover:bg-[#FAF7F2] dark:hover:bg-white/5'
                  }`}
                >
                  <span>{l.label}</span>
                  <span>{l.flag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-[#D4AF37]/30 bg-white/50 dark:bg-black/30 text-[#2D2A26] dark:text-white hover:text-[#C94C71] hover:border-[#C94C71] transition-all"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4 text-[#C94C71]" />}
          </button>

          {/* Main CTA */}
          <button
            onClick={() => scrollToSection('join-team')}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white rose-gold-gradient shadow-md shadow-[#C94C71]/25 hover:shadow-lg hover:shadow-[#C94C71]/40 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F4E8C1]" />
            <span>{t.ctaJoinNow}</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#2D2A26] dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Attribution Banner Notice if ref present */}
      {activeAttribution && activeAttribution !== 'MS-FATIMA' && (
        <div className="bg-[#D4AF37]/10 border-b border-[#D4AF37]/20 py-1 text-center text-xs text-[#8C7A6B] dark:text-[#D4AF37]">
          {t.attributedBy} <strong className="font-bold text-[#C94C71]">{activeAttribution}</strong>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-full bg-white/95 dark:bg-[#120E11]/98 backdrop-blur-xl border-b border-[#D4AF37]/30 px-6 py-6 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-top-4 duration-200">
          <button
            onClick={() => scrollToSection('home')}
            className="text-start py-2 font-medium text-base text-[#2D2A26] dark:text-white hover:text-[#C94C71]"
          >
            {t.navHome}
          </button>
          <button
            onClick={() => scrollToSection('story')}
            className="text-start py-2 font-medium text-base text-[#2D2A26] dark:text-white hover:text-[#C94C71]"
          >
            {t.navAbout}
          </button>
          <button
            onClick={() => scrollToSection('store')}
            className="text-start py-2 font-medium text-base text-[#2D2A26] dark:text-white hover:text-[#C94C71]"
          >
            {t.navStore}
          </button>
          <button
            onClick={() => scrollToSection('roadmap')}
            className="text-start py-2 font-medium text-base text-[#2D2A26] dark:text-white hover:text-[#C94C71]"
          >
            {t.navRoadmap}
          </button>
          <button
            onClick={() => scrollToSection('reviews')}
            className="text-start py-2 font-medium text-base text-[#2D2A26] dark:text-white hover:text-[#C94C71]"
          >
            {t.navReviews}
          </button>
          <button
            onClick={() => scrollToSection('awards')}
            className="text-start py-2 font-medium text-base text-[#2D2A26] dark:text-white hover:text-[#C94C71]"
          >
            {t.navAwards}
          </button>
          <button
            onClick={() => scrollToSection('booking')}
            className="text-start py-2 font-medium text-base text-[#2D2A26] dark:text-white hover:text-[#C94C71]"
          >
            {t.navBooking}
          </button>

          <div className="pt-4 border-t border-[#D4AF37]/20 flex flex-col gap-3">
            <button
              onClick={() => scrollToSection('join-team')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white rose-gold-gradient shadow-md"
            >
              <Sparkles className="w-4 h-4 text-[#F4E8C1]" />
              <span>{t.ctaJoinNow}</span>
            </button>
            <a
              href={`https://wa.me/${cms.officialWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                'مرحباً مدام فاطمة، أود الاستفسار عن الانضمام والمنتجات'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
            >
              <MessageCircle className="w-4 h-4" />
              <span>محادثة واتساب سريعة</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
