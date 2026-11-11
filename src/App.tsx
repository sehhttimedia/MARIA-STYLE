import React from 'react';
import { AppProvider } from './context/AppContext';
import { CustomCursor } from './components/CustomCursor';
import { FastBrandIntro } from './components/FastBrandIntro';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MadameFatimaStory } from './components/MadameFatimaStory';
import { RoadmapSection } from './components/RoadmapSection';
import { StoreSection } from './components/StoreSection';
import { MlmFormSection } from './components/MlmFormSection';
import { BookingSection } from './components/BookingSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { AwardsSection } from './components/AwardsSection';
import { LiveToast } from './components/LiveToast';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { AdminModal } from './components/Admin/AdminModal';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0C0A0B] text-[#2D2A26] dark:text-[#FAF7F2] transition-colors duration-300 relative selection:bg-[#C94C71]/30 selection:text-[#F4E8C1]">
      {/* Luxury Non-blocking Brand Intro */}
      <FastBrandIntro />

      {/* Luxury Interactive Cursor */}
      <CustomCursor />

      {/* Top Countdown Announcement Bar */}
      <AnnouncementBar />

      {/* Luxury Glass Header */}
      <Navbar />

      {/* Main Content Sections */}
      <main id="main-content">
        <HeroSection />
        <MadameFatimaStory />
        <StoreSection />
        <RoadmapSection />
        <MlmFormSection />
        <BookingSection />
        <TestimonialsSection />
        <AwardsSection />
      </main>

      {/* Live Social Proof Activity Toasts */}
      <LiveToast />

      {/* Floating WhatsApp Quick Action Button */}
      <FloatingWhatsApp />

      {/* Rich Footer with CMS Socials and Admin Trigger */}
      <Footer />

      {/* Full Administrative Modal & Dashboard */}
      <AdminModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
