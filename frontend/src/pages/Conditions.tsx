import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Info, Scale, HeartPulse, FileText, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Conditions = () => {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  return (
    <div className="bg-cream min-h-screen pt-24 pb-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/5 text-accent rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-accent/10">
            <Scale size={14} />
            Legal & Medical Guidelines
          </div>
          <h1 className="editorial-heading text-4xl md:text-6xl text-ink mb-6">
            {isBn ? 'শর্তাবলী ও ডিসক্লেমার' : 'Conditions & Disclaimer'}
          </h1>
          <p className="font-bn text-lg md:text-xl text-ink-muted max-w-2xl mx-auto leading-relaxed">
            {isBn 
              ? 'দেশিডায়েট এআই ব্যবহারের পূর্বে আমাদের নির্দেশিকা এবং শর্তাবলী দয়া করে মনোযোগ দিয়ে পড়ুন।' 
              : 'Please read our guidelines and conditions carefully before using DesiDiet AI.'}
          </p>
        </motion.div>

        {/* Major Disclaimer Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-accent text-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl mb-12 relative overflow-hidden group"
        >
          <div className="absolute top-[-10%] right-[-5%] opacity-10 group-hover:rotate-12 transition-transform duration-700">
            <ShieldAlert size={300} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <ShieldAlert size={24} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                {isBn ? 'গুরুত্বপূর্ণ সতর্কবার্তা' : 'Important Disclaimer'}
              </h2>
            </div>
            
            <p className="font-bn text-xl md:text-2xl leading-relaxed mb-8 font-medium">
              {isBn 
                ? 'এটি একটি এআই পুষ্টি সহায়ক। এটি কোনো পেশাদার চিকিৎসা পরামর্শ, রোগ নির্ণয় বা চিকিৎসার বিকল্প নয়। গুরুতর স্বাস্থ্য সমস্যা, গর্ভাবস্থা বা দীর্ঘমেয়াদী রোগের ক্ষেত্রে অবশ্যই একজন নিবন্ধিত পুষ্টিবিদ বা চিকিৎসকের পরামর্শ নিন।'
                : 'This is an AI nutrition assistant. It is not a substitute for professional medical advice, diagnosis, or treatment. For serious health issues, pregnancy, or chronic diseases, always consult a registered dietitian or physician.'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { bn: 'পেশাদার পরামর্শের বিকল্প নয়', en: 'Not a medical substitute' },
                { bn: 'জরুরী অবস্থায় ব্যবহার করবেন না', en: 'Not for emergencies' },
                { bn: 'তথ্য যাচাই করে নিন', en: 'Verify all information' },
                { bn: 'চিকিৎসকের সাথে কথা বলুন', en: 'Consult your doctor' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <span className="font-bn text-sm font-bold uppercase tracking-wide">{isBn ? item.bn : item.en}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Section 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-[2rem] border border-ink/5 shadow-sm"
          >
            <div className="w-12 h-12 bg-cream rounded-xl flex items-center justify-center text-ink mb-6">
              <Info size={24} />
            </div>
            <h3 className="font-bn font-black text-xl text-ink mb-4">
              {isBn ? 'তথ্যের নির্ভুলতা' : 'Information Accuracy'}
            </h3>
            <p className="font-bn text-ink-muted leading-relaxed text-sm">
              {isBn 
                ? 'আমাদের এআই মডেলটি সাধারণ পুষ্টি বিজ্ঞানের উপর ভিত্তি করে তথ্য প্রদান করে। যদিও আমরা তথ্যের নির্ভুলতা বজায় রাখার চেষ্টা করি, তবুও এআই মাঝে মাঝে ভুল বা অসম্পূর্ণ তথ্য দিতে পারে। কোনো খাদ্য পরিকল্পনা অনুসরণ করার আগে তা আপনার ব্যক্তিগত স্বাস্থ্যের সাথে সামঞ্জস্যপূর্ণ কি না তা যাচাই করে নিন।'
                : 'Our AI model provides information based on general nutritional science. While we strive for accuracy, AI can occasionally provide incorrect or incomplete information. Always verify if a meal plan is compatible with your personal health before following it.'}
            </p>
          </motion.div>

          {/* Section 2 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-8 rounded-[2rem] border border-ink/5 shadow-sm"
          >
            <div className="w-12 h-12 bg-cream rounded-xl flex items-center justify-center text-ink mb-6">
              <HeartPulse size={24} />
            </div>
            <h3 className="font-bn font-black text-xl text-ink mb-4">
              {isBn ? 'ব্যক্তিগত দায়বদ্ধতা' : 'Personal Responsibility'}
            </h3>
            <p className="font-bn text-ink-muted leading-relaxed text-sm">
              {isBn 
                ? 'দেশিডায়েট এআই ব্যবহারের মাধ্যমে আপনি স্বীকার করছেন যে আপনার স্বাস্থ্যের সমস্ত সিদ্ধান্ত আপনার নিজস্ব। এআই-এর পরামর্শের ফলে সরাসরি বা পরোক্ষভাবে কোনো শারীরিক সমস্যার জন্য কর্তৃপক্ষ দায়ী থাকবে না। এলার্জি বা নির্দিষ্ট ওষুধের পার্শ্বপ্রতিক্রিয়া সম্পর্কে নিজে সচেতন থাকুন।'
                : 'By using DesiDiet AI, you acknowledge that all health decisions are your own. The authorities will not be held responsible for any direct or indirect health issues resulting from AI advice. Be aware of allergies or side effects of specific medications.'}
            </p>
          </motion.div>
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center p-12 bg-white rounded-[3rem] border border-ink/5 shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-gold" />
          <FileText size={40} className="mx-auto mb-6 text-accent opacity-20" />
          <p className="font-bn text-ink-muted text-sm max-w-xl mx-auto italic mb-8">
            {isBn 
              ? 'আমরা চাই বাংলাদেশের প্রতিটি মানুষ সচেতনভাবে স্বাস্থ্যকর জীবনযাপন করুক। সঠিক তথ্যের সাথে চিকিৎসকের পরামর্শই সুস্থতার আসল চাবিকাঠি।'
              : 'We want every person in Bangladesh to lead a healthy lifestyle consciously. Correct information combined with medical advice is the key to true well-being.'}
          </p>
          <div className="text-[0.65rem] uppercase tracking-[0.4em] font-body font-black text-ink-faint">
            © 2026 DesiDiet AI • Powered by NDG 2025
          </div>
        </motion.div>
      </div>
    </div>
  );
};
