import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const Manifesto = () => {
  const { t } = useTranslation();
  
  const manifestoItems = [
    {
      title: t('manifesto.m1.title'),
      fullTitle: t('manifesto.m1.fullTitle'),
      desc: t('manifesto.m1.desc'),
      fullDesc: t('manifesto.m1.fullDesc'),
      num: "01"
    },
    {
      title: t('manifesto.m2.title'),
      fullTitle: t('manifesto.m2.fullTitle'),
      desc: t('manifesto.m2.desc'),
      fullDesc: t('manifesto.m2.fullDesc'),
      num: "02"
    },
    {
      title: t('manifesto.m3.title'),
      fullTitle: t('manifesto.m3.fullTitle'),
      desc: t('manifesto.m3.desc'),
      fullDesc: t('manifesto.m3.fullDesc'),
      num: "03"
    }
  ];
  return (
    <section className="bg-cream py-24 md:py-40 px-6 md:px-12 lg:px-24">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Large Decorative Text */}
        <div className="lg:col-span-5 relative">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-40"
          >
            <h2 className="font-display text-[8rem] md:text-[12rem] font-black text-ink/5 leading-none absolute -top-20 -left-10 select-none">
              {t('manifesto.bg_text')}
            </h2>
            <h3 className="font-display text-5xl md:text-7xl font-black text-ink leading-[0.95] mb-8">
              {t('manifesto.title_1')} <br /><em className="italic text-accent">{t('manifesto.title_2')}</em>
            </h3>
            <div className="w-20 h-2 bg-accent mb-8" />
            <p className="font-bn text-xl md:text-2xl text-ink-muted leading-relaxed">
              {t('manifesto.desc')}
            </p>
          </motion.div>
        </div>

        {/* Content Blocks - Now side-by-side on mobile */}
        <div className="lg:col-span-7 grid grid-cols-3 lg:grid-cols-1 gap-4 md:gap-16 lg:gap-24">
          {manifestoItems.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: i * 0.1 }}
              className="group border-b lg:border-b border-ink/5 pb-2 md:pb-12 last:border-0 text-center lg:text-left flex flex-col items-center lg:items-start transition-all"
            >
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2 md:gap-8">
                <span className="font-display text-2xl md:text-6xl font-black text-ink/10 group-hover:text-accent/20 transition-colors">
                  {item.num}
                </span>
                <div>
                  <h4 className="font-bn text-sm md:text-3xl font-bold text-ink mb-2 md:mb-6">
                    <span className="lg:hidden">{item.title}</span>
                    <span className="hidden lg:inline">{item.fullTitle}</span>
                  </h4>
                  <p className="font-bn text-[0.6rem] md:text-lg text-ink-muted leading-relaxed max-w-xl">
                    <span className="lg:hidden">{item.desc}</span>
                    <span className="hidden lg:inline">{item.fullDesc}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
