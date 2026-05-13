import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export const Hero = () => {
  const { t } = useTranslation();
  const { profileData, isLoggedIn } = useAuth();
  
  const dailyTarget = isLoggedIn && profileData?.targets?.target_calories 
    ? profileData.targets.target_calories 
    : 1950;

  const reveal: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.9, ease: "easeOut" }
    }
  };

  return (
    <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden pt-12 lg:pt-0" id="home">
      <div className="flex flex-col justify-center lg:justify-end p-6 md:p-12 lg:p-24 pb-12 lg:pb-20 relative z-10">
        <motion.div 
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex items-center gap-4 text-[0.6rem] lg:text-[0.7rem] tracking-[0.18em] uppercase text-ink-muted mb-6 lg:mb-8"
        >
          <div className="w-6 lg:w-10 h-px bg-ink-muted" />
          {t('hero.eyebrow')}
        </motion.div>
        
        <motion.h1 
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display text-[clamp(2.5rem,10vw,6rem)] font-black leading-[0.9] tracking-tight mb-4"
        >
          <span className="font-bn text-[clamp(2rem,8vw,4.5rem)] font-bold block leading-[1] text-accent mb-2">{t('hero.title_bn')}</span>
          <div className="leading-tight">
            {t('hero.title_en_1')}<br />
            <em className="italic text-ink-muted font-normal">{t('hero.title_en_2')}</em><br />
            {t('hero.title_en_3')}
          </div>
        </motion.h1>

        <motion.p 
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-6 lg:mt-10 max-w-[500px] lg:max-w-[340px] text-[0.9rem] lg:text-[0.95rem] leading-[1.6] lg:leading-[1.7] text-ink-muted font-bn"
        >
          {t('hero.desc')}
        </motion.p>

        <motion.div 
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 lg:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:gap-6"
        >
          <Link to="/profile" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto bg-ink text-cream hover:bg-accent px-10 py-5 lg:py-4 text-base lg:text-sm font-bold interactive shadow-xl">
              {t('hero.cta_primary')}
            </Button>
          </Link>
          <Link to="/about" className="text-[0.8rem] lg:text-[0.8rem] tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-colors flex items-center justify-center gap-2 group interactive py-4 sm:py-2 px-4 border border-ink/5 sm:border-none rounded-xl">
            {t('hero.cta_ghost')} <span className="group-hover:translate-x-2 transition-transform">→</span>
          </Link>
        </motion.div>

        <motion.div 
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-3 px-4 py-2 border border-cream-dark text-[0.6rem] lg:text-[0.68rem] tracking-[0.1em] uppercase text-ink-faint mt-10 self-start bg-white/50 backdrop-blur-sm"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
          {t('hero.badge')}
        </motion.div>
      </div>

      <div className="relative overflow-hidden bg-cream-dark lg:h-full h-[45vh] md:h-[55vh]">
        <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-12">
          {/* Inspiration SVG */}
          <motion.svg 
            initial={{ y: 20, opacity: 0, scale: 0.8 }}
            animate={{ y: [-15, 0, -15], opacity: 1, scale: 1 }}
            transition={{ 
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1 },
              scale: { duration: 1.2, ease: "easeOut" }
            }}
            className="w-full h-full max-w-[280px] md:max-w-[400px] lg:max-w-[480px] aspect-square drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)]" 
            viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="210" cy="340" rx="160" ry="30" fill="#D4C9B0" opacity="0.6"/>
            <path d="M80 220 Q80 340 210 340 Q340 340 340 220" fill="#E8DFC8"/>
            <ellipse cx="210" cy="220" rx="130" ry="30" fill="#EDE6D6"/>
            <ellipse cx="210" cy="215" rx="110" ry="40" fill="#F5EDD4"/>
            <g transform="translate(155,160) rotate(-8)">
              <ellipse cx="55" cy="25" rx="65" ry="22" fill="#B87A5A"/>
              <path d="M120 25 L148 8 L148 42 Z" fill="#B87A5A"/>
              <circle cx="18" cy="20" r="4" fill="#2A1A0E" opacity="0.6"/>
              <path d="M30 15 Q55 8 80 15" stroke="#8B5A3A" strokeWidth="1.5" fill="none" opacity="0.5"/>
              <path d="M30 25 Q55 20 80 25" stroke="#8B5A3A" strokeWidth="1.5" fill="none" opacity="0.5"/>
            </g>
            <g transform="translate(260,165)">
              <ellipse cx="20" cy="20" rx="22" ry="16" fill="#6B9B4E" transform="rotate(-20)"/>
              <ellipse cx="45" cy="15" rx="18" ry="14" fill="#5A8A3D" transform="rotate(15)"/>
              <ellipse cx="30" cy="35" rx="16" ry="12" fill="#7BAE5E" transform="rotate(-5)"/>
            </g>
            <g fill="#C49A3A" opacity="0.7">
              <ellipse cx="165" cy="205" rx="5" ry="4"/>
              <ellipse cx="185" cy="198" rx="4" ry="3.5"/>
              <ellipse cx="205" cy="210" rx="5" ry="4"/>
              <ellipse cx="225" cy="202" rx="4" ry="3.5"/>
              <ellipse cx="245" cy="208" rx="5" ry="4"/>
            </g>
            <g opacity="0.25" stroke="#8B7355" strokeWidth="2" fill="none" strokeLinecap="round">
              <motion.path 
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 3, repeat: Infinity }}
                d="M180 130 Q175 115 182 100 Q189 85 184 70" 
              />
              <motion.path 
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                d="M210 125 Q205 108 212 93 Q219 78 214 63" 
              />
              <motion.path 
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                d="M240 130 Q235 113 242 98 Q249 83 244 68" 
              />
            </g>
            <circle cx="210" cy="280" r="155" stroke="#D4C9B0" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="4 8"/>
          </motion.svg>
        </div>

        {/* Floating tags - Hidden on very small screens, responsive positioning */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-10 left-6 md:bottom-20 md:left-8 bg-white border border-ink/5 p-3 md:p-4 px-5 md:px-6 font-bn text-[0.75rem] md:text-[0.85rem] text-ink-muted shadow-2xl rounded-2xl z-20"
        >
          <strong className="block text-ink text-[1.1rem] md:text-[1.3rem] font-black tracking-tight leading-tight mb-1">{dailyTarget} kcal</strong>
          {t('hero.todays_goal')}
        </motion.div>

        <div className="absolute bottom-6 right-6 md:bottom-12 md:right-8 w-20 h-20 md:w-28 md:h-28 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-ink opacity-20"
          />
          <div className="font-bn text-[0.6rem] md:text-[0.7rem] text-center leading-[1.3] text-ink-muted bg-white/90 backdrop-blur-md w-14 h-14 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center border border-ink/10 shadow-xl z-10">
            <span className="font-display font-black text-[0.6rem] md:text-[0.7rem] text-accent block mb-0.5">NDG</span>
            2025<br />ENC
          </div>
        </div>
      </div>
    </section>
  );
};
