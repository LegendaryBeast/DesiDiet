import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

export const CTASection = () => {
  const { t } = useTranslation();
  return (
    <section className="px-6 md:px-12 lg:px-24 py-24 lg:py-40 text-center relative overflow-hidden bg-cream">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bn text-[20vw] font-bold text-cream-dark opacity-40 whitespace-nowrap pointer-events-none select-none tracking-tighter z-0">
        {t('cta.bg_text')}
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-[0.65rem] lg:text-[0.68rem] tracking-[0.2em] uppercase text-ink-faint mb-6 lg:mb-10">{t('cta.eyebrow')}</div>
        
        <h2 className="font-display text-[clamp(2.5rem,8vw,6rem)] font-black leading-[0.95] tracking-tight mb-8">
          <span className="font-bn text-[clamp(1.8rem,5vw,4.5rem)] font-bold block text-accent mb-2">{t('cta.title_1')}</span>
          {t('cta.title_2')}<br /><em className="italic text-ink-muted">{t('cta.title_3')}</em>
        </h2>
        
        <p className="font-bn text-[0.95rem] lg:text-[1.1rem] leading-[1.8] text-ink-muted max-w-[450px] mb-12">
          {t('cta.desc')}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
          <Link to="/profile" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto px-10 lg:px-14 py-4 lg:py-5 text-lg lg:text-xl font-bold bg-accent hover:bg-ink">
              {t('cta.button')}
            </Button>
          </Link>
          <Link to="/#features" className="text-[0.8rem] lg:text-[0.9rem] tracking-[0.08em] uppercase text-ink-muted hover:text-ink transition-colors font-body interactive py-2">
            {t('cta.link')}
          </Link>
        </div>
      </div>
    </section>
  );
};
