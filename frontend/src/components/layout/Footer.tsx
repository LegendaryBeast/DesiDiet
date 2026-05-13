import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-ink text-cream px-6 md:px-12 lg:px-24 py-16 lg:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 lg:mb-20 pb-16 lg:pb-20 border-b border-white/10">
        <div>
          <Link to="/" className="font-bn text-[1.5rem] font-bold tracking-[0.02em] text-cream mb-6 block">
            দেশি<span className="text-accent-light">ডায়েট</span> এআই
          </Link>
          <p className="font-bn text-[0.85rem] leading-[1.8] text-white/50 max-w-[240px]">
            বাংলাদেশের মানুষের জন্য, বাংলাদেশের বিজ্ঞান দিয়ে তৈরি একটি পুষ্টি সহায়ক।
          </p>
        </div>

        <div>
          <h4 className="text-[0.65rem] lg:text-[0.68rem] tracking-[0.15em] uppercase text-white/40 mb-6 lg:mb-8 font-body">Product</h4>
          <ul className="flex flex-col gap-3">
            <li><a href="#features" className="font-bn text-[0.85rem] text-white/60 hover:text-white transition-colors">বৈশিষ্ট্য</a></li>
            <li><Link to="/meal-plan" className="font-bn text-[0.85rem] text-white/60 hover:text-white transition-colors">খাবার পরিকল্পনা</Link></li>
            <li><Link to="/health-log" className="font-bn text-[0.85rem] text-white/60 hover:text-white transition-colors">স্বাস্থ্য লগ</Link></li>
            <li><a href="#" className="font-bn text-[0.85rem] text-white/60 hover:text-white transition-colors">রিপোর্ট</a></li>
            <li><Link to="/conditions" className="font-bn text-[0.85rem] text-white/60 hover:text-white transition-colors">শর্তাবলী ও ডিসক্লেমার</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[0.65rem] lg:text-[0.68rem] tracking-[0.15em] uppercase text-white/40 mb-6 lg:mb-8 font-body">Science</h4>
          <ul className="flex flex-col gap-3">
            <li><a href="#" className="font-bn text-[0.85rem] text-white/60 hover:text-white transition-colors">NDG 2025</a></li>
            <li><a href="#" className="font-bn text-[0.85rem] text-white/60 hover:text-white transition-colors">GraphRAG</a></li>
            <li><a href="#" className="font-bn text-[0.85rem] text-white/60 hover:text-white transition-colors">Neo4j</a></li>
            <li><a href="#" className="font-bn text-[0.85rem] text-white/60 hover:text-white transition-colors">LLM Layer</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[0.65rem] lg:text-[0.68rem] tracking-[0.15em] uppercase text-white/40 mb-6 lg:mb-8 font-body">Contact</h4>
          <ul className="flex flex-col gap-3">
            <li><a href="#" className="font-bn text-[0.85rem] text-white/60 hover:text-white transition-colors">সাপোর্ট</a></li>
            <li><a href="#" className="font-bn text-[0.85rem] text-white/60 hover:text-white transition-colors">API</a></li>
            <li><a href="#" className="font-bn text-[0.85rem] text-white/60 hover:text-white transition-colors">GitHub</a></li>
            <li><a href="#" className="font-bn text-[0.85rem] text-white/60 hover:text-white transition-colors">Blog</a></li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="font-bn text-[0.7rem] lg:text-[0.75rem] text-white/30">
          © 2026 দেশিডায়েট এআই · NDG 2025 ভিত্তিক
        </div>
        <div className="font-bn text-[0.68rem] lg:text-[0.72rem] text-white/30 max-w-[450px] lg:text-right leading-[1.6]">
          ⚠️ এটি একটি এআই পুষ্টি সহায়ক। গুরুতর স্বাস্থ্য সমস্যায় অবশ্যই একজন নিবন্ধিত পুষ্টিবিদ বা চিকিৎসকের পরামর্শ নিন।
        </div>
      </div>
    </footer>
  );
};
