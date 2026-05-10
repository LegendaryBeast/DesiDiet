"""
Dietary Rules extracted from the National Dietary Guidelines for Bangladesh 2025 (NDG 2025).
Covers all 11 disease-specific guidelines + age/physiological conditions.
These are used to build Condition and DietaryRule nodes in the Knowledge Graph.
"""

NDG_DIETARY_RULES = [
    # ========== DIABETES MELLITUS (Guideline 2, Section 3) ==========
    {"condition": "Diabetes", "rule_type": "AVOID", "group_target": "Sugars & Sweets",
     "reason_en": "Restrict refined sugar, jaggery, honey, condensed milk, chocolate - spike blood glucose.",
     "reason_bn": "চিনি, গুড়, মধু, ঘনীভূত দুধ, চকলেট সীমিত করুন - রক্তে গ্লুকোজ বাড়ায়।"},
    {"condition": "Diabetes", "rule_type": "AVOID", "group_target": "Roots & Tubers",
     "reason_en": "Limit potato, sweet potato, sago, arrowroot - high GI starchy foods.",
     "reason_bn": "আলু, মিষ্টি আলু, সাগু সীমিত করুন - উচ্চ জিআই।"},
    {"condition": "Diabetes", "rule_type": "PREFER", "group_target": "Leafy Vegetables",
     "reason_en": "Very low calorie and high fiber, excellent for glycemic control.",
     "reason_bn": "খুব কম ক্যালরি এবং উচ্চ আঁশ, গ্লাইসেমিক নিয়ন্ত্রণের জন্য চমৎকার।"},
    {"condition": "Diabetes", "rule_type": "PREFER", "group_target": "Pulses & Legumes",
     "reason_en": "Low GI complex carbohydrates, 25-30g fiber/day recommended.",
     "reason_bn": "কম জিআই জটিল শর্করা, দৈনিক ২৫-৩০ গ্রাম আঁশ প্রস্তাবিত।"},
    {"condition": "Diabetes", "rule_type": "PREFER", "group_target": "Fish & Seafood",
     "reason_en": "Protein 10-20% of energy, vegetable+fish protein preferred.",
     "reason_bn": "প্রোটিন শক্তির ১০-২০%, মাছ ও উদ্ভিদ প্রোটিন পছন্দনীয়।"},
    {"condition": "Diabetes", "rule_type": "PREFER", "group_target": "Vegetables",
     "reason_en": "Non-starchy vegetables: spinach, cabbage, broccoli, cauliflower, okra, cucumber.",
     "reason_bn": "স্টার্চবিহীন সবজি: পালং, বাঁধাকপি, ব্রকলি, ফুলকপি, ঢেঁড়স, শসা।"},

    # ========== HYPERTENSION (Guideline 7, Section 3) ==========
    {"condition": "Hypertension", "rule_type": "AVOID", "group_target": "Spices & Condiments",
     "reason_en": "Sodium <1.5g/day. Reduce salt to less than 3/4 tsp/day.",
     "reason_bn": "সোডিয়াম <১.৫ গ্রাম/দিন। লবণ ৩/৪ চা চামচের কম।"},
    {"condition": "Hypertension", "rule_type": "PREFER", "group_target": "Fruits",
     "reason_en": "DASH diet: rich in potassium, calcium 1000-2000mg/day from fruits & dairy.",
     "reason_bn": "DASH ডায়েট: পটাশিয়াম সমৃদ্ধ, ক্যালসিয়াম ১০০০-২০০০ মিগ্রা/দিন।"},
    {"condition": "Hypertension", "rule_type": "PREFER", "group_target": "Pulses & Legumes",
     "reason_en": "Encourage nuts and legumes daily per DASH guidelines.",
     "reason_bn": "DASH নির্দেশিকা অনুযায়ী প্রতিদিন বাদাম ও ডাল উৎসাহিত।"},
    {"condition": "Hypertension", "rule_type": "PREFER", "group_target": "Milk & Dairy",
     "reason_en": "Low-fat milk products increase calcium and magnesium intake.",
     "reason_bn": "কম চর্বিযুক্ত দুগ্ধজাত ক্যালসিয়াম ও ম্যাগনেসিয়াম বাড়ায়।"},

    # ========== OBESITY / WEIGHT LOSS (Guideline 1, Section 3) ==========
    {"condition": "Weight_Loss", "rule_type": "AVOID", "group_target": "Fats & Oils",
     "reason_en": "Total fat <30% calories. Limit cooking oil to 15ml/person/day.",
     "reason_bn": "মোট চর্বি <৩০% ক্যালরি। রান্নার তেল ১৫ মিলি/ব্যক্তি/দিন।"},
    {"condition": "Weight_Loss", "rule_type": "AVOID", "group_target": "Sugars & Sweets",
     "reason_en": "Free sugars <10% energy, ideally <5% for additional benefits.",
     "reason_bn": "মুক্ত চিনি <১০% শক্তি, অতিরিক্ত সুবিধার জন্য <৫%।"},
    {"condition": "Weight_Loss", "rule_type": "PREFER", "group_target": "Fish & Seafood",
     "reason_en": "Lean protein increases satiety, helps maintain muscle mass during deficit.",
     "reason_bn": "চর্বিহীন প্রোটিন তৃপ্তি বাড়ায়, পেশী বজায় রাখে।"},
    {"condition": "Weight_Loss", "rule_type": "PREFER", "group_target": "Leafy Vegetables",
     "reason_en": "Low density, high fiber foods promote satiety with fewer calories.",
     "reason_bn": "কম ঘনত্ব, উচ্চ আঁশযুক্ত খাবার কম ক্যালরিতে তৃপ্তি দেয়।"},

    # ========== WEIGHT GAIN / UNDERWEIGHT ==========
    {"condition": "Weight_Gain", "rule_type": "PREFER", "group_target": "Nuts & Seeds",
     "reason_en": "Nutrient-dense, calorie-dense healthy fats (587 kcal/100g).",
     "reason_bn": "পুষ্টিকর, ক্যালরিযুক্ত স্বাস্থ্যকর চর্বি।"},
    {"condition": "Weight_Gain", "rule_type": "PREFER", "group_target": "Eggs",
     "reason_en": "High-quality bioavailable protein and healthy fats.",
     "reason_bn": "উচ্চ মানের প্রোটিন এবং স্বাস্থ্যকর চর্বি।"},
    {"condition": "Weight_Gain", "rule_type": "PREFER", "group_target": "Milk & Dairy",
     "reason_en": "Balanced macros and bone-building calcium.",
     "reason_bn": "সুষম ম্যাক্রো এবং হাড়-গঠনকারী ক্যালসিয়াম।"},

    # ========== CORONARY HEART DISEASE (Guideline 6, Section 3) ==========
    {"condition": "Heart_Disease", "rule_type": "AVOID", "group_target": "Fats & Oils",
     "reason_en": "Total fat 20-25% calories. Saturated fat <7%. Trans fat <1%. Cholesterol <200mg/day.",
     "reason_bn": "মোট চর্বি ২০-২৫%। স্যাচুরেটেড <৭%। ট্রান্স <১%। কোলেস্টেরল <২০০ মিগ্রা।"},
    {"condition": "Heart_Disease", "rule_type": "PREFER", "group_target": "Fish & Seafood",
     "reason_en": "Omega-3 fatty acids (EPA) reduce serum triglycerides.",
     "reason_bn": "ওমেগা-৩ ফ্যাটি অ্যাসিড (ইপিএ) সিরাম ট্রাইগ্লিসেরাইড কমায়।"},
    {"condition": "Heart_Disease", "rule_type": "PREFER", "group_target": "Pulses & Legumes",
     "reason_en": "Plant protein + legumes decrease LDL cholesterol.",
     "reason_bn": "উদ্ভিদ প্রোটিন + ডাল এলডিএল কোলেস্টেরল কমায়।"},
    {"condition": "Heart_Disease", "rule_type": "PREFER", "group_target": "Fruits",
     "reason_en": "Soluble fiber 10-25g/day reduces LDL by ~5%.",
     "reason_bn": "দ্রবণীয় আঁশ ১০-২৫ গ্রাম/দিন এলডিএল ~৫% কমায়।"},

    # ========== RENAL DISEASE / CKD (Guideline 3, Section 3) ==========
    {"condition": "Renal_Disease", "rule_type": "AVOID", "group_target": "Meat & Poultry",
     "reason_en": "Protein restricted: Stage I-III 0.75g/kg/day, Stage IV-V 0.6g/kg/day.",
     "reason_bn": "প্রোটিন সীমিত: স্তর I-III ০.৭৫ গ্রা/কেজি, স্তর IV-V ০.৬ গ্রা/কেজি।"},
    {"condition": "Renal_Disease", "rule_type": "AVOID", "group_target": "Nuts & Seeds",
     "reason_en": "High phosphorus and potassium - restrict in Stage 3+ CKD.",
     "reason_bn": "উচ্চ ফসফরাস ও পটাশিয়াম - স্তর ৩+ এ সীমিত।"},
    {"condition": "Renal_Disease", "rule_type": "PREFER", "group_target": "Cereals & Grains",
     "reason_en": "Adequate carbohydrate to provide calories and spare protein.",
     "reason_bn": "পর্যাপ্ত শর্করা ক্যালরি সরবরাহ ও প্রোটিন সংরক্ষণের জন্য।"},

    # ========== RENAL CALCULI / STONES (Guideline 4, Section 3) ==========
    {"condition": "Renal_Stones", "rule_type": "AVOID", "group_target": "Nuts & Seeds",
     "reason_en": "Oxalate-rich: peanuts, beans, chocolates. Limit <40-50mg oxalate/day.",
     "reason_bn": "অক্সালেট সমৃদ্ধ: বাদাম, শিম, চকলেট। <৪০-৫০ মিগ্রা/দিন।"},
    {"condition": "Renal_Stones", "rule_type": "PREFER", "group_target": "Fruits",
     "reason_en": "Citrates inhibit stones. Lemon water encouraged for low urinary citrates.",
     "reason_bn": "সাইট্রেট পাথর প্রতিরোধ করে। লেবু পানি উৎসাহিত।"},

    # ========== LIVER DISEASE (Guideline 5, Section 3) ==========
    {"condition": "Liver_Disease", "rule_type": "AVOID", "group_target": "Fats & Oils",
     "reason_en": "Limit fat to 60g/day or 30% calories. Replace saturated with MUFA/PUFA.",
     "reason_bn": "চর্বি ৬০ গ্রাম/দিন বা ৩০% ক্যালরি। স্যাচুরেটেড MUFA/PUFA দিয়ে প্রতিস্থাপন।"},
    {"condition": "Liver_Disease", "rule_type": "AVOID", "group_target": "Sugars & Sweets",
     "reason_en": "Simple carbohydrates <10% total energy. Excess carbs contribute to fatty liver.",
     "reason_bn": "সরল শর্করা <১০% মোট শক্তি। অতিরিক্ত শর্করা ফ্যাটি লিভার বাড়ায়।"},
    {"condition": "Liver_Disease", "rule_type": "PREFER", "group_target": "Eggs",
     "reason_en": "Protein 1.2-1.5g/kg/day with branched-chain amino acids (egg white).",
     "reason_bn": "প্রোটিন ১.২-১.৫ গ্রা/কেজি/দিন ব্রাঞ্চড-চেইন অ্যামিনো অ্যাসিড (ডিমের সাদা)।"},
    {"condition": "Liver_Disease", "rule_type": "PREFER", "group_target": "Leafy Vegetables",
     "reason_en": "Vitamin K (broccoli, spinach, cabbage) prevents liver tissue bleeding.",
     "reason_bn": "ভিটামিন কে (ব্রকলি, পালং, বাঁধাকপি) লিভার টিস্যু রক্তক্ষরণ প্রতিরোধ করে।"},

    # ========== DIARRHOEA (Guideline 8, Section 3) ==========
    {"condition": "Diarrhoea", "rule_type": "AVOID", "group_target": "Pulses & Legumes",
     "reason_en": "Limit beans, pulses, cabbage, broccoli during active diarrhoea.",
     "reason_bn": "সক্রিয় ডায়রিয়ায় শিম, ডাল, বাঁধাকপি সীমিত করুন।"},
    {"condition": "Diarrhoea", "rule_type": "AVOID", "group_target": "Milk & Dairy",
     "reason_en": "Limit milk for adults due to lactose intolerance risk during diarrhoea.",
     "reason_bn": "প্রাপ্তবয়স্কদের জন্য ল্যাকটোজ অসহিষ্ণুতার ঝুঁকিতে দুধ সীমিত।"},
    {"condition": "Diarrhoea", "rule_type": "PREFER", "group_target": "Cereals & Grains",
     "reason_en": "Sago, rice, flat rice, bread - easily tolerated during diarrhoea.",
     "reason_bn": "সাগু, ভাত, চিড়া, রুটি - ডায়রিয়ায় সহজে সহনীয়।"},

    # ========== TUBERCULOSIS (Guideline 9, Section 3) ==========
    {"condition": "Tuberculosis", "rule_type": "PREFER", "group_target": "Meat & Poultry",
     "reason_en": "Protein 1.2-1.5g/kg/day. Eggs, meats, poultry essential for TB recovery.",
     "reason_bn": "প্রোটিন ১.২-১.৫ গ্রা/কেজি/দিন। ডিম, মাংস টিবি পুনরুদ্ধারে অপরিহার্য।"},
    {"condition": "Tuberculosis", "rule_type": "PREFER", "group_target": "Fish & Seafood",
     "reason_en": "Additional 200-300 kcal/day needed. Fish provides omega-3 + protein.",
     "reason_bn": "অতিরিক্ত ২০০-৩০০ কিলোক্যালরি/দিন প্রয়োজন। মাছ ওমেগা-৩ + প্রোটিন দেয়।"},
    {"condition": "Tuberculosis", "rule_type": "PREFER", "group_target": "Fruits",
     "reason_en": "Vitamins A, C, E antioxidants protect against harmful oxidative damage.",
     "reason_bn": "ভিটামিন এ, সি, ই অ্যান্টিঅক্সিডেন্ট ক্ষতিকর জারণ ক্ষতি থেকে রক্ষা করে।"},

    # ========== CANCER (Guideline 10, Section 3) ==========
    {"condition": "Cancer", "rule_type": "PREFER", "group_target": "Leafy Vegetables",
     "reason_en": "Beta-carotene, Vitamin C, E antioxidants from amaranth, spinach, arum leaves.",
     "reason_bn": "বিটা-ক্যারোটিন, ভিটামিন সি, ই অ্যান্টিঅক্সিডেন্ট ডাটা, পালং থেকে।"},
    {"condition": "Cancer", "rule_type": "PREFER", "group_target": "Fruits",
     "reason_en": "Guava, amla, papaya, mango - rich in antioxidants. Fiber protects colon.",
     "reason_bn": "পেয়ারা, আমলকি, পেঁপে, আম - অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ।"},
    {"condition": "Cancer", "rule_type": "AVOID", "group_target": "Sugars & Sweets",
     "reason_en": "Limit free sugar and refined cereals for cancer prevention.",
     "reason_bn": "ক্যান্সার প্রতিরোধে মুক্ত চিনি ও পরিশোধিত শস্য সীমিত করুন।"},

    # ========== HYPOTHYROIDISM (Guideline 11, Section 3) ==========
    {"condition": "Hypothyroidism", "rule_type": "AVOID", "group_target": "Vegetables",
     "reason_en": "Limit goitrogens: cabbage, broccoli, cauliflower, turnips, spinach interfere with thyroid.",
     "reason_bn": "গয়ট্রোজেন সীমিত: বাঁধাকপি, ব্রকলি, ফুলকপি থাইরয়েডে হস্তক্ষেপ করে।"},
    {"condition": "Hypothyroidism", "rule_type": "AVOID", "group_target": "Nuts & Seeds",
     "reason_en": "Goitrogens in walnuts, peanuts, almonds, flaxseeds may hinder thyroid function.",
     "reason_bn": "আখরোট, বাদাম, তিসিতে গয়ট্রোজেন থাইরয়েড কার্যকারিতা বাধা দিতে পারে।"},

    # ========== PREGNANCY (Guideline 5, Section 2) ==========
    {"condition": "Pregnancy", "rule_type": "PREFER", "group_target": "Milk & Dairy",
     "reason_en": "Calcium RNI 1200mg/day for fetal skeleton mineralization.",
     "reason_bn": "ক্যালসিয়াম RNI ১২০০ মিগ্রা/দিন ভ্রূণের কঙ্কাল খনিজকরণের জন্য।"},
    {"condition": "Pregnancy", "rule_type": "PREFER", "group_target": "Meat & Poultry",
     "reason_en": "Protein 60g/day (1.1g/kg/day). Heme iron prevents maternal anemia.",
     "reason_bn": "প্রোটিন ৬০ গ্রাম/দিন। হেম আয়রন মায়ের রক্তাল্পতা রোধ করে।"},
    {"condition": "Pregnancy", "rule_type": "PREFER", "group_target": "Leafy Vegetables",
     "reason_en": "Folic acid, iron, vitamin A from leafy greens critical for fetal development.",
     "reason_bn": "সবুজ শাক থেকে ফলিক অ্যাসিড, আয়রন, ভিটামিন এ ভ্রূণ বিকাশে গুরুত্বপূর্ণ।"},

    # ========== LACTATION (Guideline 6, Section 2) ==========
    {"condition": "Lactation", "rule_type": "PREFER", "group_target": "Fish & Seafood",
     "reason_en": "Long chain PUFA crucial for infant retina and brain development.",
     "reason_bn": "লং চেইন PUFA শিশুর রেটিনা ও মস্তিষ্ক বিকাশে অপরিহার্য।"},
    {"condition": "Lactation", "rule_type": "PREFER", "group_target": "Eggs",
     "reason_en": "Additional 19g protein/day first 6 months. Choline 450mg/day from egg yolk.",
     "reason_bn": "প্রথম ৬ মাসে অতিরিক্ত ১৯ গ্রাম প্রোটিন। ডিমের কুসুম থেকে কোলিন।"},

    # ========== ELDERLY (Guideline 7, Section 2) ==========
    {"condition": "Elderly", "rule_type": "PREFER", "group_target": "Fish & Seafood",
     "reason_en": "Omega-3 rich fish preferred. Protein 1-1.25g/kg for older adults.",
     "reason_bn": "ওমেগা-৩ সমৃদ্ধ মাছ পছন্দনীয়। প্রোটিন ১-১.২৫ গ্রা/কেজি।"},
    {"condition": "Elderly", "rule_type": "PREFER", "group_target": "Milk & Dairy",
     "reason_en": "Low-fat yoghurt for bone health. Calcium RNI 1000-1300mg.",
     "reason_bn": "হাড়ের স্বাস্থ্যের জন্য কম চর্বিযুক্ত দই। ক্যালসিয়াম ১০০০-১৩০০ মিগ্রা।"},
]
