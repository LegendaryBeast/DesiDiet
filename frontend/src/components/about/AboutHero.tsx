import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const AboutHero = () => {
  const { t } = useTranslation();
  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-ink">
      {/* Background Image with Parallax-like effect */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="/images/about_hero.png" 
          alt="Bengali Nature" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink/80" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <h1 className="font-display text-[clamp(3rem,12vw,10rem)] font-black leading-[0.85] tracking-tight text-cream uppercase mb-8">
            {t('about_hero.title_1')} <br />
            <span className="italic text-accent-light">{t('about_hero.title_2')}</span>
          </h1>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mt-12">
            <div className="w-px h-12 bg-accent hidden md:block" />
            <p className="font-bn text-lg md:text-xl text-cream/80 max-w-lg leading-relaxed">
              {t('about_hero.desc')}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-cream/40 flex flex-col items-center gap-2"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.3em] font-body">{t('about_hero.scroll')}</span>
        <div className="w-px h-12 bg-cream/20" />
      </motion.div>
    </section>
  );
};
