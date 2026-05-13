import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

export const Nav = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAboutPage = location.pathname === '/about';
  const isLightNav = isAboutPage && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 px-4 lg:px-12 py-4 lg:py-6 flex justify-between items-center ${
          scrolled ? 'bg-cream/95 backdrop-blur-md border-b border-ink/10 py-3 lg:py-4' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <Link to="/" className={`font-bn text-[1rem] lg:text-[1.1rem] font-bold tracking-[0.02em] transition-colors z-[101] ${isLightNav ? 'text-cream' : 'text-ink'}`}>
          {t('nav.logo')}<span className="text-accent">{t('nav.logo_span')}</span>
        </Link>

        <ul className="hidden md:flex items-center gap-6 lg:gap-10 list-none">
          <li>
            <a href="/#features" className={`text-[0.65rem] lg:text-[0.75rem] tracking-[0.12em] uppercase transition-colors interactive ${isLightNav ? 'text-cream/70 hover:text-cream' : 'text-ink-muted hover:text-ink'}`}>
              {t('nav.features')}
            </a>
          </li>
          <li>
            <Link to="/about" className={`text-[0.65rem] lg:text-[0.75rem] tracking-[0.12em] uppercase transition-colors interactive ${isLightNav ? 'text-cream/70 hover:text-cream' : 'text-ink-muted hover:text-ink'}`}>
              {t('nav.about')}
            </Link>
          </li>
          <li>
            <Link to="/conditions" className={`text-[0.65rem] lg:text-[0.75rem] tracking-[0.12em] uppercase transition-colors interactive ${isLightNav ? 'text-cream/70 hover:text-cream' : 'text-ink-muted hover:text-ink'}`}>
              {t('nav.conditions')}
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-4 lg:gap-6">
          <button 
            onClick={() => i18n.changeLanguage(i18n.language === 'bn' ? 'en' : 'bn')}
            className={`font-bn text-[0.85rem] lg:text-[0.95rem] font-bold hover:text-accent interactive px-3 py-1 border rounded-full transition-colors flex items-center justify-center min-w-[40px] ${
              isLightNav ? 'text-cream border-cream/20' : 'text-ink border-ink/10'
            }`}
          >
            {i18n.language === 'bn' ? 'EN' : 'বাং'}
          </button>
          {isLoggedIn ? (
            <Link to="/chat" className="hidden sm:block">
              <button className={`text-[0.65rem] lg:text-[0.75rem] tracking-[0.1em] uppercase px-4 lg:px-6 py-2 lg:py-2.5 border transition-all font-body interactive ${
                isLightNav 
                  ? 'border-cream text-cream hover:bg-cream hover:text-ink' 
                  : 'border-ink bg-transparent text-ink hover:bg-ink hover:text-cream'
              }`}>
                {i18n.language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
              </button>
            </Link>
          ) : (
            <Link to="/auth" className="hidden sm:block">
              <button className={`text-[0.65rem] lg:text-[0.75rem] tracking-[0.1em] uppercase px-4 lg:px-6 py-2 lg:py-2.5 border transition-all font-body interactive ${
                isLightNav 
                  ? 'border-cream text-cream hover:bg-cream hover:text-ink' 
                  : 'border-ink bg-transparent text-ink hover:bg-ink hover:text-cream'
              }`}>
                {t('nav.start')}
              </button>
            </Link>
          )}
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 z-[101] interactive relative w-8 h-8 flex flex-col justify-center gap-1.5 ${isLightNav ? 'text-cream' : 'text-ink'}`}
          >
            <motion.div 
              animate={mobileMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              className={`w-6 h-px transition-colors ${isLightNav && !mobileMenuOpen ? 'bg-cream' : 'bg-ink'}`} 
            />
            <motion.div 
              animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className={`w-6 h-px transition-colors ${isLightNav && !mobileMenuOpen ? 'bg-cream' : 'bg-ink'}`} 
            />
            <motion.div 
              animate={mobileMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              className={`w-6 h-px transition-colors ${isLightNav && !mobileMenuOpen ? 'bg-cream' : 'bg-ink'}`} 
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-cream z-[90] flex flex-col items-center justify-center gap-10 md:hidden"
          >
            <a href="/#features" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bn text-ink hover:text-accent transition-colors">{t('nav.features')}</a>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bn text-ink hover:text-accent transition-colors">{t('nav.about')}</Link>
            <Link to="/conditions" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bn text-ink hover:text-accent transition-colors">{t('nav.conditions')}</Link>
            {isLoggedIn ? (
              <Link to="/chat" onClick={() => setMobileMenuOpen(false)}>
                <button className="text-lg font-bn border border-ink px-10 py-3 bg-ink text-cream hover:bg-accent hover:border-accent transition-all">
                  {i18n.language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
                </button>
              </Link>
            ) : (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <button className="text-lg font-bn border border-ink px-10 py-3 bg-ink text-cream hover:bg-accent hover:border-accent transition-all">{t('nav.start')}</button>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

