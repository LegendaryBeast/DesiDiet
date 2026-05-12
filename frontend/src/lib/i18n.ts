import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        logo: 'Desi',
        logo_span: 'Diet',
        features: 'Features',
        about: 'About',
        conditions: 'Conditions',
        start: 'Get Started'
      },
      hero: {
        eyebrow: 'Powered by NDG Bangladesh 2025',
        title_bn: 'DesiDiet',
        title_en_1: 'Your Personal',
        title_en_2: 'Nutrition',
        title_en_3: 'Companion',
        desc: 'A personalized AI nutrition assistant specially developed for the people of Bangladesh — creating daily food plans tailored to your health, taste, and local cuisine.',
        cta_primary: 'Start Today',
        cta_ghost: 'Learn More',
        badge: 'NDG 2025 Grounded'
      },
      chat: {
        title: 'DesiDiet AI',
        ai_name: 'DesiDiet AI',
        active_status: 'Active Assistant',
        clear_chat: 'Clear Chat',
        greeting_user: 'Hi, {{name}}',
        how_can_i_help: 'How can I help you today?',
        description_short: 'Ask any question about your nutrition, diet, and health.',
        typing: 'is typing...',
        input_placeholder: 'Ask DesiDiet AI...',
        footer_secure: 'Secure AI Architecture',
        footer_disclaimer: 'Medical Disclaimer applies',
        greeting: 'Hi, I am your DesiDiet AI',
        subtitle: 'Can I help you with your nutrition today?',
        placeholder: 'Ask me anything about your diet...',
        send: 'Send',
        back: 'Back to Home',
        suggestions: {
          title1: 'Diet',
          sub1: 'Today\'s Meal Plan',
          title2: 'Report',
          sub2: 'Your Health Status',
          title3: 'Calories',
          sub3: 'Nutrient Calculation'
        }
      },
      about: {
        ch1: {
          num: '01 / Scientific',
          titleBn: 'Knowledge Graph',
          titleEn: 'Powered by Real Science',
          desc: 'Our system uses Neo4j GraphRAG technology — linking food, nutrition, disease, and dietary rules. Verified by NDG Bangladesh 2025.'
        },
        ch2: {
          num: '02 / Conversational',
          titleBn: 'Like a Friend',
          titleEn: 'Your Dietitian Friend',
          desc: 'No complex forms — collects info through natural conversation. Remembers your blood sugar, weight, and preferences.'
        },
        ch3: {
          num: '03 / Precision',
          titleBn: 'Precise Calories',
          titleEn: 'Precise Nutrition Math',
          desc: 'NDG 2025 Table 20 formulas for IBW calculation. Scientific macro splitting: 15% Protein, 55% Carbs, 30% Fat.'
        },
        ch4: {
          num: '04 / Planning',
          titleBn: 'Seven Days',
          titleEn: 'Weekly Meal Plans',
          desc: 'Different food every day, same nutrition value. At least 4 days of fish as per NDG 2025 recommendations.'
        }
      }
    }
  },
  bn: {
    translation: {
      nav: {
        logo: 'দেশি',
        logo_span: 'ডায়েট',
        features: 'বৈশিষ্ট্য',
        about: 'আমাদের সম্পর্কে',
        conditions: 'শর্তাবলী',
        start: 'শুরু করুন'
      },
      hero: {
        eyebrow: 'NDG বাংলাদেশ ২০২৫ দ্বারা পরিচালিত',
        title_bn: 'দেশিডায়েট',
        title_en_1: 'আপনার ব্যক্তিগত',
        title_en_2: 'পুষ্টি',
        title_en_3: 'সঙ্গী',
        desc: 'বাংলাদেশের মানুষের জন্য বিশেষভাবে তৈরি একটি এআই পুষ্টি সহায়ক — যা আপনার স্বাস্থ্য, রুচি এবং স্থানীয় খাবারের কথা মাথায় রেখে প্রতিদিনের খাদ্য পরিকল্পনা তৈরি করে।',
        cta_primary: 'আজই শুরু করুন',
        cta_ghost: 'আরো জানুন',
        badge: 'NDG ২০২৫ গ্রাউন্ডেড'
      },
      chat: {
        title: 'দেশিডায়েট এআই',
        ai_name: 'দেশিডায়েট এআই',
        active_status: 'সক্রিয় অ্যাসিস্ট্যান্ট',
        clear_chat: 'চ্যাট মুছুন',
        greeting_user: 'হাই, {{name}}',
        how_can_i_help: 'আমি আপনাকে আজ কীভাবে সাহায্য করতে পারি?',
        description_short: 'আপনার পুষ্টি, ডায়েট এবং স্বাস্থ্য সংক্রান্ত যেকোনো প্রশ্ন জিজ্ঞাসা করুন।',
        typing: 'টাইপ করছে...',
        input_placeholder: 'দেশিডায়েট এআই কে জিজ্ঞাসা করুন...',
        footer_secure: 'নিরাপদ এআই আর্কিটেকচার',
        footer_disclaimer: 'মেডিক্যাল ডিসক্লেমার প্রযোজ্য',
        greeting: 'নমস্কার, আমি আপনার দেশিডায়েট এআই',
        subtitle: 'আজ আপনাকে কীভাবে সাহায্য করতে পারি?',
        placeholder: 'আপনার খাদ্য তালিকা সম্পর্কে কিছু জিজ্ঞাসা করুন...',
        send: 'পাঠান',
        back: 'হোমে ফিরে যান',
        suggestions: {
          title1: 'ডায়েট',
          sub1: 'আজকের মিল প্ল্যান',
          title2: 'রিপোর্ট',
          sub2: 'আপনার শারীরিক অবস্থা',
          title3: 'ক্যালোরি',
          sub3: 'পুষ্টির হিসাব নিকাশ'
        }
      },
      about: {
        ch1: {
          num: '01 / Scientific',
          titleBn: 'নলেজ গ্রাফ',
          titleEn: 'Powered by Real Science',
          desc: 'আমাদের সিস্টেম Neo4j GraphRAG প্রযুক্তি ব্যবহার করে — খাবার, পুষ্টি, রোগ এবং ডায়েটারি নিয়মের মধ্যে সম্পর্ক স্থাপন করে। প্রতিটি পরামর্শ সরাসরি National Dietary Guidelines Bangladesh 2025 থেকে যাচাইকৃত।'
        },
        ch2: {
          num: '02 / Conversational',
          titleBn: 'বন্ধুর মতো',
          titleEn: 'Your Dietitian Friend',
          desc: 'জটিল ফর্ম নয় — স্বাভাবিক কথোপকথনে আপনার তথ্য সংগ্রহ করে। আপনার রক্তের শর্করা, ওজন, পছন্দ-অপছন্দ সব মনে রাখে। প্রতিদিন আপডেট হয়, প্রতিদিন নতুন পরামর্শ।'
        },
        ch3: {
          num: '03 / Precision',
          titleBn: 'সঠিক ক্যালোরি',
          titleEn: 'Precise Nutrition Math',
          desc: 'NDG 2025-এর Table 20 ফর্মুলা ব্যবহার করে আপনার আদর্শ শরীরের ওজন (IBW) অনুযায়ী ক্যালোরি নির্ধারণ। প্রোটিন ১৫%, শর্করা ৫৫%, চর্বি ৩০% — বৈজ্ঞানিক ম্যাক্রো বিভাজন।'
        },
        ch4: {
          num: '04 / Planning',
          titleBn: 'সাত দিনের',
          titleEn: 'Weekly Meal Plans',
          desc: 'প্রতিদিন ভিন্ন খাবার, কিন্তু একই পুষ্টিমান। সপ্তাহে কমপক্ষে ৪ দিন মাছ — NDG 2025-এর সুপারিশ অনুযায়ী। শুক্রবারে একটু বিশেষ — সংস্কৃতির সাথে স্বাস্থ্যের মেলবন্ধন।'
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'bn',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
