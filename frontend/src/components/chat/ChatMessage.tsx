import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Copy, Check, User } from 'lucide-react';

interface ChatMessageProps {
  id: number;
  type: 'ai' | 'user';
  text: string;
  time: string;
  isStreaming?: boolean;
}

export const ChatMessage = ({ type, text, time, isStreaming }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [text]);

  const isAi = type === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`flex ${isAi ? 'justify-start' : 'justify-end'} items-end gap-2 md:gap-4`}
    >
      {isAi && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-[1.25rem] bg-ink flex-shrink-0 flex items-center justify-center text-cream shadow-xl mb-1 transform -rotate-6 border-2 border-white/10"
        >
          <Bot size={16} className="md:w-6 md:h-6" />
        </motion.div>
      )}

      <div className={`relative p-4 md:p-7 lg:p-9 rounded-[1.5rem] md:rounded-[2.8rem] font-bn leading-relaxed text-sm md:text-lg max-w-[92%] md:max-w-[80%] lg:max-w-[70%] shadow-lg transition-all duration-300 ${
        isAi
          ? 'bg-white border border-ink/5 text-ink rounded-tl-none ring-1 ring-ink/5'
          : 'bg-ink text-cream rounded-br-none shadow-ink/30'
      }`}>
        {/* Loading dots when empty */}
        {isAi && text === '' && (
          <div className="flex gap-1.5 py-2 px-1">
            <div className="w-2 h-2 bg-ink/20 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-ink/20 rounded-full animate-pulse delay-75" />
            <div className="w-2 h-2 bg-ink/20 rounded-full animate-pulse delay-150" />
          </div>
        )}

        {/* Message content */}
        <div className="relative z-10">
          {isAi && text ? (
            <div className="prose prose-sm md:prose-base max-w-none prose-headings:font-bold prose-headings:text-ink prose-p:text-ink prose-strong:text-accent prose-ul:text-ink prose-ol:text-ink prose-li:marker:text-accent">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {text}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{text}</div>
          )}
        </div>

        {/* Streaming cursor */}
        {isAi && isStreaming && text !== '' && (
          <span className="inline-block w-0.5 h-5 bg-accent ml-1 animate-pulse" />
        )}

        {/* Footer: time + copy */}
        <div className={`text-[0.6rem] md:text-[0.65rem] mt-2 md:mt-4 font-body font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2 ${isAi ? 'justify-start' : 'justify-end'}`}>
          {isAi && <div className="w-1 h-1 bg-accent rounded-full animate-ping" />}
          {time}
          {isAi && text && !isStreaming && (
            <button
              onClick={handleCopy}
              className="ml-2 p-1 rounded-lg hover:bg-ink/5 transition-colors"
              title="কপি করুন"
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {!isAi && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-accent flex-shrink-0 flex items-center justify-center text-cream shadow-lg mb-1"
        >
          <User size={14} className="md:w-4 md:h-4" />
        </motion.div>
      )}
    </motion.div>
  );
};
