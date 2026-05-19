import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <div className="font-display text-[8rem] md:text-[12rem] font-black text-ink/5 leading-none select-none">
          404
        </div>
        <h1 className="font-bn text-2xl md:text-4xl font-black text-ink -mt-8 md:-mt-12 mb-4">
          পেজটি পাওয়া যায়নি
        </h1>
        <p className="font-bn text-ink-muted mb-8">
          আপনি যে পেজটি খুঁজছেন তা হয়তো সরিয়ে ফেলা হয়েছে বা কখনোই ছিল না।
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-cream rounded-2xl font-bn font-bold hover:bg-accent transition-all shadow-xl"
          >
            <Home className="w-4 h-4" />
            হোমপেজে যান
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-ink border border-ink/10 rounded-2xl font-bn font-bold hover:bg-cream transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            পিছনে যান
          </button>
        </div>
      </motion.div>
    </div>
  );
};
