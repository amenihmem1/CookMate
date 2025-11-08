import React from 'react';
import { View } from 'react-native';
import OllamaChatbot from '../../components/OllamaChatbot';

export default function ChatbotScreen() {
  return (
    <View style={{ flex: 1 }}>
      <OllamaChatbot model={"llama2"} />
    </View>
  );
}
