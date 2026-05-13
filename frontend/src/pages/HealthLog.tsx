import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Calendar,
  Activity,
  Droplets,
  Weight,
  Plus,
  History,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { healthLogApi, type HealthLogResponse, type HealthTrendsResponse } from '../lib/api';

export const HealthLog = () => {
  const [activeTab, setActiveTab] = useState<'log' | 'history' | 'trends'>('log');
  const [logs, setLogs] = useState<HealthLogResponse[]>([]);
  const [trends, setTrends] = useState<HealthTrendsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [weightKg, setWeightKg] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [hba1c, setHba1c] = useState('');
  const [notes, setNotes] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await healthLogApi.list(30);
      setLogs(data);
    } catch {
      setError('লগ লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await healthLogApi.trends();
      setTrends(data);
    } catch {
      setError('ট্রেন্ড লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') fetchLogs();
    else if (activeTab === 'trends') fetchTrends();
  }, [activeTab, fetchLogs, fetchTrends]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await healthLogApi.create({
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        blood_sugar: bloodSugar ? parseFloat(bloodSugar) : undefined,
        blood_pressure: bloodPressure || undefined,
        hba1c: hba1c ? parseFloat(hba1c) : undefined,
        notes: notes || undefined,
      });
      setSuccess('স্বাস্থ্য লগ সংরক্ষণ হয়েছে!');
      setWeightKg('');
      setBloodSugar('');
      setBloodPressure('');
      setHba1c('');
      setNotes('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setSaveLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Prepare chart data from trends
  const weightChartData = (trends?.weight_trend?.history || []).map(([date, val]) => ({
    date: new Date(date).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' }),
    weight: val,
  }));

  const sugarChartData = (trends?.blood_sugar_trend?.history || []).map(([date, val]) => ({
    date: new Date(date).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' }),
    sugar: val,
  }));

  return (
    <DashboardLayout title="স্বাস্থ্য লগ" subtitle={today}>
      <div className="max-w-5xl mx-auto pb-20">
        {/* Tab Toggle */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-white p-1.5 rounded-2xl border border-ink/5 shadow-sm gap-1">
            {[
              { id: 'log' as const, label: 'আজকের লগ', icon: Plus },
              { id: 'history' as const, label: 'ইতিহাস', icon: History },
              { id: 'trends' as const, label: 'ট্রেন্ড', icon: Activity },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bn text-sm font-bold transition-all ${
                  activeTab === id ? 'bg-ink text-cream shadow-xl' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 font-bn text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 font-bn text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'log' && (
            <motion.div key="log" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Log Form */}
              <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-ink/5 h-fit">
                <h2 className="font-bn text-xl font-bold text-ink mb-8 flex items-center gap-3">
                  <Plus className="w-6 h-6 text-accent" />
                  নতুন এন্ট্রি
                </h2>

                <form onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block font-bn text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">ওজন (কেজি)</label>
                    <div className="relative group">
                      <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint group-focus-within:text-accent transition-colors" />
                      <input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)}
                        placeholder="যেমন: ৭০.৫"
                        className="w-full bg-cream/50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 font-bn focus:bg-white focus:border-accent/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bn text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">রক্তের শর্করা (mmol/L)</label>
                    <div className="relative group">
                      <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                      <input type="number" step="0.1" value={bloodSugar} onChange={(e) => setBloodSugar(e.target.value)}
                        placeholder="যেমন: ৬.৫"
                        className="w-full bg-cream/50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 font-bn focus:bg-white focus:border-accent/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bn text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">রক্তচাপ (systolic/diastolic)</label>
                    <div className="relative group">
                      <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint group-focus-within:text-accent transition-colors" />
                      <input type="text" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)}
                        placeholder="যেমন: ১২০/৮০"
                        className="w-full bg-cream/50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 font-bn focus:bg-white focus:border-accent/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bn text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">HbA1c (%)</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint group-focus-within:text-accent transition-colors" />
                      <input type="number" step="0.1" value={hba1c} onChange={(e) => setHba1c(e.target.value)}
                        placeholder="যেমন: ৭.২"
                        className="w-full bg-cream/50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 font-bn focus:bg-white focus:border-accent/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bn text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">নোট</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="আজ কেমন অনুভব করছেন..."
                      rows={3}
                      className="w-full bg-cream/50 border-2 border-transparent rounded-2xl py-4 px-4 font-bn focus:bg-white focus:border-accent/20 outline-none transition-all resize-none"
                    />
                  </div>

                  <button type="submit" disabled={saveLoading}
                    className="w-full py-4 bg-ink text-cream rounded-2xl font-bold font-bn flex items-center justify-center gap-3 hover:bg-accent transition-all shadow-xl disabled:opacity-60"
                  >
                    {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'এন্ট্রি সংরক্ষণ করুন'}
                  </button>
                </form>
              </div>

              {/* Quick Stats */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-ink/5">
                  <h3 className="font-bn text-lg font-bold text-ink mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-accent rounded-full inline-block" />
                    আপনার নির্দেশিকা
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        label: 'সাধারণ রক্তে শর্করা',
                        val: '৪.০ - ৭.৮ mmol/L',
                        bg: 'bg-emerald-50',
                        border: 'border-emerald-200',
                        labelColor: 'text-emerald-600',
                        valColor: 'text-emerald-800',
                      },
                      {
                        label: 'স্বাস্থ্যকর রক্তচাপ',
                        val: '< ১২০/৮০ mmHg',
                        bg: 'bg-sky-50',
                        border: 'border-sky-200',
                        labelColor: 'text-sky-600',
                        valColor: 'text-sky-800',
                      },
                      {
                        label: 'HbA1c লক্ষ্যমাত্রা',
                        val: '< ৭% (ডায়াবেটিস)',
                        bg: 'bg-amber-50',
                        border: 'border-amber-200',
                        labelColor: 'text-amber-600',
                        valColor: 'text-amber-900',
                      },
                      {
                        label: 'BMI লক্ষ্যমাত্রা',
                        val: '১৮.৫ - ২৩.০ (দক্ষিণ এশিয়া)',
                        bg: 'bg-violet-50',
                        border: 'border-violet-200',
                        labelColor: 'text-violet-600',
                        valColor: 'text-violet-900',
                      },
                    ].map((item, i) => (
                      <div key={i} className={`p-4 rounded-2xl border ${item.bg} ${item.border}`}>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${item.labelColor}`}>{item.label}</p>
                        <p className={`font-black text-base ${item.valColor}`}>{item.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
              ) : logs.length === 0 ? (
                <div className="text-center py-20 font-bn text-ink-muted">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>কোনো লগ নেই। প্রথমে একটি এন্ট্রি যোগ করুন।</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((entry, i) => (
                    <div key={entry.log_id} className="bg-white p-5 rounded-[1.5rem] flex flex-col md:flex-row md:items-center justify-between border border-ink/5 hover:border-accent/20 transition-all gap-4">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-cream rounded-2xl flex flex-col items-center justify-center text-ink hover:bg-accent hover:text-cream transition-all duration-300 shadow-sm">
                          <span className="text-[0.55rem] uppercase font-body font-black opacity-40">
                            {new Date(entry.log_date).toLocaleDateString('en', { month: 'short' })}
                          </span>
                          <span className="text-xl font-black leading-none">{new Date(entry.log_date).getDate()}</span>
                        </div>
                        <div>
                          <div className="font-bn font-bold text-ink">স্বাস্থ্য পরীক্ষা</div>
                          <div className="font-bn text-xs text-ink-faint">
                            {new Date(entry.created_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })} এ লগ করা হয়েছে
                          </div>
                          {entry.notes && <div className="font-bn text-xs text-ink-muted mt-1 italic">"{entry.notes}"</div>}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 md:gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-ink/5">
                        {entry.weight_kg && (
                          <div className="text-center">
                            <div className="text-[0.6rem] text-ink-faint font-bn font-bold uppercase tracking-wider mb-1">ওজন</div>
                            <div className="font-bold text-ink text-sm">{entry.weight_kg} kg</div>
                          </div>
                        )}
                        {entry.blood_sugar && (
                          <div className="text-center">
                            <div className="text-[0.6rem] text-ink-faint font-bn font-bold uppercase tracking-wider mb-1">শর্করা</div>
                            <div className={`font-bold text-sm ${entry.blood_sugar > 7.8 ? 'text-red-500' : 'text-green-600'}`}>
                              {entry.blood_sugar}
                            </div>
                          </div>
                        )}
                        {entry.blood_pressure && (
                          <div className="text-center">
                            <div className="text-[0.6rem] text-ink-faint font-bn font-bold uppercase tracking-wider mb-1">রক্তচাপ</div>
                            <div className="font-bold text-ink text-sm">{entry.blood_pressure}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'trends' && (
            <motion.div key="trends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
              ) : (
                <>
                  {/* Weight Trend */}
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-ink/5">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-bn text-xl font-bold text-ink flex items-center gap-3">
                        <Activity className="w-6 h-6 text-accent" />
                        ওজন পরিবর্তনের ট্রেন্ড
                      </h2>
                      {trends?.weight_trend?.change_kg != null && (
                        <div className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-xl ${
                          trends.weight_trend.change_kg < 0
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-500'
                        }`}>
                          {trends.weight_trend.change_kg < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                          {trends.weight_trend.change_kg > 0 ? '+' : ''}{trends.weight_trend.change_kg} kg
                        </div>
                      )}
                    </div>

                    {weightChartData.length > 0 ? (
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={weightChartData}>
                            <defs>
                              <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#C8472A" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#C8472A" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F0E8" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9E9890', fontSize: 10 }} dy={10} />
                            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '12px' }} />
                            <Area type="monotone" dataKey="weight" stroke="#C8472A" strokeWidth={3} fill="url(#wGrad)" dot={{ r: 4, fill: '#C8472A', strokeWidth: 2, stroke: '#fff' }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-ink-muted font-bn text-sm">
                        পর্যাপ্ত ডেটা নেই
                      </div>
                    )}
                  </div>

                  {/* Blood Sugar Trend */}
                  {sugarChartData.length > 0 && (
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-ink/5">
                      <h2 className="font-bn text-xl font-bold text-ink mb-6 flex items-center gap-3">
                        <Droplets className="w-6 h-6 text-blue-500" />
                        রক্তের শর্করার ট্রেন্ড
                      </h2>
                      <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={sugarChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F0E8" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9E9890', fontSize: 10 }} dy={10} />
                            <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '12px' }} />
                            <Line type="monotone" dataKey="sugar" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};
