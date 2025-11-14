import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { chat } from '../services/ollamaService';

export default function OllamaChatbot({ model = 'llama2' }) {
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      role: 'assistant',
      text: "Hello! I'm your assistant. Ask me a question about cooking, a recipe, or request a suggestion.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatRef = useRef(null);

  const send = async () => {
    if (!input.trim()) return;

    const userMsg = { id: String(Date.now()), role: 'user', text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await chat(userMsg.text);
      const assistantMsg = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: responseText,
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err) {
      let errorText = 'Erreur de connexion à Ollama.';
      if (err.message.includes('Failed to fetch')) {
        errorText += `\nAssure-toi qu'Ollama est lancé sur cet appareil et que l'URL est correcte.`;
      } else {
        errorText += `\nDétail: ${err.message}`;
      }
      const errMsg = { id: String(Date.now() + 2), role: 'assistant', text: errorText };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => flatRef.current?.scrollToEnd?.({ animated: true }), 50);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.bubble,
        item.role === 'user' ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      <Text
        style={[
          styles.bubbleText,
          item.role === 'user' ? styles.userText : styles.assistantText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ref={flatRef}
        contentContainerStyle={styles.list}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask the chatbot a question..."
          style={styles.input}
          editable={!loading}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={send}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.sendText}>Send</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, paddingBottom: 8 },
  bubble: { marginBottom: 12, padding: 12, borderRadius: 12, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.card },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  userText: { color: COLORS.white, fontWeight: '600' },
  assistantText: { color: COLORS.text },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background },
  input: { flex: 1, minHeight: 40, maxHeight: 120, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.card, borderRadius: 10, color: COLORS.text },
  sendButton: { marginLeft: 8, backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' },
  sendButtonDisabled: { opacity: 0.6 },
  sendText: { color: COLORS.white, fontWeight: '700' },
});
