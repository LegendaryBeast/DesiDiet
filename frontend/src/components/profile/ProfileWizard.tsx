import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  User,
  Activity,
  CheckCircle2,
  Loader2,
  AlertCircle,
  TrendingDown,
  Scale,
  TrendingUp,
} from 'lucide-react';
import { FaMale, FaFemale } from 'react-icons/fa';
import { Button } from '../ui/Button';
import { profileApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const steps = [
  { id: 'intro', q: 'চলুন আপনার প্রোফাইল তৈরি করি', sub: 'আপনার সঠিক তথ্য আমাদের সঠিক পরামর্শ দিতে সাহায্য করবে' },
  { id: 'name', q: 'আপনার নাম কি?', sub: 'আমরা আপনাকে কী নামে ডাকব?' },
  { id: 'gender', q: 'আপনার লিঙ্গ নির্বাচন করুন', sub: 'ক্যালোরি গণনায় এটি গুরুত্বপূর্ণ' },
  { id: 'age', q: 'আপনার বয়স কত?', sub: 'আপনার বিপাকীয় হার (BMR) জানতে এটি প্রয়োজন' },
  { id: 'stats', q: 'আপনার উচ্চতা ও ওজন', sub: 'BMI এবং আদর্শ ওজন নির্ধারণের জন্য' },
  { id: 'activity', q: 'আপনার দৈনিক পরিশ্রম কেমন?', sub: 'ব্যায়াম এবং দৈনন্দিন কাজের ধরন' },
  { id: 'goal', q: 'আপনার লক্ষ্য কি?', sub: 'ডায়েট পরিকল্পনার জন্য' },
  { id: 'conditions', q: 'কোনো শারীরিক সমস্যা আছে?', sub: 'যেমন ডায়াবেটিস বা উচ্চ রক্তচাপ' },
  { id: 'result', q: 'প্রোফাইল সংরক্ষণ হচ্ছে...', sub: 'আমাদের এআই আপনার জন্য বিশ্লেষণ করছে' },
];

interface ProfileFormData {
  nameBn: string;
  nameEn: string;
  gender: 'male' | 'female';
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  goal: string;
  conditions: string[];
}

export const ProfileWizard = () => {
  const navigate = useNavigate();
  const { refreshProfile, profileData } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingProfile = profileData?.profile;

  const [form, setForm] = useState<ProfileFormData>({
    nameBn: existingProfile?.name_bn || '',
    nameEn: existingProfile?.name_en || '',
    gender: (existingProfile?.gender as 'male' | 'female') || 'male',
    age: existingProfile?.age || 30,
    heightCm: existingProfile?.height_cm || 165,
    weightKg: existingProfile?.weight_kg || 65,
    activityLevel: existingProfile?.activity_level || 'moderate',
    goal: existingProfile?.goal || 'maintain',
    conditions: existingProfile?.medical_conditions || [],
  });

  const update = (updates: Partial<ProfileFormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name_bn: form.nameBn,
        name_en: form.nameEn,
        age: form.age,
        gender: form.gender,
        weight_kg: form.weightKg,
        height_cm: form.heightCm,
        activity_level: form.activityLevel,
        goal: form.goal,
        medical_conditions: form.conditions,
      };

      if (existingProfile) {
        await profileApi.update(payload);
      } else {
        await profileApi.create(payload);
      }
      await refreshProfile();
      navigate('/chat');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'প্রোফাইল সংরক্ষণ করতে সমস্যা হয়েছে');
      setSaving(false);
    }
  };

  const next = () => {
    if (currentStep === steps.length - 2) {
      // Move to result step and save
      setCurrentStep(steps.length - 1);
      saveProfile();
      return;
    }
    if (currentStep === steps.length - 1) {
      navigate('/chat');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const back = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'intro':
        return (
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-cream rounded-[2.5rem] flex items-center justify-center text-accent shadow-2xl rotate-3">
              <User size={40} />
            </div>
            <p className="font-bn text-ink-muted text-center max-w-sm">
              দেশিডায়েট এআই আপনার ব্যক্তিগত পুষ্টিবিদ হিসেবে কাজ করবে। সঠিক তথ্য দিয়ে সাহায্য করুন।
            </p>
            {existingProfile && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
                <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="font-bn text-sm text-green-700 font-bold">আপনার প্রোফাইল ইতিমধ্যে আছে</p>
                <p className="font-bn text-xs text-green-600 mt-1">এখানে আপডেট করতে পারবেন</p>
              </div>
            )}
          </div>
        );

      case 'name':
        return (
          <div className="w-full max-w-sm mx-auto space-y-4">
            <input
              type="text"
              value={form.nameBn}
              onChange={(e) => update({ nameBn: e.target.value })}
              placeholder="বাংলায় নাম লিখুন..."
              className="w-full bg-cream border-2 border-transparent focus:border-accent/20 rounded-2xl p-5 text-center font-bn text-2xl outline-none transition-all shadow-sm"
              autoFocus
            />
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => update({ nameEn: e.target.value })}
              placeholder="Name in English..."
              className="w-full bg-cream border-2 border-transparent focus:border-accent/20 rounded-2xl p-4 text-center font-body text-xl outline-none transition-all shadow-sm"
            />
          </div>
        );

      case 'gender':
        return (
          <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
            {[
              { id: 'male', label: 'পুরুষ', icon: <FaMale className="w-12 h-12" /> },
              { id: 'female', label: 'নারী', icon: <FaFemale className="w-12 h-12" /> },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => { update({ gender: g.id as 'male' | 'female' }); next(); }}
                className={`p-8 rounded-[2.5rem] border-2 transition-all group ${
                  form.gender === g.id
                    ? 'border-accent bg-accent/5 text-accent shadow-xl'
                    : 'border-ink/5 bg-white text-ink-muted hover:border-accent/20'
                }`}
              >
                <div className="flex justify-center mb-4">{g.icon}</div>
                <div className="font-bn font-bold text-lg">{g.label}</div>
              </button>
            ))}
          </div>
        );

      case 'age':
        return (
          <div className="flex flex-col items-center gap-8">
            <div className="text-6xl font-black font-display text-ink">
              {form.age} <span className="text-xl text-ink-faint">বছর</span>
            </div>
            <input
              type="range" min="15" max="100"
              value={form.age}
              onChange={(e) => update({ age: parseInt(e.target.value) })}
              className="w-full max-w-md accent-accent"
            />
          </div>
        );

      case 'stats':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg mx-auto">
            <div className="bg-white p-8 rounded-[2.5rem] border border-ink/5 shadow-sm">
              <label className="block font-bn text-sm font-bold text-ink-faint mb-4 uppercase tracking-widest">উচ্চতা (সেমি)</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={form.heightCm}
                  onChange={(e) => update({ heightCm: parseInt(e.target.value) })}
                  className="w-full text-3xl font-bold font-display bg-transparent outline-none border-b-2 border-accent/20 focus:border-accent pb-2"
                />
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-ink/5 shadow-sm">
              <label className="block font-bn text-sm font-bold text-ink-faint mb-4 uppercase tracking-widest">ওজন (কেজি)</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={form.weightKg}
                  onChange={(e) => update({ weightKg: parseInt(e.target.value) })}
                  className="w-full text-3xl font-bold font-display bg-transparent outline-none border-b-2 border-accent/20 focus:border-accent pb-2"
                />
              </div>
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
            {[
              { id: 'sedentary', label: 'বসে কাজ', sub: 'ব্যায়াম কম করা হয়' },
              { id: 'light', label: 'হালকা পরিশ্রম', sub: 'সপ্তাহে ১-২ দিন' },
              { id: 'moderate', label: 'মাঝারি পরিশ্রম', sub: 'সপ্তাহে ৩-৫ দিন ব্যায়াম' },
              { id: 'active', label: 'খুব পরিশ্রমী', sub: 'প্রতিদিন ভারী কাজ বা ব্যায়াম' },
            ].map((a) => (
              <button
                key={a.id}
                onClick={() => { update({ activityLevel: a.id }); next(); }}
                className={`p-6 rounded-[2rem] border-2 text-left transition-all group ${
                  form.activityLevel === a.id
                    ? 'border-accent bg-accent/5 shadow-lg'
                    : 'border-ink/5 bg-white hover:border-accent/20 shadow-sm'
                }`}
              >
                <div className="font-bn font-bold text-lg text-ink mb-1">{a.label}</div>
                <div className="font-bn text-xs text-ink-muted opacity-60">{a.sub}</div>
              </button>
            ))}
          </div>
        );

      case 'goal':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mx-auto">
            {[
              { id: 'weight_loss', label: 'ওজন কমানো', icon: <TrendingDown className="w-8 h-8" />, sub: '-৫০০ kcal/দিন' },
              { id: 'maintain', label: 'ওজন ধরে রাখা', icon: <Scale className="w-8 h-8" />, sub: 'বর্তমান ক্যালোরি' },
              { id: 'weight_gain', label: 'ওজন বাড়ানো', icon: <TrendingUp className="w-8 h-8" />, sub: '+৫০০ kcal/দিন' },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => { update({ goal: g.id }); next(); }}
                className={`p-6 rounded-[2rem] border-2 text-center transition-all group ${
                  form.goal === g.id
                    ? 'border-accent bg-accent/5 shadow-lg'
                    : 'border-ink/5 bg-white hover:border-accent/20 shadow-sm'
                }`}
              >
                <div className={`flex justify-center mb-3 transition-colors ${
                  form.goal === g.id ? 'text-accent' : 'text-ink-muted'
                }`}>
                  {g.icon}
                </div>
                <div className="font-bn font-bold text-ink mb-1">{g.label}</div>
                <div className="font-bn text-xs text-ink-muted opacity-60">{g.sub}</div>
              </button>
            ))}
          </div>
        );

      case 'conditions':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl mx-auto">
            {[
              { id: 'diabetes', label: 'ডায়াবেটিস' },
              { id: 'hypertension', label: 'উচ্চ রক্তচাপ' },
              { id: 'kidney', label: 'কিডনি রোগ' },
              { id: 'heart', label: 'হৃদরোগ' },
              { id: 'gastric', label: 'গ্যাস্ট্রিক' },
              { id: 'obesity', label: 'স্থূলতা' },
              { id: 'thyroid', label: 'থাইরয়েড' },
              { id: 'anemia', label: 'রক্তশূন্যতা' },
              { id: 'none', label: 'কিছুই নেই' },
            ].map((c) => {
              const isSelected = form.conditions.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    if (c.id === 'none') {
                      update({ conditions: [] });
                      next();
                    } else {
                      const newConditions = isSelected
                        ? form.conditions.filter((x) => x !== c.id)
                        : [...form.conditions, c.id];
                      update({ conditions: newConditions });
                    }
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all font-bn text-sm font-bold ${
                    isSelected
                      ? 'border-accent bg-accent text-cream'
                      : 'border-ink/5 bg-white text-ink-muted hover:border-accent/20'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        );

      case 'result':
        return (
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-ink/5 max-w-lg mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Activity size={120} />
            </div>
            <div className="relative z-10 text-center">
              {saving ? (
                <>
                  <Loader2 className="w-16 h-16 animate-spin text-accent mx-auto mb-4" />
                  <div className="font-bn text-xl font-bold text-ink mb-2">সংরক্ষণ হচ্ছে...</div>
                  <div className="font-bn text-sm text-ink-muted">AI আপনার পুষ্টি লক্ষ্যমাত্রা গণনা করছে</div>
                </>
              ) : error ? (
                <>
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <div className="font-bn text-lg font-bold text-red-500 mb-2">{error}</div>
                  <button onClick={() => { setCurrentStep(steps.length - 2); setError(null); }}
                    className="mt-4 px-6 py-3 bg-ink text-cream rounded-2xl font-bold font-bn hover:bg-accent transition-all"
                  >
                    পুনরায় চেষ্টা করুন
                  </button>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <div className="font-bn text-xl font-bold text-ink mb-2">প্রোফাইল সংরক্ষিত!</div>
                  <div className="font-bn text-sm text-ink-muted mb-6">আপনার ব্যক্তিগতকৃত ডায়েট প্ল্যান প্রস্তুত</div>
                  <div className="mt-6 flex items-center justify-center gap-3 bg-cream/50 p-4 rounded-2xl border border-ink/5">
                    <CheckCircle2 size={18} className="text-forest" />
                    <span className="font-bn text-sm text-ink-muted font-medium">আপনার জন্য ডায়েট প্ল্যান তৈরি করা হয়েছে</span>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col relative overflow-hidden font-bn">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-ink/5 z-50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          className="h-full bg-accent"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative z-10">
        <div className="max-w-4xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center"
            >
              <div className="text-center mb-12 md:mb-16">
                <div className="text-[0.65rem] tracking-[0.2em] uppercase text-ink-faint mb-4 font-body font-black">
                  Step {currentStep + 1} of {steps.length}
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-ink mb-4 tracking-tight">
                  {steps[currentStep].q}
                </h2>
                <p className="text-ink-muted opacity-70 text-lg">
                  {steps[currentStep].sub}
                </p>
              </div>

              <div className="w-full mb-16">
                {renderStepContent()}
              </div>

              {currentStep !== steps.length - 1 && (
                <div className="flex items-center gap-6">
                  {currentStep > 0 && (
                    <button
                      onClick={back}
                      className="p-4 rounded-2xl bg-white border border-ink/5 text-ink-muted hover:border-accent hover:text-accent transition-all shadow-sm group interactive"
                    >
                      <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                  )}
                  <Button
                    onClick={next}
                    className="px-12 py-5 bg-ink text-cream hover:bg-accent text-xl font-bold shadow-2xl flex items-center gap-4 group interactive min-w-[200px]"
                  >
                    পরবর্তী ধাপ
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-10 left-10 font-display text-[15vw] font-black text-ink opacity-[0.02] pointer-events-none select-none uppercase tracking-tighter">
        DesiDiet
      </div>
    </div>
  );
};
