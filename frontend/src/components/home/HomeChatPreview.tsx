import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MessageSquare, Layout, Activity, FileText } from 'lucide-react';

export const HomeChatPreview = () => {
  const { t } = useTranslation();

  return (
    <section className="py-12 lg:py-24 px-6 md:px-12 lg:px-24 bg-[#F9F6F2] overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="text-[0.65rem] lg:text-[0.68rem] tracking-[0.2em] uppercase text-ink-faint mb-6 font-body">{t('chat.experience_intelligence')}</div>
          <h2 className="font-display text-[1.8rem] lg:text-[4.5rem] font-bold text-ink leading-tight mb-4 lg:mb-8">
            {t('chat.talk_to_ai')} <em className="italic text-accent">DesiDiet AI</em>
          </h2>
          <p className="font-bn text-[0.85rem] lg:text-[1.2rem] text-ink-muted max-w-[600px] leading-relaxed">
            {t('chat.placeholder')}
          </p>
        </div>

        <div className="relative bg-white rounded-[40px] shadow-2xl border border-ink/5 p-8 lg:p-16 overflow-hidden">
          {/* Decorative soft light */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full" />
          
          <div className="relative z-10">
            <div className="flex flex-col items-center text-center mb-12">
              <div className="w-20 h-20 bg-ink rounded-3xl flex items-center justify-center text-cream mb-6 shadow-xl transform hover:rotate-6 transition-transform">
                <MessageSquare size={40} />
              </div>
              <h3 className="font-display text-xl lg:text-3xl font-bold text-ink mb-2 lg:mb-4">{t('chat.greeting')}</h3>
              <p className="font-bn text-ink-muted opacity-70">{t('chat.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: Activity, title: t('chat.suggestions.title1'), sub: t('chat.suggestions.sub1') },
                { icon: Layout, title: t('chat.suggestions.title2'), sub: t('chat.suggestions.sub2') },
                { icon: FileText, title: t('chat.suggestions.title3'), sub: t('chat.suggestions.sub3') },
              ].map((card, i) => (
                <div key={i} className="p-8 bg-[#FDFCF9] border border-ink/5 rounded-[32px] text-left hover:shadow-lg transition-all group cursor-pointer">
                  <div className="w-12 h-12 bg-cream-dark rounded-2xl flex items-center justify-center text-ink mb-6 group-hover:bg-accent group-hover:text-cream transition-colors">
                    <card.icon size={24} />
                  </div>
                  <h4 className="font-bn font-bold text-xl text-ink mb-2">{card.title}</h4>
                  <p className="text-[0.7rem] uppercase tracking-wider text-ink-faint font-body">{card.sub}</p>
                </div>
              ))}
            </div>

            <div className="max-w-[700px] mx-auto">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 lg:left-6 flex items-center pointer-events-none text-ink/20">
                  <Layout size={20} className="scale-75 lg:scale-100" />
                </div>
                <div className="w-full bg-[#FDFCF9] border border-ink/10 rounded-full pl-12 lg:pl-16 pr-4 lg:pr-6 py-4 lg:py-5 shadow-sm flex items-center justify-between overflow-hidden">
                  <span className="opacity-40 font-bn text-[0.85rem] lg:text-[1.1rem] truncate mr-4">{t('chat.placeholder')}</span>
                  <Link to="/chat" className="shrink-0">
                    <button className="px-5 lg:px-8 py-2 lg:py-3 bg-accent text-cream rounded-full font-bn font-bold hover:bg-ink transition-all shadow-lg interactive text-sm lg:text-base">
                      {t('chat.send')}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
