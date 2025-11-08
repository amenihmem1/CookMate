// Simple Ollama service wrapper
// Handles native (iOS/Android) and web environments with clearer errors.
// By default tries to contact Ollama at http://127.0.0.1:11434 but will
// attempt to use a configured OLLAMA_URL environment variable.

import { Platform } from 'react-native';

const DEFAULT_LOCAL = 'http://10.0.2.2:11434';
const ENV_URL = typeof process !== 'undefined' && process.env && process.env.OLLAMA_URL || 'http://10.0.2.2:11434';

function getDefaultBase() {
  // For Android emulator, we need to use 10.0.2.2
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:11434';
  }
  // For iOS simulator, use localhost
  if (Platform.OS === 'ios') {
    return 'http://localhost:11434';
  }
  // For web (development), use the current hostname
  if (Platform.OS === 'web') {
    try {
      const host = typeof window !== 'undefined' && window.location && window.location.hostname;
      return `http://${host}:11434`;
    } catch (e) {
      return 'http://localhost:11434';
    }
  }
  // Default fallback
  return 'http://localhost:11434';
}

const OLLAMA_BASE = ENV_URL || getDefaultBase();

export async function chat(message) {
  console.log('Platform:', Platform.OS);
  const base = getDefaultBase();
  console.log('Base URL:', base);
  // Using generate endpoint instead of chat for testing
  const url = `${base}/api/generate`;
  console.log('Full URL:', url);
  
  const body = {
    model: 'llama2',
    prompt: message,
    stream: false,
  };
  console.log('Request body:', JSON.stringify(body));

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('Ollama API error:', err);
    console.error('Platform:', Platform.OS);
    console.error('URL:', url);
    
    let errorMessage;
    if (Platform.OS === 'android') {
      errorMessage = 'Erreur de connexion à Ollama. Assurez-vous que:\n' +
        '1. Ollama est en cours d\'exécution (ollama serve)\n' +
        '2. Vous utilisez l\'émulateur Android\n' +
        '3. Le port 11434 est accessible';
    } else if (Platform.OS === 'ios') {
      errorMessage = 'Erreur de connexion à Ollama. Assurez-vous que:\n' +
        '1. Ollama est en cours d\'exécution (ollama serve)\n' +
        '2. Vous utilisez le simulateur iOS\n' +
        '3. Le port 11434 est accessible';
    } else {
      errorMessage = 'Erreur de connexion à Ollama. Vérifiez que le serveur est en cours d\'exécution.';
    }
    
    throw new Error(errorMessage);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama API error ${res.status}: ${text}`);
  }

  try {
    const data = await res.json();
    console.log('Ollama response:', data);
    if (!data.response) {
      console.error('No response in data:', data);
      throw new Error('No response from Ollama');
    }
    return data.response;
  } catch (err) {
    console.error('Error parsing response:', err);
    throw err;
  }
}

export async function generateFromOllama({ model = 'orca-mini', prompt = '', max_tokens = 512, temperature = 0.2 } = {}) {
  const url = `${OLLAMA_BASE}/api/generate`;
  const body = {
    model,
    prompt,
    max_tokens,
    temperature,
    stream: false,
  };

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Improve error message for common causes
    let hint = '';
    if (Platform.OS === 'web') {
      hint = ' (browser blocked request — CORS may be required or the Ollama server is not reachable from the browser)';
    } else {
      hint = ' (network error — ensure Ollama is running and reachable from this device/emulator)';
    }
    throw new Error(`Failed to fetch from Ollama at ${url}:${hint}\nOriginal: ${err.message}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama API error ${res.status}: ${text}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    // For chat API
    if (data && data.response) {
      return data.response;
    }
    // For generate API
    if (data && data.output && Array.isArray(data.output) && data.output.length > 0) {
      const first = data.output[0];
      if (first && typeof first === 'object' && 'content' in first) return first.content;
    }
    return JSON.stringify(data);
  }

  return await res.text();
}
