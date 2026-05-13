import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2,
  Flame,
  Zap,
  Droplet,
  Wind,
  AlertTriangle,
  CheckCircle,
  Mail,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { reportsApi, type NutritionReport, type ConditionsReport } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export const ReportPage = () => {
  const { user } = useAuth();
  const [nutritionReport, setNutritionReport] = useState<NutritionReport | null>(null);
  const [conditionsReport, setConditionsReport] = useState<ConditionsReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState(user?.email || '');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nutrition, conditions] = await Promise.all([
        reportsApi.nutrition(),
        reportsApi.conditions(),
      ]);
      setNutritionReport(nutrition);
      setConditionsReport(conditions);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'রিপোর্ট লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setEmailLoading(true);
    setEmailSuccess(null);
    try {
      const res = await reportsApi.sendEmail(emailInput, 'bn');
      setEmailSuccess(res.message);
    } catch {
      setEmailSuccess('ইমেইল পাঠানো সম্ভব হয়নি');
    } finally {
      setEmailLoading(false);
    }
  };

  const targets = nutritionReport?.targets;

  return (
    <DashboardLayout
      title="পুষ্টি রিপোর্ট"
      subtitle="Nutrition Report"
      headerActions={(
        <button onClick={fetchReports} disabled={loading}
          className="p-2.5 bg-cream rounded-2xl text-ink-muted hover:bg-accent hover:text-white transition-all"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      )}
    >
      <div className="max-w-5xl mx-auto pb-20 space-y-8">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 font-bn text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">সমস্যা হয়েছে</p>
              <p className="opacity-80">{error}</p>
              <p className="text-xs mt-1 opacity-60">প্রথমে প্রোফাইল সেট আপ করুন</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
            <p className="font-bn text-ink-muted">রিপোর্ট তৈরি হচ্ছে...</p>
          </div>
        ) : targets ? (
          <>
            {/* Targets Overview */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-ink text-cream p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                <BarChart2 className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest opacity-50 font-body">Daily Nutrition Targets</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { icon: Flame, label: 'ক্যালোরি', val: `${targets.target_calories}`, unit: 'kcal', color: 'text-accent' },
                    { icon: Zap, label: 'প্রোটিন', val: `${targets.protein_g}`, unit: 'g', color: 'text-yellow-400' },
                    { icon: Droplet, label: 'শর্করা', val: `${targets.carbs_g}`, unit: 'g', color: 'text-blue-400' },
                    { icon: Wind, label: 'চর্বি', val: `${targets.fat_g}`, unit: 'g', color: 'text-green-400' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-2 opacity-50 mb-2">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-xs font-bold uppercase tracking-wider font-body">{item.label}</span>
                      </div>
                      <div className="font-display text-3xl md:text-4xl font-black">{item.val}</div>
                      <div className={`text-sm ${item.color} font-bold`}>{item.unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* BMI and Body Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'BMI', val: targets.bmi != null ? targets.bmi.toFixed(1) : '--', sub: targets.bmi_category || '---', color: 'bg-white border-ink/5' },
                { label: 'আদর্শ ওজন', val: targets.ideal_body_weight_kg != null ? `${targets.ideal_body_weight_kg.toFixed(1)} kg` : '--', sub: 'Ideal Body Weight', color: 'bg-white border-ink/5' },
                { label: 'পানির লক্ষ্য', val: targets.water_l != null ? `${Number(targets.water_l).toFixed(1)} L` : '--', sub: 'Daily Water Intake', color: 'bg-white border-ink/5' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`p-6 rounded-[1.5rem] border shadow-sm ${item.color}`}
                >
                  <div className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-2 font-body">{item.label}</div>
                  <div className="font-display text-3xl font-black text-ink">{item.val}</div>
                  <div className="text-sm text-ink-muted font-bn mt-1">{item.sub}</div>
                </motion.div>
              ))}
            </div>

            {/* Latest Health Log */}
            {nutritionReport?.latest_health_log && (
              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-ink/5 shadow-sm">
                <h3 className="font-bn text-lg font-bold text-ink mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  সর্বশেষ স্বাস্থ্য পরীক্ষা
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'ওজন', val: nutritionReport.latest_health_log.weight_kg ? `${nutritionReport.latest_health_log.weight_kg} kg` : 'N/A' },
                    { label: 'রক্তচাপ', val: nutritionReport.latest_health_log.blood_pressure || 'N/A' },
                    { label: 'রক্তে শর্করা', val: nutritionReport.latest_health_log.blood_sugar ? `${nutritionReport.latest_health_log.blood_sugar} mmol/L` : 'N/A' },
                  ].map((item, i) => (
                    <div key={i} className="bg-cream/50 p-4 rounded-2xl border border-ink/5 text-center">
                      <div className="text-[0.6rem] text-ink-faint uppercase tracking-wider font-bold mb-1">{item.label}</div>
                      <div className="font-bold text-ink text-sm">{item.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Macro Distribution */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-ink/5 shadow-sm">
              <h3 className="font-bn text-lg font-bold text-ink mb-6">ম্যাক্রো বিভাজন (NDG 2025)</h3>
              <div className="space-y-4">
                {[
                  { label: 'প্রোটিন', pct: 15, val: targets.protein_g, color: 'bg-amber-400' },
                  { label: 'শর্করা', pct: 55, val: targets.carbs_g, color: 'bg-accent' },
                  { label: 'চর্বি', pct: 30, val: targets.fat_g, color: 'bg-forest' },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between font-bn text-sm mb-2">
                      <span className="font-bold text-ink">{m.label}</span>
                      <span className="text-ink-faint">{m.pct}% — {m.val}g</span>
                    </div>
                    <div className="h-2.5 bg-cream rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.pct}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.15 }}
                        className={`h-full ${m.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conditions Rules */}
            {conditionsReport && conditionsReport.conditions.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-ink/5 shadow-sm">
                <h3 className="font-bn text-lg font-bold text-ink mb-4">
                  আপনার অবস্থার জন্য খাদ্য নির্দেশিকা
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {conditionsReport.conditions.map((c, i) => (
                    <span key={i} className="px-3 py-1.5 bg-accent/10 text-accent text-xs font-bold rounded-xl border border-accent/20 font-bn">{c}</span>
                  ))}
                </div>
                {conditionsReport.rules.length > 0 ? (
                  <div className="space-y-3">
                    {conditionsReport.rules.slice(0, 10).map((rule, i) => (
                      <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border text-sm font-bn ${
                        rule.action === 'avoid'
                          ? 'bg-red-50 border-red-100'
                          : 'bg-green-50 border-green-100'
                      }`}>
                        {rule.action === 'avoid'
                          ? <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          : <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        }
                        <div>
                          <span className="font-bold">{rule.food}</span>
                          <span className="opacity-70 ml-1">— {rule.reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-ink-muted font-bn text-sm">কোনো বিশেষ নির্দেশিকা নেই</p>
                )}
              </div>
            )}

            {/* Email Report */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-ink/5 shadow-sm">
              <h3 className="font-bn text-lg font-bold text-ink mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5 text-accent" />
                সাপ্তাহিক রিপোর্ট ইমেইলে পান
              </h3>
              <p className="font-bn text-sm text-ink-muted mb-5">আপনার সাপ্তাহিক অগ্রগতির AI সারসংক্ষেপ ইমেইলে পাঠানো হবে</p>

              <form onSubmit={handleSendEmail} className="flex gap-3">
                <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="আপনার ইমেইল ঠিকানা"
                  className="flex-1 bg-cream/50 border-2 border-transparent focus:border-accent/30 rounded-2xl py-3 px-4 font-bn outline-none transition-all text-sm"
                  required
                />
                <button type="submit" disabled={emailLoading}
                  className="px-6 py-3 bg-ink text-cream rounded-2xl font-bold font-bn text-sm flex items-center gap-2 hover:bg-accent transition-all disabled:opacity-60"
                >
                  {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  পাঠান
                </button>
              </form>

              {emailSuccess && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-3 text-sm text-green-600 font-bn flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> {emailSuccess}
                </motion.p>
              )}
            </div>
          </>
        ) : !loading && !error && (
          <div className="text-center py-20 font-bn text-ink-muted">
            <BarChart2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold mb-2">প্রোফাইল সেট আপ করুন</p>
            <p className="text-sm opacity-60">রিপোর্ট দেখতে প্রথমে আপনার প্রোফাইল পূর্ণ করুন</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
