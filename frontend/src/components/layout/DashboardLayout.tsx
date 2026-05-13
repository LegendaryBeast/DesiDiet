import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  Layout,
  Activity,
  Languages,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  ChevronRight,
  Home,
  Pill,
  Apple,
  BarChart2,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  noPadding?: boolean;
  headerExtra?: React.ReactNode;
  headerActions?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  noPadding,
  headerExtra,
  headerActions
}) => {
  const { i18n } = useTranslation();
  const { profileData, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const profile = profileData?.profile;
  const targets = profileData?.targets;
  const isBn = i18n.language === 'bn';

  const displayName = isBn
    ? (profile?.name_bn || profile?.name_en || 'অতিথি')
    : (profile?.name_en || profile?.name_bn || 'Guest');

  // Calculate BMI from profile data if targets.bmi is missing
  const computedBmi = (() => {
    if (targets?.bmi) return targets.bmi.toFixed(1);
    const w = profile?.weight_kg;
    const h = profile?.height_cm;
    if (w && h) return (w / ((h / 100) * (h / 100))).toFixed(1);
    return '--';
  })();

  const calories = targets?.target_calories ?? '--';
  const bmiCategory = targets?.bmi_category ?? (isBn ? '---' : '---');

  const navItems = [
    { path: '/', label: isBn ? 'হোমপেজ' : 'Home', icon: Home },
    { path: '/chat', label: isBn ? 'এআই অ্যাসিস্ট্যান্ট' : 'AI Assistant', icon: MessageSquare },
    { path: '/meal-plan', label: isBn ? 'আজকের মিল প্ল্যান' : 'Meal Plan', icon: Layout },
    { path: '/health-log', label: isBn ? 'স্বাস্থ্য লগ' : 'Health Log', icon: Activity },
    { path: '/medicine', label: isBn ? 'ওষুধের রিমাইন্ডার' : 'Medicine', icon: Pill },
    { path: '/foods', label: isBn ? 'খাবারের তালিকা' : 'Foods', icon: Apple },
    { path: '/report', label: isBn ? 'পুষ্টি রিপোর্ট' : 'Report', icon: BarChart2 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="h-screen h-[100dvh] bg-cream flex overflow-hidden font-bn relative">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-[25] lg:hidden"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed lg:relative inset-y-0 left-0 w-[280px] md:w-[320px] bg-white border-r border-ink/5 flex flex-col z-30 shadow-2xl lg:shadow-none"
            >
              <div className="p-6 pt-24 lg:pt-8 md:p-8 h-full flex flex-col overflow-y-auto hide-scrollbar">
                {/* Profile Card */}
                <div className="bg-cream/50 p-5 md:p-6 rounded-[2.5rem] mb-6 md:mb-8 border border-ink/5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-ink rounded-2xl flex items-center justify-center text-cream shadow-lg transform rotate-3 flex-shrink-0">
                      <User size={24} className="md:w-7 md:h-7" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bn font-bold text-lg md:text-xl leading-tight text-ink truncate">{displayName}</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-ink-faint font-body font-bold truncate">{bmiCategory}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-2xl border border-ink/5 text-center">
                      <div className="text-[0.55rem] uppercase tracking-wider text-ink-faint font-body mb-1">BMI</div>
                      <div className="font-bold text-base text-ink">{computedBmi}</div>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-ink/5 text-center">
                      <div className="text-[0.55rem] uppercase tracking-wider text-ink-faint font-body mb-1">KCAL</div>
                      <div className="font-bold text-base text-accent">{calories}</div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-grow space-y-1.5">
                  <p className="text-[0.55rem] uppercase tracking-[0.2em] text-ink-faint font-body font-bold px-4 mb-3">Health Dashboard</p>
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-4 p-3 md:p-4 rounded-2xl transition-all group border border-transparent ${
                          isActive
                            ? 'bg-ink text-cream shadow-xl shadow-ink/10'
                            : 'text-ink-muted hover:bg-cream hover:text-ink hover:border-ink/5'
                        }`}
                      >
                        <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isActive ? 'bg-accent text-cream' : 'bg-cream group-hover:bg-ink group-hover:text-cream'
                        }`}>
                          <item.icon size={16} className="md:w-[18px] md:h-[18px]" />
                        </div>
                        <span className="font-bn text-sm font-bold flex-1">{item.label}</span>
                        {isActive && <ChevronRight size={14} className="opacity-40" />}
                      </Link>
                    );
                  })}
                </nav>

                <div className="pt-6 md:pt-8 mt-auto border-t border-ink/5 space-y-2">
                  <button
                    onClick={() => i18n.changeLanguage(isBn ? 'en' : 'bn')}
                    className="w-full flex items-center gap-4 p-3 md:p-4 rounded-2xl hover:bg-cream transition-colors text-ink-muted hover:text-ink font-bold text-sm"
                  >
                    <Languages size={18} />
                    <span>{isBn ? 'Switch to English' : 'বাংলায় যান'}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 p-3 md:p-4 rounded-2xl hover:bg-red-50 text-red-500 transition-colors font-bold text-sm"
                  >
                    <LogOut size={18} />
                    <span>{isBn ? 'লগ আউট' : 'Log Out'}</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative bg-[#FDFCF9] overflow-hidden">
        {/* Cinematic Texture Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

        {/* Dynamic Header */}
        <header className="sticky top-0 p-4 md:p-6 lg:px-10 border-b border-ink/5 flex items-center justify-between z-30 bg-white/70 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 md:p-3 bg-cream rounded-2xl text-ink-muted hover:bg-ink hover:text-cream transition-all flex shadow-sm interactive"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <Link to="/" className="p-2.5 md:p-3 bg-cream rounded-2xl text-ink-muted hover:bg-ink hover:text-cream transition-all flex lg:hidden interactive">
                <ArrowLeft size={20} />
              </Link>
            </div>

            <div className={`flex items-center gap-3 md:gap-4 transition-opacity duration-300 ${sidebarOpen ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : 'opacity-100'}`}>
              {headerExtra}
              <div>
                <h2 className="font-bn font-black text-lg md:text-2xl text-ink tracking-tight leading-tight">{title}</h2>
                {subtitle && (
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[0.55rem] md:text-[0.65rem] uppercase tracking-[0.2em] text-ink-faint font-bold font-body">{subtitle}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`flex items-center transition-opacity duration-300 ${sidebarOpen ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : 'opacity-100'}`}>
            {headerActions}
          </div>
        </header>

        {/* Content Stream */}
        <main className={`flex-1 relative z-10 scroll-smooth ${noPadding ? 'overflow-hidden flex flex-col' : 'overflow-y-auto p-4 md:p-8 lg:p-12'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
