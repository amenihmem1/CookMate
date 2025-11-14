import React from 'react';
import { View } from 'react-native';              
import OllamaChatbotComponent from '../../../components/OllamaChatbotComponent';

export default function ChatbotScreen() {
  return (
    <View style={{ flex: 1 }}>
      <OllamaChatbotComponent model="llama2" />
    </View>
  );
}