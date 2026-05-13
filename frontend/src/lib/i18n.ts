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
        badge: 'NDG 2025 Grounded',
        todays_goal: 'Today\'s Goal',
        rui_fish: 'Rui Fish',
        protein_source: '126g Protein Source'
      },
      chat: {
        title: 'DesiDiet AI',
        experience_intelligence: 'Experience the Intelligence',
        talk_to_ai: 'Talk to',
        ai_name: 'DesiDiet AI',
        active_status: 'Active Assistant',
        clear_chat: 'Clear Chat',
        greeting_user: 'Hi, {{name}}',
        how_can_i_help: 'How can I help you today?',
        description_short: 'Ask any question about your nutrition, diet, and health.',
        typing: 'is typing...',
        input_placeholder: 'Ask DesiDiet AI...',
        footer_secure: '© 2026 DesiDiet AI • Based on NDG 2025',
        footer_disclaimer: '⚠️ AI Nutrition Assistant. For serious health issues, consult a registered dietitian or physician.',
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
          title: 'Powered by Real Science',
          desc: 'Our system uses Neo4j GraphRAG technology — linking food, nutrition, disease, and dietary rules. Verified by NDG Bangladesh 2025.'
        },
        ch2: {
          num: '02 / Conversational',
          title: 'Your Dietitian Friend',
          desc: 'No complex forms — collects info through natural conversation. Remembers your blood sugar, weight, and preferences.'
        },
        ch3: {
          num: '03 / Precision',
          title: 'Precise Nutrition Math',
          desc: 'NDG 2025 Table 20 formulas for IBW calculation. Scientific macro splitting: 15% Protein, 55% Carbs, 30% Fat.'
        },
        ch4: {
          num: '04 / Planning',
          title: 'Weekly Meal Plans',
          desc: 'Different food every day, same nutrition value. At least 4 days of fish as per NDG 2025 recommendations.'
        }
      },
      features: {
        eyebrow: 'What We Offer',
        title_1: 'Smart.',
        title_2: 'Local.',
        title_3: 'Yours.',
        desc: 'Your body, your disease, your preference — everything is considered to create your personal food plan.',
        f1_title: 'Bangladeshi Food, Always',
        f1_desc: 'Hilsa, Rui, Dal-Bhat, Leafy Greens — suggestions from a complete local food list.',
        f2_title: 'Disease-Specific Nutrition',
        f2_desc: 'Special diet rules for 11 diseases including Diabetes, Hypertension, and CKD.',
        f3_title: 'Fully Personalized',
        f3_desc: 'Calorie calculation using NDG 2025 formulas based on your age, weight, and activity.',
        f4_title: 'GraphRAG + LLM Tech',
        f4_desc: 'Scientific advice created with the combination of Neo4j Knowledge Graph and advanced AI models.'
      },
      stats: {
        s1: 'Special diet rules for 11 diseases',
        s2: 'Bangladeshi food nutrition database',
        s3: 'kcal average adult Bangladeshi target',
        s4: 'NDG 2025 based scientific advice'
      },
      diseases: {
        eyebrow: 'Designed for',
        eyebrow_span: 'your',
        eyebrow_condition: 'condition',
        desc: 'Every problem in your body is different. We have encoded rules directly from the disease-specific chapters of NDG 2025 — so you get accurate, safe advice.',
        d1: { title: 'Diabetes', desc: 'Low-GI food, high fiber, 5-6 small meals. Avoid sugar and sweets completely.', tag: 'Blood Sugar Control' },
        d2: { title: 'Hypertension', desc: 'Low salt (less than 5g/day), potassium-rich food, Omega-3 from Hilsa fish.', tag: 'Blood Pressure Control' },
        d3: { title: 'CKD', desc: 'Low protein (0.6-0.75g/kg), potassium control, limiting phosphorus.', tag: 'Protein Control' },
        d4: { title: 'Obesity', desc: '500 kcal less daily, high fiber, avoid fried food, more vegetables.', tag: 'Weight Control' },
        d5: { title: 'Heart Disease', desc: 'Hilsa fish, mustard oil, avoid ghee-dalda, colorful greens & fruits.', tag: 'Heart Protection' },
        d6: { title: 'Hypothyroidism', desc: 'Iodized salt, sea fish, cooked cabbage-cauliflower.', tag: 'Thyroid Protection' }
      },
      cta: {
        bg_text: 'Get Started',
        eyebrow: 'Your health journey starts today',
        title_1: 'Your Nutrition',
        title_2: 'Your Health,',
        title_3: 'Your Rules',
        desc: 'Bangladeshi Food, Bangladeshi Science — for your life.',
        button: 'Start for Free',
        link: 'View System'
      },
      about_hero: {
        title_1: 'The Science',
        title_2: 'of Nutrition',
        desc: 'Created with the combination of Bangladeshi soil\'s nutrition and modern science — DesiDiet AI. We don\'t just count calories, we weave stories of good health.',
        scroll: 'Scroll to Explore'
      },
      manifesto: {
        bg_text: '2025',
        title_1: 'Our',
        title_2: 'Manifesto',
        desc: 'We believe healthy food doesn\'t just mean expensive recipes; rather it\'s the right balance of our familiar Bangladeshi foods.',
        m1: { title: 'Science', fullTitle: 'Science Based Advice', desc: 'Advice based on WHO and NDG 2025.', fullDesc: 'Every piece of our advice is created based on the World Health Organization (WHO) and Bangladesh\'s National Dietary Guidelines (NDG 2025).' },
        m2: { title: 'AI', fullTitle: 'AI & GraphRAG', desc: 'Proper use of advanced GraphRAG technology.', fullDesc: 'We are not just a simple chatbot. We use advanced GraphRAG technology, which creates the right link between your physical condition and food database.' },
        m3: { title: 'Everyone', fullTitle: 'Health for Everyone', desc: 'Accurate health information in easy language.', fullDesc: 'From city to village — our main goal is to deliver health information in easy language to all people.' }
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
        badge: 'NDG ২০২৫ গ্রাউন্ডেড',
        todays_goal: 'আজকের লক্ষ্য',
        rui_fish: 'রুই মাছ',
        protein_source: '১২৬g প্রোটিন উৎস'
      },
      chat: {
        title: 'দেশিডায়েট এআই',
        experience_intelligence: 'বুদ্ধিমত্তার অভিজ্ঞতা নিন',
        talk_to_ai: 'দেশিডায়েট এআই-এর সাথে কথা বলুন',
        ai_name: 'দেশিডায়েট এআই',
        active_status: 'সক্রিয় অ্যাসিস্ট্যান্ট',
        clear_chat: 'চ্যাট মুছুন',
        greeting_user: 'হাই, {{name}}',
        how_can_i_help: 'আমি আপনাকে আজ কীভাবে সাহায্য করতে পারি?',
        description_short: 'আপনার পুষ্টি, ডায়েট এবং স্বাস্থ্য সংক্রান্ত যেকোনো প্রশ্ন জিজ্ঞাসা করুন।',
        typing: 'টাইপ করছে...',
        input_placeholder: 'দেশিডায়েট এআই কে জিজ্ঞাসা করুন...',
        footer_secure: '© ২০২৬ দেশিডায়েট এআই • NDG ২০২৫ ভিত্তিক',
        footer_disclaimer: '⚠️ এটি একটি এআই পুষ্টি সহায়ক। গুরুতর স্বাস্থ্য সমস্যায় অবশ্যই একজন নিবন্ধিত পুষ্টিবিদ বা চিকিৎসকের পরামর্শ নিন।',
        greeting: 'হাই, আমি আপনার দেশিডায়েট এআই',
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
          title: 'নলেজ গ্রাফ',
          desc: 'আমাদের সিস্টেম Neo4j GraphRAG প্রযুক্তি ব্যবহার করে — খাবার, পুষ্টি, রোগ এবং ডায়েটারি নিয়মের মধ্যে সম্পর্ক স্থাপন করে। প্রতিটি পরামর্শ সরাসরি NDG Bangladesh 2025 থেকে যাচাইকৃত।'
        },
        ch2: {
          num: '02 / Conversational',
          title: 'বন্ধুর মতো',
          desc: 'জটিল ফর্ম নয় — স্বাভাবিক কথোপকথনে আপনার তথ্য সংগ্রহ করে। আপনার রক্তের শর্করা, ওজন, পছন্দ-অপছন্দ সব মনে রাখে। প্রতিদিন আপডেট হয়, প্রতিদিন নতুন পরামর্শ।'
        },
        ch3: {
          num: '03 / Precision',
          title: 'সঠিক ক্যালোরি',
          desc: 'NDG 2025-এর Table 20 ফর্মুলা ব্যবহার করে আপনার আদর্শ শরীরের ওজন (IBW) অনুযায়ী ক্যালোরি নির্ধারণ। প্রোটিন ১৫%, শর্করা ৫৫%, চর্বি ৩০% — বৈজ্ঞানিক ম্যাক্রো বিভাজন।'
        },
        ch4: {
          num: '04 / Planning',
          title: 'সাত দিনের',
          desc: 'প্রতিদিন ভিন্ন খাবার, কিন্তু একই পুষ্টিমান। সপ্তাহে কমপক্ষে ৪ দিন মাছ — NDG 2025-এর সুপারিশ অনুযায়ী। শুক্রবারে একটু বিশেষ — সংস্কৃতির সাথে স্বাস্থ্যের মেলবন্ধন।'
        }
      },
      features: {
        eyebrow: 'What We Offer',
        title_1: 'Smart.',
        title_2: 'Local.',
        title_3: 'Yours.',
        desc: 'আপনার শরীর, আপনার অসুখ, আপনার পছন্দ — সব কিছু বিবেচনা করে তৈরি হয় আপনার ব্যক্তিগত খাদ্য পরিকল্পনা।',
        f1_title: 'বাংলাদেশি খাবার, সবসময়',
        f1_desc: 'ইলিশ, রুই, ডাল-ভাত, শাকসবজি — সম্পূর্ণ স্থানীয় খাবারের তালিকা থেকে পরামর্শ।',
        f2_title: 'রোগ-ভিত্তিক পুষ্টি পরিকল্পনা',
        f2_desc: 'ডায়াবেটিস, উচ্চ রক্তচাপ, কিডনি রোগ সহ ১১টি রোগের জন্য বিশেষ ডায়েট রুলস।',
        f3_title: 'সম্পূর্ণ ব্যক্তিগতকৃত',
        f3_desc: 'আপনার বয়স, ওজন, উচ্চতা ও কার্যকলাপ অনুযায়ী NDG 2025 ফর্মুলায় ক্যালোরি হিসাব।',
        f4_title: 'GraphRAG + LLM প্রযুক্তি',
        f4_desc: 'Neo4j নলেজ গ্রাফ এবং উন্নত এআই মডেলের সমন্বয়ে তৈরি বিজ্ঞানসম্মত পরামর্শ।'
      },
      stats: {
        s1: 'রোগের জন্য বিশেষ ডায়েট রুলস',
        s2: 'বাংলাদেশি খাবারের পুষ্টি ডেটাবেজ',
        s3: 'kcal গড় প্রাপ্তবয়স্ক বাংলাদেশি লক্ষ্যমাত্রা',
        s4: 'NDG 2025 ভিত্তিক বৈজ্ঞানিক পরামর্শ'
      },
      diseases: {
        eyebrow: 'Designed for',
        eyebrow_span: 'your',
        eyebrow_condition: 'condition',
        desc: 'আপনার শরীরের প্রতিটি সমস্যা আলাদা। আমরা NDG 2025-এর রোগ-নির্দিষ্ট অধ্যায় থেকে সরাসরি নিয়ম এনকোড করেছি — যাতে আপনি পান সঠিক, নিরাপদ পরামর্শ।',
        d1: { title: 'ডায়াবেটিস', desc: 'লো-জিআই খাবার, উচ্চ আঁশ, ৫-৬ বার ছোট ছোট খাবার। চিনি এবং মিষ্টি সম্পূর্ণ এড়িয়ে চলা।', tag: 'রক্তে শর্করা নিয়ন্ত্রণ' },
        d2: { title: 'উচ্চ রক্তচাপ', desc: 'কম লবণ (দিনে ৫g-এর কম), পটাশিয়াম সমৃদ্ধ খাবার, ইলিশ মাছের ওমেগা-৩।', tag: 'রক্তচাপ নিয়ন্ত্রণ' },
        d3: { title: 'কিডনি রোগ', desc: 'কম প্রোটিন (০.৬-০.৭৫g/kg), পটাশিয়াম নিয়ন্ত্রণ, ফসফরাস সীমিত করা।', tag: 'প্রোটিন নিয়ন্ত্রণ' },
        d4: { title: 'স্থূলতা', desc: 'দৈনিক ৫০০ kcal কম, উচ্চ আঁশ, ভাজাপোড়া এড়িয়ে চলা, শাকসবজি বেশি।', tag: 'ওজন নিয়ন্ত্রণ' },
        d5: { title: 'হৃদরোগ', desc: 'ইলিশ মাছ, সরিষার তেল, ঘি-ডালডা বর্জন, রঙিন শাকসবজি ও ফলমূল।', tag: 'হার্ট সুরক্ষা' },
        d6: { title: 'হাইপোথাইরয়েড', desc: 'আয়োডিনযুক্ত লবণ, সামুদ্রিক মাছ, রান্না করা বাঁধাকপি-ফুলকপি।', tag: 'থাইরয়েড সুরক্ষা' }
      },
      cta: {
        bg_text: 'শুরু করুন',
        eyebrow: 'আপনার সুস্বাস্থ্য শুরু হোক আজ থেকে',
        title_1: 'আপনার পুষ্টি',
        title_2: 'Your Health,',
        title_3: 'Your Rules',
        desc: 'বাংলাদেশের খাবার, বাংলাদেশের বিজ্ঞান — আপনার জীবনের জন্য।',
        button: 'বিনামূল্যে শুরু করুন',
        link: 'সিস্টেম দেখুন'
      },
      about_hero: {
        title_1: 'The Science',
        title_2: 'of Nutrition',
        desc: 'বাংলাদেশের মাটির পুষ্টি আর আধুনিক বিজ্ঞানের মেলবন্ধনে তৈরি—দেশিডায়েট এআই। আমরা শুধু ক্যালোরি গুনি না, আমরা সুস্বাস্থ্যের গল্প বুনি।',
        scroll: 'স্ক্রল করুন'
      },
      manifesto: {
        bg_text: '২০২৫',
        title_1: 'Our',
        title_2: 'Manifesto',
        desc: 'আমরা বিশ্বাস করি, স্বাস্থ্যকর খাবার মানেই কেবল নামী-দামী রেসিপি নয়; বরং আমাদের পরিচিত বাংলাদেশি খাবারের সঠিক ভারসাম্য।',
        m1: { title: 'বিজ্ঞান', fullTitle: 'বিজ্ঞান ভিত্তিক পরামর্শ', desc: 'WHO এবং NDG 2025 ভিত্তিক পরামর্শ।', fullDesc: 'বিশ্ব স্বাস্থ্য সংস্থা (WHO) এবং বাংলাদেশের জাতীয় পুষ্টি নির্দেশিকা (NDG 2025) এর ওপর ভিত্তি করে আমাদের প্রতিটি পরামর্শ তৈরি করা হয়েছে।' },
        m2: { title: 'এআই', fullTitle: 'কৃত্রিম বুদ্ধিমত্তা ও GraphRAG', desc: 'উন্নত GraphRAG প্রযুক্তির সঠিক ব্যবহার।', fullDesc: 'আমরা শুধু সাধারণ চ্যাটবট নই। আমরা ব্যবহার করি উন্নত GraphRAG প্রযুক্তি, যা আপনার শারীরিক অবস্থা ও খাবারের ডেটাবেজের মধ্যে সঠিক যোগসূত্র তৈরি করে।' },
        m3: { title: 'সবাই', fullTitle: 'সবার জন্য স্বাস্থ্য', desc: 'সহজবোধ্য ভাষায় সঠিক স্বাস্থ্য তথ্য।', fullDesc: 'শহর থেকে গ্রাম—সব মানুষের জন্য সহজবোধ্য ভাষায় স্বাস্থ্য তথ্য পৌঁছে দেওয়াই আমাদের মূল লক্ষ্য।' }
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
