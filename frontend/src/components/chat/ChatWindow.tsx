import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  Layout,
  Activity,
  FileText,
  Send,
  Flame,
  History,
  Bot,
  WifiOff,
  User,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../layout/DashboardLayout';
import { chatApi, type ChatHistoryItem, isAuthenticated } from '../../lib/api';

interface Message {
  id: number;
  type: 'ai' | 'user';
  text: string;
  time: string;
}

export const ChatWindow = () => {
  const { t, i18n } = useTranslation();
  const { profileData, isLoggedIn } = useAuth();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { abortRef.current?.(); };
  }, []);

  const buildHistory = (): ChatHistoryItem[] =>
    messages.map((m) => ({
      role: m.type === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

  const send = useCallback((overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isStreaming) return;

    setApiError(null);

    const userMsg: Message = {
      id: Date.now(),
      type: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    if (!isLoggedIn || !isAuthenticated()) {
      // Fallback: simulate response for unauthenticated users
      setTimeout(() => {
        const isBn = i18n.language === 'bn';
        const fallback = isBn
          ? 'লগইন করুন বা নিবন্ধন করুন আমার সাথে কথা বলতে।'
          : 'Please login or register to chat with me.';
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, type: 'ai', text: fallback, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ]);
      }, 1000);
      return;
    }

    const aiMsgId = Date.now() + 1;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Insert placeholder
    setMessages((prev) => [...prev, { id: aiMsgId, type: 'ai', text: '', time }]);
    setIsTyping(false);
    setIsStreaming(true);

    const history = buildHistory();

    const abort = chatApi.stream(
      textToSend,
      i18n.language,
      history,
      (token) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, text: m.text + token } : m))
        );
      },
      () => {
        setIsStreaming(false);
        abortRef.current = null;
      },
      (err) => {
        setIsStreaming(false);
        setApiError(err);
        abortRef.current = null;
      }
    );

    abortRef.current = abort;
  }, [input, isStreaming, isLoggedIn, i18n.language, messages]);

  const { user } = useAuth();
  const profile = profileData?.profile;
  const isBn = i18n.language === 'bn';
  
  const displayName = isBn
    ? (profile?.name_bn || profile?.name_en || user?.email?.split('@')[0] || user?.phone || 'ব্যবহারকারী')
    : (profile?.name_en || profile?.name_bn || user?.email?.split('@')[0] || user?.phone || 'User');

  return (
    <DashboardLayout
      title={t('chat.title')}
      subtitle={t('chat.active_status')}
      noPadding
      headerExtra={(
        <div className="relative">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-ink rounded-xl md:rounded-2xl flex items-center justify-center text-cream shadow-lg transform -rotate-3">
            <Bot size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 bg-green-500 border-2 md:border-4 border-white rounded-full" />
        </div>
      )}
      headerActions={(
        <button
          onClick={() => { abortRef.current?.(); setMessages([]); setApiError(null); }}
          className="p-2 md:p-3 bg-cream text-ink-muted hover:bg-red-50 hover:text-red-500 rounded-xl transition-all flex items-center gap-2 text-[0.65rem] md:text-xs font-bold font-bn shadow-sm"
        >
          <History size={16} />
          <span className="hidden sm:inline">{t('chat.clear_chat')}</span>
        </button>
      )}
    >
      <div className="flex-1 flex flex-col relative max-w-6xl mx-auto w-full min-h-0">
        {/* Soft Background Glows */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[600px] bg-accent/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />

        {/* API Error Banner */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="m-4 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bn z-20"
          >
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </motion.div>
        )}

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 pb-12 md:p-8 md:pb-24 space-y-6 md:space-y-10 scroll-smooth relative z-10">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-10"
              >
                {/* Brand Icon */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="w-12 h-12 md:w-20 md:h-20 bg-ink rounded-2xl md:rounded-[2rem] flex items-center justify-center text-cream mb-4 md:mb-8 shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <MessageSquare size={32} className="relative z-10" />
                </motion.div>

                <div className="space-y-2 md:space-y-4 mb-6 md:mb-16 px-4">
                  <h4 className="text-ink-muted font-bn text-sm md:text-xl opacity-60">
                    {t('chat.greeting_user', { name: displayName })}
                  </h4>
                  <h3 className="font-display text-2xl md:text-4xl lg:text-5xl font-black text-ink tracking-tight leading-tight">
                    {t('chat.how_can_i_help')}
                  </h3>
                  <p className="font-bn text-[0.75rem] md:text-base text-ink-faint max-w-md mx-auto">
                    {t('chat.description_short')}
                  </p>
                </div>

                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 w-full max-w-4xl px-2">
                  {[
                    { icon: Layout, title: t('chat.suggestions.title1'), sub: t('chat.suggestions.sub1'), label: 'Meal Plan' },
                    { icon: Activity, title: t('chat.suggestions.title2'), sub: t('chat.suggestions.sub2'), label: 'Health Status' },
                    { icon: Flame, title: t('chat.suggestions.title3'), sub: t('chat.suggestions.sub3'), label: 'Nutrients' },
                  ].map((btn, i) => (
                    <button
                      key={i}
                      onClick={() => send(btn.title)}
                      disabled={isStreaming}
                      className="p-4 md:p-8 bg-white border border-ink/5 rounded-2xl md:rounded-[2.5rem] text-center sm:text-left hover:border-accent/20 hover:shadow-2xl transition-all group shadow-sm disabled:opacity-50 flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-0"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-cream rounded-xl md:rounded-2xl flex items-center justify-center text-ink group-hover:bg-accent group-hover:text-cream transition-colors shrink-0 sm:mb-6">
                        <btn.icon size={18} className="md:w-5 md:h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-bn font-bold text-sm md:text-xl text-ink mb-0.5 md:mb-2">{btn.title}</div>
                        <div className="font-bn text-xs text-ink-muted opacity-60">{btn.sub}</div>
                      </div>
                      <div className="hidden sm:block text-[0.6rem] uppercase tracking-widest text-ink-faint font-body font-bold border-t border-ink/5 pt-4 w-full mt-4">
                        {btn.label}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2 md:gap-4`}
                >
                  {msg.type === 'ai' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-[1.25rem] bg-ink flex-shrink-0 flex items-center justify-center text-cream shadow-xl mb-1 transform -rotate-6 border-2 border-white/10"
                    >
                      <Bot size={16} className="md:w-6 md:h-6" />
                    </motion.div>
                  )}
                  <div className={`relative p-4 md:p-7 lg:p-9 rounded-[1.5rem] md:rounded-[2.8rem] font-bn leading-relaxed text-sm md:text-lg max-w-[92%] md:max-w-[80%] lg:max-w-[70%] shadow-lg transition-all duration-300 ${
                    msg.type === 'user'
                      ? 'bg-ink text-cream rounded-br-none shadow-ink/30'
                      : 'bg-white border border-ink/5 text-ink rounded-tl-none ring-1 ring-ink/5'
                  }`}>
                    {/* Loading dots when empty */}
                    {msg.type === 'ai' && msg.text === '' && (
                      <div className="flex gap-1.5 py-2 px-1">
                        <div className="w-2 h-2 bg-ink/20 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-ink/20 rounded-full animate-pulse delay-75" />
                        <div className="w-2 h-2 bg-ink/20 rounded-full animate-pulse delay-150" />
                      </div>
                    )}
                    <div className="relative z-10 whitespace-pre-wrap">{msg.text}</div>
                    {/* Streaming cursor */}
                    {msg.type === 'ai' && isStreaming && msg.text !== '' && (
                      <span className="inline-block w-0.5 h-5 bg-accent ml-1 animate-pulse" />
                    )}
                    <div className={`text-[0.6rem] md:text-[0.65rem] mt-2 md:mt-4 font-body font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.type === 'ai' && <div className="w-1 h-1 bg-accent rounded-full animate-ping" />}
                      {msg.time}
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {/* AI Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col gap-2"
              >
                <div className="flex justify-start items-end gap-2 md:gap-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-[1.25rem] bg-ink flex-shrink-0 flex items-center justify-center text-cream shadow-xl mb-1 transform -rotate-6">
                    <Bot size={16} className="md:w-6 md:h-6" />
                  </div>
                  <div className="p-5 md:p-6 bg-white border border-ink/5 rounded-[1.8rem] md:rounded-[2.2rem] rounded-tl-none shadow-xl flex items-center gap-1.5 ring-1 ring-ink/5">
                    {[0, 1, 2].map((dot) => (
                      <motion.div
                        key={dot}
                        className="w-2 h-2 md:w-2.5 md:h-2.5 bg-accent/40 rounded-full"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: dot * 0.15, ease: 'easeInOut' }}
                      />
                    ))}
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-10 md:ml-16 flex items-center gap-2"
                >
                  <span className="text-[0.65rem] md:text-xs font-bn font-bold text-accent tracking-wider uppercase flex items-center gap-1.5">
                    {t('chat.ai_name')}
                    <span className="animate-pulse">{t('chat.typing')}</span>
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-6 md:h-8 shrink-0" />
        </div>

        {/* Scroll to bottom button */}
        {messages.length > 3 && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-32 right-6 p-3 bg-white border border-ink/10 rounded-2xl shadow-xl text-ink-muted hover:text-accent transition-all z-20"
          >
            <ChevronDown size={18} />
          </button>
        )}

        {/* Input Bar */}
        <div className="p-4 md:p-8 bg-white/90 backdrop-blur-xl border-t border-ink/5 z-30 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="max-w-5xl mx-auto flex items-center gap-3 md:gap-5">
            <button
              aria-label="View history"
              onClick={() => setMessages([])}
              className="p-4 md:p-5 bg-ink text-cream rounded-[1.2rem] md:rounded-[1.5rem] shadow-2xl hover:bg-accent transition-all shrink-0 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
              <History size={22} className="relative z-10" />
            </button>

            <div className="flex-1 bg-white border border-ink/10 rounded-full flex items-center px-4 md:px-8 py-1 md:py-2 shadow-2xl shadow-ink/5 focus-within:border-accent/60 focus-within:ring-4 ring-accent/5 transition-all duration-500">
              <div className="text-accent mr-3 md:mr-5 hidden sm:block opacity-60">
                <FileText size={20} />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                disabled={isStreaming}
                aria-label="Chat input"
                placeholder={t('chat.input_placeholder')}
                className="flex-1 bg-transparent py-3 md:py-5 font-bn text-sm md:text-xl focus:outline-none placeholder:text-ink/30 disabled:opacity-50"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || isStreaming}
                aria-label="Send message"
                className="ml-2 px-4 md:px-10 py-2 md:py-4 bg-accent text-white rounded-full font-bn font-black text-sm md:text-xl flex items-center gap-2 hover:bg-ink hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all shadow-xl shadow-accent/20 shrink-0"
              >
                <span className="hidden md:inline">{t('chat.send')}</span>
                <Send size={18} className={input.trim() ? 'animate-pulse' : ''} />
              </button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-2 mt-4 md:mt-6">
            <p className="text-[0.6rem] md:text-[0.7rem] uppercase tracking-[0.3em] text-ink-faint font-body font-black opacity-40">
              {t('chat.footer_secure')}
            </p>
            <span className="hidden md:block text-ink-faint opacity-20">•</span>
            <p className="text-[0.6rem] md:text-[0.7rem] uppercase tracking-[0.3em] text-ink-faint font-body font-black opacity-40">
              {t('chat.footer_disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};