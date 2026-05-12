import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius } from '../../lib/theme';
import { Send, Bot, Sparkles, ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react-native';
import { dietPlanChatApi } from '../../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHaptics } from '../../hooks/useHaptics';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

const WELCOME_MSG: Message = {
  role: 'assistant',
  content: 'নমস্কার! 👋 আমি পুষ্টি এআই। আমি আপনার ব্যক্তিগত ডায়েট পরিকল্পনা তৈরি করতে সাহায্য করব। শুরু করতে, আপনার বয়স কত?',
  id: 'welcome',
};

export default function DietPlanChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [planReady, setPlanReady] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const haptics = useHaptics();

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const restartFlow = () => {
    haptics.light();
    setMessages([WELCOME_MSG]);
    setPlanReady(false);
    setInput('');
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming || planReady) return;
    haptics.light();

    const userMsg: Message = { role: 'user', content, id: `u_${Date.now()}` };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    const assistantId = `a_${Date.now()}`;
    setMessages((prev) => [...prev, { role: 'assistant', content: '', id: assistantId }]);

    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(dietPlanChatApi.streamUrl, {
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
            .slice(-20)  // last 20 turns (enough for all 7 questions)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error('Chat failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let isGeneratingPlan = false;

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
                } else if (data.status === 'generating_plan') {
                  isGeneratingPlan = true;
                  setMessages((prev) =>
                    prev.map((m) => m.id === assistantId ? { ...m, content: accumulated + '\n\nপরিকল্পনা তৈরি করা হচ্ছে... অনুগ্রহ করে একটু অপেক্ষা করুন। ⏳' } : m)
                  );
                } else if (data.plan_ready) {
                  setPlanReady(true);
                  haptics.success();
                  setMessages((prev) =>
                    prev.map((m) => m.id === assistantId ? { ...m, content: data.plan_ready.message_bn } : m)
                  );
                } else if (data.error) {
                  setMessages((prev) =>
                    prev.map((m) => m.id === assistantId ? { ...m, content: accumulated + '\n\n' + data.error } : m)
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
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.botAvatarLarge}>
          <Bot size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>পরিকল্পনা তৈরি</Text>
          <Text style={styles.headerSub}>এআই পুষ্টিবিদ</Text>
        </View>
        <TouchableOpacity onPress={restartFlow} style={styles.restartBtn}>
          <RotateCcw size={20} color={colors.textSecondary} />
        </TouchableOpacity>
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
          planReady ? (
            <View style={styles.planReadyCard}>
              <View style={styles.planReadyHeader}>
                <CheckCircle2 size={32} color={colors.success} />
                <Text style={styles.planReadyTitle}>ডায়েট পরিকল্পনা প্রস্তুত!</Text>
                <Text style={styles.planReadySub}>
                  আপনার ব্যক্তিগত তথ্য অনুযায়ী একটি নতুন পরিকল্পনা তৈরি করা হয়েছে।
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewPlanBtn}
                onPress={() => {
                  haptics.light();
                  router.replace('/(tabs)/meals');
                }}
              >
                <Text style={styles.viewPlanText}>সম্পূর্ণ পরিকল্পনা দেখুন</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {/* Input Bar */}
      {!planReady && (
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="আপনার উত্তর লিখুন..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={200}
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
      )}
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
  backBtn: { padding: spacing.xs },
  botAvatarLarge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary + '20',
    borderWidth: 1.5, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontFamily: fonts.bnBold, fontSize: 18, color: colors.textPrimary },
  headerSub: { fontFamily: fonts.bn, fontSize: 13, color: colors.textSecondary },
  restartBtn: { padding: spacing.xs },

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

  planReadyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  planReadyHeader: { alignItems: 'center', marginBottom: spacing.lg },
  planReadyTitle: { fontFamily: fonts.bnBold, fontSize: 24, color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.xs },
  planReadySub: { fontFamily: fonts.bn, fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  viewPlanBtn: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    width: '100%',
    alignItems: 'center',
  },
  viewPlanText: { fontFamily: fonts.bnBold, fontSize: 16, color: colors.white },

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
