import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../lib/api';

type Tab = 'login' | 'register';

export const AuthPage = () => {
  const [tab, setTab] = useState<Tab>('login');
  const [identifier, setIdentifier] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/chat');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone && !email) { setError('Phone or email is required'); return; }
    setLoading(true);
    try {
      await register({ phone: phone || undefined, email: email || undefined, password });
      navigate('/profile');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6 relative overflow-hidden font-bn">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-forest/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-ink rounded-[1.5rem] text-cream mb-6 shadow-2xl transform -rotate-3">
            <span className="font-display font-black text-2xl text-accent">D</span>
          </div>
          <h1 className="font-display font-black text-4xl text-ink tracking-tight">
            Desi<span className="text-accent">Diet</span>
          </h1>
          <p className="text-ink-muted text-sm mt-2 font-bn">আপনার ব্যক্তিগত পুষ্টি সহায়ক</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-ink/5 shadow-sm mb-8">
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                tab === t ? 'bg-ink text-cream shadow-lg' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t === 'login' ? 'লগইন' : 'নিবন্ধন'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-ink/5">
          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">ফোন বা ইমেইল</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                    <input
                      id="login-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="01XXXXXXXXX বা email@example.com"
                      className="w-full bg-cream/50 border-2 border-transparent focus:border-accent/30 rounded-2xl py-4 pl-11 pr-4 font-bn outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">পাসওয়ার্ড</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড"
                      className="w-full bg-cream/50 border-2 border-transparent focus:border-accent/30 rounded-2xl py-4 pl-11 pr-12 font-bn outline-none transition-all text-sm"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="font-bn">{error}</span>
                  </div>
                )}

                <button
                  id="login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-ink text-cream rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-accent transition-all shadow-xl shadow-ink/10 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>লগইন করুন <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegister}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">ফোন নম্বর</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                    <input
                      id="register-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-cream/50 border-2 border-transparent focus:border-accent/30 rounded-2xl py-4 pl-11 pr-4 font-bn outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">ইমেইল (ঐচ্ছিক)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                    <input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-cream/50 border-2 border-transparent focus:border-accent/30 rounded-2xl py-4 pl-11 pr-4 font-bn outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">পাসওয়ার্ড (ন্যূনতম ৬ অক্ষর)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="শক্তিশালী পাসওয়ার্ড"
                      minLength={6}
                      className="w-full bg-cream/50 border-2 border-transparent focus:border-accent/30 rounded-2xl py-4 pl-11 pr-12 font-bn outline-none transition-all text-sm"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="font-bn">{error}</span>
                  </div>
                )}

                <button
                  id="register-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-ink text-cream rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-accent transition-all shadow-xl shadow-ink/10 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>অ্যাকাউন্ট তৈরি করুন <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-ink-faint mt-6 font-bn">
          আপনার তথ্য সম্পূর্ণ নিরাপদ এবং গোপনীয়
        </p>
      </motion.div>
    </div>
  );
};
