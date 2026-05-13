import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill,
  Plus,
  Trash2,
  Clock,
  Utensils,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mic,
  List,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { medicineApi, type MedicineReminderListItem, type MedicineReminderResponse } from '../lib/api';

export const MedicinePage = () => {
  const [tab, setTab] = useState<'add' | 'list'>('list');
  const [reminders, setReminders] = useState<MedicineReminderListItem[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastAdded, setLastAdded] = useState<MedicineReminderResponse | null>(null);

  const fetchReminders = useCallback(async () => {
    setListLoading(true);
    try {
      const data = await medicineApi.list();
      setReminders(data);
    } catch {
      setError('রিমাইন্ডার লোড করতে সমস্যা হয়েছে');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    setLastAdded(null);
    try {
      const result = await medicineApi.add({ input, language: 'bn' });
      setLastAdded(result);
      setSuccess(result.confirmation);
      setInput('');
      fetchReminders();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ওষুধ যোগ করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await medicineApi.delete(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError('মুছতে সমস্যা হয়েছে');
    }
  };

  const EXAMPLES = [
    'সকালে ও রাতে মেটফরমিন ৫০০ mg খাবারের পরে নিতে হবে',
    'রাতে ঘুমানোর আগে ইনসুলিন নিতে হবে',
    'সকালে ৮টায় আমলোডিপিন ৫mg এবং বিকেলে ৪টায় লিসিনোপ্রিল ১০mg',
  ];

  return (
    <DashboardLayout title="ওষুধের রিমাইন্ডার" subtitle="Medicine Reminders">
      <div className="max-w-4xl mx-auto pb-20 space-y-8">
        {/* Tab */}
        <div className="flex justify-center">
          <div className="flex bg-white p-1.5 rounded-2xl border border-ink/5 shadow-sm gap-1">
            {[
              { id: 'list' as const, label: 'রিমাইন্ডার সমূহ', icon: List },
              { id: 'add' as const, label: 'নতুন যোগ করুন', icon: Plus },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
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

        {/* Mobile App Notice */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-[1.5rem] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bn font-bold text-amber-800 text-sm">নোট: নোটিফিকেশন ফিচার</p>
            <p className="font-bn text-amber-700 text-xs mt-1">ওষুধের রিমাইন্ডার পুশ-নোটিফিকেশন শুধুমাত্র আমাদের মোবাইল অ্যাপ্লিকেশনে (App) ব্যবহার করা যাবে। ওয়েবসাইটে আপনি শুধু তালিকা দেখতে ও যোগ করতে পারবেন।</p>
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 font-bn text-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 font-bn text-sm"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {tab === 'add' && (
            <motion.div key="add" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Input Form */}
              <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-ink/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-ink rounded-2xl flex items-center justify-center text-cream">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bn text-xl font-bold text-ink">AI দিয়ে ওষুধ যোগ করুন</h2>
                    <p className="font-bn text-sm text-ink-muted">বাংলায় বলুন বা লিখুন কোন ওষুধ কখন নিতে হবে</p>
                  </div>
                </div>

                <form onSubmit={handleAdd} className="space-y-4">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="যেমন: সকালে মেটফরমিন ৫০০ mg খাবারের পরে এবং রাতে গ্লিমেপিরাইড ২mg..."
                    rows={4}
                    className="w-full bg-cream/50 border-2 border-transparent focus:border-accent/30 rounded-2xl py-4 px-4 font-bn outline-none transition-all resize-none text-sm"
                    required
                  />

                  <button type="submit" disabled={loading || !input.trim()}
                    className="w-full py-4 bg-ink text-cream rounded-2xl font-bold font-bn flex items-center justify-center gap-3 hover:bg-accent transition-all shadow-xl disabled:opacity-60"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> AI বিশ্লেষণ করছে...</>
                    ) : (
                      <><Pill className="w-5 h-5" /> রিমাইন্ডার যোগ করুন</>
                    )}
                  </button>
                </form>

                {/* Examples */}
                <div className="mt-6">
                  <p className="font-bn text-xs text-ink-faint mb-3 uppercase tracking-wider font-bold">উদাহরণ:</p>
                  <div className="space-y-2">
                    {EXAMPLES.map((ex, i) => (
                      <button key={i} onClick={() => setInput(ex)}
                        className="w-full text-left p-3 rounded-xl bg-cream/50 hover:bg-cream text-ink-muted hover:text-ink transition-colors font-bn text-sm border border-transparent hover:border-ink/5"
                      >
                        "{ex}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Parsed Result */}
              {lastAdded && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-green-100"
                >
                  <h3 className="font-bn text-lg font-bold text-ink mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    যোগ করা হয়েছে
                  </h3>
                  <div className="space-y-3">
                    {lastAdded.medicines.map((med, i) => (
                      <div key={i} className="bg-cream/50 p-4 rounded-2xl border border-ink/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-ink font-bn">{med.name} — {med.dose}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${med.with_food ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                            {med.with_food ? '🍽️ খাবারের সাথে' : '💊 খালি পেটে'}
                          </span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {med.times.map((t, j) => (
                            <span key={j} className="flex items-center gap-1 text-xs bg-white border border-ink/5 px-3 py-1 rounded-xl font-mono font-bold text-ink-muted">
                              <Clock className="w-3 h-3" /> {t}
                            </span>
                          ))}
                        </div>
                        {med.notes && <p className="text-xs text-ink-faint font-bn mt-2 italic">{med.notes}</p>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {tab === 'list' && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {listLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
              ) : reminders.length === 0 ? (
                <div className="text-center py-20 font-bn text-ink-muted">
                  <Pill className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-bold mb-2">কোনো রিমাইন্ডার নেই</p>
                  <p className="text-sm opacity-60">নতুন ওষুধ যোগ করুন</p>
                  <button onClick={() => setTab('add')}
                    className="mt-4 px-6 py-3 bg-ink text-cream rounded-2xl font-bold font-bn text-sm hover:bg-accent transition-all"
                  >
                    ওষুধ যোগ করুন
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.map((r) => (
                    <motion.div
                      key={r.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-5 md:p-6 rounded-[1.5rem] border border-ink/5 hover:border-accent/20 transition-all group shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 bg-cream rounded-2xl flex items-center justify-center text-accent group-hover:bg-ink group-hover:text-cream transition-colors flex-shrink-0">
                            <Pill className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bn font-bold text-ink">{r.name} — {r.dose}</h3>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {r.times.map((t, i) => (
                                <span key={i} className="flex items-center gap-1 text-xs bg-cream border border-ink/5 px-3 py-1 rounded-xl font-mono font-bold text-ink-muted">
                                  <Clock className="w-3 h-3" /> {t}
                                </span>
                              ))}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${r.with_food ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                {r.with_food ? (
                                  <span className="flex items-center gap-1"><Utensils className="w-3 h-3" /> খাবারের সাথে</span>
                                ) : '💊 খালি পেটে'}
                              </span>
                              {r.notes && <span className="text-xs text-ink-faint font-bn italic">{r.notes}</span>}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(r.id)}
                          className="p-2 rounded-xl text-ink-faint hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};
