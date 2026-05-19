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
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Save,
  X,
  Plus,
  CalendarDays,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { mealPlanApi, type MealPlanResponse, foodsApi, type FoodSearchResponse } from '../lib/api';

const SLOT_ICONS: Record<string, React.ElementType> = {
  breakfast: Coffee,
  morning_snack: Apple,
  lunch: Utensils,
  evening_snack: Apple,
  dinner: Moon,
};

const SLOT_COLORS: Record<string, string> = {
  breakfast: 'text-amber-500',
  morning_snack: 'text-green-500',
  lunch: 'text-accent',
  evening_snack: 'text-purple-500',
  dinner: 'text-blue-500',
};

// Day names in Bengali
const BN_DAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
const EN_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface MealItem {
  name_bn?: string;
  name_en?: string;
  amount?: string;
  amount_g?: number;
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
  explanation_bn?: string;
}

const MAIN_SLOTS = ['breakfast', 'lunch', 'dinner'];
const SNACK_SLOTS = ['morning_snack', 'evening_snack'];

export const MealPlan = () => {
  const { profileData } = useAuth();
  const [plan, setPlan] = useState<MealPlanResponse | null>(null);
  const [completedSlots, setCompletedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<number>(0);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [showSnacks, setShowSnacks] = useState(false);

  // Day selector state
  const [selectedDayOffset, setSelectedDayOffset] = useState(0); // 0 = today
  const [dayPlan, setDayPlan] = useState<MealPlanResponse | null>(null);
  const [dayLoading, setDayLoading] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlanData, setEditingPlanData] = useState<PlanData | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [addingFoodToSlot, setAddingFoodToSlot] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResponse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const targets = profileData?.targets;

  const today = new Date();
  const currentDayIndex = today.getDay(); // 0=Sun, 1=Mon, ...

  const fetchDaily = useCallback(async (offset = 0) => {
    const isToday = offset === 0;
    if (isToday) setLoading(true);
    else setDayLoading(true);
    setError(null);
    try {
      // For today, use the daily endpoint
      // For other days, we'd need a different endpoint or generate
      // For now, we fetch weekly and pick the right day, or just show today
      if (isToday) {
        const data = await mealPlanApi.getDaily('bn');
        setPlan(data);
        setCompletedSlots(data.completed_slots || []);
        setFeedback(data.feedback || 0);
        setEditingPlanData(data.plan_data as PlanData);
        setIsEditing(false);
      } else {
        // Fetch weekly and pick the day at the offset
        const weekly = await mealPlanApi.getWeekly('bn');
        if (weekly[offset - 1]) {
          setDayPlan(weekly[offset - 1]);
        } else {
          setError('এই দিনের প্ল্যান পাওয়া যায়নি');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'প্ল্যান লোড করতে সমস্যা হয়েছে');
    } finally {
      if (isToday) setLoading(false);
      else setDayLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDaily(0);
  }, [fetchDaily]);

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

  const handleDaySelect = (offset: number) => {
    setSelectedDayOffset(offset);
    if (offset === 0) {
      setDayPlan(null);
    } else {
      fetchDaily(offset);
    }
  };

  const toggleSlot = async (slot: string) => {
    const activePlan = selectedDayOffset === 0 ? plan : dayPlan;
    if (!activePlan) return;
    const isComplete = completedSlots.includes(slot);
    try {
      const res = await mealPlanApi.markSlotComplete(activePlan.plan_id, slot, !isComplete);
      setCompletedSlots(res.completed_slots);
    } catch {
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

  // Determine which plan to render
  const activePlan = selectedDayOffset === 0 ? plan : dayPlan;
  const isViewingToday = selectedDayOffset === 0;
  const pd = isViewingToday && isEditing && editingPlanData ? editingPlanData : (activePlan ? getPlanData(activePlan) : {});
  const allMeals = pd.meals || [];

  // Split into main meals and snacks
  const mainMeals = allMeals.filter((m) => MAIN_SLOTS.includes(m.slot));
  const snackMeals = allMeals.filter((m) => SNACK_SLOTS.includes(m.slot));

  // Calculate calories
  const totalCal = activePlan?.calorie_target || pd.target_calories || 0;
  const consumedCal = allMeals
    .filter((m) => completedSlots.includes(m.slot))
    .reduce((acc, m) => acc + (m.items || []).reduce((s, item) => s + (item.calories || 0), 0), 0);
  const pct = totalCal > 0 ? Math.min(100, Math.round((consumedCal / totalCal) * 100)) : 0;

  const renderSlotCard = (slot: MealSlot, index: number, isSnack = false) => {
    const SlotIcon = SLOT_ICONS[slot.slot] || Utensils;
    const slotColor = SLOT_COLORS[slot.slot] || 'text-ink';
    const isDone = completedSlots.includes(slot.slot);
    const slotIndex = allMeals.findIndex((m) => m.slot === slot.slot);

    return (
      <motion.div
        key={slot.slot}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07 }}
        className={`bg-white rounded-[2rem] p-5 md:p-6 border transition-all group shadow-sm ${
          isDone ? 'border-green-200 bg-green-50/30' : 'border-ink/5 hover:border-accent/10'
        } ${isSnack ? 'opacity-90' : ''}`}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
            isDone ? 'bg-green-100 text-green-500' : 'bg-cream ' + slotColor
          }`}>
            {isDone ? <CheckCircle2 className="w-6 h-6" /> : <SlotIcon className="w-6 h-6" />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bn text-base font-bold text-ink">{slot.slot_bn || slot.slot}</h3>
                <p className="text-[0.65rem] text-ink-faint font-body font-bold uppercase tracking-wider">
                  {(slot.items || []).reduce((sum, item) => sum + (item.calories || 0), 0)} kcal • লক্ষ্য {slot.target_calories || 0} kcal
                </p>
              </div>
              {isViewingToday && (
                <button
                  onClick={() => toggleSlot(slot.slot)}
                  className={`text-xs font-bn font-bold px-3 py-1.5 rounded-xl transition-all shrink-0 ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(slot.items || []).map((food, j) => (
                <div
                  key={j}
                  className="flex items-start justify-between p-3 bg-cream/40 rounded-2xl hover:bg-cream/70 transition-colors border border-transparent hover:border-ink/5"
                >
                  <div className="flex-1 pr-2 min-w-0">
                    <div className="font-bn text-ink font-bold text-sm truncate">{food.name_bn || food.name_en}</div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {food.amount_g && (
                        <div className="text-[0.6rem] uppercase tracking-wider font-body font-bold text-ink-faint bg-white px-1.5 py-0.5 rounded">
                          {food.amount_g}g
                        </div>
                      )}
                      {food.food_group && (
                        <div className="text-[0.55rem] uppercase tracking-wider font-body font-bold text-accent bg-accent/5 px-1.5 py-0.5 rounded">
                          {food.food_group}
                        </div>
                      )}
                    </div>
                    {food.why_bn && (
                      <div className="mt-1 text-[0.7rem] text-ink-muted font-bn leading-relaxed">
                        <span className="text-accent">•</span> {food.why_bn}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="font-bold text-ink-muted text-xs bg-white px-2 py-1 rounded-lg border border-ink/5 whitespace-nowrap">
                      {food.calories || '?'} cal
                    </div>
                    {isEditing && isViewingToday && (
                      <button
                        onClick={() => removeFoodItem(slotIndex, j)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="বাদ দিন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isEditing && isViewingToday && (
                addingFoodToSlot === slotIndex ? (
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
                        className="p-2 text-ink-muted hover:bg-ink/5 rounded-xl transition-colors"
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
                              const newItems = [...(newMeals[slotIndex].items || [])];
                              newItems.push({
                                name_bn: res.name_bn,
                                name_en: res.name_en,
                                calories: res.calories || 0,
                                amount_g: 100,
                                food_group: res.food_group
                              });
                              newMeals[slotIndex] = { ...newMeals[slotIndex], items: newItems };
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
                      setAddingFoodToSlot(slotIndex);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="col-span-1 md:col-span-2 flex items-center justify-center gap-2 p-3 border border-dashed border-ink/20 rounded-2xl hover:border-accent hover:text-accent hover:bg-accent/5 transition-all text-ink-muted text-sm font-bn font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন খাবার যোগ করুন</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <DashboardLayout
      title="আজকের খাবার"
      subtitle={new Date().toLocaleDateString('bn-BD', { weekday: 'long', month: 'long', day: 'numeric' })}
      headerActions={(
        <div className="flex items-center gap-2">
          {isViewingToday && (
            <>
              {isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)} className="text-xs font-bn font-bold px-3 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5" /> বাতিল
                  </button>
                  <button onClick={saveEdits} disabled={savingEdit} className="text-xs font-bn font-bold px-3 py-2 bg-ink text-cream rounded-xl hover:bg-accent transition-colors flex items-center gap-1.5">
                    {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} সেভ
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="text-xs font-bn font-bold px-3 py-2 border border-ink/10 text-ink rounded-xl hover:bg-ink/5 transition-colors flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5" /> কাস্টমাইজ
                </button>
              )}
            </>
          )}
          <button
            onClick={() => {
              if (selectedDayOffset === 0) fetchDaily(0);
              else fetchDaily(selectedDayOffset);
            }}
            disabled={loading || dayLoading}
            className="p-2.5 bg-cream rounded-2xl text-ink-muted hover:bg-accent hover:text-white transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading || dayLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 font-bn text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">সমস্যা হয়েছে</p>
              <p className="opacity-80">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {(loading || dayLoading) && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
            <p className="font-bn text-ink-muted">AI আপনার জন্য পরিকল্পনা তৈরি করছে...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !dayLoading && !activePlan && !error && (
          <div className="text-center py-20 font-bn text-ink-muted">
            <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold mb-2">আজকের প্ল্যান পাওয়া যায়নি</p>
            <p className="text-sm opacity-60">প্রথমে আপনার প্রোফাইল সেট আপ করুন</p>
          </div>
        )}

        {/* Plan Content */}
        {!loading && !dayLoading && activePlan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Progress Header */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-ink/5">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Circular Progress */}
                <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-cream" />
                    <circle
                      cx="50%" cy="50%" r="45%"
                      stroke="currentColor" strokeWidth="10" fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 0.45 * 112}`}
                      strokeDashoffset={`${2 * Math.PI * 0.45 * 112 * (1 - pct / 100)}`}
                      className="text-accent transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-display text-2xl font-black text-ink leading-none">{pct}%</span>
                    <span className="font-bn text-[0.6rem] text-ink-muted font-bold uppercase tracking-wider">kcal</span>
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { icon: Flame, label: 'লক্ষ্য', val: `${totalCal} kcal`, color: 'text-ink' },
                      { icon: Zap, label: 'শর্করা', val: targets ? `${targets.carbs_g}g` : '--', color: 'text-accent' },
                      { icon: Utensils, label: 'প্রোটিন', val: targets ? `${targets.protein_g}g` : '--', color: 'text-forest' },
                      { icon: Droplet, label: 'চর্বি', val: targets ? `${targets.fat_g}g` : '--', color: 'text-gold' },
                    ].map((item, i) => (
                      <div key={i} className="bg-cream/50 p-3 rounded-2xl border border-ink/5">
                        <div className="flex items-center gap-1.5 text-ink-faint mb-1 justify-center sm:justify-start">
                          <item.icon className={`w-3 h-3 ${item.color}`} />
                          <span className="font-bn text-[0.6rem] font-bold uppercase tracking-wider">{item.label}</span>
                        </div>
                        <div className="font-bold text-sm text-ink">{item.val}</div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-ink-muted font-bn">
                    <span className="text-accent font-bold">{consumedCal}</span> / {totalCal} kcal গৃহীত
                    {isViewingToday ? '' : ` • ${BN_DAYS[(currentDayIndex + selectedDayOffset) % 7]}বার`}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Meals — Always Visible */}
            <div className="space-y-3">
              <h2 className="font-bn text-sm font-bold text-ink-faint uppercase tracking-widest px-1">মূল খাবার</h2>
              {mainMeals.length > 0 ? (
                mainMeals.map((slot, i) => renderSlotCard(slot, i))
              ) : (
                <div className="bg-white p-6 rounded-[2rem] border border-ink/5 text-center font-bn text-ink-muted text-sm">
                  কোনো মূল খাবার পাওয়া যায়নি
                </div>
              )}
            </div>

            {/* Snacks Toggle */}
            {snackMeals.length > 0 && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowSnacks(!showSnacks)}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-ink/5 hover:border-accent/20 transition-all"
                >
                  <span className="font-bn text-sm font-bold text-ink">হালকা নাস্তা ({snackMeals.length})</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-faint font-bn">
                      {snackMeals.reduce((sum, m) => sum + (m.items || []).reduce((s, item) => s + (item.calories || 0), 0), 0)} kcal
                    </span>
                    {showSnacks ? <ChevronUp className="w-4 h-4 text-ink-muted" /> : <ChevronDown className="w-4 h-4 text-ink-muted" />}
                  </div>
                </button>

                <AnimatePresence>
                  {showSnacks && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3 overflow-hidden"
                    >
                      {snackMeals.map((slot, i) => renderSlotCard(slot, i, true))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Explanation */}
            {pd.explanation_bn && (
              <div className="bg-cream/50 p-5 rounded-[2rem] border border-ink/5">
                <p className="font-bn text-sm text-ink-muted leading-relaxed">{pd.explanation_bn}</p>
              </div>
            )}

            {/* Feedback — Only for today */}
            {isViewingToday && (
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

            {/* Day Selector */}
            <div className="bg-white p-5 rounded-[2rem] border border-ink/5 shadow-sm">
              <h3 className="font-bn text-sm font-bold text-ink-muted mb-4 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                অন্যান্য দিনের প্ল্যান
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }, (_, i) => {
                  const dayIndex = (currentDayIndex + i) % 7;
                  const isSelected = selectedDayOffset === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleDaySelect(i)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
                        isSelected
                          ? 'bg-ink text-cream shadow-xl'
                          : 'bg-cream text-ink-muted hover:bg-ink/5'
                      }`}
                    >
                      <span className="text-[0.6rem] uppercase font-body font-bold tracking-wider opacity-60">
                        {i === 0 ? 'আজ' : BN_DAYS[dayIndex]}
                      </span>
                      <span className="font-bn text-sm font-bold">
                        {EN_DAYS[dayIndex]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};
