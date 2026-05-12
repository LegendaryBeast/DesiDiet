import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { colors, fonts, spacing, radius } from '../../lib/theme';
import { Send, Bot, Sparkles } from 'lucide-react-native';
import { API_BASE_URL } from '../../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHaptics } from '../../hooks/useHaptics';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

const QUICK_PROMPTS = [
  'আমার জন্য ডায়েট পরিকল্পনা তৈরি করুন',
  'আমার জন্য আজকের সেরা নাস্তা কী?',
  'ডায়াবেটিস রোগীর জন্য কোন ফল ভালো?',
  'ওজন কমাতে রাতের খাবারে কী খাব?',
  'প্রতিদিন কতটুকু পানি পান করা দরকার?',
];

const WELCOME_MSG: Message = {
  role: 'assistant',
  content: 'নমস্কার! 👋 আমি পুষ্টি এআই। আপনার খাদ্যাভ্যাস, পুষ্টি বা স্বাস্থ্য নিয়ে যেকোনো প্রশ্ন করুন — আমি আপনার ব্যক্তিগত স্বাস্থ্য তথ্য অনুযায়ী পরামর্শ দেব।',
  id: 'welcome',
};

export default function ChatScreen() {
  const { prefill } = useLocalSearchParams<{ prefill?: string }>();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const haptics = useHaptics();
  const prefillSent = useRef(false);

  // Auto-send prefill message when navigated from Meals tab
  useEffect(() => {
    if (prefill && !prefillSent.current) {
      prefillSent.current = true;
      setTimeout(() => sendMessage(prefill), 400); // small delay for screen mount
    }
  }, [prefill]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    haptics.light();

    const userMsg: Message = { role: 'user', content, id: `u_${Date.now()}` };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setShowQuickPrompts(false);
    setStreaming(true);

    const assistantId = `a_${Date.now()}`;
    setMessages((prev) => [...prev, { role: 'assistant', content: '', id: assistantId }]);

    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: content,
          language: 'bn',
          history: messages
            .filter((m) => m.role !== 'assistant' || m.content) // skip empty typing bubbles
            .slice(-10)  // last 10 turns
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error('Chat failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value).split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.token) {
                  accumulated += data.token;
                  setMessages((prev) =>
                    prev.map((m) => m.id === assistantId ? { ...m, content: accumulated } : m)
                  );
                }
              } catch { /* ignore parse errors */ }
            }
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না। পরে আবার চেষ্টা করুন।' }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.role === 'user';
    const isStreamingLast = streaming && index === messages.length - 1 && !isUser;

    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowBot]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Sparkles size={14} color={colors.primary} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          {isStreamingLast && item.content === '' ? (
            <View style={styles.typingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          ) : (
            <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextBot]}>
              {item.content}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.botAvatarLarge}>
          <Bot size={22} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.headerTitle}>পুষ্টি এআই</Text>
          <Text style={styles.headerSub}>ব্যক্তিগতকৃত পরামর্শ</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.msgList}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          showQuickPrompts && messages.length === 1 ? (
            <View style={styles.quickPromptsContainer}>
              <Text style={styles.quickPromptsTitle}>দ্রুত প্রশ্ন করুন</Text>
              {QUICK_PROMPTS.map((q, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.quickChip}
                  onPress={() => {
                    haptics.light();
                    if (q === 'আমার জন্য ডায়েট পরিকল্পনা তৈরি করুন') {
                      router.push('/(tabs)/diet-plan');
                    } else {
                      sendMessage(q);
                    }
                  }}
                >
                  <Text style={styles.quickChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null
        }
      />

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="আপনার প্রশ্ন লিখুন..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={600}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || streaming) && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || streaming}
        >
          {streaming
            ? <ActivityIndicator size="small" color={colors.white} />
            : <Send size={20} color={colors.white} strokeWidth={2} />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  botAvatarLarge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary + '20',
    borderWidth: 1.5, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.textPrimary },
  headerSub: { fontFamily: fonts.bn, fontSize: 13, color: colors.textSecondary },
  onlineDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.success,
    marginLeft: 'auto',
  },

  msgList: { padding: spacing.md, paddingBottom: 20 },

  msgRow: { flexDirection: 'row', marginBottom: spacing.md, alignItems: 'flex-end', gap: spacing.sm },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowBot: { justifyContent: 'flex-start' },

  botAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.primary + '20',
    borderWidth: 1, borderColor: colors.primary + '40',
    alignItems: 'center', justifyContent: 'center',
  },

  bubble: { maxWidth: '78%', borderRadius: radius.lg, paddingVertical: 10, paddingHorizontal: 14 },
  bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleBot: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  msgText: { fontFamily: fonts.bn, fontSize: 15, lineHeight: 24 },
  msgTextUser: { color: colors.white },
  msgTextBot: { color: colors.textPrimary },

  typingDots: { flexDirection: 'row', gap: 5, paddingVertical: 4, paddingHorizontal: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary + '80' },
  dot1: {}, dot2: {}, dot3: {},

  quickPromptsContainer: { marginTop: spacing.md, gap: spacing.sm },
  quickPromptsTitle: { fontFamily: fonts.bnBold, fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  quickChip: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: colors.primary + '40',
  },
  quickChipText: { fontFamily: fonts.bn, fontSize: 14, color: colors.primary },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.bn,
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
