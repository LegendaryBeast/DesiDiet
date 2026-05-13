import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Apple,
  Shield,
  AlertTriangle,
  XCircle,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  foodsApi,
  type FoodWithInsightResponse,
  type SafeFoodsResponse,
  type FoodDetailResponse,
} from '../lib/api';

const SAFETY_CONFIG = {
  safe: { label: 'নিরাপদ', icon: Shield, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
  caution: { label: 'সতর্কতা', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  avoid: { label: 'এড়িয়ে চলুন', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
};

type Tab = 'search' | 'safe';

export const FoodsPage = () => {
  const [tab, setTab] = useState<Tab>('safe');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodWithInsightResponse[]>([]);
  const [safeFoods, setSafeFoods] = useState<SafeFoodsResponse[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodDetailResponse | null>(null);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [safeFoodsLoading, setSafeFoodsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSafeFoods = useCallback(async () => {
    setSafeFoodsLoading(true);
    setError(null);
    try {
      const data = await foodsApi.safeFoods();
      setSafeFoods(data);
    } catch {
      setError('নিরাপদ খাবার লোড করতে সমস্যা হয়েছে');
    } finally {
      setSafeFoodsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'safe') fetchSafeFoods();
  }, [tab, fetchSafeFoods]);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setSearchResults([]); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await foodsApi.searchWithInsight(q);
      setSearchResults(data);
    } catch {
      setError('অনুসন্ধান করতে সমস্যা হয়েছে');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (tab === 'search') handleSearch(query);
    }, 600);
    return () => clearTimeout(timer);
  }, [query, tab, handleSearch]);

  const toggleDetail = async (code: string) => {
    if (expandedCode === code) { setExpandedCode(null); setSelectedFood(null); return; }
    setExpandedCode(code);
    try {
      const detail = await foodsApi.detail(code);
      setSelectedFood(detail);
    } catch {
      setSelectedFood(null);
    }
  };

  const renderFoodCard = (food: FoodWithInsightResponse | SafeFoodsResponse, showInsight: boolean) => {
    const safetyKey = 'safety' in food ? (food.safety as keyof typeof SAFETY_CONFIG) : 'safe';
    const safety = SAFETY_CONFIG[safetyKey] || SAFETY_CONFIG.safe;
    const SafetyIcon = safety.icon;
    const isExpanded = expandedCode === food.code;
    const insight = 'ai_insight' in food ? food.ai_insight : null;

    return (
      <motion.div
        key={food.code}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[1.5rem] border border-ink/5 hover:border-accent/20 transition-all shadow-sm overflow-hidden group"
      >
        <button
          onClick={() => toggleDetail(food.code)}
          className="w-full p-5 flex items-center gap-4 text-left"
        >
          {/* Food group icon */}
          <div className="w-11 h-11 bg-cream rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-ink group-hover:text-cream transition-colors">
            <Apple className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bn font-bold text-ink truncate">{food.name_bn}</span>
              <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${safety.bg} ${safety.color} flex-shrink-0`}>
                <SafetyIcon className="w-3 h-3" /> {safety.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-ink-faint font-body">{food.name_en}</span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="font-bold text-ink text-sm">{food.calories ?? '?'} kcal</div>
            <div className="text-xs text-ink-faint">100g</div>
          </div>

          <div className="text-ink-faint ml-1">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {/* Expanded detail */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-4 border-t border-ink/5">
                {/* Macros */}
                <div className="grid grid-cols-4 gap-3 pt-4">
                  {[
                    { label: 'প্রোটিন', val: food.protein ?? '--', unit: 'g' },
                    { label: 'শর্করা', val: 'carbs' in food ? (food.carbs ?? '--') : '--', unit: 'g' },
                    { label: 'চর্বি', val: 'fat' in food ? (food.fat ?? '--') : '--', unit: 'g' },
                    { label: 'ফাইবার', val: food.fiber ?? '--', unit: 'g' },
                  ].map((m, i) => (
                    <div key={i} className="bg-cream/50 p-3 rounded-xl text-center border border-ink/5">
                      <div className="text-[0.55rem] text-ink-faint uppercase tracking-wider mb-1 font-bold">{m.label}</div>
                      <div className="font-bold text-sm text-ink">{m.val}<span className="text-xs opacity-60">{m.val !== '--' ? m.unit : ''}</span></div>
                    </div>
                  ))}
                </div>

                {/* AI Insight */}
                {showInsight && insight && (
                  <div className="bg-gradient-to-r from-accent/5 to-transparent p-4 rounded-2xl border border-accent/10">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <p className="font-bn text-sm text-ink leading-relaxed">{insight}</p>
                    </div>
                  </div>
                )}

                {/* Rules from detail */}
                {selectedFood?.code === food.code && selectedFood.rules.length > 0 && (
                  <div className="space-y-2">
                    {selectedFood.rules.map((rule, i) => (
                      <div key={i} className={`p-3 rounded-xl border text-sm font-bn ${
                        rule.action === 'AVOID' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'
                      }`}>
                        <span className="font-bold">{rule.action === 'AVOID' ? '⚠️ এড়িয়ে চলুন' : '✅ পছন্দনীয়'}</span>
                        {rule.condition && <span className="opacity-70"> ({rule.condition})</span>}: {rule.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <DashboardLayout title="খাবারের তালিকা" subtitle="Food Database">
      <div className="max-w-4xl mx-auto pb-20 space-y-8">
        {/* Tab */}
        <div className="flex justify-center">
          <div className="flex bg-white p-1.5 rounded-2xl border border-ink/5 shadow-sm gap-1">
            {[
              { id: 'safe' as Tab, label: 'নিরাপদ খাবার', icon: Shield },
              { id: 'search' as Tab, label: 'খাবার খুঁজুন', icon: Search },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setTab(id); setQuery(''); setSearchResults([]); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bn text-sm font-bold transition-all ${
                  tab === id ? 'bg-ink text-cream shadow-xl' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        {tab === 'search' && (
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="খাবার খুঁজুন... যেমন: রুই মাছ, ডাল, আম"
              className="w-full bg-white border border-ink/10 rounded-2xl py-4 pl-14 pr-4 font-bn focus:border-accent/30 focus:ring-4 ring-accent/5 outline-none transition-all shadow-sm"
              autoFocus
            />
            {loading && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-accent" />}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 font-bn text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {tab === 'safe' && (
            <motion.div key="safe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {safeFoodsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-accent" />
                  <p className="font-bn text-ink-muted">আপনার অবস্থার জন্য নিরাপদ খাবার খুঁজছি...</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bn font-bold text-ink flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      আপনার জন্য নিরাপদ {safeFoods.length}টি খাবার
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {safeFoods.map((food) => renderFoodCard(food, false))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === 'search' && (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {query.length < 2 ? (
                <div className="text-center py-16 text-ink-muted font-bn">
                  <Apple className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>খাবারের নাম লিখুন অনুসন্ধান করতে</p>
                  <p className="text-sm opacity-60 mt-1">বাংলা বা ইংরেজি উভয়তে খুঁজতে পারেন</p>
                </div>
              ) : searchResults.length === 0 && !loading ? (
                <div className="text-center py-16 text-ink-muted font-bn">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>"{query}" এর জন্য কোনো ফলাফল পাওয়া যায়নি</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((food) => renderFoodCard(food, true))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};
