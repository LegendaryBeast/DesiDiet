import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const getFeatures = (t: any) => [
  {
    num: '01',
    title: t('features.f1_title'),
    desc: t('features.f1_desc'),
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 20 L18 26 L28 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    num: '02',
    title: t('features.f2_title'),
    desc: t('features.f2_desc'),
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 20 H28 M20 12 V28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    num: '03',
    title: t('features.f3_title'),
    desc: t('features.f3_desc'),
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="14" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 34 C8 27 12 22 20 22 C28 22 32 27 32 34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    num: '04',
    title: t('features.f4_title'),
    desc: t('features.f4_desc'),
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M20 4 L24 16 H36 L26 24 L30 36 L20 28 L10 36 L14 24 L4 16 H16 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    )
  }
];

export const FeaturesSection = () => {
  const { t } = useTranslation();
  const features = getFeatures(t);

  return (
    <section className="px-6 md:px-12 lg:px-24 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 bg-cream" id="features">
      <div className="lg:sticky lg:top-32 h-fit">
        <div className="text-[0.65rem] lg:text-[0.68rem] tracking-[0.2em] uppercase text-ink-faint mb-4 lg:mb-6">{t('features.eyebrow')}</div>
        <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.1] tracking-tight mb-6 lg:mb-8 text-ink">
          {t('features.title_1')}<br /><em className="italic text-ink-muted font-normal">{t('features.title_2')}</em><br />{t('features.title_3')}
        </h2>
        <p className="font-bn text-[0.9rem] lg:text-[1rem] leading-[1.8] text-ink-muted max-w-[320px]">
          {t('features.desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-cream-dark">
        {features.map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className={`p-8 lg:p-12 group hover:bg-cream-dark transition-all duration-500 relative border-r border-b border-cream-dark`}
          >
            <span className="absolute top-8 right-8 text-[0.6rem] lg:text-[0.65rem] tracking-[0.15em] text-ink-faint font-body">{f.num}</span>
            <div className="text-accent mb-6 group-hover:scale-110 transition-transform duration-500 origin-left">
              {f.icon}
            </div>
            <h3 className="font-bn text-[1.1rem] lg:text-[1.25rem] font-bold text-ink mb-4">{f.title}</h3>
            <p className="font-bn text-[0.85rem] lg:text-[0.95rem] leading-[1.7] text-ink-muted">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
