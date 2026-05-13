import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Droplet, Activity, Stethoscope, Scale, HeartPulse, Dna } from 'lucide-react';

const getDiseases = (t: any) => [
  {
    Icon: Droplet,
    iconColor: 'text-red-500',
    title: t('diseases.d1.title'),
    en: 'Diabetes Mellitus',
    desc: t('diseases.d1.desc'),
    tag: t('diseases.d1.tag')
  },
  {
    Icon: Activity,
    iconColor: 'text-accent',
    title: t('diseases.d2.title'),
    en: 'Hypertension',
    desc: t('diseases.d2.desc'),
    tag: t('diseases.d2.tag')
  },
  {
    Icon: Stethoscope,
    iconColor: 'text-blue-500',
    title: t('diseases.d3.title'),
    en: 'Chronic Kidney Disease',
    desc: t('diseases.d3.desc'),
    tag: t('diseases.d3.tag')
  },
  {
    Icon: Scale,
    iconColor: 'text-amber-500',
    title: t('diseases.d4.title'),
    en: 'Obesity',
    desc: t('diseases.d4.desc'),
    tag: t('diseases.d4.tag')
  },
  {
    Icon: HeartPulse,
    iconColor: 'text-rose-500',
    title: t('diseases.d5.title'),
    en: 'Coronary Heart Disease',
    desc: t('diseases.d5.desc'),
    tag: t('diseases.d5.tag')
  },
  {
    Icon: Dna,
    iconColor: 'text-purple-500',
    title: t('diseases.d6.title'),
    en: 'Hypothyroidism',
    desc: t('diseases.d6.desc'),
    tag: t('diseases.d6.tag')
  }
];

export const DiseasesGrid = () => {
  const { t } = useTranslation();
  const diseases = getDiseases(t);

  return (
    <section className="bg-cream-dark px-6 md:px-12 lg:px-24 py-20 lg:py-32" id="conditions">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 lg:mb-24 items-end">
        <motion.h2 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.95] tracking-tighter text-ink"
        >
          {t('diseases.eyebrow')}<br /><em className="italic text-accent">{t('diseases.eyebrow_span')}</em> {t('diseases.eyebrow_condition')}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="font-bn text-[0.9rem] lg:text-[1rem] leading-[1.8] text-ink-muted max-w-[480px]"
        >
          {t('diseases.desc')}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {diseases.map((d, i) => {
          const Icon = d.Icon;
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-cream p-8 lg:p-10 relative group overflow-hidden hover:translate-y-[-6px] transition-transform duration-500"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-accent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
              <div className="mb-6 h-10 flex items-center">
                <Icon className={`w-10 h-10 ${d.iconColor} transform group-hover:scale-110 transition-transform duration-300`} />
              </div>
              <h3 className="font-bn text-[1.1rem] lg:text-[1.2rem] font-bold text-ink mb-2">{d.title}</h3>
              <span className="font-body text-[0.65rem] lg:text-[0.7rem] tracking-[0.1em] uppercase text-ink-faint block mb-6">{d.en}</span>
              <p className="font-bn text-[0.85rem] lg:text-[0.9rem] leading-[1.7] text-ink-muted mb-8">
                {d.desc}
              </p>
              <span className="inline-block px-3 py-1 bg-cream-dark text-ink-muted font-bn text-[0.7rem] lg:text-[0.75rem]">
                {d.tag}
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
