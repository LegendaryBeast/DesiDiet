import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coffee,
  Utensils,
  Apple,
  Moon,
  RefreshCw,
  Info,
  Flame,
  Droplet,
  Zap,
  CheckCircle2,
  Star,
  Loader2,
  AlertCircle,
  CalendarDays,
  History,
  Edit2,
  Trash2,
  Save,
  X,
  Plus,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { mealPlanApi, type MealPlanResponse, foodsApi, type FoodSearchResponse } from '../lib/api';

const SLOT_ICONS: Record<string, React.ElementType> = {
  breakfast: Coffee,
  snack1: Apple,
  lunch: Utensils,
  snack2: Apple,
  dinner: Moon,
  snack: Apple,
};

const SLOT_COLORS: Record<string, string> = {
  breakfast: 'text-amber-500',
  snack1: 'text-green-500',
  lunch: 'text-accent',
  snack2: 'text-purple-500',
  dinner: 'text-blue-500',
  snack: 'text-green-500',
};

type Tab = 'today' | 'weekly' | 'history';

interface MealItem {
  name_bn?: string;
  name_en?: string;
  amount?: string;
  calories?: number;
  protein_g?: number;
  why_bn?: string;
  food_group?: string;
}

interface MealSlot {
  slot: string;
  slot_bn?: string;
  slot_en?: string;
  target_calories?: number;
  items?: MealItem[];
}

interface PlanData {
  meals?: MealSlot[];
  target_calories?: number;
  macros?: { protein_g?: number; carbs_g?: number; fat_g?: number };
}

export const MealPlan = () => {
  const { profileData } = useAuth();
  const [tab, setTab] = useState<Tab>('today');
  const [plan, setPlan] = useState<MealPlanResponse | null>(null);
  const [weeklyPlans, setWeeklyPlans] = useState<MealPlanResponse[]>([]);
  const [historyPlans, setHistoryPlans] = useState<MealPlanResponse[]>([]);
  const [completedSlots, setCompletedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<number>(0);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlanData, setEditingPlanData] = useState<PlanData | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  
  const [addingFoodToSlot, setAddingFoodToSlot] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResponse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const targets = profileData?.targets;

  const fetchDaily = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mealPlanApi.getDaily('bn');
      setPlan(data);
      setCompletedSlots(data.completed_slots || []);
      setFeedback(data.feedback || 0);
      setEditingPlanData(data.plan_data as PlanData);
      setIsEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'প্ল্যান লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeekly = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mealPlanApi.getWeekly('bn');
      setWeeklyPlans(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'সাপ্তাহিক প্ল্যান লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mealPlanApi.getHistory(20);
      setHistoryPlans(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ইতিহাস লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'today') fetchDaily();
    else if (tab === 'weekly') fetchWeekly();
    else fetchHistory();
  }, [tab, fetchDaily, fetchWeekly, fetchHistory]);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await foodsApi.search(searchQuery);
        setSearchResults(results);
      } catch (e) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const toggleSlot = async (slot: string) => {
    if (!plan) return;
    const isComplete = completedSlots.includes(slot);
    try {
      const res = await mealPlanApi.markSlotComplete(plan.plan_id, slot, !isComplete);
      setCompletedSlots(res.completed_slots);
    } catch {
      // Optimistic update fallback
      setCompletedSlots((prev) =>
        isComplete ? prev.filter((s) => s !== slot) : [...prev, slot]
      );
    }
  };

  const submitFeedback = async (rating: number) => {
    if (!plan || feedbackLoading) return;
    setFeedbackLoading(true);
    setFeedback(rating);
    try {
      await mealPlanApi.submitFeedback(plan.plan_id, rating);
    } catch {
      // silent fail
    } finally {
      setFeedbackLoading(false);
    }
  };

  const getPlanData = (p: MealPlanResponse): PlanData => {
    if (!p.plan_data) return {};
    return p.plan_data as PlanData;
  };

  const saveEdits = async () => {
    if (!plan || !editingPlanData) return;
    setSavingEdit(true);
    
    // Calculate new total calories
    const newUserCal = (editingPlanData.meals || []).reduce(
      (sum, m) => sum + (m.items || []).reduce((s, item) => s + (item.calories || 0), 0), 
      0
    );

    try {
      const updated = await mealPlanApi.editPlan(plan.plan_id, editingPlanData, newUserCal);
      setPlan(updated);
      setIsEditing(false);
    } catch (err: unknown) {
      setError('প্ল্যান সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSavingEdit(false);
    }
  };

  const removeFoodItem = (slotIndex: number, itemIndex: number) => {
    if (!editingPlanData || !editingPlanData.meals) return;
    const newMeals = [...editingPlanData.meals];
    const newItems = [...(newMeals[slotIndex].items || [])];
    newItems.splice(itemIndex, 1);
    newMeals[slotIndex] = { ...newMeals[slotIndex], items: newItems };
    setEditingPlanData({ ...editingPlanData, meals: newMeals });
  };



  const renderMealCard = (p: MealPlanResponse, showToggle = false) => {
    const isToday = showToggle;
    const pd = isToday && isEditing && editingPlanData ? editingPlanData : getPlanData(p);
    const meals = pd.meals || [];
    const consumedCal = meals
      .filter((m) => completedSlots.includes(m.slot))
      .reduce((acc, m) => acc + (m.items || []).reduce((s, item) => s + (item.calories || 0), 0), 0);
    
    // Total calculation
    let totalCal = p.calorie_target || pd.target_calories || 0;
    const aiCal = p.ai_suggestion_cal;
    const userCal = p.user_choice_cal;
    
    if (isToday && isEditing && editingPlanData) {
      totalCal = meals.reduce(
        (sum, m) => sum + (m.items || []).reduce((s, item) => s + (item.calories || 0), 0), 
        0
      );
    } else if (userCal) {
      totalCal = userCal;
    } else if (aiCal) {
      totalCal = aiCal;
    }

    const pct = totalCal > 0 ? Math.min(100, Math.round((consumedCal / totalCal) * 100)) : 0;

    return (
      <div className="space-y-6">
        {/* Header */}
        <header className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-ink/5">
          {/* Circular Progress */}
          <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-cream" />
              <circle
                cx="50%" cy="50%" r="45%"
                stroke="currentColor" strokeWidth="10" fill="transparent"
                strokeDasharray={`${2 * Math.PI * 0.45 * 144}`}
                strokeDashoffset={`${2 * Math.PI * 0.45 * 144 * (1 - pct / 100)}`}
                className="text-accent transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-display text-3xl font-black text-ink leading-none">{pct}%</span>
              <div className="font-bn text-[0.65rem] text-ink-muted mt-1 leading-tight font-bold">
                <span className="text-accent">{consumedCal}</span> / {totalCal} <br />
                <span className="uppercase tracking-wider">kcal গৃহীত</span>
              </div>
            </div>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <h1 className="font-display text-3xl md:text-5xl font-black text-ink mb-3">
              আজকের <em className="italic text-ink-muted">খাবার</em>
            </h1>
            <p className="font-bn text-sm text-ink-muted mb-6">
              {new Date(p.plan_date).toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Flame, label: 'লক্ষ্য', val: `${totalCal} kcal`, color: 'text-ink' },
                { icon: Zap, label: 'শর্করা', val: targets ? `${targets.carbs_g}g` : '--', color: 'text-accent' },
                { icon: Utensils, label: 'প্রোটিন', val: targets ? `${targets.protein_g}g` : '--', color: 'text-forest' },
                { icon: Droplet, label: 'চর্বি', val: targets ? `${targets.fat_g}g` : '--', color: 'text-gold' },
              ].map((item, i) => (
                <div key={i} className="bg-cream/50 p-4 rounded-2xl border border-ink/5">
                  <div className="flex items-center gap-2 text-ink-faint mb-1 justify-center lg:justify-start">
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <span className="font-bn text-[0.65rem] font-bold uppercase tracking-wider">{item.label}</span>
                  </div>
                  <div className="font-bold text-base md:text-lg text-ink">{item.val}</div>
                </div>
              ))}
            </div>
            
            {isToday && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {aiCal && (
                  <div className="text-xs font-bn px-3 py-1.5 bg-ink/5 text-ink-muted rounded-xl">
                    AI Suggestion: <span className="font-bold">{aiCal} kcal</span>
                  </div>
                )}
                {userCal && (
                  <div className="text-xs font-bn px-3 py-1.5 bg-accent/10 text-accent rounded-xl">
                    Your Choice: <span className="font-bold">{userCal} kcal</span>
                  </div>
                )}
                <div className="flex-1" />
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="text-xs font-bn font-bold px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors flex items-center gap-2">
                      <X className="w-3.5 h-3.5" /> বাতিল
                    </button>
                    <button onClick={saveEdits} disabled={savingEdit} className="text-xs font-bn font-bold px-4 py-2 bg-ink text-cream rounded-xl hover:bg-accent transition-colors flex items-center gap-2">
                      {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} সেভ করুন
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="text-xs font-bn font-bold px-4 py-2 border border-ink/10 text-ink rounded-xl hover:bg-ink/5 transition-colors flex items-center gap-2">
                    <Edit2 className="w-3.5 h-3.5" /> কাস্টমাইজ
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Meal Cards */}
        <div className="space-y-4">
          {meals.map((slot, i) => {
            const SlotIcon = SLOT_ICONS[slot.slot] || Utensils;
            const slotColor = SLOT_COLORS[slot.slot] || 'text-ink';
            const isDone = completedSlots.includes(slot.slot);

            return (
              <motion.div
                key={slot.slot + i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`bg-white rounded-[2rem] p-6 md:p-8 border transition-all group shadow-sm ${
                  isDone ? 'border-green-200 bg-green-50/30' : 'border-ink/5 hover:border-accent/10'
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Slot info */}
                  <div className="lg:w-48 flex lg:flex-col items-center lg:items-start justify-between border-b lg:border-b-0 lg:border-r border-ink/5 pb-4 lg:pb-0 lg:pr-8">
                    <div className={`bg-cream p-3 rounded-2xl ${isDone ? 'bg-green-100' : 'group-hover:bg-ink group-hover:text-cream'} transition-colors`}>
                      {isDone ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <SlotIcon className={`w-6 h-6 ${slotColor}`} />}
                    </div>
                    <div className="mt-0 lg:mt-4">
                      <div className="font-bn text-base font-bold text-ink">{slot.slot_bn || slot.slot}</div>
                      <div className="font-body text-[0.6rem] uppercase tracking-widest text-ink-faint font-bold">
                        {(slot.items || []).reduce((sum, item) => sum + (item.calories || 0), 0)} kcal
                      </div>
                    </div>
                    {showToggle && (
                      <button
                        onClick={() => toggleSlot(slot.slot)}
                        className={`mt-3 lg:mt-4 text-xs font-bn font-bold px-3 py-1.5 rounded-xl transition-all ${
                          isDone
                            ? 'bg-green-500 text-white hover:bg-red-400'
                            : 'bg-cream text-ink-muted hover:bg-accent hover:text-white'
                        }`}
                      >
                        {isDone ? '✓ খাওয়া হয়েছে' : 'খাওয়া হয়নি'}
                      </button>
                    )}
                  </div>

                  {/* Food items */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(slot.items || []).map((food, j) => (
                      <div
                        key={j}
                        className="flex items-start justify-between p-4 bg-cream/30 rounded-2xl hover:bg-cream/60 transition-colors border border-transparent hover:border-ink/5 relative group/item"
                      >
                        <div className="flex-1 pr-3">
                          <div className="font-bn text-ink font-bold text-sm">{food.name_bn || food.name_en}</div>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            {food.amount && <div className="font-bn text-[0.7rem] text-ink-faint">{food.amount}</div>}
                          </div>

                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="font-bold text-ink-muted text-xs bg-white px-2 py-1 rounded-lg border border-ink/5 whitespace-nowrap">
                            {food.calories || '?'} cal
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => removeFoodItem(i, j)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="বাদ দিন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isEditing && (
                      addingFoodToSlot === i ? (
                        <div className="col-span-1 md:col-span-2 flex flex-col items-start gap-2 p-3 bg-accent/5 border border-accent/20 rounded-2xl">
                          <div className="flex w-full gap-2">
                            <input
                              type="text"
                              placeholder="খাবারের নাম খুঁজুন..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="flex-1 w-full bg-white px-3 py-2 rounded-xl border border-ink/10 text-sm font-bn outline-none focus:border-accent/50"
                              autoFocus
                            />
                            <button
                              onClick={() => { setAddingFoodToSlot(null); setSearchQuery(''); setSearchResults([]); }}
                              className="p-2 text-ink-muted hover:bg-ink/5 rounded-xl transition-colors flex justify-center items-center"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {searchLoading && (
                            <div className="text-xs text-ink-muted px-2 py-1 font-bn flex items-center gap-2">
                              <Loader2 className="w-3 h-3 animate-spin" /> খুঁজছে...
                            </div>
                          )}
                          
                          {searchResults.length > 0 && (
                            <div className="flex flex-col gap-1 w-full max-h-48 overflow-y-auto mt-1">
                              {searchResults.map((res) => (
                                <button
                                  key={res.code}
                                  onClick={() => {
                                    if (!editingPlanData || !editingPlanData.meals) return;
                                    const newMeals = [...editingPlanData.meals];
                                    const newItems = [...(newMeals[i].items || [])];
                                    newItems.push({
                                      name_bn: res.name_bn,
                                      name_en: res.name_en,
                                      calories: res.calories || 0,
                                      amount: "100g",
                                      food_group: res.food_group
                                    });
                                    newMeals[i] = { ...newMeals[i], items: newItems };
                                    setEditingPlanData({ ...editingPlanData, meals: newMeals });
                                    setAddingFoodToSlot(null);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                  }}
                                  className="text-left w-full p-3 bg-white hover:bg-cream rounded-xl text-sm font-bn border border-ink/5 flex justify-between items-center transition-colors"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-bold text-ink">{res.name_bn || res.name_en}</span>
                                    <span className="text-[0.65rem] text-ink-faint">{res.food_group}</span>
                                  </div>
                                  <span className="text-xs font-bold text-accent shrink-0">
                                    {res.calories || '?'} cal
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                          {searchQuery && !searchLoading && searchResults.length === 0 && (
                            <div className="text-xs text-red-400 px-2 py-1 font-bn">
                              কোনো খাবার পাওয়া যায়নি
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAddingFoodToSlot(i);
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                          className="flex items-center justify-center gap-2 p-4 border border-dashed border-ink/20 rounded-2xl hover:border-accent hover:text-accent hover:bg-accent/5 transition-all text-ink-muted text-sm font-bn font-bold h-full min-h-[4rem]"
                        >
                          <Plus className="w-4 h-4" />
                          <span>নতুন খাবার যোগ করুন</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Feedback */}
        {showToggle && (
          <div className="bg-white p-6 rounded-[2rem] border border-ink/5 shadow-sm">
            <p className="font-bn text-sm font-bold text-ink-muted mb-4 text-center">এই প্ল্যান কেমন লাগলো?</p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => submitFeedback(star)}
                  disabled={feedbackLoading}
                  className={`transition-all hover:scale-110 ${feedback >= star ? 'text-gold' : 'text-ink/20'}`}
                >
                  <Star className="w-7 h-7 fill-current" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout
      title="মিল প্ল্যান"
      subtitle="Nutrition Strategy"
      headerActions={(
        <button
          onClick={() => tab === 'today' ? fetchDaily() : tab === 'weekly' ? fetchWeekly() : fetchHistory()}
          disabled={loading}
          className="p-2.5 bg-cream rounded-2xl text-ink-muted hover:bg-accent hover:text-white transition-all"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      )}
    >
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        {/* Tab Selector */}
        <div className="flex justify-center">
          <div className="flex bg-white p-1.5 rounded-2xl border border-ink/5 shadow-sm gap-1">
            {[
              { id: 'today' as Tab, label: 'আজকের', icon: Flame },
              { id: 'weekly' as Tab, label: 'সাপ্তাহিক', icon: CalendarDays },
              { id: 'history' as Tab, label: 'ইতিহাস', icon: History },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bn text-sm font-bold transition-all ${
                  tab === id ? 'bg-ink text-cream shadow-xl' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 font-bn text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">সমস্যা হয়েছে</p>
              <p className="opacity-80">{error}</p>
              <p className="text-xs mt-1 opacity-60">দয়া করে প্রথমে আপনার প্রোফাইল সেট আপ করুন</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
            <p className="font-bn text-ink-muted">AI আপনার জন্য পরিকল্পনা তৈরি করছে...</p>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {!loading && !error && (
            <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {tab === 'today' && (
                plan ? renderMealCard(plan, true) : (
                  <div className="text-center py-20 font-bn text-ink-muted">
                    <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>আজকের প্ল্যান পাওয়া যায়নি</p>
                  </div>
                )
              )}

              {tab === 'weekly' && (
                <div className="space-y-6">
                  {weeklyPlans.length > 0 ? (
                    weeklyPlans.map((p) => (
                      <div key={p.plan_id} className="bg-white p-6 rounded-[2rem] border border-ink/5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bn font-bold text-lg text-ink">
                            {new Date(p.plan_date).toLocaleDateString('bn-BD', { weekday: 'long', month: 'long', day: 'numeric' })}
                          </h3>
                          <span className="text-sm font-bold text-accent bg-accent/10 px-3 py-1 rounded-xl">{p.calorie_target} kcal</span>
                        </div>
                        {renderMealCard(p, false)}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 font-bn text-ink-muted">
                      <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>সাপ্তাহিক প্ল্যান পাওয়া যায়নি</p>
                    </div>
                  )}
                </div>
              )}

              {tab === 'history' && (
                <div className="space-y-4">
                  {historyPlans.length > 0 ? (
                    historyPlans.map((p) => (
                      <div key={p.plan_id} className="bg-white p-5 rounded-[1.5rem] border border-ink/5 flex items-center justify-between hover:border-accent/20 transition-all">
                        <div>
                          <p className="font-bn font-bold text-ink">
                            {new Date(p.plan_date).toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-ink-faint font-bn">{p.calorie_target} kcal লক্ষ্যমাত্রা</p>
                        </div>
                        <div className="text-right">
                          {p.feedback ? (
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-4 h-4 ${p.feedback! >= s ? 'text-gold fill-current' : 'text-ink/10'}`} />
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-ink-faint font-bn">রেটিং নেই</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 font-bn text-ink-muted">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>কোনো ইতিহাস নেই</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};
