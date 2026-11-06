import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { X } from 'lucide-react';

export const AdminModal: React.FC = () => {
  const { isAdminModalOpen, setIsAdminModalOpen, isAdminLoggedIn } = useApp();

  if (!isAdminModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-white dark:bg-[#161114] rounded-3xl shadow-2xl border border-[#D4AF37]/40 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Floating Close Button for Login Screen */}
        {!isAdminLoggedIn && (
          <button
            onClick={() => setIsAdminModalOpen(false)}
            className="absolute top-4 end-4 z-20 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-black/5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content Render */}
        {isAdminLoggedIn ? (
          <AdminDashboard onClose={() => setIsAdminModalOpen(false)} />
        ) : (
          <AdminLogin />
        )}
      </div>
    </div>
  );
};
